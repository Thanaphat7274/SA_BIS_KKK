import React, { useState } from "react";
import { UserPlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
const AddEmployee = ({ onClose, onSuccess }) => {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [hireDate, setHireDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({ firstname: "", lastname: "", hireDate: "" });
  const [successMessage, setSuccessMessage] = useState("");
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    
    let hasError = false;
    let newError = { firstname: "", lastname: "", hireDate: "" };
    
    if (!firstname.trim()) {
      newError.firstname = "กรุณากรอกชื่อจริง";
      hasError = true;
    }
    if (!lastname.trim()) {
      newError.lastname = "กรุณากรอกนามสกุล";
      hasError = true;
    }
    if (!hireDate) {
      newError.hireDate = "กรุณาเลือกวันจ้าง";
      hasError = true;
    } 
    
    setError(newError);
    if (hasError) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/addEmployee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          firstname: firstname.trim(), 
          lastname: lastname.trim(), 
          hiredate: hireDate 
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccessMessage(`เพิ่มพนักงานสำเร็จ! Username: ${data.username}, Password: ${data.password}`);
        // รีเซ็ตฟอร์ม
        setFirstname('');
        setLastname('');
        setHireDate('');
        // เรียก callback ถ้ามี
        if (onSuccess) {
          onSuccess(data);
        }
      } else {
        throw new Error(data.error || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Error:', error);
      setError({ ...newError, general: error.message || 'เกิดข้อผิดพลาดในการเพิ่มพนักงาน' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
            <UserPlusIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">เพิ่มพนักงานใหม่</h2>
            <p className="text-sm text-gray-600">กรอกข้อมูลพนักงานเพื่อสร้างบัญชีใหม่</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">เพิ่มพนักงานสำเร็จ!</p>
                <p className="text-sm text-green-700 mt-1">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">เกิดข้อผิดพลาด</p>
                <p className="text-sm text-red-700 mt-1">{error.general}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Firstname */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ชื่อจริง <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  error.firstname ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="กรอกชื่อจริง"
                disabled={loading}
              />
              {error.firstname && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error.firstname}
                </p>
              )}
            </div>

            {/* Lastname */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                นามสกุล <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  error.lastname ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="กรอกนามสกุล"
                disabled={loading}
              />
              {error.lastname && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error.lastname}
                </p>
              )}
            </div>
          </div>

          {/* Hire Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              วันที่เริ่มงาน <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={hireDate}
                onChange={(e) => setHireDate(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer ${
                  error.hireDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                style={{
                  colorScheme: 'light',
                  WebkitAppearance: 'none',
                  MozAppearance: 'textfield'
                }}
                disabled={loading}
              />
              <div 
                className="absolute inset-0 cursor-pointer"
                onClick={() => {
                  const input = document.querySelector('input[type="date"]');
                  if (input && !loading) {
                    input.showPicker();
                  }
                }}
              />
            </div>
            {error.hireDate && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error.hireDate}
              </p>
            )}
            {hireDate && !error.hireDate && (
              <p className="text-sm text-gray-600 mt-1">
                วันที่เลือก: {new Date(hireDate).toLocaleDateString('th-TH', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            )}
          </div>

          {/* Submit button */}
          <div className="flex justify-end space-x-3 pt-4">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                ยกเลิก
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>กำลังเพิ่ม...</span>
                </>
              ) : (
                <>
                  <UserPlusIcon className="w-4 h-4" />
                  <span>เพิ่มพนักงาน</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployee;
