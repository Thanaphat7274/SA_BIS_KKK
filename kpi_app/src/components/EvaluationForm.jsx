import React, { useState, useEffect } from "react";

const EvaluationForm = ({ employee, position, expectedScore = 5 }) => {
  const [details, setDetails] = useState([]);
  const [scores, setScores] = useState({});
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(true);

  // ดึงข้อมูล details และ subdetails จาก database
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8080/api/getDetails');
        const data = await response.json();
        console.log('Details data:', data);
        setDetails(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching details:', error);
        setLoading(false);
      }
    };

    fetchDetails();
  }, []);

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
    return Math.round(detail.max_score / detail.subdetails.length);
  };

  // คำนวณคะแนนที่คาดหวัง (ครึ่งหนึ่งของคะแนนเต็ม subdetail)
  const getExpectedScore = (detail) => {
    const maxScore = getSubdetailMaxScore(detail);
    return Math.round(maxScore / 2);
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
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800 mt-12">
        ส่วนที่ 3 คะแนนความสามารถ (Performance Behavior)
      </h2>
      
      <div className="overflow-x-auto mb-8">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-200 font-semibold">
            <tr>
              <th className="border border-gray-400 px-3 py-2 text-center">พฤติกรรม</th>
              <th className="border border-gray-400 px-3 py-2 text-center w-24">คะแนนคาดหวัง</th>
              <th className="border border-gray-400 px-3 py-2 text-center w-64">ความคิดเห็น/ข้อเสนอแนะของผู้ถูกประเมิน</th>
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
                                    <div>{subdetailExpectedScore}</div>
                                    <div className="text-xs text-gray-600 mt-1">
                                      (จาก {getSubdetailMaxScore(detail)})
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
                              <div>{getExpectedScore(detail)}</div>
                              <div className="text-xs text-gray-600 mt-1">
                                (จาก {getSubdetailMaxScore(detail)})
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
    </div>
  );
};

export default EvaluationForm;
