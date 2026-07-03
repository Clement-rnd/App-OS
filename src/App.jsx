import { useState } from 'react'
import { Login } from './components/Login/Login'
import { Home } from './components/Home/Home'

function App() {
  const [page, setPage] = useState('login')

  if (page === 'home') {
    return <Home />
  }

  return <Login onLogin={() => setPage('home')} onSkip={() => setPage('home')} />
}

export default App
