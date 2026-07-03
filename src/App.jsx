import { useState } from 'react'
import { Login } from './components/Login/Login'
import { Home } from './components/Home/Home'
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

  return <Login onLogin={() => setPage('home')} onSkip={() => setPage('home')} />
}

export default App
