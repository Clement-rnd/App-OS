import { useState } from 'react'
import iconClose from '../../assets/questionnaire/icon-sheet-close.svg'
import iconSave from '../../assets/questionnaire/icon-save.svg'
import iconSearch from '../../assets/recipients/icon-search.svg'
import iconClearX from '../../assets/recipients/icon-clear-x.svg'
import iconCheckSelected from '../../assets/recipients/icon-check-selected.svg'
import iconAddContact from '../../assets/recipients/icon-add-contact.svg'
import { useSheetDrag } from '../../hooks/useSheetDrag'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import { useSheetViewTransition } from '../../hooks/useSheetViewTransition'
import { useStandaloneScreenHeight } from '../../hooks/useStandaloneScreenHeight'
import { LanguageField } from '../Profile/LanguageField'
import './RecipientSelectSheet.css'

const CLOSE_ANIMATION_MS = 380
const MAX_RECIPIENTS = 5

// Best-effort split of whatever the user typed in the search field into the
// add-contact view's separate fields, so re-typing it there isn't required.
function prefillFromQuery(raw) {
  const trimmed = raw.trim()
  if (!trimmed) return {}
  if (trimmed.includes('@')) return { email: trimmed }
  const digits = trimmed.replace(/\D/g, '')
  const nonDigitChars = trimmed.replace(/[\d\s+().-]/g, '')
  if (digits.length >= 6 && !nonDigitChars) return { phone: trimmed }
  const [firstName, ...rest] = trimmed.split(' ')
  return { firstName: firstName || '', lastName: rest.join(' ') }
}

const CONTACTS = [
  { id: 'annie', name: 'Annie Versaire', phone: '+33 6 12 34 56 78' },
  { id: 'anita', name: 'Anita Listing', phone: '+33 6 23 45 67 89' },
  { id: 'artie', name: 'Artie Choke', phone: '+33 6 34 56 78 90' },
  { id: 'beau', name: 'Beau Nanza', phone: '+33 6 45 67 89 01' },
  { id: 'bill', name: 'Bill DR.House', phone: '+33 6 56 78 90 12' },
  { id: 'justin', name: 'Justin Time', phone: '+33 6 67 89 01 23' },
  { id: 'lou', name: 'Lou Natic', phone: '+33 6 78 90 12 34' },
  { id: 'moe', name: 'Moe Lasses', phone: '+33 6 89 01 23 45' },
  { id: 'sue', name: 'Sue Fley', phone: '+33 6 90 12 34 56' },
  { id: 'rick', name: "Rick O'Shea", phone: '+33 6 11 22 33 44' },
  { id: 'barb', name: 'Barb Dwyer', phone: '+33 6 15 26 37 48' },
  { id: 'manuel', name: 'Manuel Labor', phone: '+33 6 20 31 42 53' },
  { id: 'terry', name: 'Terry Aki', phone: '+33 6 25 36 47 58' },
  { id: 'paige', name: 'Paige Turner', phone: '+33 6 30 41 52 63' },
  { id: 'stan', name: 'Stan Dupp', phone: '+33 6 35 46 57 68' },
  { id: 'warren', name: 'Warren Peace', phone: '+33 6 40 51 62 73' },
  { id: 'marge', name: 'Marge Arita', phone: '+33 6 44 55 66 77' },
  { id: 'carrie', name: 'Carrie Oki', phone: '+33 6 50 61 72 83' },
  { id: 'robin', name: 'Robin Banks', phone: '+33 6 60 71 82 93' },
]

