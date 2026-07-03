import { useState } from 'react'
import { Login } from './components/Login/Login'
import { Home } from './components/Home/Home'
import { ForgotPassword } from './components/ForgotPassword/ForgotPassword'
import { ResetPassword } from './components/ResetPassword/ResetPassword'
import { SelectCompany } from './components/SelectCompany/SelectCompany'

function App() {
  const [page, setPage] = useState('login')

  if (page === 'home') {
    return <Home />
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
