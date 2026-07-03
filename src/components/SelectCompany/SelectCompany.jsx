import { useState } from 'react'
import logo from '../../assets/opinion-system-logo.svg'
import { StatusBar } from '../StatusBar/StatusBar'
import './SelectCompany.css'

const COMPANIES = [
  'Sofa Kingdom Realtors',
  'Tech Solutions Inc.',
  'Green Valley Properties',
  'Urban Nest Realty',
]

function BuildingIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0.75 20.25C0.75 19.8358 1.08579 19.5 1.5 19.5H22.5C22.9142 19.5 23.25 19.8358 23.25 20.25C23.25 20.6642 22.9142 21 22.5 21H1.5C1.08579 21 0.75 20.6642 0.75 20.25Z"
        fill="#041b44"
        fillOpacity="0.56"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.68934 2.68934C2.97064 2.40804 3.35217 2.25 3.75 2.25H12.75C13.1478 2.25 13.5294 2.40804 13.8107 2.68934C14.092 2.97065 14.25 3.35218 14.25 3.75V20.25C14.25 20.6642 13.9142 21 13.5 21C13.0858 21 12.75 20.6642 12.75 20.25L12.75 3.75H3.75L3.75 20.25C3.75 20.6642 3.41421 21 3 21C2.58579 21 2.25 20.6642 2.25 20.25V3.75C2.25 3.35217 2.40804 2.97064 2.68934 2.68934Z"
        fill="#041b44"
        fillOpacity="0.56"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.75 9C12.75 8.58579 13.0858 8.25 13.5 8.25H20.25C20.6478 8.25 21.0294 8.40804 21.3107 8.68934C21.592 8.97065 21.75 9.35218 21.75 9.75V20.25C21.75 20.6642 21.4142 21 21 21C20.5858 21 20.25 20.6642 20.25 20.25L20.25 9.75L13.5 9.75C13.0858 9.75 12.75 9.41421 12.75 9Z"
        fill="#041b44"
        fillOpacity="0.56"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.25 6.75C5.25 6.33579 5.58579 6 6 6H9C9.41421 6 9.75 6.33579 9.75 6.75C9.75 7.16421 9.41421 7.5 9 7.5H6C5.58579 7.5 5.25 7.16421 5.25 6.75Z"
        fill="#041b44"
        fillOpacity="0.56"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.75 12.75C6.75 12.3358 7.08579 12 7.5 12H10.5C10.9142 12 11.25 12.3358 11.25 12.75C11.25 13.1642 10.9142 13.5 10.5 13.5H7.5C7.08579 13.5 6.75 13.1642 6.75 12.75Z"
        fill="#041b44"
        fillOpacity="0.56"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.25 16.5C5.25 16.0858 5.58579 15.75 6 15.75H9C9.41421 15.75 9.75 16.0858 9.75 16.5C9.75 16.9142 9.41421 17.25 9 17.25H6C5.58579 17.25 5.25 16.9142 5.25 16.5Z"
        fill="#041b44"
        fillOpacity="0.56"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.75 16.5C15.75 16.0858 16.0858 15.75 16.5 15.75H18C18.4142 15.75 18.75 16.0858 18.75 16.5C18.75 16.9142 18.4142 17.25 18 17.25H16.5C16.0858 17.25 15.75 16.9142 15.75 16.5Z"
        fill="#041b44"
        fillOpacity="0.56"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.75 12.75C15.75 12.3358 16.0858 12 16.5 12H18C18.4142 12 18.75 12.3358 18.75 12.75C18.75 13.1642 18.4142 13.5 18 13.5H16.5C16.0858 13.5 15.75 13.1642 15.75 12.75Z"
        fill="#041b44"
        fillOpacity="0.56"
      />
    </svg>
  )
}

