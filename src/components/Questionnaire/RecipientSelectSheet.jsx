import { useState } from 'react'
import iconClose from '../../assets/questionnaire/icon-sheet-close.svg'
import iconSearch from '../../assets/recipients/icon-search.svg'
import iconClearX from '../../assets/recipients/icon-clear-x.svg'
import iconCheckSelected from '../../assets/recipients/icon-check-selected.svg'
import iconAddContact from '../../assets/recipients/icon-add-contact.svg'
import { useSheetDrag } from '../../hooks/useSheetDrag'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import { AddContactSheet } from './AddContactSheet'
import './RecipientSelectSheet.css'

const CLOSE_ANIMATION_MS = 380
const SHEET_ENTRANCE_MS = 380
const MAX_RECIPIENTS = 5

// Best-effort split of whatever the user typed in the search field into the
// AddContactSheet's separate fields, so re-typing it there isn't required.
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
  const [query, setQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState(() => new Set((initialSelected || []).map(c => c.id)))
  const [isClosing, setIsClosing] = useState(false)
  // A recipient added by hand from the "no results" state below (a phone
  // number/email that isn't a saved contact) -- kept separate from the
  // static CONTACTS list, merged back in for search/selection/confirm.
  const [customContacts, setCustomContacts] = useState([])
  const [isAddContactOpen, setAddContactOpen] = useState(false)

  const closeWithAnimation = callback => {
    if (isClosing) return
    setIsClosing(true)
    setTimeout(callback, CLOSE_ANIMATION_MS)
  }

  const { dragHandlers, dragStyle, isDragClosing } = useSheetDrag({
    onRequestClose: () => closeWithAnimation(onClose),
    closeDurationMs: CLOSE_ANIMATION_MS,
  })

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

  // "No results" state: the typed value isn't a saved contact -- open the
  // same "new contact" form used for collaborators, prefilled from what was
  // typed, then add and select the result once it's saved.
  const handleOpenAddContact = () => {
    if (selectedIds.size >= MAX_RECIPIENTS) return
    setAddContactOpen(true)
  }

  const handleSaveNewContact = contact => {
    setCustomContacts(prev => [...prev, contact])
    setSelectedIds(prev => new Set(prev).add(contact.id))
    setQuery('')
    setAddContactOpen(false)
  }

  const handleConfirm = () => {
    const selectedContacts = allContacts.filter(c => selectedIds.has(c.id))
    closeWithAnimation(() => onConfirm(selectedContacts))
  }

  return (
    <>
    <div className={`recipient-sheet-overlay${isClosing ? ' recipient-sheet-overlay--closing' : ''}`}>
      <div className="recipient-sheet-backdrop" onClick={() => closeWithAnimation(onClose)} />
      <div
        className={`recipient-sheet${isClosing && !isDragClosing ? ' recipient-sheet--closing' : ''}`}
        role="dialog"
        aria-label="Ajouter des destinataires"
        style={dragStyle}
      >
        <div className="recipient-sheet__handle-row" {...dragHandlers}>
          <span className="recipient-sheet__handle" />
        </div>

        <div className="recipient-sheet__appbar">
          <p className="recipient-sheet__title">Ajouter des destinataires</p>
          <button
            type="button"
            className="recipient-sheet__close"
            onClick={() => closeWithAnimation(onClose)}
            aria-label="Fermer"
          >
            <img src={iconClose} alt="" />
          </button>
        </div>

        <div className="recipient-sheet__search-wrap" style={{ animationDelay: `${SHEET_ENTRANCE_MS}ms` }}>
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

        <div className="recipient-sheet__results-row" style={{ animationDelay: `${SHEET_ENTRANCE_MS + 60}ms` }}>
          <p className="recipient-sheet__results-label">
            {query ? `Contacts Trouvés (${filtered.length})` : `Contacts (${filtered.length})`}
          </p>
          {selectedCount > 0 && (
            <button type="button" className="recipient-sheet__selected-pill" onClick={() => setSelectedIds(new Set())}>
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
            disabled={selectedIds.size >= MAX_RECIPIENTS}
          >
            <img src={iconAddContact} alt="" />
          </button>
        </div>

        {query && filtered.length === 0 ? (
          <div className="recipient-sheet__empty">
            <p className="recipient-sheet__empty-text">Aucun résultat pour « {query.trim()} »</p>
            <button
              type="button"
              className="recipient-sheet__empty-add-btn"
              onClick={handleOpenAddContact}
              disabled={selectedIds.size >= MAX_RECIPIENTS}
            >
              <img src={iconAddContact} alt="" />
              <span>Ajouter comme nouveau contact</span>
            </button>
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
                  style={{ animationDelay: `${SHEET_ENTRANCE_MS + 60 + Math.min(index, 5) * 50}ms` }}
                  onClick={() => toggleContact(contact.id)}
                >
                  <span className="recipient-sheet__avatar">{contact.name[0]}</span>
                  <span className="recipient-sheet__item-text">
                    <span className="recipient-sheet__item-name">{contact.name}</span>
                    <span className="recipient-sheet__item-phone">{contact.phone}</span>
                  </span>
                  {isSelected && <img src={iconCheckSelected} alt="" className="recipient-sheet__item-check" />}
                </button>
              )
            })}
          </div>
        )}

        <div className="recipient-sheet__footer">
          <p className="recipient-sheet__footer-hint">Sélectionnez jusqu'à {MAX_RECIPIENTS} destinataires</p>
          <button
            type="button"
            className={`recipient-sheet__confirm-btn${selectedCount > 0 ? ' recipient-sheet__confirm-btn--enabled' : ''}`}
            disabled={selectedCount === 0}
            onClick={handleConfirm}
          >
            Ajouter des destinataires ({selectedCount})
          </button>
          <div className="recipient-sheet__home-indicator-wrap" />
        </div>
      </div>
    </div>

    {isAddContactOpen && (
      <AddContactSheet
        initialValue={prefillFromQuery(query)}
        onClose={() => setAddContactOpen(false)}
        onSave={handleSaveNewContact}
      />
    )}
    </>
  )
}
