import KPIPage from './pages/KPI_page';
import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<KPIPage />} />
          <Route path="/about" element={<h1>About Page</h1>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
