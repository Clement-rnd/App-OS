import { useState } from 'react'
import logo from '../../assets/opinion-system-logo.svg'
import { CompanySelectSheet } from './CompanySelectSheet'
import './SelectCompany.css'

export const COMPANIES = [
  'Sofa Kingdom Realtors',
  'Tech Solutions Inc.',
  'Green Valley Properties',
  'Urban Nest Realty',
]

export function SelectCompany({ onContinue }) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selected, setSelected] = useState(COMPANIES[0])

  const handleSelectCompany = company => {
    setSelected(company)
    setSheetOpen(false)
    setTimeout(() => onContinue?.(company), 400)
  }

  return (
    <div className="select-company">
      <div className="select-company__header">
        <div className="select-company__status-bar" />
      </div>

      <div className="select-company__logo-section">
        <img className="select-company__logo" src={logo} alt="Opinion System" />
      </div>

      <div className="select-company__content">
        <div className="select-company__text">
          <h1 className="select-company__heading">Bienvenue,</h1>
          <p className="select-company__subtext">
            Sélectionnez l'entreprise à laquelle vous souhaitez vous connecter
          </p>
        </div>

        <button
          type="button"
          className="select-company__field"
          onClick={() => setSheetOpen(true)}
        >
          <span className="select-company__field-value">
            {selected || 'Choissisez votre entreprise'}
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="20" height="20" fill="none">
            <path
              d="M13.825 6.9125L10 10.7292L6.175 6.9125L5 8.0875L10 13.0875L15 8.0875L13.825 6.9125Z"
              fill="#8ea1b2"
            />
          </svg>
        </button>
      </div>

      {sheetOpen && (
        <CompanySelectSheet
          companies={COMPANIES}
          selected={selected}
          onSelect={handleSelectCompany}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </div>
  )
}