export function SelectCompany({ onContinue }) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(COMPANIES[0])

  const filteredCompanies = COMPANIES.filter(company =>
    company.toLowerCase().includes(search.trim().toLowerCase())
  )

  const handleSelectCompany = company => {
    setSelected(company)
    setSheetOpen(false)
    setTimeout(() => onContinue?.(company), 400)
  }

  return (
    <div className="select-company">
      <div className="select-company__header">
        <StatusBar />
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
        <div className="select-company__sheet-overlay">
          <div
            className="select-company__backdrop"
            onClick={() => setSheetOpen(false)}
          />
          <div className="select-company__sheet" role="dialog" aria-label="Sélectionner une entreprise">
            <div className="select-company__sheet-handle-row">
              <span className="select-company__sheet-handle" />
            </div>

            <div className="select-company__sheet-appbar">
              <p className="select-company__sheet-title">Sélectionner une entreprise</p>
              <button
                type="button"
                className="select-company__sheet-close"
                onClick={() => setSheetOpen(false)}
                aria-label="Fermer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="20" height="20" fill="none">
                  <path
                    d="M15.1828 3.93281C15.4268 3.68883 15.8225 3.68903 16.0666 3.93281C16.3107 4.17688 16.3107 4.57252 16.0666 4.8166L10.883 9.99921L16.0666 15.1828C16.3107 15.4269 16.3107 15.8225 16.0666 16.0666C15.8225 16.3107 15.4269 16.3107 15.1828 16.0666L9.99921 10.883L4.8166 16.0666C4.57252 16.3107 4.17688 16.3107 3.93281 16.0666C3.68903 15.8225 3.68883 15.4268 3.93281 15.1828L9.11542 9.99921L3.93281 4.8166C3.68912 4.57249 3.68886 4.17675 3.93281 3.93281C4.17675 3.68886 4.57249 3.68912 4.8166 3.93281L9.99921 9.11542L15.1828 3.93281Z"
                    fill="#041b44"
                  />
                </svg>
              </button>
            </div>

            <div className="select-company__sheet-search-wrap">
              <div className="select-company__sheet-search">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="20" height="20" fill="none">
                  <path
                    d="M13.1292 11.8792H12.4708L12.2375 11.6542C13.0542 10.7042 13.5458 9.47083 13.5458 8.12917C13.5458 5.1375 11.1208 2.7125 8.12917 2.7125C5.1375 2.7125 2.7125 5.1375 2.7125 8.12917C2.7125 11.1208 5.1375 13.5458 8.12917 13.5458C9.47083 13.5458 10.7042 13.0542 11.6542 12.2375L11.8792 12.4708V13.1292L16.0458 17.2875L17.2875 16.0458L13.1292 11.8792ZM8.12917 11.8792C6.05417 11.8792 4.37917 10.2042 4.37917 8.12917C4.37917 6.05417 6.05417 4.37917 8.12917 4.37917C10.2042 4.37917 11.8792 6.05417 11.8792 8.12917C11.8792 10.2042 10.2042 11.8792 8.12917 11.8792Z"
                    fill="#8ea1b2"
                  />
                </svg>
                <input
                  className="select-company__sheet-search-input"
                  type="text"
                  placeholder="Entrez un nom d'entreprise"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                {search.length > 0 && (
                  <button
                    type="button"
                    className="select-company__sheet-clear-btn"
                    onClick={() => setSearch('')}
                    aria-label="Effacer la recherche"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="16" height="16" fill="none">
                      <path
                        d="M15.1828 3.93281C15.4268 3.68883 15.8225 3.68903 16.0666 3.93281C16.3107 4.17688 16.3107 4.57252 16.0666 4.8166L10.883 9.99921L16.0666 15.1828C16.3107 15.4269 16.3107 15.8225 16.0666 16.0666C15.8225 16.3107 15.4269 16.3107 15.1828 16.0666L9.99921 10.883L4.8166 16.0666C4.57252 16.3107 4.17688 16.3107 3.93281 16.0666C3.68903 15.8225 3.68883 15.4268 3.93281 15.1828L9.11542 9.99921L3.93281 4.8166C3.68912 4.57249 3.68886 4.17675 3.93281 3.93281C4.17675 3.68886 4.57249 3.68912 4.8166 3.93281L9.99921 9.11542L15.1828 3.93281Z"
                        fill="#8ea1b2"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {filteredCompanies.length === 0 ? (
              <p className="select-company__sheet-empty">
                Aucune entreprise ne correspond à « {search} »
              </p>
            ) : (
            <ul className="select-company__sheet-list">
              {filteredCompanies.map(company => {
                const isSelected = company === selected
                return (
                  <li key={company}>
                    <button
                      type="button"
                      className={`select-company__sheet-item${isSelected ? ' select-company__sheet-item--selected' : ''}`}
                      onClick={() => handleSelectCompany(company)}
                    >
                      <span className="select-company__sheet-item-icon">
                        <BuildingIcon />
                      </span>
                      <span className="select-company__sheet-item-name">{company}</span>
                      {isSelected && (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="20" height="20" fill="none">
                          <path
                            d="M7.32917 13.2292L3.85417 9.75417L2.67083 10.9292L7.32917 15.5875L17.3292 5.5875L16.1542 4.4125L7.32917 13.2292Z"
                            fill="#041b44"
                            fillOpacity="0.56"
                          />
                        </svg>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
