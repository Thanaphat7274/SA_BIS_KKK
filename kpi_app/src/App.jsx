import KPIPage from './pages/KPI_page';
import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'

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
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/user" element={<User />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
