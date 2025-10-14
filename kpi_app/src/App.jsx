
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import KPIPage from './pages/KPI_page';
import Evaluation from './pages/Evaluation';

import ManageEvaluationCriteria from './pages/ManageEvaluationCriteria';
import LoginPage from './pages/LoginPage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route 
            path="/kpi" 
            element={
              <ProtectedRoute>
                <KPIPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/evaluation" 
            element={
              <ProtectedRoute>
                <Evaluation />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/manage-criteria" 
            element={
              <ProtectedRoute>
                <ManageEvaluationCriteria />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
