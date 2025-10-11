
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import KPIPage from './pages/KPI_page';
import Evaluation from './pages/Evaluation';

import ManageEvaluationCriteria from './pages/ManageEvaluationCriteria';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<KPIPage />} />
          <Route path="/evaluation" element={<Evaluation />} />
          <Route path="/manage-criteria" element={<ManageEvaluationCriteria />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
