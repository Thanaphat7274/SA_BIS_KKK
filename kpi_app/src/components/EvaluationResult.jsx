import React, { useState, useEffect } from "react";
import { CheckCircleIcon, ClipboardDocumentCheckIcon, UserGroupIcon, ChartBarIcon } from "@heroicons/react/24/outline";

const EvaluationResult = ({ username }) => {
  const [evaluationData, setEvaluationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ดึงข้อมูลการประเมินจาก API โดยใช้ username
  useEffect(() => {
    const fetchEvaluationData = async () => {
      try {
        setLoading(true);
        
        // เรียก API โดยใช้ username (proxy จะส่งไปที่ http://localhost:8080)
        const endpoint = username 
          ? `http://127.0.0.1:3000/api/evaluation/user/${username}` 
          : 'http://127.0.0.1:3000/api/evaluation/latest';
        
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // แปลงวันที่ให้อ่านง่าย
        if (data.evaluationDate) {
          data.evaluationDate = new Date(data.evaluationDate).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        }
        
        setEvaluationData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching evaluation:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluationData();
  }, [username]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
            <p className="text-gray-600 text-lg font-medium">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !evaluationData) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center p-6">
        <div className="bg-red-50 border border-red-300 p-8 rounded-2xl shadow-lg max-w-md">
          <p className="text-red-700 text-lg font-medium">เกิดข้อผิดพลาด: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  // คำนวณคะแนนรวม
  const totalScore = evaluationData.attendance.weightedScore + 
                     evaluationData.performance.weightedScore + 
                     evaluationData.behavior.weightedScore;
  
  const totalMaxScore = evaluationData.attendance.maxScore + 
                        evaluationData.performance.maxScore + 
                        evaluationData.behavior.maxScore;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold mb-2">📋 ผลการประเมิน</h1>
          <p className="text-blue-100">แบบประเมินผลการปฏิบัติงาน</p>
        </div>

        {/* Employee Info Card */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <UserGroupIcon className="h-6 w-6 mr-2 text-blue-600" />
            ข้อมูลผู้ถูกประเมิน
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">ชื่อ-นามสกุล</p>
              <p className="text-lg font-semibold text-gray-800">{evaluationData.employeeName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">รหัสพนักงาน</p>
              <p className="text-lg font-semibold text-gray-800">{evaluationData.employeeCode}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">ตำแหน่ง</p>
              <p className="text-lg font-semibold text-gray-800">{evaluationData.position}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">ผู้ประเมิน</p>
              <p className="text-lg font-semibold text-gray-800">{evaluationData.evaluator}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">วันที่ประเมิน</p>
              <p className="text-lg font-semibold text-gray-800">{evaluationData.evaluationDate}</p>
            </div>
          </div>
        </div>

        {/* Evaluation Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b-2 border-gray-300">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-700">รายการประเมิน</th>
                  <th className="text-center p-4 font-semibold text-gray-700 w-32">
                    <div className="transform  origin-center inline-block">
                      คะแนน/น้ำหนัก
                    </div>
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-700">คะแนนที่ได้</th>
                </tr>
              </thead>
              <tbody>
                {/* Section 1: Attendance */}
                <tr className="border-b hover:bg-gray-50 transition">
                  <td className="p-4">
                    <div className="flex items-start">
                      <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-800">
                          1. {evaluationData.attendance.details || "คะแนนการมาปฏิบัติงานต่อปี"}
                        </p>
                        <p className="text-sm text-gray-500">
                          (น้ำหนัก {evaluationData.attendance.weight}%)
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center border-l">
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="text-2xl font-bold text-gray-700 transform  origin-center">
                        {evaluationData.attendance.maxScore}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 border-l">
                    <div className="flex items-center justify-center h-full">
                      <span className="text-2xl font-bold text-green-600">
                        {evaluationData.attendance.weightedScore}
                      </span>
                    </div>
                  </td>
                </tr>

                {/* Section 2: Performance/KPI */}
                <tr className="border-b hover:bg-gray-50 transition">
                  <td className="p-4">
                    <div className="flex items-start">
                      <ChartBarIcon className="h-5 w-5 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-800">
                          2. {evaluationData.performance.details || "คะแนนผลงานตามตัวชี้วัด"}
                        </p>
                        <p className="text-sm text-gray-500">
                          (น้ำหนัก {evaluationData.performance.weight}%)
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center border-l">
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="text-2xl font-bold text-gray-700 transform  origin-center">
                        {evaluationData.performance.maxScore}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 border-l">
                    <div className="flex items-center justify-center h-full">
                      <span className="text-2xl font-bold text-blue-600">
                        {evaluationData.performance.weightedScore}
                      </span>
                    </div>
                  </td>
                </tr>

                {/* Section 3: Behavior */}
                <tr className="border-b hover:bg-gray-50 transition">
                  <td className="p-4">
                    <div className="flex items-start">
                      <ClipboardDocumentCheckIcon className="h-5 w-5 text-purple-600 mr-3 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-800">
                          3. {evaluationData.behavior.details || "พฤติกรรมการปฏิบัติงาน"}
                        </p>
                        <p className="text-sm text-gray-500">
                          (น้ำหนัก {evaluationData.behavior.weight}%)
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center border-l">
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="text-2xl font-bold text-gray-700 transform  origin-center">
                        {evaluationData.behavior.maxScore}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 border-l">
                    <div className="flex items-center justify-center h-full">
                      <span className="text-2xl font-bold text-purple-600">
                        {evaluationData.behavior.weightedScore}
                      </span>
                    </div>
                  </td>
                </tr>

                {/* Total Row */}
                <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-t-2 border-blue-300">
                  <td className="p-4">
                    <p className="font-bold text-gray-800 text-lg">
                      คะแนนรวมทั้งสิ้น (ข้อ1+2+3)
                    </p>
                  </td>
                  <td className="p-4 text-center border-l">
                    <span className="text-xl font-bold text-gray-700">
                      {totalMaxScore}
                    </span>
                  </td>
                  <td className="p-4 border-l">
                    <div className="flex items-center justify-center">
                      <span className="text-3xl font-bold text-indigo-600">
                        {totalScore.toFixed(1)}
                      </span>
                      <span className="text-lg text-gray-600 ml-2">คะแนน</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Comments Section - Read Only */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <ClipboardDocumentCheckIcon className="h-5 w-5 mr-2 text-blue-600" />
              ความคิดเห็นของผู้ประเมิน
            </h3>
            <div className="w-full p-4 bg-gray-50 border border-gray-300 rounded-lg text-gray-700">
              <p>{evaluationData.evaluatorComment || "ไม่มีความคิดเห็น"}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <UserGroupIcon className="h-5 w-5 mr-2 text-purple-600" />
              ความคิดเห็นของผู้ถูกประเมิน
            </h3>
            <div className="w-full p-4 bg-purple-50 border border-purple-300 rounded-lg text-purple-700">
              <p>{evaluationData.employeeComment || "ไม่มีความคิดเห็น"}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EvaluationResult;
