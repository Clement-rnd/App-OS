import { useState } from 'react'
import iconFilterClose from '../../assets/reviews/icon-filter-close.svg'
import iconCalendarChevronLeft from '../../assets/reviews/icon-calendar-chevron-left.svg'
import iconCalendarChevronRight from '../../assets/reviews/icon-calendar-chevron-right.svg'
import './Calendar.css'

const MONTH_NAMES = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
]
const DAY_LABELS = ['lu', 'ma', 'me', 'je', 've', 'sa', 'di']

function toIsoDate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function parseIsoDate(iso) {
  if (!iso) return null
  const [year, month, day] = iso.split('-').map(Number)
  return { year, month: month - 1, day }
}

function buildMonthGrid(year, month) {
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7 // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < firstWeekday; i++) cells.push(null)
  for (let day = 1; day <= daysInMonth; day++) cells.push(day)
  return cells
}

export function Calendar({ activeTab, onTabChange, startDate, endDate, onSelectDate, onClose }) {
  const initialParsed = parseIsoDate(activeTab === 'du' ? startDate : endDate)
  const today = new Date()
  const [viewYear, setViewYear] = useState(initialParsed?.year ?? today.getFullYear())
  const [viewMonth, setViewMonth] = useState(initialParsed?.month ?? today.getMonth())

  const goToMonth = delta => {
    let nextMonth = viewMonth + delta
    let nextYear = viewYear
    if (nextMonth < 0) {
      nextMonth = 11
      nextYear -= 1
    } else if (nextMonth > 11) {
      nextMonth = 0
      nextYear += 1
    }
    setViewMonth(nextMonth)
    setViewYear(nextYear)
  }

  const switchTab = tab => {
    onTabChange(tab)
    const parsed = parseIsoDate(tab === 'du' ? startDate : endDate)
    if (parsed) {
      setViewYear(parsed.year)
      setViewMonth(parsed.month)
    }
  }

  const handleSelectDay = day => {
    onSelectDate(toIsoDate(viewYear, viewMonth, day))
    // Selecting a start date naturally flows into picking the end date next.
    if (activeTab === 'du') switchTab('au')
  }

  const startParsed = parseIsoDate(startDate)
  const endParsed = parseIsoDate(endDate)
  const activeParsed = activeTab === 'du' ? startParsed : endParsed
  const isSelected = day =>
    activeParsed && activeParsed.year === viewYear && activeParsed.month === viewMonth && activeParsed.day === day

  return (
    <div className="calendar">
      <div className="calendar__header">
        <span className="calendar__header-title">{activeTab === 'du' ? 'Date de début' : 'Date de fin'}</span>
        <button
          type="button"
          className="calendar__header-close"
          onClick={onClose}
          aria-label="Fermer la sélection de dates"
        >
          <img src={iconFilterClose} alt="" />
        </button>
      </div>

      <div className="calendar__tabs">
        <button
          type="button"
          className={`calendar__tab${activeTab === 'du' ? ' calendar__tab--active' : ''}`}
          onClick={() => switchTab('du')}
        >
          Du
        </button>
        <button
          type="button"
          className={`calendar__tab${activeTab === 'au' ? ' calendar__tab--active' : ''}`}
          onClick={() => switchTab('au')}
        >
          Au
        </button>
      </div>

      <div className="calendar__body">
        <div className="calendar__nav">
          <span className="calendar__month-label">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>
          <div className="calendar__nav-buttons">
            <button
              type="button"
              className="calendar__nav-btn"
              onClick={() => goToMonth(-1)}
              aria-label="Mois précédent"
            >
              <img src={iconCalendarChevronLeft} alt="" />
            </button>
            <button type="button" className="calendar__nav-btn" onClick={() => goToMonth(1)} aria-label="Mois suivant">
              <img src={iconCalendarChevronRight} alt="" />
            </button>
          </div>
        </div>

        <div className="calendar__weekdays">
          {DAY_LABELS.map(label => (
            <span key={label} className="calendar__weekday">
              {label}
            </span>
          ))}
        </div>

        <div className="calendar__days">
          {buildMonthGrid(viewYear, viewMonth).map((day, index) => (
            <div key={index} className="calendar__day-cell">
              {day != null && (
                <button
                  type="button"
                  className={`calendar__day${isSelected(day) ? ' calendar__day--selected' : ''}`}
                  onClick={() => handleSelectDay(day)}
                >
                  {day}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
