import { useState } from 'react'
import { Login } from './components/Login/Login'
import { Home } from './components/Home/Home'
import { ForgotPassword } from './components/ForgotPassword/ForgotPassword'
import { ResetPassword } from './components/ResetPassword/ResetPassword'
import { SelectCompany } from './components/SelectCompany/SelectCompany'
import { Reviews } from './components/Reviews/Reviews'
import { Questionnaire } from './components/Questionnaire/Questionnaire'

const TAB_TO_PAGE = {
  home: 'home',
  chat: 'reviews',
  send: 'questionnaire',
}

function App() {
  const [page, setPage] = useState('login')

  const handleNavigate = tab => {
    const target = TAB_TO_PAGE[tab]
    if (target) setPage(target)
  }

  if (page === 'reviews') {
    return <Reviews onNavigate={handleNavigate} />
  }

  if (page === 'questionnaire') {
    return <Questionnaire onNavigate={handleNavigate} />
  }

  if (page === 'home') {
    return <Home onNavigate={handleNavigate} onOpenQuestionnaire={() => setPage('questionnaire')} />
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

export default App
