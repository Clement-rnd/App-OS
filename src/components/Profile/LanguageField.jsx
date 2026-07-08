import { useEffect, useRef, useState } from 'react'
import iconDropdownChevron from '../../assets/questionnaire/icon-dropdown-chevron.svg'
import { LANGUAGES } from './languages'
import './LanguageField.css'

const DROPDOWN_CLOSE_ANIMATION_MS = 200

export function LanguageField({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const fieldRef = useRef(null)
  const selected = LANGUAGES.find(lang => lang.code === value) || LANGUAGES[0]

  const closeDropdown = () => {
    if (isClosing) return
    setIsClosing(true)
    setTimeout(() => {
      setIsOpen(false)
      setIsClosing(false)
    }, DROPDOWN_CLOSE_ANIMATION_MS)
  }

  const toggleDropdown = () => {
    if (isOpen) closeDropdown()
    else setIsOpen(true)
  }

  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = event => {
      if (fieldRef.current && !fieldRef.current.contains(event.target)) {
        closeDropdown()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  return (
    <div ref={fieldRef} className="profile-lang-field">
      <label className="profile-lang-field__label">Langue</label>
      <div
        className="profile-lang-field__row"
        onClick={toggleDropdown}
        role="button"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            toggleDropdown()
          }
        }}
      >
        <img src={selected.flag} alt="" className="profile-lang-field__flag" />
        <span className="profile-lang-field__value">{selected.label}</span>
        <span className="profile-lang-field__chevron" aria-hidden="true">
          <img src={iconDropdownChevron} alt="" />
        </span>
      </div>
      {isOpen && (
        <div className={`profile-lang-field__dropdown${isClosing ? ' profile-lang-field__dropdown--closing' : ''}`}>
          {LANGUAGES.map((lang, index) => (
            <button
              key={lang.code}
              type="button"
              className={`profile-lang-field__dropdown-item${
                lang.code === selected.code ? ' profile-lang-field__dropdown-item--selected' : ''
              }`}
              style={{ animationDelay: `${index * 40}ms` }}
              onClick={() => {
                onChange(lang.code)
                closeDropdown()
              }}
            >
              <img src={lang.flag} alt="" />
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
