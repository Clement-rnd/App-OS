# Opinion System — App Logic Documentation

This document describes how the Opinion System app (real-estate reviews SaaS) actually works today, section by section: every screen, the business rules that drive it, and the exact thresholds/validation/calculations found in the code. It's a snapshot of the current build (all data is mocked client-side — there is no real backend behind any of this yet).

## Table of contents

1. [App Shell & Shared Infrastructure](#app-shell--shared-infrastructure)
2. [Authentication Flow](#authentication-flow)
3. [Home Dashboard & Notifications](#home-dashboard--notifications)
4. [Mes Avis — Core Page & Filtering](#mes-avis--core-page--filtering)
5. [Mes Avis — Review Detail Actions & Sharing](#mes-avis--review-detail-actions--sharing)
6. [Récolter des Avis — Send Questionnaire Flow](#récolter-des-avis--send-questionnaire-flow)
7. [Profile & Account Management](#profile--account-management)
8. [Support Chat](#support-chat)

---

## App Shell & Shared Infrastructure

### 1. Navigation model

The app has no router (no React Router, no URL-based routes) — it is a **single-page state machine** driven entirely by one piece of state in `src/App.jsx`: `page`, which starts at `'login'`. A function called `renderPage()` reads `page` and returns exactly one top-level screen component: `Login`, `ForgotPassword`, `ResetPassword`, `Home`, `Reviews`, `Questionnaire`, `Profile`, or `Notifications`. Only one of these is ever mounted at a time — moving to a new screen unmounts the old one completely (this matters for the "load once" behavior described under `useSimulatedLoading` below).

Screen switches happen through a small set of callback functions that App.jsx defines and passes down as props, all of which ultimately call `setPage(...)`:
- **Bottom-nav taps** go through `handleNavigate(tab)`. The bottom navigation bar (used inside Home, Reviews, Questionnaire, Profile) works with abstract tab keys (`home`, `chat`, `send`, `user`) rather than page names; a lookup table `TAB_TO_PAGE` translates them (`home→home`, `chat→reviews`, `send→questionnaire`, `user→profile`).
- **Deep-links into "Mes Avis" (Reviews)** go through two dedicated helpers rather than a plain navigate: `handleOpenReviewsTab(tabLabel)` sets `reviewsInitialTab` and switches to `'reviews'`, so Reviews opens pre-filtered to a specific tab (e.g. when a Home stat tile is tapped); `handleOpenReviewDetails(review)` sets `reviewsInitialReview` and switches to `'reviews'`, so Reviews opens straight into a specific review's details sheet (used when a notification is opened for an already-answered negative review). Both of these "initial" values are explicitly cleared on every other navigation via `handleNavigate`, so they don't linger and silently re-apply themselves if the user leaves "Mes Avis" and comes back later through the ordinary bottom nav.
- **Responding to a review from a notification** goes through `handleRequestRespond(notification)`, which stores the notification in `respondingNotification` and navigates to `'reviews'` in the same click. The respond sheet itself is then rendered by App.jsx as an overlay on top of whatever screen is active (see below), not inside the Notifications screen, because "responding" is conceptually a Reviews action, not a Notifications one.
- Auth-related transitions (`Login → Home`, `Login → ForgotPassword → ResetPassword → Login`, `Profile → Login` on logout) are simple direct `setPage` calls passed as `onLogin`, `onSkip`, `onForgotPassword`, `onResetPassword`, `onBack`, `onLogout`.

**Sheets/modals are layered independently of `page`.** App.jsx renders two things unconditionally alongside the current page:
- A floating support-chat button (`SupportChatFab`) and, when clicked, a `SupportChatWindow` overlay — controlled by local boolean state `isSupportChatOpen`. Both are hidden while `page` is one of the three auth pages (`login`, `forgot-password`, `reset-password`), defined in the `AUTH_PAGES` constant.
- The `RespondSheet` overlay for the notification-driven respond flow, rendered whenever `respondingNotification` is non-null, regardless of which page is showing underneath.

Beyond this, individual screens (Home, Reviews, Questionnaire, etc.) manage their own internal sheets/modals as local component state — App.jsx has no visibility into, e.g., a "share review" sheet inside Reviews. So the overall model is: **one active full-screen page, chosen by a hand-rolled state machine with no URL, plus a small number of App-level overlays that can float on top of any page, plus each page's own private sheets.**

### 2. Global state

App.jsx intentionally holds the minimum state that must survive a screen change or be shared across otherwise-unrelated screens:

- `page` — the active screen, described above.
- `notifications` — the full notifications list, initialized from `initialNotifications` (built by `notificationsData.js`). This lives at the App level (not inside the Notifications screen) because Home also needs it: Home computes and displays an **unread badge count** as `notifications.filter(n => n.unread).length`, and both Home and Reviews can *create* notifications via `handleAddNotification` (e.g. a new review event), and the respond-from-notification flow needs to mark a notification's own review as answered (`handleSubmitNotificationResponse`) even while the Notifications screen isn't mounted.
- `isSupportChatOpen` — whether the support chat window overlay is open; kept at the top so the chat button/window can float above any page.
- `reviewsInitialTab` / `reviewsInitialReview` — one-shot "where to land" instructions handed to the Reviews screen the moment it's opened via a deep link, cleared on any other navigation (see above).
- `respondingNotification` — the notification (and its embedded review) currently being answered via the App-level `RespondSheet` overlay.

Everything else — form inputs, which sheet is open within a screen, which tab is selected within Reviews, drag state, etc. — is local `useState` inside the relevant component. The dividing line is essentially: **state goes in App.jsx only if a screen other than the one that "owns" it needs to read or mutate it, or if it must persist across an unmount/remount of the active screen.**

### 3. Shared hooks

- **`useLockBodyScroll(enabled = true)`** — Prevents the page behind an open bottom sheet/modal from scrolling. While active, it pins `document.body` (`position: fixed`, `top: -<scrollY>px`, `width: 100%`, `overflow: hidden`) and adds right-padding equal to the vanished scrollbar's width so fixed-width elements (like a sticky header) don't visibly shift when the scrollbar disappears. On cleanup it restores the previous inline styles and scrolls back to the original position. It deliberately uses `useLayoutEffect` (not `useEffect`) so the restore happens synchronously in the same frame as any dependent DOM change (e.g. a header flipping back to `position: sticky`) — otherwise there's a one-frame flash where the header is sticky inside a still-locked body. The `enabled` flag exists only for overlays that stay mounted after "closing" (e.g. the support chat window, which keeps its history alive) so they can toggle the lock without unmounting.
- **`useSheetDrag({ onRequestClose, closeDurationMs })`** — Powers the "drag down to dismiss" gesture on bottom sheets. Tracks pointer position and velocity while dragging; on release, it closes the sheet if the drag distance exceeded **100px** or the release velocity exceeded **0.5 px/ms** (constants `DRAG_CLOSE_DISTANCE` / `DRAG_CLOSE_VELOCITY`), otherwise it snaps back to 0. Returns pointer-event handlers plus a `dragStyle` object that either follows the finger live, plays a slide-down close transition, or is `undefined` at rest.
- **`useSheetViewTransition(view, setView)`** — Handles sheets that morph their own content between two internal "views" without stacking a second sheet on top (e.g. a review-details view that turns into a "respond" view in place). It measures the current content height before switching, plays a short (130ms) fade/slide-out of the outgoing content, swaps the view, then animates the container's height to match the new content's natural height (synced to a 300ms CSS height transition) so the sheet resizes smoothly instead of snapping instantly. Used by multi-step sheets like the review-respond flow, survey-select sheet, edit-profile sheet, etc.
- **`useSimulatedLoading(key, delayMs = 1000)`** — Fakes network latency so a freshly mounted page shows skeleton placeholders (see `Skeleton` below) for about a second instead of popping content in instantly. It tracks "already loaded" keys (e.g. `'home'`, `'reviews'`) in a **module-level** `Set` (not React state), so the skeleton only ever plays once per page for the life of the app session — navigating away and back doesn't replay the fake loading.
- **`useStandaloneScreenHeight()`** — A narrow bug workaround: on an installed iOS PWA, the browser under-measures the viewport height right when a screen first mounts. This hook detects iOS + standalone display mode and, only in that case, returns `Math.max(window.screen.height, window.innerHeight)` as a manual override; everywhere else (regular browser tabs, Android PWAs) it returns `undefined` on purpose so callers keep relying on ordinary CSS (`dvh`, `inset: 0`, etc.), which the code notes is more reliable outside iOS-standalone.
- **`useSwipeActions()`** — Powers swipe-to-reveal row actions (e.g. swiping a list row left to reveal delete/archive buttons). The reveal panel is a fixed **144px** wide (`ACTIONS_WIDTH`); dragging past half that width (**72px**, `OPEN_THRESHOLD`) on release snaps the row open, otherwise it snaps closed. Exposes drag handlers, the current horizontal offset, and `toggle()`/`close()` helpers for tapping a row or dismissing it programmatically.

### 4. Shared utilities

**`src/utils/nps.js`** centralizes Net Promoter Score business logic so it isn't duplicated across screens:
- `getNpsCategory(rating)` classifies a review's 0–5 star rating into one of three NPS buckets: **rating ≤ 2.5 → "Détracteur"**; **2.5 < rating < 4 → "Passif"**; **rating ≥ 4 → "Promoteur"**.
- `getNpsScore(rating)` converts the app's 0–5 star rating into the conventional 0–10 NPS score shown on the review-details sheet, as `min(10, round(rating * 2))`.
- `getRatingBreakdown(review)` fabricates a per-criteria rating breakdown (Réception / Qualité / Communication / Délais) for reviews that only have one overall score in the mock data. It deterministically hashes the review's `id` and nudges each criterion by −1, 0, or +1 star around the rounded overall rating (clamped to 1–5), so the same review always displays the same breakdown rather than a random one on every render — this is a mock-data stand-in, not a real per-criteria survey result.

**`src/utils/reviewTabs.js`** exports three string constants that name the filter tabs on the "Mes Avis" (Reviews) screen: `REVIEW_TAB_SANS_REPONSE = 'Sans Réponses'`, `REVIEW_TAB_NEGATIFS = 'Avis Négatifs'`, `REVIEW_TAB_A_RECUPERER = 'À Relancer'`. Their purpose is purely to keep other screens that deep-link into a specific Reviews tab (e.g. Home's stat tiles, or a notification that should land on "À Relancer") using the *exact* same label Reviews.jsx itself uses, instead of each caller hard-coding the French string and risking silent drift if one is ever renamed.

### 5. Shared UI primitives

- **`Skeleton`** (`src/components/Skeleton/Skeleton.jsx`) — A single shimmering placeholder bar (`<span>` with a `skeleton-bar` CSS animation), configurable via `width` (default `'100%'`), `height` (default `12`px), `radius` (default `4`px), plus passthrough `className`/`style`. Used to build loading-state layouts on any screen driven by `useSimulatedLoading`.
- **`StarRating`** (`src/components/StarRating/StarRating.jsx`) — Renders a 5-star display for a given `rating` (0–5, supports halves). Full stars are solid gold (`#ffb400`); a half star is drawn as an outlined star (`#dfe9ef` stroke) with a clipped gold fill covering exactly the fractional portion; empty stars are outline-only so they read as a defined star shape rather than fading out. Half-star threshold: a star counts as "half" once the remainder is `≥ 0.5`.
- **`Button`** (`src/components/Button/Button.jsx`) — The shared button primitive. Accepts `variant` (default `'primary'`, applied as CSS class `btn--<variant>`), `onClick`, and `disabled`; renders children inside a native `<button>`. All button styling variants are driven by CSS classes rather than inline logic.
- **`ResponseAlert`** (`src/components/ResponseAlert/ResponseAlert.jsx`) — A toast/confirmation banner used across Home, Reviews (Mes Avis), Notifications, Questionnaire, and ForgotPassword to confirm an action succeeded (e.g. "Une réponse a été envoyée", "Une réponse a été modifiée", "Rappel de duplication envoyé", a password-reset confirmation, a questionnaire-sent confirmation). It auto-dismisses after a fixed **4000ms** (`AUTO_DISMISS_MS`) via `onClose`, and also offers a manual close (×) button. Its `className` prop lets each caller reposition/restyle the toast for its own layout without forking the component — e.g. Questionnaire passes `className="response-alert--above-success-footer"` to sit the toast above a footer bar, while Home and Reviews use it with no extra class (default positioning).

### 6. Canonical/mock review data

**`src/data/canonicalReviews.js`** exports `CANONICAL_REVIEWS`, a small, fixed array of exactly 6 fully-detailed sample reviews (`canon-1` … `canon-6`). This is explicitly *not* the full mock review dataset (that larger set lives separately, e.g. `COMPANY_REVIEWS_DATA` in `Reviews/mockReviewsData.js`) — its stated purpose, per its own comment, is to be the **single shared source of truth for the overlap** between Home's review carousel and the most recent entries in "Mes Avis," so both screens show the *same* underlying reviews rather than two independently-authored samples that could drift out of sync. Each entry carries author, star rating, date, review text, a pre-computed `npsScore`, service type, Google-sharing flag, a per-criteria `ratings` breakdown, an assigned collaborator, a `source` (`'opinion-system'` or `'google'`), a `certification` level (`'certifie-os'` or `'standard-os'`), and a status (`'sans-reponse'`, `'en-attente'`, or `'archive'`). It is imported directly by `Home.jsx` and by `Reviews.jsx` (imported alongside, and presumably merged/deduplicated with, the larger `COMPANY_REVIEWS_DATA` mock set).

---

## Authentication Flow

This flow covers four screens: the Login screen, the "Forgot Password" screen, the "Reset Password" screen, and a Sign-Up modal. All four are presentation-layer components: none of them call a real backend directly. Each one receives its "what happens next" behavior as callback functions (e.g. `onLogin`, `onSendLink`, `onResetPassword`) from a parent component, and the actual page transitions/success states you see here are either simulated locally (via timers) or simply trigger those callbacks without any visible server check. In other words, as written, these screens describe the *shape* of the flow and its validation rules, but the "is this password correct" / "does this account exist" logic itself is not implemented in these files — it's delegated upward (or currently mocked).

### 1. Login (`Login.jsx`)

**Fields:**
- **Identifiant** (username/identifier) — plain text input.
- **Mot de passe** (password) — password input with a show/hide "eye" toggle button.

**Validation rules (exact):**
- Identifiant is considered valid if `identifiant.trim().length > 0` (i.e., anything other than empty/whitespace-only text).
- Password is considered valid if `password.length >= 8` (8 characters or more — content/complexity is not checked at login, only length).
- The **"Se connecter"** (Log in) button is only enabled when **both** conditions are true (`isValid = isIdentifiantValid && isPasswordValid`). Otherwise it is rendered disabled.

**Error display:** Errors only appear after a field has been "touched" (i.e., the user clicked into it and then clicked/tabbed away — `onBlur`). At that point:
- If the identifiant is still empty: shows "Entrez un nom d'utilisateur valide" ("Enter a valid username").
- If the password is still under 8 characters: shows "Entrez un mot de passe valide" ("Enter a valid password").

**On submit:** Clicking "Se connecter" simply calls the `onLogin` callback passed in from the parent — there is no credential check, API call, or error handling inside this component. Whatever happens next (successful login, redirect, error) is entirely controlled outside this file; from this component's own logic, the button click always "succeeds" once the field-length rules above are satisfied.

**Other elements on this screen:**
- A "Skip" button in the header that calls `onSkip` — an explicit bypass of the login step entirely.
- "Mot de passe oublié?" (Forgot password?) button that calls `onForgotPassword`, taking the user to the Forgot Password screen.
- Footer text "Vous n'avez pas de compte OS ?" (Don't have an OS account?) with an "Inscrivez-vous" (Sign up) button that opens the **Sign-Up modal** described below, layered on top of the Login screen (it does not navigate away from Login).

### 2. Forgot Password (`ForgotPassword.jsx`)

**Field:** A single "Identifiant" text input (same identifier concept as Login — no email-specific validation, just a generic text field).

**Validation rule (exact):** The "Envoyer le lien" (Send the link) button is enabled only when `identifiant.trim().length > 0 && !sent` — i.e., the field isn't empty, **and** a request hasn't already been sent in this session. Once sent, the button becomes disabled again (preventing repeat submissions from the same screen instance).

**On submit:**
1. Clicking "Envoyer le lien" immediately shows a confirmation banner (a `ResponseAlert`) and marks the request as `sent`.
2. It also calls `onSendLink(identifiant)` so the parent can act on the submitted identifier.
3. The confirmation message reads: *"Si nous trouvons un compte associé aux informations fournies, vous recevrez un e-mail contenant un lien de réinitialisation de mot de passe."* ("If we find an account associated with the information provided, you will receive an email containing a password reset link.") — this phrasing is deliberately non-committal: it neither confirms nor denies whether an account actually exists for that identifier. This is a standard security precaution to prevent an attacker from using this form to discover which usernames/emails are registered in the system (account enumeration).
4. After sending, a 5-second timer automatically fires and calls `onResetPassword()`, moving the user to the Reset Password screen. The code comment explicitly states this timer "Simulates the user following the reset link sent by email" — i.e., in this mocked flow, the app doesn't wait for a real email click, it just advances automatically after 5 seconds to represent that step.

**Navigation:** A "Retour à la connexion" (Back to login) button calls `onBack`, returning to the Login screen at any time.

### 3. Reset Password (`ResetPassword.jsx`)

**Fields:** "Nouveau mot de passe" (new password) and "Confirmez le mot de passe" (confirm password), each with its own independent show/hide eye toggle.

**Password requirements (exact, all four must be satisfied — checked live and shown as a checklist with checkmarks):**
1. **Lowercase character** — matches `/[a-z]/`.
2. **Uppercase character** — matches `/[A-Z]/`.
3. **A digit or a special character** — matches `/[0-9!@#$%^&*(),.?":{}|<>_\-+=~\`[\]/\\;']/`.
4. **Minimum 8 characters** — `value.length >= 8`.

Each requirement in the on-screen checklist ("Un caractère minuscule", "Un caractère majuscule", "Un chiffre ou un caractère spécial", "Minimum 8 caractères") turns from a plain bullet to a green checkmark as soon as the new-password field satisfies it — this updates in real time as the user types.

**Confirmation rule:** `passwordsMatch = newPassword === confirmPassword` (exact string equality, case-sensitive).

**Overall enable condition for the submit button:** `isValid = meetsRequirements && passwordsMatch && confirmPassword.length > 0` — i.e., all four password-strength rules pass, the two fields match exactly, and the confirmation field isn't empty.

**Error display:** The "Les mots de passe ne correspondent pas" ("Passwords don't match") message appears only once the confirmation field has been blurred (touched) **and** it's non-empty **and** it doesn't match the new password.

**On success:** Clicking "Réinitialiser le mot de passe" (only clickable once `isValid` is true) calls `onResetPassword(newPassword)`, handing the new password up to the parent. No screen-level confirmation or further validation occurs inside this component beyond that call.

**Navigation:** A "Retour à la connexion" button calls `onBack`, same as on the Forgot Password screen.

### 4. Sign Up (`SignUpModal.jsx`)

This is **not a registration form** with input fields — it is a promotional/informational modal opened from the Login screen's "Inscrivez-vous" link. There are no username/email/password fields and no validation logic at all.

**Content:** Marketing copy about the platform ("Valorisez votre expertise grâce à des avis contrôlés et une méthode certifiée…") encouraging the visitor to book an appointment, followed by a single call-to-action button, "Remplissez le formulaire" ("Fill out the form"). Notably, this button currently has **no `onClick` handler wired up** in the code — clicking it does not do anything (no navigation, no external link, no callback), so as it stands the CTA is visually present but non-functional.

**Dismissal behavior:** The modal can be closed two ways — clicking the "X" close button, or clicking the dark backdrop area behind the modal — both simply call `onClose` immediately. There is **no leave-confirmation prompt** (no "are you sure you want to close?" dialog); since there's no form data to lose, closing is instant. While open, the modal locks background page scrolling (`useLockBodyScroll`) so the page behind it doesn't move.

### Cross-links and navigation summary

- **Login → Forgot Password**: "Mot de passe oublié?" button.
- **Login → Sign-Up modal**: "Inscrivez-vous" button (opens as an overlay on top of Login, not a page navigation).
- **Forgot Password → Login**: "Retour à la connexion" button.
- **Forgot Password → Reset Password**: automatic, 5 seconds after a link "send" is submitted (simulating the user clicking the emailed link).
- **Reset Password → Login**: "Retour à la connexion" button.

No screen in this set implements a leave-confirmation ("unsaved changes") dialog — navigating away or closing is always immediate, including in the Sign-Up modal.

---

## Home Dashboard & Notifications

### 1. Reputation badge logic

The "Réputation" badge shown next to the company name on the Home screen (`src/components/Home/Home.jsx`) is driven **purely by the "Ma note Opinion System" rating** — it is not influenced by response rates or pending-review counts.

**Which reviews count toward the rating:** Only reviews from the default company (`bastien-arfi`) that satisfy **both** conditions:
- `review.source === 'opinion-system'` (collected through Opinion System, not imported from Google), **and**
- `review.certification === 'certifie-os'` (certified by Opinion System, excluding "standard-os" reviews).

Google-sourced reviews are explicitly excluded because they have their own separate rating (`kpiGoogle`), and non-certified reviews aren't held to the same bar.

**Calculation:** the average of the `rating` field across those filtered reviews, rounded to one decimal:
```js
OS_RATING = Math.round((sum of ratings / count) * 10) / 10
```
If there are zero qualifying reviews, `OS_RATING` defaults to `0`. It is displayed split into whole/decimal parts (e.g. "4,8/5").

**Tier thresholds** (function `getReputationTier(rating)`), exactly three bands:

| Condition | Tier key | French label |
|---|---|---|
| `rating >= 4.5` | `excellente` | **Réputation excellente** |
| `rating >= 3` (and < 4.5) | `en-progres` | **Réputation en progrès** |
| `rating < 3` | `en-sommeil` | **Réputation en sommeil** |

The tier key is used as a CSS modifier class (`home__reputation--excellente`, etc.) that drives the badge's color/dot styling (green / orange / red respectively).

### 2. Stat tiles

All four tiles are computed once from the shared default-company dataset (`COMPANY_REVIEWS_DATA['bastien-arfi'].reviews`), the same dataset the "Mes Avis" reviews list uses, so the numbers always agree with each other:

1. **Ma note Opinion System** — the `OS_RATING` described above (X,Y/5). No warning styling; only drives the reputation badge.
2. **Avis collectés** — `TOTAL_REVIEWS_COUNT`, the total number of reviews in the default company's review array (no filtering by source/certification). Clicking this tile navigates to `'chat'`. No warning styling.
3. **Avis sans réponse** — `UNANSWERED_COUNT`, the count of reviews in that same array where `review.response` is falsy, displayed zero-padded to 2 digits (e.g. "07"). Clicking navigates to the Reviews tab filtered to `REVIEW_TAB_SANS_REPONSE`.
4. **Avis à récolter** — `PENDING_COUNT`, the length of `COMPANY_PENDING_REVIEWS['bastien-arfi']` (reviews requested but not yet submitted), zero-padded to 2 digits. Clicking navigates to the Reviews tab filtered to `REVIEW_TAB_A_RECUPERER`.

**Warning highlight logic:** tiles 3 and 4 each get an *independent* visual warning (extra CSS classes `home__stat--warning` / `home__stat-value--warning`, an inset red border plus red value text) when their own count exceeds 49% of total reviews collected:
```js
WARNING_RATIO = 0.49
SANS_REPONSE_WARNING = TOTAL_REVIEWS_COUNT > 0 && UNANSWERED_COUNT / TOTAL_REVIEWS_COUNT > 0.49
A_RECOLTER_WARNING  = TOTAL_REVIEWS_COUNT > 0 && PENDING_COUNT / TOTAL_REVIEWS_COUNT > 0.49
```
These warnings are explicitly decoupled from the reputation badge — a tile can be flagged red while the badge is green, and vice versa.

### 3. Review carousel ("Derniers avis reçus")

The carousel is a horizontally-scrollable strip of `ReviewCard` components sourced from `CANONICAL_REVIEWS` (`src/data/canonicalReviews.js`), copied into local state with `response: null` added to each — this is a small, separate sample list, distinct from the larger `COMPANY_REVIEWS_DATA` dataset used for the stat tiles. Active-dot pagination tracks scroll position using a fixed card step of `312 + 16 = 328px` (card width + gap).

Each card shows: author, star rating/score, date, an NPS chip, an optional "Certifié OS" chip (shown unless `certification === 'standard-os'`), a Google-share chip ("Partagé"/"Non partagé"), review text, and two actions.

**NPS chip color mapping** (via `getNpsCategory(rating)` in `src/utils/nps.js`):
- `rating <= 2.5` → **Détracteur** (red/detractor chip class)
- `2.5 < rating < 4` → **Passif** (chip class `--passive`)
- `rating >= 4` → **Promoteur** (chip class `--promoter`)

**Actions:**
- **"Répondre"** (shown when `review.response` is null) — opens the standalone `RespondSheet` for that review.
- **"Répondu"** (shown once a response exists, with a reply-bubble icon instead of the arrow icon) — instead opens the `ReviewDetailSheet` for that review (clicking it does not reopen the respond flow).
- **"Détails"** — always opens `ReviewDetailSheet`.

### 4. Responding to reviews

Two entry points share the same core fields component (`RespondFields.jsx`): the standalone `RespondSheet` (opened from a review card's "Répondre") and an embedded "respond" view inside `ReviewDetailSheet` (opened via "Répondre" or via the pencil-edit icon on an existing response).

**Fields/flow:**
- A **review summary card** (author, rating, date, stars; chips shown only in the standalone sheet) for context.
- An **AI suggestion box** ("✨ Suggestion IA"): starts empty with a placeholder prompting the user to click "Générer." Clicking cycles through 3 canned French suggestion templates (personalized with the reviewer's first name). "Régénérer" (after the first generation) advances to the next template. "Utiliser" types the suggestion word-by-word into the reply textarea.
- A **reply textarea** ("Votre Réponse"), free text, pre-filled with the existing response if editing.

**Validation:** the submit button is enabled only when `replyText.trim().length > 0`; otherwise it's disabled.

**On submit:** `handleSubmitResponse` determines `wasEditing = Boolean(review.response)` *before* applying the update, sets the review's `response` to the trimmed text, closes the responding sheet, opens/updates the `ReviewDetailSheet` for that review, and shows a toast (`ResponseAlert`):
- If it was already answered (editing): **"Une réponse a été modifiée"**.
- If it's the first response: **"Une réponse a été envoyée"**.

The submit button label itself also differs: **"Enregistrer"** when editing vs. **"Répondre"** for a first response (both sheets show this same title/button distinction: sheet title is "Modifier la réponse" vs. "Répondre à l'avis").

**Deleting a response:** an editing-only "Supprimer la réponse" button clears `review.response` back to `null` and reopens the detail sheet (no toast is shown for deletion, unlike submit).

### 5. Google review-sharing/boost

From `ReviewDetailSheet`, when a review hasn't been shared to Google and has no pending reminder, a "Demander à partager sur Google" button opens a "Boostez mon avis sur Google" view: it shows the recipient (reviewer name/phone from `getReviewerPhone`), an editable message (default `GOOGLE_BOOST_DEFAULT_MESSAGE`), and 3 active send channels (SMS, QR Code, Email — "Plus" is disabled) that all trigger the same `handleSendGoogleBoost` action.

**What it simulates (`Home.jsx`'s `handleSendGoogleBoost`):**
1. Immediately stamps the review with `googleReminderSentDate = TODAY_STR` (`'06/09/2026'`, matching Reviews.jsx's own anchor date) and shows a toast: **"Rappel de duplication envoyé"**. While pending, the detail view shows "Rappel envoyé le {date}" instead of the Partagé/Non Partagé chip, and the "Demander à partager" button is hidden (only shown when not shared *and* no reminder pending).
2. After a delay of **`GOOGLE_BOOST_CONFIRM_MS = 6000` ms (6 seconds)**, a timeout fires "OS confirming" the share: the review is updated to `googleShared: true` and `googleReminderSentDate: null`, and a notification is created via `buildGoogleShareConfirmedNotification(confirmedReview)` and pushed up through `onAddNotification`.
3. Pending timeouts are tracked in a ref and cleared on unmount to avoid leaks/stale updates.

After confirmation, the review's Google chip flips to "Partagé" everywhere it's shown (carousel card, summary card, detail sheet), and the "Demander à partager sur Google" CTA disappears for that review.

### 6. Notifications

**Notification types** (`NOTIFICATION_TYPES` in `notificationsData.js`), each with its own avatar/badge styling:
- `newReview` — blue star badge; non-actionable; points at a real "Promoteur, still sans-réponse" review (`NEW_REVIEW_IDS`).
- `negativeReview` — orange warning badge; **actionable**, `actionType: 'respond'`; points at a real "Détracteur, still sans-réponse" review (`NEGATIVE_REVIEW_IDS`).
- `avisARecuperer` — yellow flag badge; non-actionable; templated messages about reviewers who haven't submitted/responded yet.
- `expiringDate` — clock avatar icon; non-actionable; messages about certification/attestation/subscription expiring soon.
- `boostReviews` — rocket avatar icon; **actionable**, `actionType: 'boost'`; message cites days since last request (`BOOST_REVIEWS_DAY_COUNTS = [7, 10, 14, 21, 30]`).
- `googleShareConfirmed` — green star badge; generated live (not seeded) whenever a Google-boost reminder is confirmed (see section 5); message: "`{author}` a accepté de partager son avis sur Google."

Seed data (`initialNotifications`) is built across 5 date groups (`today`, `yesterday`, `monday`, `lastWeek`, `lastMonth`) with fixed counts (2, 3, 5, 6, 5 respectively) and fixed unread counts per group (2, 1, 0, 0, 0) — total 3 unread among the seeded set. Types cycle through `TYPE_ORDER` (`newReview → negativeReview → avisARecuperer → expiringDate → boostReviews`, `googleShareConfirmed` never seeded, only live-created).

**Unread count:** `unreadCount = notifications.filter(n => n.unread).length`, shown as a badge both on the Notifications screen's "Non Lue" tab and on the Home header's bell icon (`unreadNotifCount` prop, only rendered when `> 0`).

**Tapping a notification (`handleRowClick`):**
- If it `needsAction` (i.e., `actionable === true` and `actionCompleted === false`) **and** its type's `actionType === 'respond'` → calls `onRequestRespond` (opens the respond flow) without marking read yet.
- If `needsAction` and `actionType === 'boost'` → marks it read **and** `actionCompleted: true` in the same update, then navigates to `'send'`.
- Otherwise: if unread, marks it read, then routes by type — `negativeReview`/`newReview`/`googleShareConfirmed` open that review's `ReviewDetailSheet`; `avisARecuperer` opens the Reviews tab filtered to `REVIEW_TAB_A_RECUPERER`; `expiringDate` navigates to `'user'`; `boostReviews` (already completed) navigates to `'send'`.

Rows can also be **swiped** to reveal "Lu" (mark read) and "Supprimer" (delete) quick actions independent of the tap behavior. The kebab menu offers "Tout marquer comme lu" and "Effacer toutes les notifications" (clears the list entirely). Deleting a single notification shows a toast: "La notification a été supprimée." The list paginates 10 at a time (`PAGE_SIZE = 10`) with infinite scroll via an IntersectionObserver (`rootMargin: '200px'`).

---

## Mes Avis — Core Page & Filtering

### 1. Review data model

Each submitted review (from `mockReviewsData.js`, one array per company under `COMPANY_REVIEWS_DATA[companyId].reviews`) carries these fields:

| Field | Example | Meaning |
|---|---|---|
| `id` | `'bastien-arfi-1'` | Unique review id, prefixed with the company id. |
| `author` | `'Jean David Lépineux'` | Reviewer's display name. |
| `rating` | `'4.5'` | Star rating, 0–5 in half-point increments, stored as a string. |
| `date` | `'06/09/2026'` | Submission date, `DD/MM/YYYY`. |
| `text` | free text | Review body shown on the card. |
| `collaboratorId` | `'angela-belle'` | Links the review to one entry in the collaborators list. |
| `source` | `'opinion-system'` \| `'google'` | Platform the review was left on. |
| `certification` | `'certifie-os'` \| `'standard-os'` | Which questionnaire type produced it — "Certifié OS" vs "Standard OS". |
| `googleSharing` | `'google-partage'` \| `'google-non-partage'` | Whether this review has also been duplicated/shared onto the business's Google profile. |
| `status` | `'sans-reponse'` \| `'en-attente'` \| `'archive'` | Internal lifecycle flag. Set to `'archive'` when a response is submitted and back to `'sans-reponse'` when a response is deleted. **Not** the same axis as the `reponse` filter, and this field is deliberately excluded when matching real reviews against the `etat` filter group, so it never actually filters the "Tous" list; it only exists to describe the row's own state. |
| `response` | string \| `null` | Owner's reply text; `null` means unanswered. |
| `npsScore` | number 0–10 | A raw NPS number present in the mock data, but it is **not** what drives the "Promoteur/Passif/Détracteur" badge (see below). |
| `service` | `'Vente de propriété'`, etc. | The service line the review is about. |
| `ratings` | `{ reception, qualite, communication, delais }` | 1–5 sub-scores shown in the review-details sheet. |

Two values are *derived*, not stored, and each uses a different threshold on the same `rating` field:

- **NPS badge** (`getNpsCategory` in `src/utils/nps.js`, fed `parseFloat(review.rating)`): `rating <= 2.5` → `Détracteur`; `rating < 4` → `Passif`; otherwise → `Promoteur`. This is what the card chip and the "Badge NPS" filter group use — `npsScore` is ignored for this.
- **Note category** (`getNoteCategory` in `filterReviews.js`, powering the "Note de l'avis" filter group): `rating >= 4` → `positif`; `rating >= 3` → `neutre`; else → `negatif`. Different buckets from the NPS badge even though both read `rating`.

A second, separate data source backs the "not-yet-a-review" state: `COMPANY_PENDING_REVIEWS` in `mockPendingReviews.js` holds *sent-but-unanswered questionnaires*, one array per company, with fields `id`, `author`, `phone`, `email` (nullable), `service`, `certification`, `collaboratorId`, `sentDate`, `relanceDate` (nullable — last resend date), `expiryDate`, `archived` (boolean). These items never become "reviews" in the model above — they're a distinct card type (`PendingReviewCard`) shown by the "À Relancer" tab and by the État chips "Expiré"/"Archivé", computed from a fixed `TODAY` anchor of `2026-09-06` (`filterReviews.js`), not the real device clock.

### 2. Tabs

`Reviews.jsx`'s `TAB_DEFS` defines exactly three tabs, each a shortcut onto the *same* `etat`/`nps`/`reponse` filter groups the Filtres sheet exposes rather than an independent dimension:

| Label (`utils/reviewTabs.js`) | Condition |
|---|---|
| `Sans Réponses` (`REVIEW_TAB_SANS_REPONSE`) | `reponse: 'sans-reponse'`, `nps: []` — reviews where `review.response` is falsy. |
| `Avis Négatifs` (`REVIEW_TAB_NEGATIFS`) | `reponse: null`, `nps: ['detracteur']` — reviews whose NPS badge is `Détracteur`. |
| `À Relancer` (`REVIEW_TAB_A_RECUPERER`) | `isPending: true` — not a review filter at all; toggles État's `en-attente` chip and swaps the entire list to the pending-questionnaires data source. |

Behavior on tap (`toggleTabFilter`):
- **Sans Réponses / Avis Négatifs** are mutually exclusive with each other and are radio-like: tapping an already-active one deactivates it (`reponse: null, nps: []`); tapping the other one replaces whatever combination was active. Either way, tapping any of these two tabs also strips `en-attente`/`expire`/`archive` out of `etat`, so switching from "À Relancer" straight to "Avis Négatifs" leaves the pending view entirely instead of leaving stale État chips selected.
- **À Relancer** just flips État's `en-attente` option in/out (via `applyFilterRules(..., 'etat')`), so it gets the exact same cascade a manual tap on the "En attente" chip in Filtres would get — clearing `source`, `note`, `nps`, `reponse`, `googleSharing`. It stays visually active (`isActive: isPendingView`) even when narrowed further to "Expiré" or "Archivé", since those two both imply `en-attente` underneath.

Tab badge counts are computed from `tabCountReviews` — the company's reviews filtered by every *other* active filter (collaborator, source, note, période, etc.) but with `reponse`/`nps` deliberately zeroed out, so selecting a tab never changes the numbers shown on the other tabs. "À Relancer"'s count is simply `pendingReviews.length` (unexpired, unarchived pending questionnaires for the current collaborator).

A tab can also be pre-selected on page load: `Reviews` accepts an `initialTabLabel` prop (used when Home's stat tiles deep-link in) that seeds `appliedFilters` before first render.

### 3. Filters (FiltersSheet)

`FILTER_GROUPS` in `FiltersSheet.jsx` defines seven groups (`periode` is an eighth, date-only group with no cascade rules):

| Group id | Label | multi? | Options (id → label) |
|---|---|---|---|
| `periode` | Période | single | `aujourdhui` Aujourd'hui, `semaine` Cette semaine, `mois` Ce mois, `annee` Cette année, `personnalise` Personnalisé (opens a Du/Au date-range picker) |
| `type` | Questionnaire envoyé | multi | `certifie-os` Certifié OS, `standard-os` Standard OS |
| `etat` | État de l'envoi du questionnaire | multi | `en-attente` En attente, `expire` Expiré, `archive` Archivé |
| `source` | Source de l'avis | multi | `opinion-system` Opinion System, `google` Google |
| `note` | Note de l'avis | multi | `positif` Positif, `neutre` Neutre, `negatif` Négatif |
| `nps` | Badge NPS | multi | `promoteur` Promoteur, `passif` Passif, `detracteur` Détracteur |
| `reponse` | Réponse a l'avis | single | `sans-reponse` Sans-Réponse, `avis-repondu` Répondu |
| `googleSharing` | Partage sur Google | multi | `google-partage` Google Partagé, `google-non-partage` Google Non-Partagé |

All groups except `periode` and `etat` (and `type`) are flagged `hiddenWhenPending: true`: whenever `etat` includes `en-attente`, the sheet hides `source`, `note`, `nps`, `reponse`, and `googleSharing` outright (not greyed — removed from the sheet), because "no review exists yet" while a questionnaire is only pending.

**Cross-group cascade.** Two rule tables drive `applyFilterRules(filters, changedGroupId)`, run on every chip tap (and reused by `Reviews.jsx`'s tab logic so tabs get identical behavior):

`AUTO_SELECT_RULES` (applied first):
- Selecting `etat:expire` also selects `etat:en-attente`.
- Selecting `etat:archive` also selects `etat:en-attente`.

`DISABLE_RULES` (applied after auto-select; each disables — and clears if already selected — the target unless `noClear` is set):
1. `source:google` disables `googleSharing:google-non-partage`.
2. `type:standard-os` disables `source:google`.
3. `reponse:avis-repondu` disables `reponse:sans-reponse` (moot in practice since `reponse` is single-select, but coded explicitly).
4. `etat:en-attente` disables the **entire** `source`, `note`, `nps`, `reponse`, and `googleSharing` groups (all options in each, and clears anything already picked there).
5. `etat:expire` disables `etat:archive` (mutually exclusive: a questionnaire is expired *or* archived, never both).
6. `etat:archive` disables `etat:expire` (same rule, reverse direction).
7. `etat:expire` disables `etat:en-attente`, `noClear: true`.
8. `etat:archive` disables `etat:en-attente`, `noClear: true`.

Concrete examples:
- Tap **"Google"** under Source de l'avis → the **"Google Non-Partagé"** chip under Partage sur Google greys out (and clears if it was selected). "Google Partagé" stays selectable.
- Tap **"Standard OS"** under Questionnaire envoyé → the **"Google"** chip under Source de l'avis greys out/clears, effectively forcing source filtering away from Google.
- Tap **"En attente"** under État → Source de l'avis, Note de l'avis, Badge NPS, Réponse a l'avis, and Partage sur Google are all disabled *and* hidden from the sheet, and any selections in them are cleared. This is the same thing that happens when the "À Relancer" tab is tapped.
- Tap **"Expiré"** under État → "En attente" auto-selects alongside it (both chips now active together); "Archivé" greys out/clears (rule 5); and "En attente" itself becomes locked — it cannot be manually untoggled while "Expiré" is active (rule 7, `noClear`), because removing it out from under "Expiré" would leave the État group in a state "Expiré" depends on. The mirror image happens for **"Archivé"**.
- Removing the "En attente" pill directly from the active-filter-pills row is likewise blocked in `Reviews.jsx`'s `removeActiveFilter` whenever `expire` or `archive` is still selected, for the same reason.

Matching logic (`reviewMatchesFilters` in `filterReviews.js`) checks, for a real review: `source` (must include `review.source` if non-empty), `note` (via `getNoteCategory(review.rating)`), `nps` (via `getNpsFilterId(review.rating)`, itself just `getNpsCategory` mapped to filter ids), `type` (must include `review.certification`), `googleSharing` (must include `review.googleSharing`), `etat` (must include `review.status`) — but `Reviews.jsx` always strips `en-attente`/`expire`/`archive` out of `etat` before calling this (`reviewFilters`), so `etat` never actually narrows the real-review list; those three states instead redirect the whole page to the pending-questionnaire data source (§6 below). `reponse` is matched by `matchesReponseFilter` (`sans-reponse` ⇒ `!review.response`, `avis-repondu` ⇒ `Boolean(review.response)`), and `periode`/`periodeRange` by `matchesPeriode` in `filterReviews.js` (today / this week (Mon–Sun) / this month / this year / a custom Du–Au range, all evaluated against the fixed `TODAY` anchor).

The "Filtres" chip in the results row shows a numeric badge (`countActiveFilters`) and the row below it lists a removable pill per active option (`getActiveFilterEntries`/`removeFilterEntry`); one label is intentionally re-worded for consistency with the tab it echoes — the NPS pill for `detracteur` displays as **"Négatifs"** in this pill row (even though the chip inside Filtres itself still says "Détracteur"), because it's reached via the "Avis Négatifs" tab.

### 4. Sorting

`SortSheet.jsx`'s `SORT_OPTIONS`, applied via `SORT_COMPARATORS` in `Reviews.jsx` (default: `plus-recent`):

| id | Label | Description | Comparator |
|---|---|---|---|
| `plus-recent` | Plus récent | "Du plus récent au plus ancien" | `parseReviewDate(b.date) - parseReviewDate(a.date)` (descending by date) |
| `plus-ancien` | Plus ancien | "Du plus ancien au plus récent" | `parseReviewDate(a.date) - parseReviewDate(b.date)` (ascending by date) |
| `alphabetique` | Ordre alphabétique | "A → Z par nom d'auteur" | `a.author.localeCompare(b.author, 'fr')` |

Sorting is applied only to the real-review "Tous"/tab lists (`filteredReviews.sort(...)`); the pending/expired/archived questionnaire lists (§6) are rendered in whatever order they sit in `COMPANY_PENDING_REVIEWS`, unsorted. Changing sort order also resets pagination back to `PAGE_SIZE`.

### 5. Company / Collaborator switching

- `CompanySelectSheet.jsx` exposes 5 hardcoded companies (`COMPANIES`, e.g. `bastien-arfi` → "La Boîte Immobilière", `sofa-kingdom` → "Cabinet Moreau Immobilier", etc.). Default selection is `COMPANIES[0]`. The sheet has its own live text search (case-insensitive substring on `name`, no debounce) with a clear ("×") button and an "Aucun résultat pour « … »" empty state.
- Picking a company sets `selectedCompany`, resets `selectedCollaborator` back to `COLLABORATORS[0]` (`'all'`), and resets pagination to `PAGE_SIZE`. It does **not** clear active filters, sort order, or the current tab — only the underlying review/pending-questionnaire arrays swap (`COMPANY_REVIEWS_DATA[selectedCompany.id]`, `companyPendingReviews[selectedCompany.id]`).
- `CollaboratorSelectSheet.jsx` exposes `{ id: 'all', name: 'Tous les collaborateurs' }` plus 75 generated collaborators (`COLLABORATOR_COUNT`), built by cycling 47 first names × 47 last names; the first 9 keep plain `firstname-lastname` slugs (these are the ones actually referenced by `collaboratorId` in the mock review/pending data), the rest get an index-suffixed id. Same live search/clear/empty-state pattern as the company sheet.
- Picking a collaborator filters both the reviews array and the pending-questionnaire arrays down to `item.collaboratorId === selectedCollaborator.id` (skipped entirely when `'all'`), resets pagination to `PAGE_SIZE`, and — like company — leaves filters/sort/tab untouched.
- Both selections use a small UI transition: the summary-row label fades out for 180ms (`NAME_EXIT_MS`) before swapping to the new name, purely cosmetic.
- The two KPI tiles ("Opinion System" rating/count and "Google" rating/count) double as quick filter toggles: clicking one calls `toggleSourceFilter`, which adds/removes that source id (`opinion-system`/`google`) from the `source` filter group — identical effect to picking it inside Filtres. The counts shown on the tiles (`osReviewCount`/`googleReviewCount`) are always computed from the full, unfiltered `companyReviews` list (not from whatever's currently filtered), while the rating values (`companyData.kpiOS.rating`/`kpiGoogle.rating`) are static per-company mock numbers that don't recompute from the live review list.

### 6. Search / pagination

There is no search box on the Reviews page itself for filtering the review list — search only exists inside the Company and Collaborator sheets (§5), scoped to filtering *those* pickers' own lists.

Pagination on the real-review "Tous"/tab lists is infinite-scroll, not a "load more" button:
- `PAGE_SIZE = 10`. `visibleCount` starts at `PAGE_SIZE` and `visibleReviews = filteredReviews.slice(0, visibleCount)`.
- `hasMore = filteredReviews.length > visibleCount`.
- A zero-size sentinel `<div>` is rendered at the bottom of the list whenever `!isLoading && !isPendingView && hasMore`; an `IntersectionObserver` with `rootMargin: '200px'` watches it, and once it scrolls near the viewport, `visibleCount` increments by another `PAGE_SIZE` (no cap check beyond `hasMore` naturally becoming false).
- `visibleCount` is reset to `PAGE_SIZE` on every event that changes what should be visible: applying/resetting filters, changing sort order, switching company, switching collaborator, and toggling a tab.
- The pending/expired/archived questionnaire views (`pendingReviews`, `expiredPendingReviews`, `archivedPendingReviews`) are **not** paginated at all — they render their full filtered array every time, and the infinite-scroll effect is explicitly skipped while `isPendingView` is true.
- List changes (filter/sort/tab/company/collaborator) are wrapped in `withListTransition`: the current cards fade out for `LIST_EXIT_MS` (180ms) before the underlying state mutates and the new set fades back in, avoiding an abrupt swap.

---

## Mes Avis — Review Detail Actions & Sharing

### 1. Review detail sheet

`src/components/Reviews/ReviewDetailsSheet.jsx` is a bottom sheet opened by tapping a review card. Rather than stacking separate modals, it has one internal `view` state (`'details' | 'respond' | 'google-boost'`) and the same sheet morphs its content/title/footer between the three (`useSheetViewTransition`). It closes via backdrop tap, close (X) button, or drag-down, all going through a 380 ms close animation (`CLOSE_ANIMATION_MS = 380`).

**Details view** shows the review card (author initial avatar, author name, numeric score, date, star rating, review text) plus:
- **Your reply block** ("Votre réponse"), shown only if `review.response` is set, with a pencil icon that opens the respond view to edit it.
- **Info rows**: "Type de questionnaire" (`review.certification === 'certifie-os'` → "Certifié OS", else "Standard OS"); "Score NPS" (`getNpsScore`/10 plus a `Promoteur`/`Passif`/`Détracteur` badge from `getNpsCategory`); "Service" — a fake-but-stable service type deterministically derived from a hash of `review.id` (mock data has no real field for this); "Partage Google" — see §5.
- **Répartition des notes**: four bar rows (`reception`, `qualite`, `communication`, `delais`) rendered as `value/5` width bars.

**Actions available from the details view (footer):**
- **"Répondre"** — shown only when `!review.response`; switches to the respond view.
- **"Demander à partager sur Google"** — shown only when the review is not already Google-shared and has no reminder pending (`!isGoogleShared && !hasPendingGoogleReminder`); switches to the google-boost view (§5).
- If a response already exists, the reply button is replaced entirely by the "Votre réponse" block with its own edit pencil (no separate "reply" button once answered).

**Respond view** renders `RespondFields` with a controlled `replyText`. The footer's primary button reads "Répondre" for a first reply or "Enregistrer" when editing an existing one (`isEditing = Boolean(review.response)`), disabled until `replyText.trim().length > 0`. When editing, a secondary **"Supprimer la réponse"** button is also shown.
- Submit → `onSubmit(review, replyText.trim())`, then back to details view.
- Delete → `onDelete(review)`, clears the local draft text, back to details view.

**State transition on respond/delete** (handled in `src/components/Reviews/Reviews.jsx`, `updateReviewResponse`): submitting a response also sets the review's internal `status` field to `'archive'`; deleting the response reverts `status` to `'sans-reponse'`. This `status` is the same field the État filter group reads (`reviewFilters.etat` in `filterReviews.js`), so answering a review moves it out of the "Sans Réponse"/"À Récupérer" tab counts, and un-answering it (deleting the reply) puts it back.

### 2. Archiving

Archiving in this codebase applies **only to pending (unanswered) questionnaires**, not to submitted reviews — there is no "archive a review" action; the "archive" `status` value used by respond/delete above is a different, unrelated concept.

- Trigger: the kebab ("⋮") menu on a `PendingReviewCard` (`src/components/Reviews/PendingReviewCard.jsx`) shows **"Archiver"** (styled as a destructive action) whenever `item.archived` is falsy. Clicking it calls `onArchiveRequest(item)`.
- This opens `ConfirmArchiveModal` (`src/components/Reviews/ConfirmArchiveModal.jsx`) — a simple Oui/Non dialog: *"Êtes-vous sûr de vouloir archiver cet envoi ?"*.
- Confirming ("Oui") runs `handleConfirmArchive` in `Reviews.jsx`: sets `item.archived = true` in the `companyPendingReviews` state, closes the modal, and shows a toast "1 questionnaire en attente a été archivé" (`ResponseAlert`).
- **Reversible**: once `archived === true`, the same kebab menu instead shows **"Désarchiver"**, which calls `onUnarchive(item)` → `handleUnarchivePending` sets `archived = false` and shows "Le questionnaire a été désarchivé". There is no permanent/irreversible archive state.
- Effect on visibility: archived items disappear from the default "À Récupérer" list (`pendingReviews` filters out `item.archived`) and only reappear when the État filter's "Archivé" option is selected (`isArchivedView` in `Reviews.jsx`), where the card only offers Renvoyer + Désarchiver (no Modifier/Archiver).

### 3. Pending reviews / à récolter

A "pending" item represents a questionnaire that was **sent to a customer but never answered** — a wholly separate mock data source (`COMPANY_PENDING_REVIEWS` in `src/components/Reviews/mockPendingReviews.js`) from actual submitted reviews (`COMPANY_REVIEWS_DATA`). Each entry has `author`, `phone`/`email`, `service`, `certification`, `collaboratorId`, `sentDate`, `relanceDate` (last resend date, or `null`), `expiryDate`, and `archived`.

`PendingReviewCard` shows:
- Author name and a kebab menu: "Modifier" (opens the resend sheet directly on the recipient-edit view) / "Archiver" (see §2), or "Désarchiver" if already archived.
- Service label + a "Certifié OS" badge (with the small OS logo) when `certification === 'certifie-os'`.
- Status line: "Archivé" if archived; otherwise computed live from `expiryDate` via `getDaysUntil` — "Expiré" (< 0 days), "Expire aujourd'hui" (0), or "Expire dans N jour(s)" (> 0).
- Meta line: "Envoyé le {sentDate}" plus, if a resend has ever happened, "• Relancé le {relanceDate}".
- Footer **"Renvoyer"** button, always present, opening `ResendQuestionnaireSheet`.

In `Reviews.jsx`, the "À Récolter"/"À Récupérer" tab is a shortcut onto the État filter's `en-attente` option (`isPendingView`), which switches the whole list from reviews to this pending data source; expired items (`getDaysUntil < 0`) drop off this default list and only surface when "Expiré" is explicitly selected under Filtres.

### 4. Resend Questionnaire

`src/components/Reviews/ResendQuestionnaireSheet.jsx` has two morphing views, `'resend'` (default) and `'edit-recipient'`:

**Resend view:**
- Recipient card (avatar initial, name, contact = email or phone) with a warning line: *"{author} n'a pas encore répondu au questionnaire envoyé le {sentDate}."*
- Editable message textarea, pre-filled with a fixed message plus a per-item survey link: `https://avis.opinion-system.fr/r/{item.id}`.
- "Envoyer par" channel row: SMS / QR Code / Email buttons — **all three call the identical `handleSend`**, so the channel choice has no differing behavior in this build. A fourth "Plus" button is disabled/decorative.
- A footer pill, *"Laissez Opinion System l'envoyer par e-mail"* (with an OS badge and chevron), has no `onClick` handler wired — it renders as an option but is not functional here.
- `handleSend` calls `onResend(item)` and closes the sheet. In `Reviews.jsx`, `handleResendConfirmed` simply stamps `item.relanceDate = TODAY_STR` (`'06/09/2026'`) and shows "Questionnaire renvoyé avec succès". **There is no cooldown or resend-count/limit logic** — resend can be triggered any number of times; only the single most recent `relanceDate` is kept (no history).

**Edit-recipient view** (reached via the pencil icon on the recipient card, or directly via "Modifier" on the card's kebab menu): fields Prénom*, Nom de famille*, Email (optional), Numéro de téléphone* (required fields marked with `*`). "Enregistrer" is disabled until `firstName`, `lastName`, and `phone` are all non-empty (`isRecipientValid`). Saving joins first/last name into a single `author` string and calls `onSaveRecipient(item, { author, email, phone })`, which patches the pending item, shows "Le destinataire a été modifié", and returns to the resend view.

### 5. Google Boost / sharing

Shared copy, icons, and helper functions live in `src/components/Reviews/GoogleBoostShared.jsx` (reused identically by `Home/ReviewDetailSheet.jsx`).

**Entry point:** the "Demander à partager sur Google" button on a review's details view (§1), shown only when the review is neither already shared nor mid-reminder. It opens the `'google-boost'` view of the same sheet:
- Recipient card with a fabricated but stable phone number (`getReviewerPhone`: derived from a hash of `review.id`, formatted as a French mobile `+33 0X XX XX XX XX`) — mock data has no real reviewer contact info.
- Editable message textarea defaulting to `GOOGLE_BOOST_DEFAULT_MESSAGE`, which embeds one fixed Google review link for every recipient: `https://g.page/r/CQq3JZbG3XkPEB0/review` (`GOOGLE_REVIEW_URL`) — not a unique per-recipient token, unlike the resend link.
- "Envoyer par" channels: SMS / QR Code / Email all call the same `handleSendGoogleBoost`; "Plus" is disabled.

**Mechanics on send** (`handleSendGoogleBoost` in `Reviews.jsx`):
1. **Immediately**: sets `review.googleReminderSentDate = TODAY_STR` (`'06/09/2026'`), updates the open sheet's local copy of the review, shows toast "Rappel de duplication envoyé", and returns the sheet to the details view.
2. **After `GOOGLE_BOOST_CONFIRM_MS = 6000` ms (6 seconds)** — simulating "OS" confirming the reviewer actually accepted — the review flips to `googleSharing: 'google-partage'` and `googleReminderSentDate` is cleared back to `null`; the open sheet (if still showing that review) is updated; and `onAddNotification(buildGoogleShareConfirmedNotification(review))` fires, producing a notification of type `'googleShareConfirmed'` with message *"{author} a accepté de partager son avis sur Google"*, grouped `'today'`, `unread: true`, `actionable: false`, `actionCompleted: true`.
3. Pending timers are tracked in `googleBoostTimeoutsRef` and cleared on unmount of the `Reviews` component. Since `App.jsx` remounts each page fresh on navigation, **navigating away from "Mes Avis" before the 6 seconds elapse cancels the pending confirmation** — the review never flips to `google-partage` and the notification is never created, i.e. the "reminder sent" state can be left stuck (until re-triggered) if the user leaves too quickly.

**Displayed state** on the details view's "Partage Google" row (`hasPendingGoogleReminder = !isGoogleShared && Boolean(googleReminderSentDate)`): shows "Rappel envoyé le {date}" while pending, otherwise a Google icon plus "Partagé" or "Non Partagé". This also gates the visibility of the "Demander à partager sur Google" button itself (hidden once shared or pending).

### 6. Share Reviews sheet

`src/components/Reviews/ShareReviewsSheet.jsx` is opened from the share icon in the "Mes Avis" top app bar — it is **not tied to any individual review**; it shares the company's overall review/reputation page. `Reviews.jsx` passes it a hardcoded `url="https://sofakingdomrealtors.com"` regardless of which company is currently selected elsewhere on the page (a fidelity gap: switching "votre entreprise" does not change this link).

It offers exactly two actions, both against that single URL:
- **"Ouvrir le site"** — `window.open(url, '_blank', 'noopener,noreferrer')`, opening the link in a new tab.
- **"Partager le lien"** — uses the Web Share API (`navigator.share({ url })`) to hand off to the device's native share sheet when available; if unsupported, silently falls back to `navigator.clipboard.writeText(url)` with no confirmation toast shown to the user.

There is no multi-channel picker (SMS/QR/Email) here like the resend and Google-boost sheets — it is a single generic link-sharing utility for the business's public page.

---

## Récolter des Avis — Send Questionnaire Flow

### 1. Overview / step list

The flow is orchestrated by `Questionnaire.jsx` and presented as a single scrollable screen with three numbered step cards, opened one at a time as bottom sheets:

1. **Service** ("Quel service avez-vous récemment fourni ?") — opens `ServiceInputSheet`
2. **Questionnaire** ("Sélectionnez un questionnaire à envoyer") — opens `SurveySelectSheet`
3. **Destinataires** ("Sélectionnez votre(s) destinataire(s)") — opens `RecipientSelectSheet`

Each step's card is clickable/tappable regardless of whether the previous steps are filled in — there is no ordering lock, a user can open Step 3 before Step 1. A step is considered "completed" (checkmark badge, condensed summary, pencil-edit affordance) purely based on whether its piece of state is filled:
- Step 1 complete when `serviceAnswer` is a non-empty string
- Step 2 complete when `surveyAnswer` is non-null
- Step 3 complete when `recipients.length > 0`

**Progress bar**: `completedStepsCount` = count of the three booleans above that are true; `progressPercent = completedStepsCount / 3 * 100` fills the header progress bar.

**Footer CTA** ("Envoyer le questionnaire"): disabled unless `isComplete = Boolean(serviceAnswer) && Boolean(surveyAnswer) && recipients.length > 0` — i.e. all three steps must be filled (only one recipient is required, not all 5 slots). When enabled and tapped, it opens `SendQuestionnaireSheet`.

### 2. Step 1 — Service Input (`ServiceInputSheet.jsx`)

Opens in a "choices" view listing 4 preset services (capped intentionally — "the most common services, so the list stays a quick pick"), each with an icon and subtitle:

| id | Title | Subtitle | Icon |
|---|---|---|---|
| `vente` | Vente d'un bien | Accompagnement pour la vente d'une maison ou d'un appartement | `icon-service-tag` |
| `achat` | Achat d'un bien | Accompagnement pour l'achat d'une maison ou d'un appartement | `icon-service-house` |
| `location` | Location d'un bien | Mise en location d'un bien pour le compte du propriétaire | `icon-service-key` |
| `estimation` | Estimation immobilière | Évaluation de la valeur d'un bien immobilier | `icon-service-magnifier` |

Tapping a preset immediately submits its `title` as the answer and closes the sheet (no confirm step). Below the list is a 5th row, "Rédiger ma propre réponse" (icon `icon-add-recipient`, reused as an accent "add" icon), which switches to a "custom" view.

**Custom view**: a single `<textarea>` with:
- Placeholder text: "Exemple : Annonce exclusive : appartement de 2 chambres à Bordeaux"
- `MAX_LENGTH = 80` characters (enforced via the native `maxLength` attribute), with a live "`n`/80" counter
- Validation: `isValid = value.trim().length > 0` — the "Confirmer" button is disabled until at least one non-whitespace character is entered
- A banner above both views reads: "Les informations saisies ici seront visibles dans votre avis public. Assurez-vous qu'elles reflètent bien votre expérience." + "Sélectionnez une option ci-dessous ou rédigez votre propre texte."

Re-opening the sheet to edit a previous answer: if the saved answer exactly matches one of the 4 preset titles, it reopens on the "choices" view with that preset pre-checked; otherwise (`opensAsCustom`) it reopens directly on the "custom" view with the textarea pre-filled with the previous free-text answer.

### 3. Step 2 — Survey Select (`SurveySelectSheet.jsx`)

Two tabs, "Certifié" (default) and "Standard", each backed by a hardcoded list:

**Certifié** (`CERTIFIED_SURVEYS`):
- Transaction immobilière — "10 questions - 3 fois certifié"
- Satisfaction client — "10 questions - 3x certifié"
- Suivi post-questionnaire — "10 questions - 3x certifié"

**Standard** (`STANDARD_SURVEYS`):
- Equipe Interne — "10 questions - 3x certifié"
- Equipe Interne — "10 questions - 3x certifié" (a second, identically-named/identically-subtitled entry — the Standard items' subtitles still say "certifié," a copy inconsistency relative to what the tab banner says about Standard)

Each tab has its own explanatory banner (`TAB_INFO`):
- Certifié: "Certifié AFNOR triple et authentifié par Opinion System. Ces avis peuvent être partagés sur Google."
- Standard: "Questions ouvertes, sans vérification. Idéal pour les retours internes."

Functionally, "certified" means the questionnaire is presented as AFNOR-triple-certified and authenticated by Opinion System, and its resulting reviews are eligible to be shared to Google. "Standard" surveys are framed as open-ended, unverified, internal-feedback-only. Selecting any survey stores `{ ...survey, type: tab }` as the answer (so the answer object is tagged `certified` or `standard`), then closes the sheet and returns to Step 2's card, which now shows: the survey title/subtitle, a "Langue" dropdown (default `fr-FR` "Français (France)", 4 languages available: FR, `en-CA` "Anglais (Canada)", `nl-NL` "Néerlandais (Pays-Bas)", `it-IT` "Italien (Italie)"), and a "Catégorie" dropdown (default `logement` "Logement"; other options: `auto-ecole` "Auto-école", `assurance` "Assurance", `aide-personne` "Aide à la personne"). Both dropdowns are edited inline on the card without reopening the survey sheet; tapping the survey title/badge itself reopens the survey-picker sheet to change the questionnaire.

### 4. Step 3 — Recipient Select (`RecipientSelectSheet.jsx`)

**Search**: a single text input ("Entrez un nom, un numéro ou email") filters a static, hardcoded 19-person contact list (`CONTACTS`, e.g. "Annie Versaire", "Anita Listing", etc., each with a French `+33 6 …` phone number and no email). Matching logic: a contact matches if its name contains the (lower-cased) query, OR — if the query contains any digits — its phone number's digits contain the query's digits. There's a special case for French local-format numbers: a query starting with `0` (e.g. "06 12 34 56 78") is also checked against the digit string with the leading `0` replaced by country code `33`, so it still matches the stored `+33 6 12 34 56 78` form.

**Selecting**: tapping a contact row toggles it in/out of a `selectedIds` `Set`. The row shows a checkmark (`icon-check-selected`) when selected. There is also a "Minus"-style remove interaction, but that lives on the *step card* back in `Questionnaire.jsx` (`RecipientList`'s `icon-minus-circle` button), not inside this sheet — once recipients are confirmed and shown on the Step 3 card, each has its own pencil (edit) and minus-circle (remove) button.

**5-recipient cap**: `MAX_RECIPIENTS = 5`, enforced in two places:
- `toggleContact`: adding a new id to the selection is a no-op once `selectedIds.size` is already `5` (`else if (next.size < MAX_RECIPIENTS) next.add(id)`); removing is always allowed.
- The "Ajouter un contact" button and the "Ajouter comme nouveau contact" fallback button are both `disabled` once `canAddMore = selectedIds.size < MAX_RECIPIENTS` is false.
- A footer hint reads "Sélectionnez jusqu'à 5 destinataires."
- `Questionnaire.jsx` mirrors the same constant (`MAX_RECIPIENTS = 5`) to decide whether to show the "Ajouter un autre destinataire" button under the confirmed recipient list on the Step 3 card.

A "selected" pill ("`n` Sélectionnés" with a clear-X) appears once `selectedCount > 0` and clears the entire selection in one tap.

**No-results / add-new-contact path**: if the query has text and zero contacts match (`hasNoResults`), the list is replaced by "Aucun résultat pour « `query` »" and the footer button becomes "Ajouter comme nouveau contact." Tapping it (or the header's add-contact icon) opens the same sheet's "add-contact" view, pre-filling from the typed query via `prefillFromQuery`: if the query contains `@` it's treated as an email; if it's mostly digits (≥6 digits, no non-phone characters) it's treated as a phone number; otherwise the first word becomes first name and the rest becomes last name.

**Add-contact form fields**: Prénom, Nom, a language selector (`LanguageField`, defaulting to `'fr'`), Téléphone, Mail.

**Exact validation rule — the phone-OR-email dynamic-required-star logic**: `hasPhone = contactPhone.trim().length > 0`, `hasEmail = contactEmail.trim().length > 0`. The form is valid (`isContactValid`) only when first name AND last name are non-empty **and** (`hasPhone || hasEmail`) — i.e., phone and email are not each individually mandatory, but at least one of the two must be filled. This is reflected visually: the "Téléphone" label shows a trailing `*` only `{!hasEmail && '*'}` (i.e., only while email is empty), and the "Mail" label shows its `*` only `{!hasPhone && '*'}` (only while phone is empty) — so the two asterisks appear/disappear live as the other field is typed into, and both can disappear simultaneously once either field has content. The "Enregistrer" button is disabled until `isContactValid` is true. On save, a new contact object is created with `id: custom-${Date.now()}`, prepended to the contact list (so it's immediately visible without scrolling), auto-selected, and the view returns to "select."

Confirming the whole sheet ("Ajouter des destinataires (`n`)") is disabled while `selectedCount === 0`; it maps selected ids back to full contact objects (across both the static list and any newly-added custom contacts) and passes that array up via `onConfirm`, replacing `recipients` in `Questionnaire.jsx`.

### 5. Editing a recipient (`EditRecipientSheet.jsx`)

Opened from the pencil icon next to a recipient already added to the Step 3 card. Fields, all pre-filled from the existing recipient:
- Prénom* / Nom de famille* — derived by splitting `recipient.name` on the first space (`splitName`)
- Email * — pre-filled from `recipient.email || ''`
- Numéro de téléphone* — pre-filled from `recipient.phone`, with a (non-functional/decorative) France flag + chevron country-code control

**Important**: despite every field being labeled with a `*` ("Informations Requises" hint in the footer), there is **no actual validation gating the Save button** — `handleSave` has no `isValid`/disabled check at all; "Enregistrer" is always clickable. The only fallback logic is on the name: if both first and last name are cleared, the save falls back to keeping the original `recipient.name` (`[firstName, lastName].filter(Boolean).join(' ').trim() || recipient.name`). Email and phone are saved verbatim, even if left empty. Saving calls `onSave` with the updated recipient object, which `Questionnaire.jsx` splices into the `recipients` array by matching `id`.

### 6. Contacts permission modal (`ContactsPermissionModal.jsx`)

Triggered the first time the user tries to open Step 3 (`openRecipientSheet` in `Questionnaire.jsx`), gated by a ref (`hasContactsAccessRef`, not React state) that starts `false`:
- If access hasn't been granted yet, tapping the Step 3 card (or "Ajouter un autre destinataire") opens `ContactsPermissionModal` instead of `RecipientSelectSheet`.
- **Allow** (`handleAllowContacts`): sets `hasContactsAccessRef.current = true`, closes the permission modal, and immediately opens `RecipientSelectSheet`. Because this is a ref (persists for the component's lifetime, not reset by re-renders), the permission prompt is only ever shown once per visit to this flow — every subsequent open of Step 3 goes straight to the recipient sheet.
- **Deny** (`handleDenyContacts`, also triggered by tapping the backdrop): simply closes the modal. `RecipientSelectSheet` never opens, and the ref stays `false`, so the *next* attempt to open Step 3 will show the permission modal again.

Note this is purely cosmetic/simulated — there is no real device Contacts API call; it only gates access to the same hardcoded `CONTACTS` list inside `RecipientSelectSheet`.

### 7. Sending — simulation mechanics (`SendQuestionnaireSheet.jsx`)

This entire step is a simulation — no real SMS/email/QR interaction happens; it's a scripted UI that mimics switching to the Messages/Mail apps.

**Compose view** (the default view for the current recipient, paged via `currentIndex` / `‹ n/total ›` caret controls):
- **Destinataire** header showing avatar, name, and (in this view) `recipient.phone`
- **Message au destinataire**: an editable `<textarea>`, keyed per recipient in a `messages` state object (`messages[recipient.id]`). If untouched, it defaults to `getDefaultMessage(recipient)`: the fixed intro "Salut ! Pourriez-vous prendre un moment pour partager vos retours ? Cela nous aide vraiment. Merci !" followed by two line breaks and a per-recipient link `https://avis.opinion-system.fr/r/{recipient.id}`.
- **Envoyer par**: three channel buttons — SMS (`iconSms`), QR Code (`iconQrCode`), Email (`iconEmail`) — plus a permanently disabled 4th "Plus" placeholder button (no more channels are actually implemented). A channel button gets a "selected" highlight once that channel has been used for this recipient (`selectedChannels` Set).
- **"Laissez Opinion System l'envoyer par e-mail"** toggle: flips a boolean (`autoSendByEmail`) and rotates a chevron, but is not wired to any further send logic in the code — toggling it has no observable effect on sending.

**Opening a channel** (tapping SMS/QR Code/Email) swaps the whole content area to that channel's simulated screen (`channelScreen` state: `'sms' | 'email' | 'qrcode' | null`), with a back arrow in the header to return to compose.

- **SMS / Email screens** (share the same layout): a banner "Simulation de l'application Messages" (SMS) or "Simulation de l'application Mail" (Email); for Email only, an "Objet" field showing the fixed subject `Demande d'avis - Opinion System`; a read-only rendering of the same **Message** text from compose; and a confirm button labeled "Envoyer le SMS" or "Envoyer l'email". The recipient's contact line at the top switches from phone (compose/SMS) to a derived email address (Email screen only) — see below.
- **QR Code screen**: generates a real QR code image client-side (via the `qrcode` package, `QRCode.toDataURL`) encoding the URL `https://avis.opinion-system.fr/r/{recipient.id}`, rendered in a box; the confirm button reads "J'ai terminé."

**Derived email address**: `getRecipientEmail(recipient)` — if the recipient already has a real `.email` (only possible for manually-added contacts), it's used as-is; otherwise one is synthesized from the name: lower-cased, accented letters (à/â/á, è/ê/é/ë, etc.) folded to their unaccented equivalent, non `a-z`/space characters stripped, words joined with `.`, giving e.g. "annie.versaire", suffixed with `@exemple.fr`.

**Confirming a send** (`handleConfirmSend`, fired by any of the three channel screens' confirm button): the tapped channel is added to `selectedChannels`, and — critically — the *entire recipient* is immediately marked as sent by adding `recipient.id` to `sentIndices`, regardless of whether the other two channels were ever used. In other words, confirming just **one** channel is sufficient to consider that recipient "done"; there is no requirement to send via all three. After marking sent:
- If every recipient now has an entry in `sentIndices` (`sentIndices.size === recipients.length`), the whole batch is done: after a 600ms delay the sheet closes and `onSent` fires, which in `Questionnaire.jsx` (`handleQuestionnaireSent`) snapshots the result and shows the success screen.
- Otherwise, if the current recipient isn't the last one in the pager (`currentIndex < total - 1`), the view auto-advances to the next recipient (`goNext`) and returns to that recipient's compose screen, letting the same pick-a-channel-and-send flow repeat.
- A recipient already marked sent shows an "Envoyé" label in the header when paged back to.

### 8. Leave confirmation (`ConfirmLeaveModal.jsx`)

Triggered only from `Questionnaire.handleClose` (the header "X" close button — the send sheet, recipient sheet, etc. each just close on backdrop/drag without this check). The exact condition:

```
if (hasProgress && !sentResult) { show ConfirmLeaveModal } else { navigate to home directly }
```

where `hasProgress = Boolean(serviceAnswer) || Boolean(surveyAnswer) || recipients.length > 0`. So:
- **No warning** if nothing has been filled in yet (`hasProgress` false) — closes straight to Home.
- **No warning** once the questionnaire has actually been sent (`sentResult` truthy) — this is the explicit bypass for the success screen: even though `hasProgress` is still true at that point (service/survey/recipients are all still set), `sentResult` overrides it, since "there's nothing left to lose" once sending is complete.
- **Warning shown** in every other case — i.e., any of the three steps has been started/filled but sending hasn't happened yet.

The modal itself ("Êtes-vous sûr de vouloir quitter ? / Tous les changements seront perdus.") offers "Non, continuez où j'étais" (`onStay`, just closes the modal) and "Oui, retournez à l'accueil" (`onLeave`, navigates to `'home'`, discarding all in-progress state).

### 9. Success screen

Once `handleQuestionnaireSent` fires, `Questionnaire.jsx` replaces the step-card content with `SuccessContent` and snapshots a `sentResult` object: `{ recipients, service: serviceAnswer, survey: surveyAnswer, language, category }` — a frozen copy taken at the moment of sending, so it keeps displaying correctly even after the fields are reset for a new questionnaire. A toast/alert "Le questionnaire a été envoyé" also appears once (`ResponseAlert`, dismissible).

**Displayed content**:
- Confirmation line: "Votre questionnaire a été envoyé avec succès !"
- "Envoyé à :" header (checkmark badge) followed by one row per recipient: avatar (first letter of name), name, phone, and a static "sent" status icon (a disabled send-plane icon overlaid with a filled checkmark badge) — every recipient in the list is shown with this same sent indicator (the screen doesn't distinguish per-recipient channel used, since reaching this screen already implies all recipients are in `sentIndices`).
- A details block with four label/value rows (`SuccessFieldRow`, same layout pattern as Profile's info rows):
  - **Questionnaire** → `result.survey?.title`
  - **Langue** → `result.language.label` (e.g. "Français (France)")
  - **Catégorie** → `result.category.label` (e.g. "Logement")
  - **Service** → `result.service` (the free-text or preset service answer from Step 1)

**Footer** (replaces the normal "Envoyer le questionnaire" CTA while `sentResult` is set), two buttons:
- **"Envoyer un autre questionnaire"** (`handleSendAnother`): resets `serviceAnswer` to `''`, `surveyAnswer` to `null`, `recipients` to `[]`, `language`/`category` back to their defaults (`fr-FR`/`Logement`), and `sentResult` to `null` — returning the user to the empty 3-step list within the same `Questionnaire` screen to start a brand-new send.
- **"Accueil"**: calls `onNavigate?.('home')` directly, leaving the flow (no confirmation modal, and this button doesn't go through `handleClose` at all — it's a direct navigation call).

---

## Profile & Account Management

### 1. Profile overview page

The "Mon Compte" screen (`src/components/Profile/Profile.jsx`) is the account landing page, reached via the bottom navigation ("user" tab).

**What is displayed:**
- **Header / hero card**: an avatar icon, the logged-in user's full name (`firstName` + `lastName`), their role (e.g. "Manager"), and a chip showing the company name (with a small building icon) — currently hard-coded to a mock manager ("Marc Delacroix") at company "La Boîte Immobilière".
- **"Informations personnelles" card**: a read-only list of the user's own fields — Prénom (first name), Nom (last name), Langue (language, shown via its human-readable label, e.g. "Français (France)"), Téléphone (phone), and Mail (email).
- No company details, statistics, or collaborator list are rendered on this page in the current implementation — the page only surfaces the personal-info card.

**Actions available from this page:**
- **"Modifier mon profil"** button — opens the `EditProfileSheet` to edit the personal fields listed above.
- **"Déconnexion du compte"** (logout) button — calls the `onLogout` callback passed in from the parent app.
- Standard bottom navigation to move to other app sections.

Note: the codebase also contains fully-built components for editing the company profile (`EditCompanySheet`), viewing/managing collaborators (`CollaboratorsListSheet`), and adding/editing a single collaborator (`EditCollaboratorSheet`), but `Profile.jsx` does not currently import or render any of them and has no buttons/links that open them — they exist as ready-made UI pieces not yet wired into the visible Profile screen.

### 2. Editing personal profile

Triggered from the "Modifier mon profil" button, `EditProfileSheet.jsx` opens a bottom sheet (draggable, closes on backdrop tap, drag-down, or the close icon) pre-filled with the current user's data.

**Exact fields (all marked required with a trailing `*` and the footer hint "* Informations Requises"):**
- **Prénom*** — free text input.
- **Nom*** — free text input.
- **Langue** — not marked with an asterisk; rendered via the shared `LanguageField` dropdown (see section 5).
- **Téléphone*** — `type="tel"` input.
- **Mail*** — `type="email"` input.

**Validation rules:** There is no live/blocking validation (no error messages, no disabling of the Save button). The only safeguard is on save: if the trimmed **Prénom** or **Nom** value is empty, the code falls back to the original (pre-edit) value rather than saving a blank string:
```js
firstName: firstName.trim() || user.firstName,
lastName: lastName.trim() || user.lastName,
```
**Email** is trimmed the same way and falls back to the previous value if emptied, but otherwise has no format check beyond the browser's native `type="email"` input behavior. **Téléphone** and **Langue** are saved as-is with no trimming/fallback logic. On save, the sheet calls `onSave` with the merged user object and closes; `Profile.jsx`'s `handleSaveProfile` simply overwrites the local `currentUser` state (there is no backend call — data is in-memory only).

### 3. Editing company info

`EditCompanySheet.jsx` ("Profil de l'entreprise") is a bottom sheet for editing the company record, structured as `{ name, logoUrl, coverUrl, brandColors }`. (As noted above, no button in the current Profile page opens this sheet, but the component is complete.)

**Fields:**
- **Logo de l'entreprise** — an image upload control (click opens a hidden `<input type="file" accept="image/*">`). If no logo is set, a placeholder circle shows the first letter of the company name. Selecting a file creates a local preview via `URL.createObjectURL(file)` (no upload to a server — purely client-side object URL).
- **Image de couverture (utilisée pour l'attestation électronique)** — a second image upload, same mechanism, described as being used on the electronic certificate/attestation document. Shows an "Ajouter une image" placeholder when empty.
- **Couleurs de la marque (2 maximum)** — exactly two brand-color swatches (`MAX_BRAND_COLORS = 2`, and the initial array is sliced to that length even if more were supplied). Each swatch shows the current hex value and a pencil button that opens the `ColorPickerPopover` (see section 4) to change that specific color.

**Validation rules:** None are enforced explicitly — there are no required-field markers, and the Save button is always enabled. Logo/cover are optional (placeholders are shown when absent); the company `name` itself is not editable in this sheet (only used to derive the logo placeholder letter). Saving simply merges `{ logoUrl, coverUrl, brandColors }` into the existing company object and calls `onSave`.

### 4. Collaborators

**Data model:** A "collaborator" is a person record shaped just like the user's own profile — `{ id, firstName, lastName, language, phone, email }` — representing another team member (e.g. an agent/employee) that the manager/account owner can add to their company account, distinct from the account owner themself. Collaborators do **not** carry a color field in this codebase.

**List view — `CollaboratorsListSheet.jsx` ("Mes Collaborateurs"):**
- A search box ("Entrez un nom d'un collaborateur") filters the collaborator list by matching the search text (case-insensitive substring) against the concatenated `firstName + " " + lastName`; a clear ("x") button appears once text is typed.
- An "Ajouter un collaborateur" row/button at the top triggers `onAddCollaborator` to open the add flow.
- Each collaborator row shows an avatar icon, full name, email, and an edit (pencil) button that calls `onEditCollaborator(collaborator)`.
- If the filtered list is empty, an empty-state message is shown: "Aucun collaborateur ne correspond à « {search} »".

**Adding/editing — `EditCollaboratorSheet.jsx`:**
Used for both flows via an `isNew` flag (title becomes "Ajouter un collaborateur" vs. "Modifier le collaborateur"; the Delete button is hidden when `isNew` is true).

**Exact fields (all required, marked with `*`, same footer hint "* Informations Requises" as the profile sheet):**
- **Prénom*** — text input.
- **Nom*** — text input.
- **Langue** — via the shared `LanguageField` dropdown (no asterisk).
- **Téléphone*** — `type="tel"` input.
- **Mail*** — `type="email"` input.

**Validation rules:** Unlike the personal-profile sheet, there is **no fallback-to-previous-value** logic here — on save, `firstName`, `lastName`, and `email` are simply `.trim()`-ed and saved as typed (so they can be saved empty/blank with no blocking validation). `phone` and `language` are saved with no trimming. There is no live error display and the Save button is never disabled.

**Delete/remove logic:** When editing an existing collaborator (`isNew` is false), a "Supprimer" button (trash icon) appears in the footer. Clicking it plays the same closing animation as the other close actions and then calls `onDelete(collaborator.id)` — deletion is purely by id, with no confirmation dialog inside this component.

**Color-tagging:** There is no per-collaborator color field or picker anywhere in these files. The only color picker (`ColorPickerPopover.jsx`) is used exclusively inside `EditCompanySheet` for the two company **brand colors** — it is not connected to collaborators, and there is no evidence of colors being used to tag/distinguish reviews by collaborator. `ColorPickerPopover` offers 10 fixed preset swatches (`#2c95ff, #1cb68d, #041b44, #f7b600, #fc6530, #4527a0, #00d492, #8ea1b2, #ed6c02, #d32f2f`), highlights whichever preset matches the current color, and also allows free-form entry via a `#`-prefixed hex text input that strips non-hex characters and caps input at 6 characters. It positions itself under its anchor button, clamped to stay within the viewport, and closes when a click/tap occurs outside it.

### 5. Language selection

Supported languages are defined in `src/components/Profile/languages.js` as a fixed list of four locale/label/flag entries:
- `fr-FR` — "Français (France)"
- `en-CA` — "Anglais (Canada)"
- `nl-NL` — "Néerlandais (Pays-Bas)"
- `it-IT` — "Italien (Italie)"

A helper, `languageLabel(code)`, resolves a stored code to its display label (falling back to the raw code if unmatched); this is what the read-only Profile overview page uses to show "Langue" as e.g. "Français (France)" instead of the raw code.

The `LanguageField.jsx` component renders the selector: a row showing the selected language's flag icon and label with a chevron, which expands into a dropdown listing all four options (each with its own flag icon), highlighting the currently selected one. Selecting an item calls the passed-in `onChange(lang.code)` and closes the dropdown; clicking outside the field also closes it.

**Where it's used:** `LanguageField` is used in exactly two places — the personal-profile editor (`EditProfileSheet.jsx`) and the collaborator editor (`EditCollaboratorSheet.jsx`) — meaning each user account and each collaborator record carries its own independent `language` value (there's no single "app language" setting; it is a per-person attribute, presumably intended to drive the language of communications/documents sent to or generated for that person, though no such downstream usage is present in these files).

---

## Support Chat

### 1. Trigger button (FAB)

The chat is launched from a single floating action button rendered by `SupportChatFab.jsx`. It is a small circular button displaying an "AI" icon, with the accessible label "Ouvrir l'assistant support". The button accepts a `hidden` prop — when `hidden` is true, the FAB renders nothing at all, meaning the parent screen controls whether the bubble is shown on a given page. Clicking it calls the `onClick` handler passed in by the parent, which is responsible for opening the `SupportChatWindow` overlay (the FAB component itself holds no chat state — it's purely a trigger).

### 2. Chat window UI/flow

When opened, `SupportChatWindow` displays as a slide-in overlay/panel (with a backdrop that closes it on click, and a matching slide-down close animation) rather than a full page. It has three internal views, switchable via a bottom tab bar ("Chat" / "Aide") once the user leaves the main chat:

- **Chat view** (default): the actual conversation. It opens with a seeded bot greeting ("Bonjour ! Je suis l'assistant IA d'Opinion System. Posez vos questions et je me ferai un plaisir de vous aider."). The user types **free text only** — there are no clickable suggested-question chips inside the chat conversation itself. The input is a plain text field with an attach-file button (present in the UI but with no wired-up handler) and a send button that's disabled until the draft has non-whitespace content. Pressing Enter (without Shift) also sends. Below the input there's a permanent disclaimer: "Le contenu généré par l'IA peut être inexact." (AI-generated content may be inaccurate.)
- **Bot response pattern**: after the user sends a message, it's appended immediately, the input clears, and a typing indicator (three animated dots) appears for a fixed **750ms delay** (`setTimeout`), simulating "thinking." After that delay, `generateSupportReply(trimmed)` is called synchronously against the knowledge base (see below) and the resulting text is appended as a bot bubble with a timestamp and an "Assistant support" label. There is no streaming — the full reply appears at once after the delay.
- **History view** ("Chat" tab): a static, hard-coded list of past conversation previews. None of this is persisted or generated from real data — it's fixed mock content (`HISTORY_ITEMS`), and clicking any row just switches back to the live chat view.
- **Help view** ("Aide" tab): shows a hard-coded search box (non-functional — it just updates local state, nothing filters), a "Trending articles" list, and a "Browse categories" list (e.g., Questionnaire, Avis, Compact CRM, Outils, Mes avis dans Google, Mon compte, Accueil, Extranet, Site Web, Huwin), each with an article count. These are also static display data (`TRENDING_ARTICLES`, `HELP_CATEGORIES`) with no working navigation — the buttons don't do anything when clicked.

So overall: the only interactive, functional conversational path is free-text typing in the Chat view; the Help/History views are decorative/mock scaffolding.

### 3. Knowledge base matching logic

The matching logic lives entirely in `supportChatKnowledgeBase.js`, in the function `generateSupportReply(message)`. The algorithm is a simple **case-insensitive, accent-insensitive substring/keyword match** — not a scoring system, not exact-phrase matching, not fuzzy matching:

1. The incoming user message is lowercased.
2. It is then run through Unicode normalization (`normalize('NFD')`) and a regex strip of combining diacritical marks, which effectively removes accents (so "répondre" becomes "repondre").
3. The knowledge base is an ordered array of entries, each with a list of `keywords` (already written in unaccented lowercase form) and a canned `response` string.
4. The code does `KNOWLEDGE_BASE.find(entry => entry.keywords.some(keyword => normalized.includes(keyword)))` — it walks the array **in order** and returns the **first entry** for which **any one** of its keywords is a substring anywhere in the normalized message. There is no scoring, no "best match," and no minimum-word-boundary check (e.g., a keyword could match as part of a larger word) — it's a plain `String.includes()` substring test.
5. Because it stops at the first matching entry in array order, entries earlier in the list effectively take priority if a message happens to contain keywords from multiple entries.

The knowledge base entries (topics), in matching order, are:
1. **Sending a questionnaire / collecting reviews** — questionnaire, survey, review request, "recolter"
2. **Responding to a review / negative review** — repondre, avis negatif, avis, review, commentaire
3. **Notifications** — notification
4. **Managing collaborators/team** — collaborateur, equipe, employe
5. **Company info/branding** (logo, colors, cover image) — entreprise, logo, couleur, marque, couverture
6. **Password / login help** — mot de passe, connexion, login, connecter, identifiant
7. **Personal profile editing** — profil
8. **Greetings** (bonjour, salut, hello, coucou, bonsoir) — small-talk response
9. **Thanks** (merci) — small-talk response

### 4. Fallback behavior

If none of the knowledge-base entries' keywords appear anywhere in the normalized message, `generateSupportReply` returns a fixed `FALLBACK_RESPONSE`: "Je n'ai pas d'information précise à ce sujet. Vous pouvez reformuler votre question, ou contacter notre équipe support à support@opinionsystem.fr." This is shown exactly like a normal bot bubble, after the same 750ms typing delay — there is no escalation to a human agent, no ticket creation, and no logging of unanswered questions; it is purely a static text fallback pointing the user to an email address.
