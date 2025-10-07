
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import KPIPage from './pages/KPI_page';
import Evaluation from './pages/Evaluation';
import EvaluationForm from './pages/EvaluationForm';
import ManageEvaluationCriteria from './pages/ManageEvaluationCriteria';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<KPIPage />} />
          <Route path="/evaluation" element={<Evaluation />} />
          <Route path="/evaluation-form" element={<EvaluationForm />} />
          <Route path="/manage-criteria" element={<ManageEvaluationCriteria />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
