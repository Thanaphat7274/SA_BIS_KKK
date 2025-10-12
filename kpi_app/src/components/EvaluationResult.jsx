import React, { useState, useEffect } from "react";
import { CheckCircleIcon, ClipboardDocumentCheckIcon, UserGroupIcon, ChartBarIcon } from "@heroicons/react/24/outline";

const EvaluationResult = ({ username }) => {
  const [evaluationData, setEvaluationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ดึงข้อมูลการประเมินจาก API
  useEffect(() => {
    const fetchEvaluationData = async () => {
      try {
        setLoading(true);
        
        // ดึง emp_id จาก localStorage - ลองหลายแหล่ง
        let empId = localStorage.getItem('emp_id') || 
                    localStorage.getItem('user_id') || 
                    localStorage.getItem('id');
        
        console.log('Stored values:', {
          emp_id: localStorage.getItem('emp_id'),
          user_id: localStorage.getItem('user_id'),
          id: localStorage.getItem('id'),
          username: localStorage.getItem('username'),
          role: localStorage.getItem('role')
        });

        // ถ้ายังไม่มี ให้ลองดึงจาก username
        if (!empId && username) {
          // ดึงข้อมูล user จาก username
          const userResponse = await fetch(`http://localhost:8080/api/employees`);
          if (userResponse.ok) {
            const employees = await userResponse.json();
            const currentUser = employees.find(e => e.username === username);
            if (currentUser) {
              empId = currentUser.emp_id;
            }
          }
        }
        
        if (!empId) {
          throw new Error('ไม่พบข้อมูลพนักงาน กรุณาเข้าสู่ระบบใหม่');
        }

        console.log('Using emp_id:', empId);

        // ดึงการประเมินล่าสุดของพนักงาน
        const response = await fetch(`http://localhost:8080/api/evaluations`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const allEvaluations = await response.json();
        
        console.log('All evaluations:', allEvaluations);
        
        // กรองเฉพาะการประเมินของพนักงานคนนี้ และเอาล่าสุด
        const myEvaluations = allEvaluations.filter(e => e.emp_id === parseInt(empId));
        
        console.log('My evaluations:', myEvaluations);
        
        if (myEvaluations.length === 0) {
          throw new Error('ยังไม่มีข้อมูลการประเมินของคุณ');
        }

        // เอาการประเมินล่าสุด
        const latestEval = myEvaluations[0];
        
        console.log('Latest evaluation:', latestEval);
        
        // ดึงรายละเอียดการประเมิน
        const detailResponse = await fetch(`http://localhost:8080/api/evaluations/${latestEval.appraisal_id}`);
        
        if (!detailResponse.ok) {
          throw new Error('ไม่สามารถดึงรายละเอียดการประเมินได้');
        }
        
        const detailData = await detailResponse.json();
        console.log('Detail data:', detailData);
        
        setEvaluationData(detailData);
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

  const getSubdetailMaxScore = (detail) => {
    if (!detail.subdetails || detail.subdetails.length === 0) return 0;
    return detail.max_score / detail.subdetails.length;
  };

  const calculateAttendanceScore = (attendanceData) => {
    const maxScore = 10;
    const absentDays = attendanceData?.absent || 0;
    const lateDays = attendanceData?.late || 0;
    const leaveDays = attendanceData?.leave || 0;

    // ถ้าขาด คะแนนเป็น 0
    if (absentDays > 0) {
      return {
        score: 0,
        maxScore: maxScore,
        absent: absentDays,
        late: lateDays,
        leave: leaveDays,
        deduction: maxScore,
        reason: 'ขาดงาน'
      };
    }

    let deduction = 0;
    
    // ลา 1 วัน = ตัด 0.2 คะแนน
    deduction += leaveDays * 0.2;
    
    // สาย 1 วัน = ตัด 0.1 คะแนน
    deduction += lateDays * 0.1;
    
    // ถ้าลา + สาย เกิน 5 วัน ตัดเพิ่ม 1 คะแนน
    const totalDays = leaveDays + lateDays;
    if (totalDays > 5) {
      deduction += 1;
    }

    const score = Math.max(0, maxScore - deduction);

    return {
      score: score,
      maxScore: maxScore,
      absent: absentDays,
      late: lateDays,
      leave: leaveDays,
      deduction: deduction,
      reason: null
    };
  };

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

  if (!evaluationData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold mb-2">📋 ผลการประเมินของฉัน</h1>
          <p className="text-blue-100">
            {evaluationData.employee.first_name} {evaluationData.employee.last_name} - {evaluationData.employee.position_name}
          </p>
        </div>

        {/* ข้อมูลพนักงาน */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg shadow-md">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">พนักงาน ID:</span>
              <p className="font-semibold text-gray-900">{evaluationData.employee.emp_id}</p>
            </div>
            <div>
              <span className="text-gray-600">ตำแหน่ง:</span>
              <p className="font-semibold text-gray-900">{evaluationData.employee.position_name || '-'}</p>
            </div>
            <div>
              <span className="text-gray-600">ปีที่ประเมิน:</span>
              <p className="font-semibold text-gray-900">{evaluationData.employee.year + 543}</p>
            </div>
            <div>
              <span className="text-gray-600">วันที่ประเมิน:</span>
              <p className="font-semibold text-gray-900">
                {new Date(evaluationData.employee.evaluated_at).toLocaleDateString('th-TH')}
              </p>
            </div>
          </div>
        </div>

        {/* คะแนนการเข้างาน */}
        {evaluationData.attendance && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg shadow-md">
            <h3 className="font-bold text-lg text-gray-800 mb-3">
              📅 คะแนนการเข้างาน (เต็ม 10 คะแนน)
            </h3>
            {(() => {
              const attendanceScore = calculateAttendanceScore(evaluationData.attendance);
              return (
                <div className="space-y-3">
                  {/* สรุปวันลา/สาย/ขาด */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-blue-100 rounded-lg p-3">
                      <p className="text-xs text-gray-600">ลา</p>
                      <p className="text-2xl font-bold text-blue-600">{attendanceScore.leave}</p>
                      <p className="text-xs text-gray-500">วัน</p>
                    </div>
                    <div className="bg-orange-100 rounded-lg p-3">
                      <p className="text-xs text-gray-600">สาย</p>
                      <p className="text-2xl font-bold text-orange-600">{attendanceScore.late}</p>
                      <p className="text-xs text-gray-500">วัน</p>
                    </div>
                    <div className="bg-red-100 rounded-lg p-3">
                      <p className="text-xs text-gray-600">ขาด</p>
                      <p className="text-2xl font-bold text-red-600">{attendanceScore.absent}</p>
                      <p className="text-xs text-gray-500">วัน</p>
                    </div>
                  </div>

                  {/* เกณฑ์การหักคะแนน */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-sm font-semibold text-gray-700 mb-2">เกณฑ์การคำนวณ:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• ลา 1 วัน = ตัด 0.2 คะแนน</li>
                      <li>• สาย 1 วัน = ตัด 0.1 คะแนน</li>
                      <li>• ลา + สาย เกิน 5 วัน = ตัดเพิ่ม 1 คะแนน</li>
                      <li className="text-red-600 font-semibold">• ขาด = คะแนนเป็น 0</li>
                    </ul>
                  </div>

                  {/* การคำนวณคะแนน */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">คะแนนเต็ม:</span>
                      <span className="text-lg font-semibold text-gray-800">{attendanceScore.maxScore.toFixed(2)}</span>
                    </div>
                    
                    {attendanceScore.reason ? (
                      <div className="bg-red-50 border border-red-200 rounded p-3 mb-2">
                        <p className="text-sm text-red-700 font-semibold">
                          ⚠️ {attendanceScore.reason} - คะแนนเป็น 0
                        </p>
                      </div>
                    ) : (
                      <>
                        {attendanceScore.leave > 0 && (
                          <div className="flex justify-between items-center text-sm mb-1">
                            <span className="text-gray-600">หัก (ลา {attendanceScore.leave} วัน × 0.2):</span>
                            <span className="text-red-600">-{(attendanceScore.leave * 0.2).toFixed(2)}</span>
                          </div>
                        )}
                        {attendanceScore.late > 0 && (
                          <div className="flex justify-between items-center text-sm mb-1">
                            <span className="text-gray-600">หัก (สาย {attendanceScore.late} วัน × 0.1):</span>
                            <span className="text-red-600">-{(attendanceScore.late * 0.1).toFixed(2)}</span>
                          </div>
                        )}
                        {(attendanceScore.leave + attendanceScore.late) > 5 && (
                          <div className="flex justify-between items-center text-sm mb-1">
                            <span className="text-gray-600">หัก (เกิน 5 วัน):</span>
                            <span className="text-red-600">-1.00</span>
                          </div>
                        )}
                      </>
                    )}
                    
                    <div className="border-t border-gray-300 mt-2 pt-2 flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-700">คะแนนที่ได้:</span>
                      <span className={`text-2xl font-bold ${
                        attendanceScore.score === 0 ? 'text-red-600' : 
                        attendanceScore.score >= 8 ? 'text-green-600' : 
                        attendanceScore.score >= 5 ? 'text-yellow-600' : 'text-orange-600'
                      }`}>
                        {attendanceScore.score.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* คะแนนรวม */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6 shadow-md">
          <div className="text-center">
            <p className="text-gray-600 text-lg mb-2">คะแนนรวมทั้งหมด</p>
            <p className="text-5xl font-bold text-green-600">{evaluationData.total_score.toFixed(2)}</p>
            <p className="text-gray-500 text-sm mt-2">จาก 90.00 คะแนน</p>
          </div>
        </div>

        {/* ตารางคะแนนแต่ละหมวด */}
        <div className="space-y-6">
          {evaluationData.details.map((detail, detailIndex) => (
            <div key={detail.detail_id} className="border border-gray-200 rounded-lg overflow-hidden shadow-md bg-white">
              {/* หัวข้อหลัก */}
              <div className="bg-blue-100 px-4 py-3">
                <h3 className="font-bold text-lg text-gray-800">
                  {detailIndex + 1}. {detail.topic}
                  <span className="ml-3 text-sm font-normal text-gray-700">
                    (คะแนนเต็ม: {detail.max_score})
                  </span>
                </h3>
              </div>

              {/* SubDetails */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        พฤติกรรม/เกณฑ์
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-32">
                        คะแนนที่ได้
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {detail.subdetails && detail.subdetails.length > 0 ? (
                      detail.subdetails.map((subdetail) => {
                        const key = `${detail.detail_id}_${subdetail.subdetail_id}`;
                        const scoreValue = evaluationData.scores[key] || 0;
                        const subdetailMaxScore = getSubdetailMaxScore(detail);
                        
                        // รวบรวม score descriptions
                        const scoreDescItems = [];
                        for (let i = 1; i <= 5; i++) {
                          const desc = subdetail[`score_${i}_desc`];
                          if (desc && desc.trim() !== '') {
                            scoreDescItems.push({
                              level: i,
                              text: desc,
                              scoreValue: ((i * 20) / 100) * subdetailMaxScore
                            });
                          }
                        }

                        return (
                          <React.Fragment key={subdetail.subdetail_id}>
                            <tr className="hover:bg-gray-50">
                              <td className="px-4 py-4">
                                <div className="font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">
                                  {detailIndex + 1}.{subdetail.subdetail_id} {subdetail.subdetail_topic}
                                  <span className="ml-2 text-xs text-gray-500">
                                    (คะแนนเต็ม: {subdetailMaxScore.toFixed(2)})
                                  </span>
                                </div>
                                
                                {scoreDescItems.length > 0 ? (
                                  <div className="ml-4 space-y-2">
                                    {scoreDescItems.map((item) => {
                                      const isSelected = Math.abs(scoreValue - item.scoreValue) < 0.01;
                                      return (
                                        <div
                                          key={item.level}
                                          className={`flex items-start p-2 rounded ${
                                            isSelected ? 'bg-green-100 border-2 border-green-500' : 'bg-gray-50'
                                          }`}
                                        >
                                          <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${
                                            isSelected ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                                          }`}>
                                            {isSelected ? '✓' : item.level}
                                          </div>
                                          <div className="flex-1">
                                            <span className={`font-semibold mr-2 ${
                                              isSelected ? 'text-green-700' : 'text-blue-700'
                                            }`}>
                                              {item.level} ({item.scoreValue.toFixed(2)} คะแนน):
                                            </span>
                                            <span className={isSelected ? 'text-gray-900 font-medium' : 'text-gray-700'}>
                                              {item.text}
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <div className="text-sm text-gray-500 italic">
                                    ไม่มีเกณฑ์การให้คะแนน
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-4 text-center align-top">
                                <div className="inline-flex flex-col items-center justify-center bg-green-50 border-2 border-green-500 rounded-lg px-4 py-3">
                                  <div className="text-3xl font-bold text-green-600">
                                    {scoreValue.toFixed(2)}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    จาก {subdetailMaxScore.toFixed(2)}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          </React.Fragment>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="2" className="px-4 py-8 text-center text-gray-500">
                          ไม่มีรายการประเมินในหมวดนี้
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default EvaluationResult;
