import { useState } from 'react'
import { Login } from './components/Login/Login'
import { Home } from './components/Home/Home'
import { ForgotPassword } from './components/ForgotPassword/ForgotPassword'
import { ResetPassword } from './components/ResetPassword/ResetPassword'
import { SelectCompany } from './components/SelectCompany/SelectCompany'
import { Reviews } from './components/Reviews/Reviews'
import { Questionnaire } from './components/Questionnaire/Questionnaire'
import { Profile } from './components/Profile/Profile'
import { Notifications } from './components/Notifications/Notifications'
import { initialNotifications } from './components/Notifications/notificationsData'
import { SupportChatFab } from './components/SupportChat/SupportChatFab'
import { SupportChatWindow } from './components/SupportChat/SupportChatWindow'

const TAB_TO_PAGE = {
  home: 'home',
  chat: 'reviews',
  send: 'questionnaire',
  user: 'profile',
}

const AUTH_PAGES = ['login', 'forgot-password', 'reset-password', 'select-company']

function App() {
  const [page, setPage] = useState('login')
  const [notifications, setNotifications] = useState(initialNotifications)
  const [isSupportChatOpen, setIsSupportChatOpen] = useState(false)

  const handleNavigate = tab => {
    const target = TAB_TO_PAGE[tab]
    if (target) setPage(target)
  }

  const renderPage = () => {
    if (page === 'notifications') {
      return (
        <Notifications
          notifications={notifications}
          onChangeNotifications={setNotifications}
          onNavigate={handleNavigate}
        />
      )
    }

    if (page === 'profile') {
      return <Profile onNavigate={handleNavigate} onLogout={() => setPage('login')} />
    }

    if (page === 'reviews') {
      return <Reviews onNavigate={handleNavigate} />
    }

    if (page === 'questionnaire') {
      return <Questionnaire onNavigate={handleNavigate} />
    }

    if (page === 'home') {
      return (
        <Home
          onNavigate={handleNavigate}
          onOpenQuestionnaire={() => setPage('questionnaire')}
          onOpenNotifications={() => setPage('notifications')}
          unreadNotifCount={notifications.filter(n => n.unread).length}
        />
      )
    }

    if (page === 'select-company') {
      return <SelectCompany onContinue={() => setPage('home')} />
    }

    if (page === 'reset-password') {
      return <ResetPassword onBack={() => setPage('login')} onResetPassword={() => setPage('login')} />
    }

    if (page === 'forgot-password') {
      return (
        <ForgotPassword
          onBack={() => setPage('login')}
          onResetPassword={() => setPage('reset-password')}
        />
      )
    }

    return (
      <Login
        onLogin={() => setPage('select-company')}
        onSkip={() => setPage('home')}
        onForgotPassword={() => setPage('forgot-password')}
      />
    )
  }

  const isAuthPage = AUTH_PAGES.includes(page)

  return (
    <>
      {renderPage()}

      {!isAuthPage && (
        <>
          <SupportChatFab onClick={() => setIsSupportChatOpen(true)} hidden={isSupportChatOpen} />
          <SupportChatWindow isOpen={isSupportChatOpen} onClose={() => setIsSupportChatOpen(false)} />
        </>
      )}
    </>
  )
}

export default App
