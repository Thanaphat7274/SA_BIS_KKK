import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Sidebar from './components/Sildebar'
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Sidebar />} />
          <Route path="/about" element={<h1>About Page</h1>} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