export function RecipientSelectSheet({ initialSelected, onClose, onConfirm }) {
  useLockBodyScroll()
  const screenHeight = useStandaloneScreenHeight()
  const [query, setQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState(() => new Set((initialSelected || []).map(c => c.id)))
  const [isClosing, setIsClosing] = useState(false)
  // A recipient added by hand from the "no results" state below (a phone
  // number/email that isn't a saved contact) -- kept separate from the
  // static CONTACTS list, merged back in for search/selection/confirm.
  const [customContacts, setCustomContacts] = useState([])
  // 'select' | 'add-contact' -- switching between them morphs the content of
  // this same sheet instead of stacking a second sheet on top of itself
  // (same pattern as ReviewDetailsSheet/ResendQuestionnaireSheet), so the two
  // no longer render as separate, visibly overlapping sheets.
  const [view, setView] = useState('select')
  const [contactFirstName, setContactFirstName] = useState('')
  const [contactLastName, setContactLastName] = useState('')
  const [contactLanguage, setContactLanguage] = useState('fr')
  const [contactPhone, setContactPhone] = useState('')
  const [contactEmail, setContactEmail] = useState('')

  const closeWithAnimation = callback => {
    if (isClosing) return
    setIsClosing(true)
    setTimeout(callback, CLOSE_ANIMATION_MS)
  }

  // Dragging down or tapping the backdrop/close button while adding a
  // contact returns to the recipient list instead of dropping the whole
  // flow -- only from the select view do those gestures close the sheet.
  const requestClose = () => {
    if (view === 'add-contact') {
      withViewTransition('select')
    } else {
      closeWithAnimation(onClose)
    }
  }

  const { dragHandlers, dragStyle, isDragClosing } = useSheetDrag({
    onRequestClose: requestClose,
    closeDurationMs: CLOSE_ANIMATION_MS,
  })

  const {
    swapInnerRef,
    footerInnerRef,
    isContentExiting,
    withViewTransition,
    swapStyle,
    onSwapTransitionEnd,
    footerStyle,
    onFooterTransitionEnd,
  } = useSheetViewTransition(view, setView)

  const allContacts = [...CONTACTS, ...customContacts]
  const normalizedQuery = query.trim().toLowerCase()
  const queryDigits = query.replace(/\D/g, '')
  // A French number typed with its leading 0 (e.g. "06 12 34 56 78") should still match
  // the stored "+33 6 12 34 56 78" form, where the country code replaces that leading 0.
  const queryDigitsWithCountryCode = queryDigits.startsWith('0') ? `33${queryDigits.slice(1)}` : null
  const filtered = allContacts.filter(c => {
    if (c.name.toLowerCase().includes(normalizedQuery)) return true
    if (!queryDigits) return false
    const phoneDigits = c.phone.replace(/\D/g, '')
    return (
      phoneDigits.includes(queryDigits) ||
      (queryDigitsWithCountryCode !== null && phoneDigits.includes(queryDigitsWithCountryCode))
    )
  })
  const selectedCount = selectedIds.size
  const canAddMore = selectedIds.size < MAX_RECIPIENTS
  const hasNoResults = query.length > 0 && filtered.length === 0

  const toggleContact = id => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else if (next.size < MAX_RECIPIENTS) {
        next.add(id)
      }
      return next
    })
  }

  // "No results" state: the typed value isn't a saved contact -- morph into
  // the same "new contact" form used for collaborators, prefilled from what
  // was typed, then add and select the result once it's saved.
  const handleOpenAddContact = () => {
    if (!canAddMore) return
    const prefill = prefillFromQuery(query)
    setContactFirstName(prefill.firstName || '')
    setContactLastName(prefill.lastName || '')
    setContactLanguage('fr')
    setContactPhone(prefill.phone || '')
    setContactEmail(prefill.email || '')
    withViewTransition('add-contact')
  }

  const isContactValid =
    contactFirstName.trim().length > 0 &&
    contactLastName.trim().length > 0 &&
    contactPhone.trim().length > 0 &&
    contactEmail.trim().length > 0

  const handleSaveContact = () => {
    if (!isContactValid) return
    const name = [contactFirstName, contactLastName].filter(Boolean).join(' ').trim()
    const contact = {
      id: `custom-${Date.now()}`,
      name,
      language: contactLanguage,
      phone: contactPhone.trim(),
      email: contactEmail.trim(),
    }
    setCustomContacts(prev => [...prev, contact])
    setSelectedIds(prev => new Set(prev).add(contact.id))
    setQuery('')
    withViewTransition('select')
  }

  const handleConfirm = () => {
    const selectedContacts = allContacts.filter(c => selectedIds.has(c.id))
    closeWithAnimation(() => onConfirm(selectedContacts))
  }

  return (
    <div
      className={`recipient-sheet-overlay${isClosing ? ' recipient-sheet-overlay--closing' : ''}`}
      style={{ height: screenHeight }}
    >
      <div className="recipient-sheet-backdrop" onClick={requestClose} />
      <div
        className={`recipient-sheet${isClosing && !isDragClosing ? ' recipient-sheet--closing' : ''}`}
        role="dialog"
        aria-label={view === 'add-contact' ? 'Ajouter un contact' : 'Ajouter des destinataires'}
        style={{ ...dragStyle, maxHeight: screenHeight * 0.9 }}
      >
        <div className="recipient-sheet__handle-row" {...dragHandlers}>
          <span className="recipient-sheet__handle" />
        </div>

        <div className="recipient-sheet__appbar">
          <div
            key={view}
            className={`recipient-sheet__appbar-main${isContentExiting ? ' recipient-sheet__appbar-main--exiting' : ''}`}
          >
            <p className="recipient-sheet__title">
              {view === 'add-contact' ? 'Ajouter un contact' : 'Ajouter des destinataires'}
            </p>
          </div>
          <button type="button" className="recipient-sheet__close" onClick={requestClose} aria-label="Fermer">
            <img src={iconClose} alt="" />
          </button>
        </div>

        <div className="recipient-sheet__swap" style={swapStyle} onTransitionEnd={onSwapTransitionEnd}>
          <div
            key={view}
            ref={swapInnerRef}
            className={`recipient-sheet__swap-inner${isContentExiting ? ' recipient-sheet__swap-inner--exiting' : ''}`}
          >
            {view === 'select' ? (
              <>
                <div className="recipient-sheet__search-wrap">
                  <div className="recipient-sheet__search">
                    <img src={iconSearch} alt="" />
                    <input
                      type="text"
                      className="recipient-sheet__search-input"
                      placeholder="Entrez un nom, un numéro ou email"
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                    />
                    {query && (
                      <button
                        type="button"
                        className="recipient-sheet__search-clear"
                        onClick={() => setQuery('')}
                        aria-label="Effacer la recherche"
                      >
                        <img src={iconClearX} alt="" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="recipient-sheet__results-row">
                  <p className="recipient-sheet__results-label">
                    {query ? `Contacts Trouvés (${filtered.length})` : `Contacts (${filtered.length})`}
                  </p>
                  {selectedCount > 0 && (
                    <button
                      type="button"
                      className="recipient-sheet__selected-pill"
                      onClick={() => setSelectedIds(new Set())}
                    >
                      <span>
                        <strong>{selectedCount}</strong> Sélectionnés
                      </span>
                      <img src={iconClearX} alt="" />
                    </button>
                  )}
                  <button
                    type="button"
                    className="recipient-sheet__add-contact-btn"
                    aria-label="Ajouter un contact"
                    onClick={handleOpenAddContact}
                    disabled={!canAddMore}
                  >
                    <img src={iconAddContact} alt="" />
                  </button>
                </div>

                {hasNoResults ? (
                  <div className="recipient-sheet__empty">
                    <p className="recipient-sheet__empty-text">Aucun résultat pour « {query.trim()} »</p>
                  </div>
                ) : (
                  <div className="recipient-sheet__list">
                    {filtered.map((contact, index) => {
                      const isSelected = selectedIds.has(contact.id)
                      return (
                        <button
                          key={contact.id}
                          type="button"
                          className={`recipient-sheet__item${isSelected ? ' recipient-sheet__item--selected' : ''}`}
                          style={{ animationDelay: `${Math.min(index, 5) * 50}ms` }}
                          onClick={() => toggleContact(contact.id)}
                        >
                          <span className="recipient-sheet__avatar">{contact.name[0]}</span>
                          <span className="recipient-sheet__item-text">
                            <span className="recipient-sheet__item-name">{contact.name}</span>
                            <span className="recipient-sheet__item-phone">{contact.phone}</span>
                          </span>
                          {isSelected && (
                            <img src={iconCheckSelected} alt="" className="recipient-sheet__item-check" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </>
            ) : (
              <div className="recipient-sheet__add-contact-fields">
                <div className="recipient-sheet__field">
                  <label className="recipient-sheet__field-label">Prénom*</label>
                  <input
                    type="text"
                    className="recipient-sheet__field-input"
                    value={contactFirstName}
                    onChange={e => setContactFirstName(e.target.value)}
                  />
                </div>

                <div className="recipient-sheet__field">
                  <label className="recipient-sheet__field-label">Nom*</label>
                  <input
                    type="text"
                    className="recipient-sheet__field-input"
                    value={contactLastName}
                    onChange={e => setContactLastName(e.target.value)}
                  />
                </div>

                <div className="recipient-sheet__field">
                  <LanguageField value={contactLanguage} onChange={setContactLanguage} />
                </div>

                <div className="recipient-sheet__field">
                  <label className="recipient-sheet__field-label">Téléphone*</label>
                  <input
                    type="tel"
                    className="recipient-sheet__field-input"
                    value={contactPhone}
                    onChange={e => setContactPhone(e.target.value)}
                  />
                </div>

                <div className="recipient-sheet__field">
                  <label className="recipient-sheet__field-label">Mail*</label>
                  <input
                    type="email"
                    className="recipient-sheet__field-input"
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="recipient-sheet__footer">
          <div className="recipient-sheet__footer-frame" style={footerStyle} onTransitionEnd={onFooterTransitionEnd}>
            <div
              key={view}
              ref={footerInnerRef}
              className={`recipient-sheet__footer-buttons${isContentExiting ? ' recipient-sheet__footer-buttons--exiting' : ''}`}
            >
              {view === 'select' ? (
                <>
                  <p className="recipient-sheet__footer-hint">Sélectionnez jusqu'à {MAX_RECIPIENTS} destinataires</p>
                  {hasNoResults ? (
                    <button
                      type="button"
                      className={`recipient-sheet__confirm-btn${canAddMore ? ' recipient-sheet__confirm-btn--enabled' : ''}`}
                      onClick={handleOpenAddContact}
                      disabled={!canAddMore}
                    >
                      <img src={iconAddContact} alt="" />
                      Ajouter comme nouveau contact
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={`recipient-sheet__confirm-btn${selectedCount > 0 ? ' recipient-sheet__confirm-btn--enabled' : ''}`}
                      disabled={selectedCount === 0}
                      onClick={handleConfirm}
                    >
                      Ajouter des destinataires ({selectedCount})
                    </button>
                  )}
                </>
              ) : (
                <>
                  <p className="recipient-sheet__footer-hint">* Informations Requises</p>
                  <button
                    type="button"
                    className={`recipient-sheet__confirm-btn${isContactValid ? ' recipient-sheet__confirm-btn--enabled' : ''}`}
                    disabled={!isContactValid}
                    onClick={handleSaveContact}
                  >
                    <img src={iconSave} alt="" />
                    Enregistrer
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="recipient-sheet__home-indicator-wrap" />
        </div>
      </div>
    </div>
  )
}
