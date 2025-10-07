import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AppraisalForm from '../components/AppraisalForm';

const Evaluation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // รับค่าที่ส่งมาจากหน้า Selectsepy หรือใช้ค่า default
  const { employee, position, appraisalId } = location.state || {};
  const defaultEmployee = { name: 'นายทนงชัย' };
  const defaultPosition = { title: 'พนักงาน' };

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
                พนักงาน: {employee?.name || defaultEmployee.name} | 
                ตำแหน่ง: {position?.title || defaultPosition.title}
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
        <AppraisalForm appraisalId={appraisalId || 1} />
      </div>
    </div>
  );
};

export default Evaluation;