import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const EvaluationDetailModal = ({ appraisalId, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvaluationDetail();
  }, [appraisalId]);

  const fetchEvaluationDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/api/evaluations/${appraisalId}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Error fetching evaluation detail:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">รายละเอียดการประเมิน KPI</h2>
            <p className="text-blue-100 text-sm mt-1">
              {data.employee.first_name} {data.employee.last_name} - {data.employee.position_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* ข้อมูลพนักงาน */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">พนักงาน ID:</span>
                <p className="font-semibold text-gray-900">{data.employee.emp_id}</p>
              </div>
              <div>
                <span className="text-gray-600">ตำแหน่ง:</span>
                <p className="font-semibold text-gray-900">{data.employee.position_name || '-'}</p>
              </div>
              <div>
                <span className="text-gray-600">ปีที่ประเมิน:</span>
                <p className="font-semibold text-gray-900">{data.employee.year + 543}</p>
              </div>
              <div>
                <span className="text-gray-600">วันที่ประเมิน:</span>
                <p className="font-semibold text-gray-900">
                  {new Date(data.employee.evaluated_at).toLocaleDateString('th-TH')}
                </p>
              </div>
            </div>
          </div>

          {/* คะแนนการเข้างาน */}
          {data.attendance && (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 rounded-lg">
              <h3 className="font-bold text-lg text-gray-800 mb-3">
                📅 คะแนนการเข้างาน (เต็ม 10 คะแนน)
              </h3>
              {(() => {
                const attendanceScore = calculateAttendanceScore(data.attendance);
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

          {/* ตารางคะแนนแต่ละหมวด */}
          <div className="space-y-6">
            {data.details.map((detail, detailIndex) => (
              <div key={detail.detail_id} className="border border-gray-200 rounded-lg overflow-hidden">
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
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-64">
                          ความคิดเห็น
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {detail.subdetails && detail.subdetails.length > 0 ? (
                        detail.subdetails.map((subdetail) => {
                          const key = `${detail.detail_id}_${subdetail.subdetail_id}`;
                          const scoreValue = data.scores[key] || 0;
                          const comment = data.comments?.[key] || '';
                          const subdetailMaxScore = getSubdetailMaxScore(detail);

                          // Prepare score descriptions (1-5)
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
                                  <div className="font-semibold text-gray-800 mb-2">
                                    {detailIndex + 1}.{subdetail.subdetail_id} {subdetail.subdetail_topic}
                                    <span className="ml-2 text-xs text-gray-500">
                                      (คะแนนเต็ม: {subdetailMaxScore.toFixed(2)})
                                    </span>
                                  </div>
                                  {/* Show score descriptions and highlight the selected one */}
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
                                <td className="px-4 py-4 align-top">
                                  {comment ? (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment}</p>
                                    </div>
                                  ) : (
                                    <div className="text-center text-gray-400 text-sm italic">
                                      ไม่มีความคิดเห็น
                                    </div>
                                  )}
                                </td>
                              </tr>
                            </React.Fragment>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="3" className="px-4 py-8 text-center text-gray-500">
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

          {/* คะแนนรวม */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6 shadow-lg mt-6">
            <div className="text-center">
              <p className="text-gray-600 text-lg mb-2">คะแนนรวมทั้งหมด</p>
              {(() => {
                const attendanceScore = data.attendance 
                  ? calculateAttendanceScore(data.attendance).score 
                  : 0;
                const totalScore = data.total_score + attendanceScore;
                return (
                  <>
                    <p className="text-5xl font-bold text-green-600">{totalScore.toFixed(2)}</p>
                    <p className="text-gray-500 text-sm mt-2">จาก 100.00 คะแนน</p>
                    <div className="mt-6 pt-4 border-t border-gray-300">
                      <p className="text-gray-700 font-semibold mb-4">รายละเอียดคะแนนแยกตามหมวด</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm max-w-2xl mx-auto">
                        {data.details.map((detail, index) => {
                          // คำนวณคะแนนรวมของ detail นี้
                          let detailScore = 0;
                          if (detail.subdetails && detail.subdetails.length > 0) {
                            detail.subdetails.forEach((subdetail) => {
                              const key = `${detail.detail_id}_${subdetail.subdetail_id}`;
                              const scoreValue = data.scores[key] || 0;
                              detailScore += scoreValue;
                            });
                          }
                          
                          return (
                            <div key={detail.detail_id} className="bg-white rounded-lg p-3 border-2 border-blue-100 hover:border-blue-300 transition-colors">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-700 font-medium">
                                  {index + 1}. {detail.topic}
                                </span>
                                <span className="font-bold text-blue-600">
                                  {detailScore.toFixed(2)}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1 text-right">
                                เต็ม {detail.max_score} คะแนน
                              </div>
                            </div>
                          );
                        })}
                        
                        {/* คะแนนการเข้างาน */}
                        <div className="bg-white rounded-lg p-3 border-2 border-yellow-100 hover:border-yellow-300 transition-colors">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 font-medium">
                              📅 การเข้างาน
                            </span>
                            <span className="font-bold text-yellow-600">
                              {attendanceScore.toFixed(2)}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1 text-right">
                            เต็ม 10.00 คะแนน
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Comments Section */}
          <div className="px-6 py-4 space-y-4">
            {/* Manager Comment */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                </svg>
                <h3 className="font-bold text-blue-800">ความคิดเห็นจากหัวหน้า</h3>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap pl-7">{data.m_comment ? data.m_comment : <span className="text-gray-400 italic">ไม่มีความคิดเห็น</span>}</p>
            </div>

            {/* Employee Comment */}
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-600 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
                <h3 className="font-bold text-green-800">ความคิดเห็นจากพนักงาน</h3>
              </div>
              {data.e_comment ? (
                <p className="text-gray-700 whitespace-pre-wrap pl-7">{data.e_comment}</p>
              ) : (
                <p className="text-gray-400 italic pl-7">ยังไม่ยืนยันผลการประเมิน</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};

export default EvaluationDetailModal;
