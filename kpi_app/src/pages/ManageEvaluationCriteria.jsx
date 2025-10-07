import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ManageEvaluationCriteria = () => {
  const navigate = useNavigate();
  const [details, setDetails] = useState([]);
  const [newDetail, setNewDetail] = useState({ topic: '', maxScore: '' });
  const [newSubDetail, setNewSubDetail] = useState({ 
    detailId: '', 
    subdetailTopic: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // ดึงข้อมูล details ที่มีอยู่
  const fetchDetails = async () => {
    try {
      setLoading(true);
      // ใช้ fetch API แทน axios
      const response = await fetch('/api/getDetails');
      if (response.ok) {
        const data = await response.json();
        setDetails(data || []);
      }
    } catch (error) {
      console.error('Error fetching details:', error);
      setMessage('ไม่สามารถดึงข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, []);

  // เพิ่ม Detail ใหม่
  const handleAddDetail = async (e) => {
    e.preventDefault();
    if (!newDetail.topic.trim()) {
      setMessage('กรุณากรอกหัวข้อประเมิน');
      return;
    }

    if (!newDetail.maxScore || newDetail.maxScore <= 0) {
      setMessage('กรุณากรอกคะแนนเต็มที่ถูกต้อง');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/addDetail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: newDetail.topic,
          max_score: parseInt(newDetail.maxScore)
        }),
      });

      if (response.ok) {
        setMessage('เพิ่มหัวข้อประเมินสำเร็จ');
        setNewDetail({ topic: '', maxScore: '' });
        fetchDetails(); // รีเฟรชข้อมูล
      } else {
        const error = await response.json();
        setMessage(`เกิดข้อผิดพลาด: ${error.error}`);
      }
    } catch (error) {
      console.error('Error adding detail:', error);
      setMessage('ไม่สามารถเพิ่มหัวข้อประเมินได้');
    } finally {
      setLoading(false);
    }
  };

  // เพิ่ม SubDetail ใหม่
  const handleAddSubDetail = async (e) => {
    e.preventDefault();
    if (!newSubDetail.detailId || !newSubDetail.subdetailTopic.trim()) {
      setMessage('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/addSubDetail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          detail_id: parseInt(newSubDetail.detailId),
          subdetail_topic: newSubDetail.subdetailTopic
        }),
      });

      if (response.ok) {
        setMessage('เพิ่มรายละเอียดย่อยสำเร็จ');
        setNewSubDetail({ detailId: '', subdetailTopic: '' });
        fetchDetails(); // รีเฟรชข้อมูล
      } else {
        const error = await response.json();
        setMessage(`เกิดข้อผิดพลาด: ${error.error}`);
      }
    } catch (error) {
      console.error('Error adding subdetail:', error);
      setMessage('ไม่สามารถเพิ่มรายละเอียดย่อยได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                จัดการเกณฑ์การประเมิน
              </h1>
              <p className="text-gray-600">
                เพิ่ม/แก้ไข หัวข้อประเมินและรายละเอียดย่อย
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* แสดงข้อความ */}
        {message && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.includes('สำเร็จ') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ฟอร์มเพิ่ม Detail */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">เพิ่มหัวข้อประเมินใหม่</h2>
            <form onSubmit={handleAddDetail}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  หัวข้อประเมิน
                </label>
                <input
                  type="text"
                  value={newDetail.topic}
                  onChange={(e) => setNewDetail({ ...newDetail, topic: e.target.value })}
                  placeholder="เช่น คุณภาพงาน, ทักษะการทำงาน"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  คะแนนเต็ม
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={newDetail.maxScore}
                  onChange={(e) => setNewDetail({ ...newDetail, maxScore: e.target.value })}
                  placeholder="กรอกคะแนนเต็ม (เช่น 10, 20, 50)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'กำลังเพิ่ม...' : 'เพิ่มหัวข้อประเมิน'}
              </button>
            </form>
          </div>

          {/* ฟอร์มเพิ่ม SubDetail */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">เพิ่มรายละเอียดย่อย</h2>
            <form onSubmit={handleAddSubDetail}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  เลือกหัวข้อประเมิน
                </label>
                <select
                  value={newSubDetail.detailId}
                  onChange={(e) => setNewSubDetail({ ...newSubDetail, detailId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- เลือกหัวข้อประเมิน --</option>
                  {details.map((detail) => (
                    <option key={detail.detail_id} value={detail.detail_id}>
                      {detail.topic} (คะแนนเต็ม: {detail.max_score || 'ไม่ระบุ'})
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  รายละเอียดย่อย
                </label>
                <textarea
                  value={newSubDetail.subdetailTopic}
                  onChange={(e) => setNewSubDetail({ ...newSubDetail, subdetailTopic: e.target.value })}
                  placeholder="อธิบายรายละเอียดของเกณฑ์การประเมิน"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {newSubDetail.detailId && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>หมายเหตุ:</strong> คะแนนย่อยจะถูกคำนวณอัตโนมัติจากคะแนนเต็มของหัวข้อหลัก หารด้วยจำนวนรายละเอียดย่อย
                    {(() => {
                      const selectedDetail = details.find(d => d.detail_id === parseInt(newSubDetail.detailId));
                      const currentSubCount = selectedDetail?.subdetails?.length || 0;
                      const newSubCount = currentSubCount + 1;
                      const maxScore = selectedDetail?.max_score || 0;
                      if (maxScore > 0) {
                        return ` (${maxScore} ÷ ${newSubCount} = ${(maxScore / newSubCount).toFixed(2)} คะแนน/รายการ)`;
                      }
                      return '';
                    })()}
                  </p>
                </div>
              )}
              <button
                type="submit"
                disabled={loading || !newSubDetail.detailId}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'กำลังเพิ่ม...' : 'เพิ่มรายละเอียดย่อย'}
              </button>
            </form>
          </div>
        </div>

        {/* แสดงรายการ Details และ SubDetails ที่มีอยู่ */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">เกณฑ์การประเมินที่มีอยู่</h2>
          
          {loading ? (
            <div className="text-center py-4">กำลังโหลด...</div>
          ) : details.length === 0 ? (
            <div className="text-center py-4 text-gray-500">ยังไม่มีเกณฑ์การประเมิน</div>
          ) : (
            <div className="space-y-4">
              {details.map((detail) => (
                <div key={detail.detail_id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{detail.topic}</h3>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      คะแนนเต็ม: {detail.max_score || 5}
                    </span>
                  </div>
                  
                  {detail.subdetails && detail.subdetails.length > 0 && (
                    <div className="ml-4 space-y-2">
                      <h4 className="font-medium text-gray-700">
                        รายละเอียดย่อย: ({detail.subdetails.length} รายการ)
                        {detail.max_score && (
                          <span className="text-sm text-gray-500 font-normal ml-2">
                            (คะแนนย่อย: {(detail.max_score / detail.subdetails.length).toFixed(2)} คะแนน/รายการ)
                          </span>
                        )}
                      </h4>
                      {detail.subdetails.map((sub, index) => (
                        <div key={sub.subdetail_id} className="flex justify-between items-start bg-gray-50 p-3 rounded">
                          <span className="text-sm">
                            {index + 1}. {sub.subdetail_topic}
                          </span>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                            {detail.max_score ? (detail.max_score / detail.subdetails.length).toFixed(2) : 'N/A'} คะแนน
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageEvaluationCriteria;