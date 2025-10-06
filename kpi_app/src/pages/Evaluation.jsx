import React, { useState } from 'react';
import { useNavigate,useLocation } from 'react-router-dom';

const Evaluation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // เพิ่ม state สำหรับเก็บคะแนน
  const [evaluationScores, setEvaluationScores] = useState({});
  // รับค่าที่ส่งมาจากหน้า Selectsepy
//   const { employee, position } = location.state || {};
  // เพิ่ม employee name
  const employee = {'name': 'นายทนงชัย '};
    const position = { title: 'พนักงาน' };

  const scores = [
    { level: "ดีมาก", desc: "ผลการปฏิบัติงานอยู่ในเกณฑ์ดีเยี่ยม สามารถปฏิบัติงานได้เกินกว่าระดับมาตรฐานอยู่เสมอ", score: 5 },
    { level: "ดี", desc: "ผลการปฏิบัติงานอยู่ในเกณฑ์ดี สามารถปฏิบัติงานได้เกินกว่าระดับมาตรฐานเป็นครั้งคราว", score: 4 },
    { level: "ปานกลาง", desc: "ผลการปฏิบัติงานอยู่ในเกณฑ์ปานกลาง สามารถปฏิบัติงานได้ในระดับมาตรฐานที่กำหนด", score: 3 },
    { level: "ต้องปรับปรุง", desc: "ผลการปฏิบัติงานอยู่ในเกณฑ์ต้องปรับปรุง การปฏิบัติงานอยู่ในเกณฑ์ต่ำกว่าระดับมาตรฐาน", score: 2 },
    { level: "ต้องแก้ไขโดยด่วน", desc: "ผลการปฏิบัติงานอยู่ในเกณฑ์ต้องปรับปรุงแก้ไขโดยด่วน การปฏิบัติงานอยู่ในเกณฑ์ต่ำกว่าระดับมาตรฐานมาก", score: 1 },
  ];

  const evaluationCriteria = [
    {
      id: 'quality',
      title: 'คุณภาพและความสำเร็จของงาน',
      description: 'ความสามารถในการทำงานให้สำเร็จตามเป้าหมาย มีคุณภาพสูง สามารถแก้ปัญหาและสื่อสารอย่างชัดเจน'
    },
    {
      id: 'skill',
      title: 'ทักษะและความเชี่ยวชาญ',
      description: 'มีความรู้และความสามารถเฉพาะทางในงานที่รับผิดชอบ สามารถนำความรู้มาประยุกต์ใช้ได้อย่างมีประสิทธิภาพ'
    },
    {
      id: 'teamwork',
      title: 'การทำงานเป็นทีม',
      description: 'สามารถทำงานร่วมกับผู้อื่นได้ดี มีความร่วมมือและช่วยเหลือเพื่อนร่วมงาน'
    },
    {
      id: 'problem_solving',
      title: 'การแก้ปัญหา',
      description: 'สามารถวิเคราะห์และแก้ไขปัญหาต่างๆ ที่เกิดขึ้นในการทำงานได้อย่างมีประสิทธิภาพ'
    },
    {
      id: 'initiative',
      title: 'ความคิดริเริ่ม',
      description: 'มีความคิดสร้างสรรค์ กล้าเสนอความคิดเห็นและแนวทางใหม่ๆ เพื่อปรับปรุงการทำงาน'
    },
    {
      id: 'management',
      title: 'การจัดการงาน',
      description: 'สามารถจัดการเวลา ลำดับความสำคัญของงาน และทรัพยากรได้อย่างมีประสิทธิภาพ'
    },
    {
      id: 'responsibility',
      title: 'ความรับผิดชอบ',
      description: 'มีความรับผิดชอบต่อหน้าที่ ตรงต่อเวลา และสามารถทำงานให้สำเร็จตามที่มอบหมาย'
    }
  ];

  // เพิ่ม function สำหรับจัดการคะแนน
  const handleScoreChange = (criteriaId, score) => {
    setEvaluationScores({
      ...evaluationScores,
      [criteriaId]: score
    });
  };

  // เพิ่ม function คำนวณคะแนนเฉลี่ย
  const calculateAverage = () => {
    const values = Object.values(evaluationScores);
    if (values.length === 0) return '0.00';
    const sum = values.reduce((acc, val) => acc + val, 0);
    return (sum / values.length).toFixed(2);
  };

  // ถ้าไม่มีข้อมูล ให้กลับไปหน้าเลือกพนักงาน
    // React.useEffect(() => {
    //     if (!employee || !position) {
    //         navigate('/');
    //     }
    // }, [employee, position, navigate]);

    // if (!employee || !position) {
    //     return null; // กำลัง redirect
    // }

    const [purposes, setPurposes] = useState({
    annual: false,
    promotion: false,
    transfer: false
  });

  const [absenceStats, setAbsenceStats] = useState({
    sick: 0,
    late: 0,
    personal: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const employeeId = employee ? employee.id : null; // สมมติ employee มี id
  
  React.useEffect(() => {
    const fetchAbsenceData = async () => {
      if (!employeeId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // เรียก API เพื่อดึงข้อมูลการลา/มาสาย
        const response = await fetch(`/api/employees/${employeeId}/absence-stats`);
        
        if (!response.ok) {
          throw new Error('ไม่สามารถดึงข้อมูลได้');
        }

        const data = await response.json();
        
        // ตั้งค่าข้อมูลที่ได้จาก API
        setAbsenceStats({
          sick: data.sickLeave || 0,
          late: data.lateArrival || 0,
          personal: data.personalLeave || 0
        });

        setLoading(false);
      } catch (err) {
        console.error('Error fetching absence data:', err);
        setError('ไม่สามารถโหลดข้อมูลการลาได้');
        setLoading(false);
      }
    };

    fetchAbsenceData();
  }, [employeeId]);

  // การจัดการการเปลี่ยนแปลงของวัตถุประสงค์
  const handlePurposeChange = (key) => {
    setPurposes(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };


  const calculateTotal = () => {
    return absenceStats.sick + absenceStats.late + absenceStats.personal;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 md:p-16">
      {/* หัวเรื่อง */}
      <h1 className="text-3xl font-bold text-center mb-10 text-gray-800">
        แบบฟอร์มการประเมินผลการปฏิบัติงานพนักงาน
      </h1>

      {/* ส่วนข้อมูลพนักงาน */}
      <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6 mb-10 max-w-4xl mx-auto">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">ข้อมูลพนักงาน (Employee Information)</h2>

        <div className="grid grid-cols-2 gap-x-10 gap-y-4 text-gray-800">
          <p><span className="font-semibold">ชื่อพนักงาน:</span> {employee.name}</p>
          <p><span className="font-semibold">นามสกุล:</span> {employee.surname}</p>
          <p><span className="font-semibold">ตำแหน่งงาน:</span> {position.title}</p>
          <p><span className="font-semibold">สังกัด:</span> {employee.department}</p>
          <p><span className="font-semibold">วันที่เริ่มต้น:</span> {employee.startDate}</p>
          <p><span className="font-semibold">เงินเดือน:</span> {employee.salary}</p>
          <p className="col-span-2"><span className="font-semibold">ระยะเวลาการประเมิน:</span> มกราคม 2566 - มีนาคม 2566</p>
        </div>
      </div>

      {/* วัตถุประสงค์ */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto mb-10">
      {/* Card 1: วัตถุประสงค์ของการประเมิน */}
      <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6 h-full">
        <h2 className="text-lg font-semibold mb-4 text-gray-700 text-center">
          วัตถุประสงค์ของการประเมิน
        </h2>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
            <input
              type="checkbox"
              checked={purposes.annual}
              onChange={() => handlePurposeChange('annual')}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-gray-800">ประเมินผลประจำปี (Annual Appraisal)</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
            <input
              type="checkbox"
              checked={purposes.promotion}
              onChange={() => handlePurposeChange('promotion')}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-gray-800">พิจารณาเลื่อนตำแหน่ง (Promotion)</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
            <input
              type="checkbox"
              checked={purposes.transfer}
              onChange={() => handlePurposeChange('transfer')}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-gray-800">พิจารณาโอน/ย้ายตำแหน่ง (Transfer/Rotation)</span>
          </label>
        </div>
      </div>

      {/* Card 2: สถิติการขาดงาน */}
      <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6 h-full">
        <h2 className="text-lg font-semibold mb-4 text-gray-700 text-center">
          สถิติการลาในช่วงประเมิน
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-gray-800 flex-1">มาสาย</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={absenceStats.late}
                readOnly
                className="w-24 px-3 py-2 border border-gray-300 rounded bg-gray-50 text-center cursor-not-allowed"
                placeholder="0"
              />
              <span className="text-gray-600">วัน</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-gray-800 flex-1">ลาป่วย</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={absenceStats.sick}
                readOnly
                className="w-24 px-3 py-2 border border-gray-300 rounded bg-gray-50 text-center cursor-not-allowed"
                placeholder="0"
              />
              <span className="text-gray-600">วัน</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-gray-800 flex-1">ลากิจ</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={absenceStats.personal}
                readOnly
                className="w-24 px-3 py-2 border border-gray-300 rounded bg-gray-50 text-center cursor-not-allowed"
                placeholder="0"
              />
              <span className="text-gray-600">วัน</span>
            </div>
          </div>

          <div className="border-t border-gray-300 pt-3 mt-4">
            <div className="flex items-center justify-between font-semibold text-gray-800">
              <span>รวม</span>
              <div className="flex items-center gap-2">
                <span className="text-xl text-blue-600">{calculateTotal()}</span>
                <span className="text-gray-600">วัน</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* ส่วนที่ 2 KPI */}
      <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-8 max-w-5xl mx-auto mb-10">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
          ส่วนที่ 2 คะแนนผลงานตามตัวชี้วัด (Performance Goal / KPI)
        </h2>

        <div className="text-gray-700 text-sm mb-4 leading-relaxed">
          <p>1. ประเมินความสามารถในการปฏิบัติงาน (KPI) โดยให้คะแนน 1 - 5 ตามระดับความสามารถของพนักงานดังคำอธิบายข้างล่าง</p>
          <p>2. ให้ประเมินความสามารถของพนักงานเฉพาะช่วงระยะเวลาที่กำหนดไว้ข้างต้น</p>
          <p>3. ให้พิจารณาทีละหัวข้อโดยไม่นำหัวข้ออื่นมาเกี่ยวโยงกัน</p>
        </div>

        {/* ตารางคะแนน */}
        <div className="overflow-x-auto mb-8">
          <table className="w-full border-collapse text-center text-sm">
            <thead className="bg-gray-200 font-semibold">
              <tr>
                <th className="border border-gray-400 px-3 py-2 w-1/6">ระดับคะแนน</th>
                <th className="border border-gray-400 px-3 py-2">คำอธิบาย</th>
                <th className="border border-gray-400 px-3 py-2 w-1/12">คะแนน</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-400 px-2 py-2">{row.level}</td>
                  <td className="border border-gray-400 text-left px-3 py-2">{row.desc}</td>
                  <td className="border border-gray-400 px-2 py-2 font-semibold">{row.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Evaluation Criteria */}
        <div className="space-y-6 mt-8">
          {evaluationCriteria.map((criteria, index) => (
            <div key={criteria.id} className="border-b border-gray-200 pb-6">
              <h3 className="font-semibold text-gray-800 mb-2">
                {index + 1}. {criteria.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                {criteria.description}
              </p>

              {/* Rating Scale */}
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-sm text-gray-600 font-medium">คะแนน:</span>
                <div className="flex items-center gap-3">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      onClick={() => handleScoreChange(criteria.id, score)}
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-semibold transition-all
                        ${evaluationScores[criteria.id] === score 
                          ? 'bg-blue-500 border-blue-500 text-white scale-110' 
                          : 'border-gray-300 text-gray-600 hover:border-blue-400 hover:bg-blue-50'
                        }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
                <span className="text-sm text-gray-500 ml-2">
                  {evaluationScores[criteria.id] ? `เลือกแล้ว: ${evaluationScores[criteria.id]}` : 'ยังไม่เลือก'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">สรุปผลการประเมิน</h3>
              <p className="text-sm text-gray-600">
                ประเมินแล้ว: {Object.keys(evaluationScores).length}/{evaluationCriteria.length} หัวข้อ
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">คะแนนเฉลี่ย</p>
              <p className="text-4xl font-bold text-blue-600">{calculateAverage()}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-4">
          <button 
            className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            disabled={Object.keys(evaluationScores).length !== evaluationCriteria.length}
          >
            บันทึกการประเมิน
          </button>
          <button 
            onClick={() => navigate(-1)}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            ยกเลิก
          </button>
        </div>

        {Object.keys(evaluationScores).length !== evaluationCriteria.length && (
          <p className="mt-3 text-sm text-red-600 text-center">
            * กรุณาประเมินให้ครบทุกหัวข้อก่อนบันทึก
          </p>
        )}
      </div>
      
    </div>
  );
};

export default Evaluation;