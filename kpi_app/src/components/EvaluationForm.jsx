import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const EvaluationForm = ({ employee, position, expectedScore = 5 }) => {
  const [details, setDetails] = useState([]);
  const [scores, setScores] = useState({});
  const [comments, setComments] = useState({});
  const [managerComment, setManagerComment] = useState(''); // Comment ของหัวหน้า
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [appraisalId, setAppraisalId] = useState(null);
  const navigate = useNavigate();  // ดึงข้อมูล details และ subdetails จาก database
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        
        // สร้าง URL พร้อม position_id ถ้ามี
        let url = 'http://localhost:8080/api/getDetails';
        if (position && position.position_id) {
          url += `?position_id=${position.position_id}`;
          console.log('Fetching details for position_id:', position.position_id);
        }
        
        const response = await fetch(url);
        const data = await response.json();
        console.log('Details data for position:', position?.position_name, data);
        setDetails(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching details:', error);
        setLoading(false);
      }
    };

    fetchDetails();
  }, [position]);

  // จัดการการเปลี่ยนแปลงคะแนน
  const handleScoreChange = (detailId, subdetailId, value) => {
    const key = `${detailId}_${subdetailId}`;
    let v = parseInt(value, 10);
    
    if (Number.isNaN(v)) {
      setScores(prev => ({ ...prev, [key]: '' }));
      return;
    }
    
    if (v < 1) v = 1;
    if (v > 5) v = 5;
    
    setScores(prev => ({ ...prev, [key]: v }));
  };

  // จัดการความคิดเห็น
  const handleCommentChange = (detailId, subdetailId, value) => {
    const key = `${detailId}_${subdetailId}`;
    setComments(prev => ({ ...prev, [key]: value }));
  };

  // คำนวณคะแนนเต็มของแต่ละ subdetail
  const getSubdetailMaxScore = (detail) => {
    if (!detail.subdetails || detail.subdetails.length === 0) return 0;
    return detail.max_score / detail.subdetails.length;
  };

  // คำนวณคะแนนที่คาดหวัง (ครึ่งหนึ่งของคะแนนเต็ม subdetail)
  const getExpectedScore = (detail) => {
    const maxScore = getSubdetailMaxScore(detail);
    return maxScore / 2;
  };

  // ฟังก์ชัน Submit การประเมิน
  const handleSubmit = async () => {
    // ตรวจสอบว่ามีคะแนนหรือไม่ (อนุญาตให้ส่งได้แม้ไม่มีคะแนน)
    const totalSubdetails = details.reduce((sum, d) => sum + (d.subdetails?.length || 0), 0);
    const scoredCount = Object.keys(scores).filter(k => scores[k] !== '' && scores[k] != null).length;
    if (scoredCount < totalSubdetails) {
      if (!window.confirm(`คุณประเมินไปแล้ว ${scoredCount}/${totalSubdetails} รายการ ต้องการส่งผลการประเมินหรือไม่?`)) {
        return;
      }
    }

    // ตรวจสอบว่ามีข้อมูลพนักงาน
    if (!employee || !employee.emp_id) {
      setSubmitMessage('ไม่พบข้อมูลพนักงานที่ต้องการประเมิน');
      return;
    }

    setSubmitting(true);
    setSubmitMessage('');

    try {
      const currentYear = new Date().getFullYear();
      
      const response = await fetch('http://localhost:8080/api/submitEvaluation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emp_id: employee.emp_id,
          year: currentYear,
          scores: scores,
          comments: comments,
          m_comment: managerComment // เพิ่ม comment ของหัวหน้า
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // แสดง modal สำเร็จ
        setAppraisalId(data.appraisal_id);
        setShowSuccessModal(true);
        
        // รอ 2 วินาที แล้ว navigate ไปหน้าหลัก
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setSubmitMessage(`❌ เกิดข้อผิดพลาด: ${data.error}`);
      }
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      setSubmitMessage('❌ ไม่สามารถส่งผลการประเมินได้');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      
      
      <div className="overflow-x-auto mb-8">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-200 font-semibold">
            <tr>
              <th className="border border-gray-400 px-3 py-2 text-center">การประเมิน</th>
              <th className="border border-gray-400 px-3 py-2 text-center w-24">คะแนนคาดหวัง</th>
              <th className="border border-gray-400 px-3 py-2 text-center w-64">ความคิดเห็น/ข้อเสนอแนะของผู้ประเมิน</th>
            </tr>
          </thead>
          <tbody>
            {/* วนลูปแสดง Details จาก database */}
            {details.map((detail, detailIndex) => (
              <React.Fragment key={detail.detail_id}>
                {/* หัวข้อหลัก (Detail) */}
                <tr className="bg-blue-100">
                  <td colSpan="3" className='border border-gray-400 font-bold text-left px-4 py-3'>
                    {detailIndex + 1}. {detail.topic}
                    {detail.max_score > 0 && (
                      <span className="ml-3 text-sm font-normal text-gray-700">
                        (คะแนนเต็ม: {detail.max_score})
                      </span>
                    )}
                  </td>
                </tr>

                {/* Subdetails */}
                {detail.subdetails && detail.subdetails.length > 0 ? (
                  detail.subdetails.map((subdetail) => {
                    const key = `${detail.detail_id}_${subdetail.subdetail_id}`;
                    
                    // Debug: แสดงข้อมูล subdetail
                    console.log(`Subdetail ${key}:`, subdetail);
                    
                    // รวบรวมรายการย่อยจาก score descriptions
                    const scoreDescItems = [];
                    for (let i = 1; i <= 5; i++) {
                      const desc = subdetail[`score_${i}_desc`];
                      console.log(`  score_${i}_desc:`, desc); // Debug
                      if (desc && desc.trim() !== '') {
                        scoreDescItems.push({
                          id: `${subdetail.subdetail_id}.${i}`,
                          text: desc,
                          scoreLevel: i
                        });
                      }
                    }
                    
                    console.log(`  Total score items:`, scoreDescItems.length); // Debug

                    // ถ้าไม่มี score descriptions ให้แสดงแค่หัวข้อ subdetail
                    const rowSpan = scoreDescItems.length > 0 ? scoreDescItems.length : 1;
                    
                    // คำนวณคะแนนคาดหวังสำหรับ subdetail นี้
                    const subdetailExpectedScore = getExpectedScore(detail);
                    const subdetailMaxScore = getSubdetailMaxScore(detail);

                    return (
                      <React.Fragment key={subdetail.subdetail_id}>
                        {scoreDescItems.length > 0 ? (
                          // กรณีมี score descriptions
                          scoreDescItems.map((item, idx) => {
                            // คำนวณคะแนนที่ได้รับในแต่ละระดับ (20%, 40%, 60%, 80%, 100%)
                            const scoreValue = ((item.scoreLevel * 20) / 100) * subdetailMaxScore;
                            
                            return (
                            <tr key={`${subdetail.subdetail_id}_${idx}`} className="hover:bg-gray-50">
                              <td className="border border-gray-400 px-3 py-2 text-left align-top">
                                <div className="flex flex-col">
                                  {/* แสดงหัวข้อ Subdetail เฉพาะแถวแรก */}
                                  {idx === 0 && (
                                    <div className="font-bold text-gray-800 mb-3 pb-2 border-b border-gray-300">
                                      {detailIndex + 1}.{subdetail.subdetail_id} {subdetail.subdetail_topic}
                                    </div>
                                  )}
                              {/* แสดงรายการ score description */}
                                  <div className="flex items-start ml-2">
                                    <div className="flex items-center mr-3">
                                      <input
                                        type="radio"
                                        name={key}
                                        value={item.scoreLevel}
                                        checked={scores[key] === item.scoreLevel}
                                        onChange={() => handleScoreChange(detail.detail_id, subdetail.subdetail_id, item.scoreLevel)}
                                        className="w-5 h-5 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <span className="font-semibold text-blue-700 mr-2">
                                        {item.scoreLevel} ({scoreValue.toFixed(2)} คะแนน):
                                      </span>
                                      <span className="text-gray-700">{item.text}</span>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              
                              {/* คะแนนคาดหวัง - แสดงเฉพาะแถวแรกและ merge cells */}
                              {idx === 0 ? (
                                <>
                                  <td 
                                    rowSpan={rowSpan} 
                                    className="border border-gray-400 text-center align-middle font-semibold text-lg bg-yellow-50"
                                  >
                                    <div>{subdetailExpectedScore.toFixed(2)}</div>
                                    <div className="text-xs text-gray-600 mt-1">
                                      (จาก {subdetailMaxScore.toFixed(2)})
                                    </div>
                                  </td>
                                  <td 
                                    rowSpan={rowSpan} 
                                    className="border border-gray-400 align-top p-2 bg-gray-50"
                                  >
                                    <textarea 
                                      rows="4"
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      placeholder="กรอกความคิดเห็น..."
                                      value={comments[key] || ''}
                                      onChange={(e) => handleCommentChange(detail.detail_id, subdetail.subdetail_id, e.target.value)}
                                    />
                                  </td>
                                </>
                              ) : null}
                            </tr>
                            );
                          })
                        ) : (
                          // กรณีไม่มี score descriptions - แสดงเฉพาะหัวข้อ
                          <tr className="hover:bg-gray-50">
                            <td className="border border-gray-400 px-3 py-2 text-left">
                              <div className="font-bold text-gray-800">
                                {detailIndex + 1}.{subdetail.subdetail_id} {subdetail.subdetail_topic}
                              </div>
                              <div className="text-sm text-red-500 mt-2">
                                ⚠️ ยังไม่มีข้อมูลคำอธิบายระดับคะแนน (score_1_desc - score_5_desc)
                              </div>
                            </td>
                            <td className="border border-gray-400 text-center align-middle font-semibold text-lg bg-yellow-50">
                              <div>{getExpectedScore(detail).toFixed(2)}</div>
                              <div className="text-xs text-gray-600 mt-1">
                                (จาก {getSubdetailMaxScore(detail).toFixed(2)})
                              </div>
                            </td>
                            <td className="border border-gray-400 align-top p-2 bg-gray-50">
                              <textarea 
                                rows="4"
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="กรอกความคิดเห็น..."
                                value={comments[key] || ''}
                                onChange={(e) => handleCommentChange(detail.detail_id, subdetail.subdetail_id, e.target.value)}
                              />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="3" className="border border-gray-400 px-4 py-3 text-center text-gray-500">
                      ไม่มีรายการประเมินในหมวดนี้
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Section */}
      <div className="bg-white rounded-lg border border-gray-300 p-6 mt-6">
        <h3 className="text-lg font-bold text-gray-800 mb-3">สรุปผลการประเมิน</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">จำนวนหัวข้อทั้งหมด</p>
            <p className="text-2xl font-bold text-blue-600">
              {details.reduce((sum, d) => sum + (d.subdetails?.length || 0), 0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">ประเมินแล้ว</p>
            <p className="text-2xl font-bold text-green-600">
              {Object.keys(scores).filter(k => scores[k] !== '' && scores[k] != null).length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">คะแนนเฉลี่ย</p>
            <p className="text-2xl font-bold text-purple-600">
              {(() => {
                const validScores = Object.values(scores).filter(v => v !== '' && v != null && !Number.isNaN(Number(v)));
                if (validScores.length === 0) return '0.00';
                const avg = validScores.reduce((a, b) => Number(a) + Number(b), 0) / validScores.length;
                return avg.toFixed(2);
              })()}
            </p>
          </div>
        </div>
      </div>

      {/* Manager Comment Section */}
      <div className="bg-white rounded-lg border border-gray-300 p-6 mt-6">
        <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
          <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          ความคิดเห็นของหัวหน้า
        </h3>
        <textarea
          value={managerComment}
          onChange={(e) => setManagerComment(e.target.value)}
          rows="4"
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-200 focus:border-blue-500 resize-none"
          placeholder="กรอกความคิดเห็น ข้อเสนอแนะ หรือคำแนะนำสำหรับพนักงาน..."
        />
        
      </div>

      {/* Submit Button และข้อความแจ้งเตือน */}
      <div className="bg-white rounded-lg border border-gray-300 p-6 mt-6">
        {submitMessage && (
          <div className={`mb-4 p-4 rounded-lg ${
            submitMessage.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {submitMessage}
          </div>
        )}

        {employee && (
          <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>ข้อมูลการประเมิน:</strong> {employee.first_name} {employee.last_name} 
              {position && ` - ${position.position_name}`}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              ปี: {new Date().getFullYear()} | พนักงาน ID: {employee.emp_id}
            </p>
          </div>
        )}

        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-300 transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                กำลังบันทึก...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                ส่งผลการประเมิน
              </span>
            )}
          </button>
        </div>

        <div className="mt-4 text-center text-sm text-gray-500">
          <p>กรุณาตรวจสอบคะแนนก่อนกดส่ง ข้อมูลจะถูกบันทึกลงระบบทันที</p>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 transform animate-bounce-in">
            <div className="text-center">
              {/* Success Icon */}
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-4">
                <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              {/* Success Message */}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                บันทึกสำเร็จ!
              </h3>
              <p className="text-gray-600 mb-4">
                ผลการประเมินถูกบันทึกเรียบร้อยแล้ว
              </p>
              
              {/* Appraisal ID */}
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-600 font-medium">Appraisal ID</p>
                <p className="text-2xl font-bold text-blue-800">{appraisalId}</p>
              </div>
              
              {/* Redirect Message */}
              <p className="text-sm text-gray-500">
                กำลังนำคุณกลับสู่หน้าหลัก...
              </p>
              
              {/* Loading Animation */}
              <div className="mt-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluationForm;
