import React, { useState, useEffect } from "react";
import { CheckCircleIcon, ClipboardDocumentCheckIcon, UserGroupIcon, ChartBarIcon } from "@heroicons/react/24/outline";

const EvaluationResult = ({ username }) => {
  const [evaluationData, setEvaluationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employeeComment, setEmployeeComment] = useState('');
  const [isCommentSubmitted, setIsCommentSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

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
        console.log('latestEval.appraisal_id:', latestEval.appraisal_id);
        
        // เพิ่ม appraisal_id เข้าไปใน detailData
        detailData.appraisal_id = latestEval.appraisal_id;
        
        console.log('detailData after adding appraisal_id:', detailData);
        console.log('detailData.appraisal_id:', detailData.appraisal_id);
        
        setEvaluationData(detailData);
        
        // ตรวจสอบว่ามี e_comment แล้วหรือยัง
        if (detailData.e_comment) {
          setEmployeeComment(detailData.e_comment);
          setIsCommentSubmitted(true);
        }
        
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

  // ฟังก์ชัน submit employee comment
  const handleSubmitComment = async () => {
    console.log('handleSubmitComment called');
    console.log('evaluationData:', evaluationData);
    console.log('appraisal_id:', evaluationData?.appraisal_id);
    
    if (isCommentSubmitted) {
      alert('✅ คุณได้ยืนยันผลการประเมินไปแล้ว\n\nไม่สามารถแก้ไขได้อีก');
      return;
    }

    // ยืนยันก่อนส่ง
    const confirmMessage = employeeComment.trim() 
      ? '⚠️ ยืนยันการรับทราบผลการประเมิน\n\nคุณต้องการยืนยันผลการประเมินนี้หรือไม่?\n\n✓ จะบันทึกพร้อมความคิดเห็นของคุณ\n✓ หลังจากยืนยันแล้วจะไม่สามารถแก้ไขได้\n\nกด OK เพื่อยืนยัน'
      : '⚠️ ยืนยันการรับทราบผลการประเมิน\n\nคุณต้องการยืนยันผลการประเมินนี้หรือไม่?\n\n✓ หลังจากยืนยันแล้วจะไม่สามารถแก้ไขได้\n\nกด OK เพื่อยืนยัน';
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    if (!evaluationData) {
      console.error('evaluationData is null or undefined');
      setSubmitMessage('❌ ไม่พบข้อมูลการประเมิน');
      return;
    }

    if (!evaluationData.appraisal_id) {
      console.error('appraisal_id not found in evaluationData');
      console.error('evaluationData keys:', Object.keys(evaluationData));
      setSubmitMessage('❌ ไม่พบข้อมูลการประเมิน ');
      return;
    }

    setSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await fetch('http://localhost:8080/api/submitEmployeeComment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appraisal_id: evaluationData.appraisal_id,
          e_comment: employeeComment.trim() || '-' // ถ้าไม่มีความคิดเห็น ส่ง '-' แทน
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitMessage('✅ ยืนยันผลการประเมินสำเร็จ!');
        setIsCommentSubmitted(true);
        
        // แสดง alert สำเร็จ
        setTimeout(() => {
          alert('✅ ยืนยันผลการประเมินสำเร็จ!\n\nคุณได้ยืนยันรับทราบผลการประเมินแล้ว' + (employeeComment.trim() ? '\nพร้อมความคิดเห็นของคุณ' : ''));
        }, 100);
      } else {
        // ตรวจสอบว่าเป็นกรณีส่งซ้ำหรือไม่
        if (data.error && data.error.includes('already submitted')) {
          setIsCommentSubmitted(true);
          setSubmitMessage('⚠️ คุณได้ยืนยันผลการประเมินไปแล้ว');
          alert('⚠️ คุณได้ยืนยันผลการประเมินไปแล้ว\n\nไม่สามารถยืนยันซ้ำได้');
        } else {
          setSubmitMessage(`❌ เกิดข้อผิดพลาด: ${data.error}`);
        }
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      setSubmitMessage('❌ ไม่สามารถยืนยันผลการประเมินได้');
    } finally {
      setSubmitting(false);
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-64">
                        ความคิดเห็น
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {detail.subdetails && detail.subdetails.length > 0 ? (
                      detail.subdetails.map((subdetail) => {
                        const key = `${detail.detail_id}_${subdetail.subdetail_id}`;
                        const scoreValue = evaluationData.scores[key] || 0;
                        const comment = evaluationData.comments?.[key] || '';
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

        {/* คะแนนรวม */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6 shadow-lg">
          <div className="text-center">
            <p className="text-gray-600 text-lg mb-2">คะแนนรวมทั้งหมด</p>
            {(() => {
              const attendanceScore = evaluationData.attendance 
                ? calculateAttendanceScore(evaluationData.attendance).score 
                : 0;
              const totalScore = evaluationData.total_score + attendanceScore;
              return (
                <>
                  <p className="text-5xl font-bold text-green-600">{totalScore.toFixed(2)}</p>
                  <p className="text-gray-500 text-sm mt-2">จาก 100.00 คะแนน</p>
                  <div className="mt-6 pt-4 border-t border-gray-300">
                    <p className="text-gray-700 font-semibold mb-4">รายละเอียดคะแนนแยกตามหมวด</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm max-w-2xl mx-auto">
                      {evaluationData.details.map((detail, index) => {
                        // คำนวณคะแนนรวมของ detail นี้
                        let detailScore = 0;
                        if (detail.subdetails && detail.subdetails.length > 0) {
                          detail.subdetails.forEach((subdetail) => {
                            const key = `${detail.detail_id}_${subdetail.subdetail_id}`;
                            const scoreValue = evaluationData.scores[key] || 0;
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

        {/* Manager Comment Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg shadow-lg p-6 mt-6">
          <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7 mr-3 text-blue-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
            </svg>
            <span className="flex-1">ความคิดเห็นจากหัวหน้า</span>
            <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-normal">
              📋 Supervisor Feedback
            </span>
          </h3>
          <div className="bg-white rounded-xl p-5 border-2 border-blue-100 shadow-inner">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                  👤
                </div>
              </div>
              <div className="flex-1">
                {evaluationData.m_comment && evaluationData.m_comment.trim() !== '' ? (
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-base">
                    {evaluationData.m_comment}
                  </p>
                ) : (
                  <p className="text-gray-400 italic leading-relaxed text-base">
                    ไม่มีการแสดงความคิดเห็น
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Employee Comment Section */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg shadow-lg p-6 mt-6">
          <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7 mr-3 text-green-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
            <span className="flex-1">ความคิดเห็นของคุณ</span>
            {isCommentSubmitted && (
              <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-normal flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                ส่งแล้ว
              </span>
            )}
          </h3>

          {submitMessage && (
            <div className={`mb-4 p-4 rounded-lg border-2 ${
              submitMessage.includes('✅') 
                ? 'bg-green-100 border-green-300 text-green-800' 
                : 'bg-red-100 border-red-300 text-red-800'
            }`}>
              <p className="font-semibold flex items-center">
                {submitMessage}
              </p>
            </div>
          )}

          {isCommentSubmitted && (
            <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
              <p className="text-sm text-blue-800 flex items-center font-semibold">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                คุณได้ยืนยันการประเมินไปแล้ว
              </p>
              <p className="text-xs text-blue-600 mt-1 ml-7">
                ⚠️ ความคิดเห็นที่ส่งแล้วไม่สามารถแก้ไขหรือลบได้
              </p>
            </div>
          )}

          <div className="bg-white rounded-xl p-5 border-2 border-green-100 shadow-inner">
            <textarea
              value={employeeComment}
              onChange={(e) => setEmployeeComment(e.target.value)}
              disabled={isCommentSubmitted}
              rows="6"
              className={`w-full px-4 py-3 border-2 rounded-lg resize-none transition-all ${
                isCommentSubmitted 
                  ? 'bg-gray-50 border-gray-300 text-gray-600 cursor-not-allowed' 
                  : 'border-green-300 focus:ring-4 focus:ring-green-200 focus:border-green-500 hover:border-green-400'
              }`}
              placeholder={isCommentSubmitted 
                ? '✓ คุณได้ส่งความคิดเห็นไปแล้ว' 
                : '💭 แสดงความคิดเห็น ข้อเสนอแนะ หรือคำถามเกี่ยวกับผลการประเมินของคุณ (ไม่บังคับ)'}
            />
          </div>
        </div>

        {/* ปุ่มยืนยันผลการประเมิน */}
        <div className="flex justify-center mt-8">
          <button
            onClick={handleSubmitComment}
            disabled={isCommentSubmitted || submitting}
            className={`px-10 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 flex items-center shadow-2xl ${
              isCommentSubmitted || submitting
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
            }`}
          >
            {submitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                กำลังบันทึก...
              </>
            ) : isCommentSubmitted ? (
              <>
                <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                ยืนยันผลการประเมินแล้ว
              </>
            ) : (
              <>
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                ยืนยันผลการประเมิน
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default EvaluationResult;
