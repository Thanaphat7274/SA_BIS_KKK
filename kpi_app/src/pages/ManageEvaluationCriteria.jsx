import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const ManageEvaluationCriteria = () => {
  const navigate = useNavigate();
  const [details, setDetails] = useState([]);
  const [positions, setPositions] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState('');
  const [newDetail, setNewDetail] = useState({ topic: '', maxScore: '' });
  const [newSubDetail, setNewSubDetail] = useState({ 
    detailId: '', 
    subdetailTopic: '',
    score1Desc: '',
    score2Desc: '',
    score3Desc: '',
    score4Desc: '',
    score5Desc: ''
  });
  const [editingDetail, setEditingDetail] = useState(null);
  const [editingSubDetail, setEditingSubDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // ดึงข้อมูล details ที่มีอยู่
  const fetchDetails = async () => {
    if (!selectedPosition) {
      setDetails([]);
      return;
    }
    
    try {
      setLoading(true);
      // ดึงข้อมูล details ตาม position
      const url = `http://localhost:8080/api/getDetails?position_id=${selectedPosition}`;
      console.log('Fetching details from:', url);
      const response = await fetch(url);
      console.log('Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Details data received:', data);
        setDetails(data || []);
      } else {
        console.error('Failed to fetch details:', response.status);
        setMessage('ไม่สามารถดึงข้อมูลได้');
      }
    } catch (error) {
      console.error('Error fetching details:', error);
      setMessage('ไม่สามารถดึงข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  // ดึงข้อมูล positions
  const fetchPositions = async () => {
    try {
      console.log('Fetching positions...');
      const response = await fetch('http://localhost:8080/api/positions');
      console.log('Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Positions data:', data);
        setPositions(data || []);
      } else {
        console.error('Failed to fetch positions:', response.status);
      }
    } catch (error) {
      console.error('Error fetching positions:', error);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  useEffect(() => {
    fetchDetails();
  }, [selectedPosition]);

  // เพิ่ม Detail ใหม่
  const handleAddDetail = async (e) => {
    e.preventDefault();
    
    if (!selectedPosition) {
      setMessage('กรุณาเลือกตำแหน่งก่อน');
      return;
    }
    
    if (!newDetail.topic.trim()) {
      setMessage('กรุณากรอกหัวข้อประเมิน');
      return;
    }

    if (!newDetail.maxScore || newDetail.maxScore <= 0) {
      setMessage('กรุณากรอกคะแนนเต็มที่ถูกต้อง');
      return;
    }

    // ตรวจสอบผลรวมคะแนนไม่เกิน 90
    const currentTotal = details.reduce((sum, detail) => sum + (detail.max_score || 0), 0);
    const newTotal = currentTotal + parseInt(newDetail.maxScore);
    if (newTotal > 90) {
      setMessage(`ไม่สามารถเพิ่มได้ คะแนนรวมจะเกิน 90 (ปัจจุบัน: ${currentTotal}, พยายามเพิ่ม: ${newDetail.maxScore}, รวมเป็น: ${newTotal})`);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/addDetail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: newDetail.topic,
          max_score: parseInt(newDetail.maxScore),
          position_id: parseInt(selectedPosition)
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
      const response = await fetch('http://localhost:8080/api/addSubDetail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          detail_id: parseInt(newSubDetail.detailId),
          subdetail_topic: newSubDetail.subdetailTopic,
          score_1_desc: newSubDetail.score1Desc,
          score_2_desc: newSubDetail.score2Desc,
          score_3_desc: newSubDetail.score3Desc,
          score_4_desc: newSubDetail.score4Desc,
          score_5_desc: newSubDetail.score5Desc
        }),
      });

      if (response.ok) {
        setMessage('เพิ่มหัวข้อย่อยสำเร็จ');
        setNewSubDetail({ 
          detailId: '', 
          subdetailTopic: '',
          score1Desc: '',
          score2Desc: '',
          score3Desc: '',
          score4Desc: '',
          score5Desc: ''
        });
        fetchDetails(); // รีเฟรชข้อมูล
      } else {
        const error = await response.json();
        setMessage(`เกิดข้อผิดพลาด: ${error.error}`);
      }
    } catch (error) {
      console.error('Error adding subdetail:', error);
      setMessage('ไม่สามารถเพิ่มหัวข้อย่อยได้');
    } finally {
      setLoading(false);
    }
  };

  // แก้ไข Detail
  const handleUpdateDetail = async (detailId, topic, maxScore) => {
    // ตรวจสอบผลรวมคะแนนไม่เกิน 90
    const currentDetail = details.find(d => d.detail_id === detailId);
    const otherDetailsTotal = details
      .filter(d => d.detail_id !== detailId)
      .reduce((sum, detail) => sum + (detail.max_score || 0), 0);
    const newTotal = otherDetailsTotal + parseInt(maxScore);
    
    if (newTotal > 90) {
      setMessage(`ไม่สามารถแก้ไขได้ คะแนนรวมจะเกิน 90 (คะแนนรายการอื่น: ${otherDetailsTotal}, พยายามใส่: ${maxScore}, รวมเป็น: ${newTotal})`);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/api/updateDetail/${detailId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic,
          max_score: parseInt(maxScore)
        }),
      });

      if (response.ok) {
        setMessage('แก้ไขหัวข้อประเมินสำเร็จ');
        setEditingDetail(null);
        fetchDetails();
      } else {
        const error = await response.json();
        setMessage(`เกิดข้อผิดพลาด: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating detail:', error);
      setMessage('ไม่สามารถแก้ไขหัวข้อประเมินได้');
    } finally {
      setLoading(false);
    }
  };

  // ลบ Detail
  const handleDeleteDetail = async (detailId) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบหัวข้อนี้? (หัวข้อย่อยทั้งหมดจะถูกลบด้วย)')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/api/deleteDetail/${detailId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage('ลบหัวข้อประเมินสำเร็จ');
        fetchDetails();
      } else {
        const error = await response.json();
        setMessage(`เกิดข้อผิดพลาด: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting detail:', error);
      setMessage('ไม่สามารถลบหัวข้อประเมินได้');
    } finally {
      setLoading(false);
    }
  };

  // แก้ไข SubDetail
  const handleUpdateSubDetail = async (subdetailId, detailId, subdetailTopic, score1, score2, score3, score4, score5) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/api/updateSubDetail/${subdetailId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          detail_id: detailId,
          subdetail_topic: subdetailTopic,
          score_1_desc: score1,
          score_2_desc: score2,
          score_3_desc: score3,
          score_4_desc: score4,
          score_5_desc: score5
        }),
      });

      if (response.ok) {
        setMessage('แก้ไขหัวข้อย่อยสำเร็จ');
        setEditingSubDetail(null);
        fetchDetails();
      } else {
        const error = await response.json();
        setMessage(`เกิดข้อผิดพลาด: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating subdetail:', error);
      setMessage('ไม่สามารถแก้ไขหัวข้อย่อยได้');
    } finally {
      setLoading(false);
    }
  };

  // ลบ SubDetail
  const handleDeleteSubDetail = async (subdetailId, detailId) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบหัวข้อย่อยนี้?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/api/deleteSubDetail/${subdetailId}?detail_id=${detailId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage('ลบหัวข้อย่อยสำเร็จ');
        fetchDetails();
      } else {
        const error = await response.json();
        setMessage(`เกิดข้อผิดพลาด: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting subdetail:', error);
      setMessage('ไม่สามารถลบหัวข้อย่อยได้');
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
                เพิ่ม/แก้ไข หัวข้อประเมินและหัวข้อย่อย
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

        {/* เลือกตำแหน่ง */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">เลือกตำแหน่งงาน</h2>
          <select
            value={selectedPosition}
            onChange={(e) => {
              console.log('Position changed:', e.target.value);
              setSelectedPosition(e.target.value);
              setMessage('');
              setNewDetail({ topic: '', maxScore: '' });
              setNewSubDetail({ 
                detailId: '', 
                subdetailTopic: '',
                score1Desc: '',
                score2Desc: '',
                score3Desc: '',
                score4Desc: '',
                score5Desc: ''
              });
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
          >
            <option value="">-- เลือกตำแหน่งงาน --</option>
            {positions.map((pos) => (
              <option key={pos.position_id} value={pos.position_id}>
                {pos.position_name}
              </option>
            ))}
          </select>
          
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ฟอร์มเพิ่ม Detail */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">เพิ่มหัวข้อประเมิน</h2>
              {selectedPosition && (
                <div className="text-sm">
                  <span className="text-gray-600">คะแนนรวม: </span>
                  <span className={`font-semibold ${
                    details.reduce((sum, d) => sum + (d.max_score || 0), 0) >= 90 
                      ? 'text-red-600' 
                      : 'text-green-600'
                  }`}>
                    {details.reduce((sum, d) => sum + (d.max_score || 0), 0)}/90
                  </span>
                </div>
              )}
            </div>
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
                  disabled={!selectedPosition}
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
                  disabled={!selectedPosition}
                />
              </div>
              {!selectedPosition && (
                <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
                  <p className="text-sm text-yellow-700">
                    กรุณาเลือกตำแหน่งก่อนเพิ่มหัวข้อประเมิน
                  </p>
                </div>
              )}
              <button
                type="submit"
                disabled={loading || !selectedPosition}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'กำลังเพิ่ม...' : 'เพิ่มหัวข้อประเมิน'}
              </button>
            </form>
          </div>

          {/* ฟอร์มเพิ่ม SubDetail */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">เพิ่มหัวข้อย่อย</h2>
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
                  หัวข้อย่อย
                </label>
                <input
                  value={newSubDetail.subdetailTopic}
                  onChange={(e) => setNewSubDetail({ ...newSubDetail, subdetailTopic: e.target.value })}
                  placeholder="หัวข้อของเกณฑ์การประเมิน"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* ช่องกรอกหัวข้อการให้คะแนน 5 ระดับ */}
              <div className="mb-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h3 className="text-md font-semibold text-gray-700 mb-3">
                  กำหนดเกณฑ์การให้คะแนน (1-5 คะแนน)
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  กรอกรายละเอียดของแต่ละระดับคะแนน เพื่อใช้เป็นเกณฑ์ในการประเมิน
                </p>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ระดับ 1 - ไม่ผ่านเกณฑ์
                    </label>
                    <textarea
                      type="text"
                      value={newSubDetail.score1Desc}
                      onChange={(e) => setNewSubDetail({ ...newSubDetail, score1Desc: e.target.value })}
                      placeholder="เช่น ไม่สามารถปฏิบัติงานได้"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ระดับ 2 - ต่ำกว่าเกณฑ์
                    </label>
                    <textarea
                      type="text"
                      value={newSubDetail.score2Desc}
                      onChange={(e) => setNewSubDetail({ ...newSubDetail, score2Desc: e.target.value })}
                      placeholder="เช่น ปฏิบัติงานได้บางส่วน ต้องปรับปรุง"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ระดับ 3 - ตามเกณฑ์
                    </label>
                    <textarea
                      type="text"
                      value={newSubDetail.score3Desc}
                      onChange={(e) => setNewSubDetail({ ...newSubDetail, score3Desc: e.target.value })}
                      placeholder="เช่น ปฏิบัติงานได้ตามมาตรฐาน"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ระดับ 4 - ดีกว่าเกณฑ์
                    </label>
                    <textarea
                      type="text"
                      value={newSubDetail.score4Desc}
                      onChange={(e) => setNewSubDetail({ ...newSubDetail, score4Desc: e.target.value })}
                      placeholder="เช่น ปฏิบัติงานได้ดีกว่ามาตรฐาน"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ระดับ 5 - เยี่ยม
                    </label>
                    <textarea
                      type="text"
                      value={newSubDetail.score5Desc}
                      onChange={(e) => setNewSubDetail({ ...newSubDetail, score5Desc: e.target.value })}
                      placeholder="เช่น ปฏิบัติงานได้เป็นเลิศ เกินความคาดหวัง"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>
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
          
          {!selectedPosition ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">กรุณาเลือกตำแหน่งเพื่อดูเกณฑ์การประเมิน</p>
            </div>
          ) : loading ? (
            <div className="text-center py-4">กำลังโหลด...</div>
          ) : details.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>ยังไม่มีเกณฑ์การประเมินสำหรับตำแหน่งนี้</p>
              <p className="text-sm mt-2">เริ่มต้นโดยเพิ่มหัวข้อประเมินใหม่</p>
            </div>
          ) : (
            <>
              {/* แสดงผลรวมคะแนน */}
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-900">
                    คะแนนรวมทั้งหมด
                  </span>
                  <span className={`text-lg font-bold ${
                    details.reduce((sum, d) => sum + (d.max_score || 0), 0) > 90 
                      ? 'text-red-600' 
                      : details.reduce((sum, d) => sum + (d.max_score || 0), 0) === 90
                      ? 'text-green-600'
                      : 'text-blue-600'
                  }`}>
                    {details.reduce((sum, d) => sum + (d.max_score || 0), 0)} / 90 คะแนน
                  </span>
                </div>
                {details.reduce((sum, d) => sum + (d.max_score || 0), 0) > 90 && (
                  <p className="text-xs text-red-600 mt-1">
                    ⚠️ คะแนนเกิน 90 กรุณาปรับคะแนนให้ถูกต้อง
                  </p>
                )}
                {details.reduce((sum, d) => sum + (d.max_score || 0), 0) < 90 && (
                  <p className="text-xs text-gray-600 mt-1">
                    เหลืออีก {90 - details.reduce((sum, d) => sum + (d.max_score || 0), 0)} คะแนน
                  </p>
                )}
              </div>

              <div className="space-y-4">
              {details.map((detail) => (
                <div key={detail.detail_id} className="border border-gray-200 rounded-lg p-4">
                  {/* Header ของ Detail */}
                  <div className="flex justify-between items-start mb-3">
                    {editingDetail === detail.detail_id ? (
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="text"
                          defaultValue={detail.topic}
                          id={`edit-topic-${detail.detail_id}`}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="number"
                          defaultValue={detail.max_score}
                          id={`edit-maxscore-${detail.detail_id}`}
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="1"
                        />
                        <button
                          onClick={() => {
                            const topic = document.getElementById(`edit-topic-${detail.detail_id}`).value;
                            const maxScore = document.getElementById(`edit-maxscore-${detail.detail_id}`).value;
                            handleUpdateDetail(detail.detail_id, topic, maxScore);
                          }}
                          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                        >
                          บันทึก
                        </button>
                        <button
                          onClick={() => setEditingDetail(null)}
                          className="px-3 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 text-sm"
                        >
                          ยกเลิก
                        </button>
                      </div>
                    ) : (
                      <>
                        <div>
                          <h3 className="font-semibold text-lg">{detail.topic}</h3>
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm inline-block mt-1">
                            คะแนนเต็ม: {detail.max_score || 5}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingDetail(detail.detail_id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="แก้ไข"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteDetail(detail.detail_id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="ลบ"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* SubDetails */}
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
                        <div key={sub.subdetail_id} className="bg-gray-50 p-3 rounded border border-gray-200">
                          {editingSubDetail === sub.subdetail_id ? (
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  รายละเอียดย่อย
                                </label>
                                <textarea
                                  defaultValue={sub.subdetail_topic}
                                  id={`edit-subtopic-${sub.subdetail_id}`}
                                  rows={2}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                              </div>

                              <div className="border-t pt-3">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">เกณฑ์การให้คะแนน</h4>
                                <div className="space-y-2">
                                  <div>
                                    <label className="block text-xs font-medium text-red-600 mb-1">ระดับ 1</label>
                                    <textarea
                                      type="text"
                                      defaultValue={sub.score_1_desc}
                                      id={`edit-score1-${sub.subdetail_id}`}
                                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                                      placeholder="เกณฑ์สำหรับระดับ 1"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-orange-600 mb-1">ระดับ 2</label>
                                    <textarea
                                      type="text"
                                      defaultValue={sub.score_2_desc}
                                      id={`edit-score2-${sub.subdetail_id}`}
                                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                                      placeholder="เกณฑ์สำหรับระดับ 2"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-yellow-600 mb-1">ระดับ 3</label>
                                    <textarea
                                      type="text"
                                      defaultValue={sub.score_3_desc}
                                      id={`edit-score3-${sub.subdetail_id}`}
                                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                                      placeholder="เกณฑ์สำหรับระดับ 3"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-green-600 mb-1">ระดับ 4</label>
                                    <textarea
                                      type="text"
                                      defaultValue={sub.score_4_desc}
                                      id={`edit-score4-${sub.subdetail_id}`}
                                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                                      placeholder="เกณฑ์สำหรับระดับ 4"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-blue-600 mb-1">ระดับ 5</label>
                                    <textarea
                                      type="text"
                                      defaultValue={sub.score_5_desc}
                                      id={`edit-score5-${sub.subdetail_id}`}
                                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                                      placeholder="เกณฑ์สำหรับระดับ 5"
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="flex gap-2 pt-2">
                                <button
                                  onClick={() => {
                                    const topic = document.getElementById(`edit-subtopic-${sub.subdetail_id}`).value;
                                    const score1 = document.getElementById(`edit-score1-${sub.subdetail_id}`).value;
                                    const score2 = document.getElementById(`edit-score2-${sub.subdetail_id}`).value;
                                    const score3 = document.getElementById(`edit-score3-${sub.subdetail_id}`).value;
                                    const score4 = document.getElementById(`edit-score4-${sub.subdetail_id}`).value;
                                    const score5 = document.getElementById(`edit-score5-${sub.subdetail_id}`).value;
                                    handleUpdateSubDetail(sub.subdetail_id, detail.detail_id, topic, score1, score2, score3, score4, score5);
                                  }}
                                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
                                >
                                  บันทึก
                                </button>
                                <button
                                  onClick={() => setEditingSubDetail(null)}
                                  className="flex-1 bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500 text-sm font-medium"
                                >
                                  ยกเลิก
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium flex-1">
                                  {index + 1}. {sub.subdetail_topic}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                    {detail.max_score ? (detail.max_score / detail.subdetails.length).toFixed(2) : 'N/A'} คะแนน
                                  </span>
                                  <button
                                    onClick={() => setEditingSubDetail(sub.subdetail_id)}
                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                    title="แก้ไข"
                                  >
                                    <PencilIcon className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSubDetail(sub.subdetail_id, detail.detail_id)}
                                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                    title="ลบ"
                                  >
                                    <TrashIcon className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              {/* แสดงเกณฑ์การให้คะแนน */}
                              {(sub.score_1_desc || sub.score_2_desc || sub.score_3_desc || sub.score_4_desc || sub.score_5_desc) && (
                                <div className="mt-2 pl-6 text-xs text-gray-600 space-y-1 border-l-2 border-blue-200">
                                  <div className="font-semibold text-gray-700 mb-1">เกณฑ์การให้คะแนน:</div>
                                  {sub.score_1_desc && (
                                    <div className="flex gap-2">
                                      <span className="font-medium text-red-600">1:</span>
                                      <span>{sub.score_1_desc}</span>
                                    </div>
                                  )}
                                  {sub.score_2_desc && (
                                    <div className="flex gap-2">
                                      <span className="font-medium text-orange-600">2:</span>
                                      <span>{sub.score_2_desc}</span>
                                    </div>
                                  )}
                                  {sub.score_3_desc && (
                                    <div className="flex gap-2">
                                      <span className="font-medium text-yellow-600">3:</span>
                                      <span>{sub.score_3_desc}</span>
                                    </div>
                                  )}
                                  {sub.score_4_desc && (
                                    <div className="flex gap-2">
                                      <span className="font-medium text-green-600">4:</span>
                                      <span>{sub.score_4_desc}</span>
                                    </div>
                                  )}
                                  {sub.score_5_desc && (
                                    <div className="flex gap-2">
                                      <span className="font-medium text-blue-600">5:</span>
                                      <span>{sub.score_5_desc}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageEvaluationCriteria;