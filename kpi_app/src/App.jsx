import logo from './logo.svg';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import KPIPage from './pages/KPI_page';


import LoginPage from './pages/LoginPage';
import AddEmployeePage from './pages/AddEmployeePage';


function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<KPIPage />} />
          <Route path="/add" element={<AddEmployeePage />} />
          <Route path="/KPI" element={<KPIPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
