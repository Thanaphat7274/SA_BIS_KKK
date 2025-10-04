import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import KPIPage from './pages/KPI_page'
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'
import Content from './components/Content'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<KPIPage />}>
            <Route index element={<Content />} />
            <Route path="dashboard" element={<Content />} />
            <Route path="evaluation" element={<Content />} />
            <Route path="employees" element={<Content />} />
            <Route path="attendance" element={<Content />} />
            <Route path="reports" element={<Content />} />
          </Route>
          <Route path="/about" element={<h1>About Page</h1>} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
