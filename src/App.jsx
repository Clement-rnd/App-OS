import { Button } from './components/Button/Button'
import './App.css'

function App() {
  return (
    <main className="app">
      <h1>Opinion System</h1>
      <Button onClick={() => alert('Ça marche !')}>Commencer</Button>
    </main>
  )
}

export default App
