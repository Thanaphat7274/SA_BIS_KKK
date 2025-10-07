import React, { useState } from 'react';
import { useNavigate,useLocation } from 'react-router-dom';
import Form_3 from '../components/Form_3';
import Form_2 from '../components/Form_2';
import Summary from '../components/Summary';
const Evaluation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const employee = {'name': 'นายทนงชัย '};
    const position = { title: 'พนักงาน' };
    
  // ถ้าไม่มีข้อมูล ให้กลับไปหน้าเลือกพนักงาน
    // React.useEffect(() => {
    //     if (!employee || !position) {
    //         navigate('/');
    //     }
    // }, [employee, position, navigate]);

    // if (!employee || !position) {
    //     return null; // กำลัง redirect
    // }


  // ข้อมูลวัตถุประสงค์การประเมิน
    const [purposes, setPurposes] = useState({
    annual: false,
    promotion: false,
    transfer: false
  });

  // ข้อมูลสถิติการลา
  const [absenceStats, setAbsenceStats] = useState({
    sick: 0,
    late: 0,
    personal: 0
  });

  // สถานะการโหลดข้อมูล
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // เก็บสรุปจากฟอร์มย่อย
  const [kpiSummary, setKpiSummary] = useState({ evaluatedCount: 0, total: 0, average: '0.00' });
  const [behaviorSummary, setBehaviorSummary] = useState({ evaluatedCount: 0, total: 0, average: '0.00' });

  const employeeId = employee ? employee.id : null; // สมมติ employee มี id

  // ดึงข้อมูลการลา/มาสาย
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

//  คำนวณผลรวมการลา
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

      {/* KPI และพฤติกรรม */}
      <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-8 max-w-5xl mx-auto mb-10">
        {/* Form_2 (KPI) */}
        <Form_2 onSummaryChange={(s) => setKpiSummary(s)} />

        {/* Form_3 (Behavior) */}
        <Form_3 onSummaryChange={(s) => setBehaviorSummary(s)} />

        {/* Summary รวม */}
        <Summary
          kpiEvaluatedCount={kpiSummary.evaluatedCount}
          kpiTotal={kpiSummary.total}
          kpiAverage={kpiSummary.average}
          behaviorEvaluatedCount={behaviorSummary.evaluatedCount}
          behaviorTotal={behaviorSummary.total}
          behaviorAverage={behaviorSummary.average}
        />
        {/* Action Buttons */}
        
      </div>

    </div>
  );
};

export default Evaluation;