import { useState } from 'react'
import iconClose from '../../assets/questionnaire/icon-sheet-close.svg'
import iconSearch from '../../assets/recipients/icon-search.svg'
import iconClearX from '../../assets/recipients/icon-clear-x.svg'
import iconCheckSelected from '../../assets/recipients/icon-check-selected.svg'
import { useSheetDrag } from '../../hooks/useSheetDrag'
import './RecipientSelectSheet.css'

const CLOSE_ANIMATION_MS = 380
const SHEET_ENTRANCE_MS = 380
const MAX_RECIPIENTS = 5

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
]

export function RecipientSelectSheet({ initialSelected, onClose, onConfirm }) {
  const [query, setQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState(() => new Set((initialSelected || []).map(c => c.id)))
  const [isClosing, setIsClosing] = useState(false)

  const closeWithAnimation = callback => {
    if (isClosing) return
    setIsClosing(true)
    setTimeout(callback, CLOSE_ANIMATION_MS)
  }

  const { dragHandlers, dragStyle, isDragClosing } = useSheetDrag({
    onRequestClose: () => closeWithAnimation(onClose),
    closeDurationMs: CLOSE_ANIMATION_MS,
  })

  const normalizedQuery = query.trim().toLowerCase()
  const queryDigits = query.replace(/\D/g, '')
  // A French number typed with its leading 0 (e.g. "06 12 34 56 78") should still match
  // the stored "+33 6 12 34 56 78" form, where the country code replaces that leading 0.
  const queryDigitsWithCountryCode = queryDigits.startsWith('0') ? `33${queryDigits.slice(1)}` : null
  const filtered = CONTACTS.filter(c => {
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

  const handleConfirm = () => {
    const selectedContacts = CONTACTS.filter(c => selectedIds.has(c.id))
    closeWithAnimation(() => onConfirm(selectedContacts))
  }

  return (
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
              placeholder="Entrez un nom, un numero ou email"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
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
        </div>

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
  )
}
