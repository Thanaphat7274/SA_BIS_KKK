import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import EvaluationForm from '../components/EvaluationForm';

const Evaluation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // รับค่าที่ส่งมาจากหน้า Selectsepy
  const { employee, position, appraisalId } = location.state || {};
  const defaultEmployee = { first_name: 'ไม่ระบุ', last_name: '' };
  const defaultPosition = { position_name: 'ไม่ระบุ' };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                การประเมินผลการปฏิบัติงาน
              </h1>
              <p className="text-gray-600">
                พนักงาน: {employee?.first_name || defaultEmployee.first_name} {employee?.last_name || defaultEmployee.last_name} | 
                ตำแหน่ง: {position?.position_name || defaultPosition.position_name}
              </p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              ← กลับ
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <EvaluationForm 
          employee={employee} 
          position={position}
          expectedScore={5}
        />
      </div>
    </div>
  );
};

export default Evaluation;