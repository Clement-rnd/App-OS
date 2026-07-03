import './StatusBar.css'

export function StatusBar({ time = '12:30' }) {
  return (
    <div className="status-bar">
      <span className="status-bar__time">{time}</span>
      <div className="status-bar__icons">
        <svg
          className="status-bar__icon status-bar__icon--signal"
          viewBox="0 0 18 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect x="0" y="7" width="3" height="5" rx="0.8" fill="currentColor" />
          <rect x="5" y="5" width="3" height="7" rx="0.8" fill="currentColor" />
          <rect x="10" y="3" width="3" height="9" rx="0.8" fill="currentColor" />
          <rect x="15" y="0" width="3" height="12" rx="0.8" fill="currentColor" />
        </svg>
        <svg
          className="status-bar__icon status-bar__icon--wifi"
          viewBox="0 0 18 13"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M9 12.5C9.69 12.5 10.25 11.94 10.25 11.25C10.25 10.56 9.69 10 9 10C8.31 10 7.75 10.56 7.75 11.25C7.75 11.94 8.31 12.5 9 12.5Z"
            fill="currentColor"
          />
          <path
            d="M9 3.5C11.9 3.5 14.55 4.6 16.55 6.4C16.83 6.65 16.85 7.08 16.6 7.36C16.35 7.64 15.92 7.66 15.64 7.41C13.87 5.82 11.55 4.85 9 4.85C6.45 4.85 4.13 5.82 2.36 7.41C2.08 7.66 1.65 7.64 1.4 7.36C1.15 7.08 1.17 6.65 1.45 6.4C3.45 4.6 6.1 3.5 9 3.5Z"
            fill="currentColor"
          />
          <path
            d="M9 6.75C10.85 6.75 12.53 7.42 13.83 8.53C14.11 8.77 14.15 9.2 13.91 9.48C13.67 9.76 13.24 9.8 12.96 9.56C11.88 8.63 10.51 8.1 9 8.1C7.49 8.1 6.12 8.63 5.04 9.56C4.76 9.8 4.33 9.76 4.09 9.48C3.85 9.2 3.89 8.77 4.17 8.53C5.47 7.42 7.15 6.75 9 6.75Z"
            fill="currentColor"
          />
        </svg>
        <svg
          className="status-bar__icon status-bar__icon--battery"
          viewBox="0 0 25 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="currentColor" opacity="0.4" />
          <rect x="2" y="2" width="18" height="8" rx="1.3" fill="currentColor" />
          <path d="M23 4V8C23.83 7.65 24.4 6.87 24.4 6C24.4 5.13 23.83 4.35 23 4Z" fill="currentColor" opacity="0.4" />
        </svg>
      </div>
    </div>
  )
}
