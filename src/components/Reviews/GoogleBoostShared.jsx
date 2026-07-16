// Shared between Reviews/ReviewDetailsSheet.jsx and Home/ReviewDetailSheet.jsx
// -- both sheets offer the identical "Demander à partager sur Google" flow,
// so its icons/copy/derived contact info live here once instead of being
// forked across two files.

// The Google review link itself (not a per-recipient token like the survey
// link SendQuestionnaireSheet builds) -- everyone asked to boost the same
// business's Google presence gets the same page, so it's baked directly
// into the message text instead of living in a separate, disconnected "URL"
// caption underneath.
const GOOGLE_REVIEW_URL = 'https://g.page/r/CQq3JZbG3XkPEB0/review'

export const GOOGLE_BOOST_DEFAULT_MESSAGE = `Salut ! Pourriez-vous prendre un moment pour partager vos retours ? Cela nous aide vraiment. Merci !\n\n${GOOGLE_REVIEW_URL}`

function hashId(id) {
  return id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
}

// The mock data has no contact info for the reviewer, so derive a plausible,
// stable phone number instead of hand-authoring one onto every mock entry.
// Always 9 digits starting with 6 (600000000-699999999), formatted like a
// French mobile number.
export function getReviewerPhone(review) {
  const hash = hashId(review.id)
  const nine = String(600000000 + (hash % 99999999))
  return `+33 0${nine[0]} ${nine.slice(1, 3)} ${nine.slice(3, 5)} ${nine.slice(5, 7)} ${nine.slice(7, 9)}`
}

// Google's own brand colors, one per letter, so "Google" in the sheet title
// reads as the actual Google wordmark instead of plain text.
const GOOGLE_WORDMARK_LETTERS = [
  { char: 'G', color: '#4285f4' },
  { char: 'o', color: '#ea4335' },
  { char: 'o', color: '#fbbc05' },
  { char: 'g', color: '#4285f4' },
  { char: 'l', color: '#34a853' },
  { char: 'e', color: '#ea4335' },
]

export function GoogleWordmark() {
  return (
    <>
      {GOOGLE_WORDMARK_LETTERS.map((letter, index) => (
        <span key={index} style={{ color: letter.color }}>
          {letter.char}
        </span>
      ))}
    </>
  )
}

export function SmsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 4h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H9l-4 4v-4H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"
        fill="currentColor"
      />
    </svg>
  )
}

export function QrCodeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3 3h7v7H3V3zm2 2v3h3V5H5zm9-2h7v7h-7V3zm2 2v3h3V5h-3zM3 14h7v7H3v-7zm2 2v3h3v-3H5zm11-2h2v2h-2v-2zm4 0h1v2h-1v-2zm-4 4h1v1h-1v-1zm0 3h1v1h-1v-1zm3-3h2v1h-2v-1zm0 3h2v1h-2v-1zm2-5h1v5h-1v-5z"
        fill="currentColor"
      />
    </svg>
  )
}

export function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm1 2.4V17h14V7.4l-6.4 4.48a1 1 0 0 1-1.2 0L5 7.4zm.8-.4L12 10.6 18.2 7H5.8z"
        fill="currentColor"
      />
    </svg>
  )
}

export function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6 12a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm7.5 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM21 12a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"
        fill="currentColor"
      />
    </svg>
  )
}
