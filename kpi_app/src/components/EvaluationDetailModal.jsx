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
    return Math.round(detail.max_score / detail.subdetails.length);
  };

  const getScoreLevel = (scoreValue, maxScore) => {
    // คำนวณระดับคะแนนจาก score_value
    const percentage = (scoreValue / maxScore) * 100;
    if (percentage >= 100) return 5;
    if (percentage >= 80) return 4;
    if (percentage >= 60) return 3;
    if (percentage >= 40) return 2;
    return 1;
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

          {/* คะแนนรวม */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="text-center">
              <p className="text-gray-600 text-lg mb-2">คะแนนรวมทั้งหมด</p>
              <p className="text-5xl font-bold text-green-600">{data.total_score.toFixed(2)}</p>
              <p className="text-gray-500 text-sm mt-2">จาก 90.00 คะแนน</p>
            </div>
          </div>

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
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {detail.subdetails && detail.subdetails.length > 0 ? (
                        detail.subdetails.map((subdetail) => {
                          const key = `${detail.detail_id}_${subdetail.subdetail_id}`;
                          const scoreValue = data.scores[key] || 0;
                          const subdetailMaxScore = getSubdetailMaxScore(detail);
                          const scoreLevel = getScoreLevel(scoreValue, subdetailMaxScore);
                          
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
                                      (คะแนนเต็ม: {subdetailMaxScore})
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
                                      จาก {subdetailMaxScore}
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
