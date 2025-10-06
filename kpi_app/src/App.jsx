import logo from './logo.svg';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import KPIPage from './pages/KPI_page';
import Evaluation from './pages/Evaluation';

import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Admin from './pages/Admin';
import User from './pages/User';
import Test1 from './pages/Test1';
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<KPIPage />} />
          <Route path="/evaluation" element={<Evaluation />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
