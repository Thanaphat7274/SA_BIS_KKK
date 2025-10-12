import React, { useState, useEffect } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, 
  LineChart, Line, CartesianGrid, ResponsiveContainer, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar 
} from "recharts";
import { 
  ChartBarIcon, UserGroupIcon, CheckCircleIcon, ClockIcon,
  TrophyIcon, ExclamationTriangleIcon, DocumentChartBarIcon
} from '@heroicons/react/24/outline';

const HR_Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [dashboardRes, evaluationsRes, employeesRes] = await Promise.all([
        fetch('http://localhost:8080/api/dashboard/hr'),
        fetch('http://localhost:8080/api/evaluations'),
        fetch('http://localhost:8080/api/employees')
      ]);

      if (dashboardRes.ok) {
        const data = await dashboardRes.json();
        setDashboardData(data);
      }

      if (evaluationsRes.ok) {
        const data = await evaluationsRes.json();
        setEvaluations(data || []);
      }

      if (employeesRes.ok) {
        const data = await employeesRes.json();
        setEmployees(data || []);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">ไม่พบข้อมูล Dashboard</p>
        </div>
      </div>
    );
  }

  // คำนวณข้อมูลเพิ่มเติม
  const avgScore = dashboardData.avgScore || 0;
  
  // กรองพนักงานที่ไม่ใช่ HR และ Supervisor
  const regularEmployees = employees.filter(emp => {
    const role = (emp.role || '').toLowerCase();
    return role !== 'hr' && role !== 'supervisor';
  });
  
  // นับจำนวนพนักงานปกติที่ประเมินแล้ว
  const evaluatedRegularEmpIds = evaluations.map(e => e.emp_id);
  const evaluatedRegularCount = regularEmployees.filter(emp => 
    evaluatedRegularEmpIds.includes(emp.emp_id)
  ).length;
  
  // นับจำนวนพนักงานปกติทั้งหมด
  const totalRegularEmployees = regularEmployees.length;
  const notEvaluatedRegularCount = totalRegularEmployees - evaluatedRegularCount;
  
  const totalEmployees = dashboardData.evaluatedCount + dashboardData.notEvaluatedCount;
  const evaluationRate = totalRegularEmployees > 0 ? (evaluatedRegularCount / totalRegularEmployees) * 100 : 0;
  
  // คำนวณคะแนนเฉลี่ยตามตำแหน่ง (position)
  const positionScores = {};
  evaluations.forEach(evaluation => {
    const posName = evaluation.position_name || 'ไม่ระบุ';
    if (!positionScores[posName]) {
      positionScores[posName] = { total: 0, count: 0 };
    }
    positionScores[posName].total += evaluation.total_score || 0;
    positionScores[posName].count += 1;
  });

  // หาตำแหน่งที่ดีที่สุดและควรพัฒนา
  let bestPosition = { position: "N/A", score: 0 };
  let worstPosition = { position: "N/A", score: 999 };
  
  Object.keys(positionScores).forEach(posName => {
    const avgScore = positionScores[posName].total / positionScores[posName].count;
    if (avgScore > bestPosition.score) {
      bestPosition = { position: posName, score: avgScore };
    }
    if (avgScore < worstPosition.score && avgScore > 0) {
      worstPosition = { position: posName, score: avgScore };
    }
  });

  // เตรียมข้อมูลสำหรับกราฟแท่ง (ตามตำแหน่ง)
  const positionBarData = Object.keys(positionScores).map(posName => ({
    position: posName,
    score: (positionScores[posName].total / positionScores[posName].count).toFixed(2)
  }));

  const donutData = [
    { name: "ประเมินแล้ว", value: evaluatedRegularCount },
    { name: "ยังไม่ประเมิน", value: notEvaluatedRegularCount },
  ];

  // นับจำนวน position ที่ไม่ซ้ำกันจากพนักงานทั้งหมด
  const uniquePositions = [...new Set(
    employees
      .filter(emp => emp.position_name && emp.position_name !== '-')
      .map(emp => emp.position_name)
  )];
  const totalPositions = uniquePositions.length;

  const COLORS = ["#10B981", "#F59E0B"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <ChartBarIcon className="w-10 h-10 text-blue-600" />
                Dashboard ภาพรวมองค์กร
              </h1>
              <p className="mt-1 text-gray-600">ข้อมูลและสถิติการประเมินผลงานพนักงาน</p>
            </div>
            <DocumentChartBarIcon className="w-16 h-16 text-blue-600 opacity-20" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Summary Cards - แถวที่ 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* จำนวนพนักงานทั้งหมด */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-lg text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">พนักงานทั้งหมด</p>
                <p className="text-4xl font-bold mt-2">{totalRegularEmployees}</p>
                <p className="text-blue-100 text-xs mt-1">คน (ไม่รวม HR/Supervisor)</p>
              </div>
              <UserGroupIcon className="w-16 h-16 text-blue-300 opacity-50" />
            </div>
          </div>

          {/* ประเมินแล้ว */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl shadow-lg text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">ประเมินแล้ว</p>
                <p className="text-4xl font-bold mt-2">{evaluatedRegularCount}</p>
                <p className="text-green-100 text-xs mt-1">{evaluationRate.toFixed(1)}% ของทั้งหมด</p>
              </div>
              <CheckCircleIcon className="w-16 h-16 text-green-300 opacity-50" />
            </div>
          </div>

          {/* ยังไม่ประเมิน */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl shadow-lg text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">ยังไม่ประเมิน</p>
                <p className="text-4xl font-bold mt-2">{notEvaluatedRegularCount}</p>
                <p className="text-orange-100 text-xs mt-1">{(100 - evaluationRate).toFixed(1)}% ของทั้งหมด</p>
              </div>
              <ClockIcon className="w-16 h-16 text-orange-300 opacity-50" />
            </div>
          </div>

          {/* คะแนนเฉลี่ย */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl shadow-lg text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">คะแนนเฉลี่ยองค์กร</p>
                <p className="text-4xl font-bold mt-2">{avgScore.toFixed(2)}</p>
                <p className="text-purple-100 text-xs mt-1">จาก 100 คะแนน</p>
              </div>
              <TrophyIcon className="w-16 h-16 text-purple-300 opacity-50" />
            </div>
          </div>
        </div>

        {/* ตำแหน่งที่ดีที่สุดและควรพัฒนา */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ตำแหน่งคะแนนสูงสุด */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-green-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-100 p-3 rounded-xl">
                <TrophyIcon className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">🏆 แผนกที่ดีที่สุด</h3>
                <p className="text-sm text-gray-500">คะแนนเฉลี่ยสูงสุด</p>
              </div>
            </div>
            <div className="text-center py-4">
              <p className="text-2xl font-bold text-green-600">{bestPosition.position}</p>
              <p className="text-4xl font-bold text-gray-800 mt-2">{bestPosition.score.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-1">คะแนน</p>
            </div>
          </div>

          {/* ตำแหน่งควรพัฒนา */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-orange-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-orange-100 p-3 rounded-xl">
                <ExclamationTriangleIcon className="w-8 h-8 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">📊 แผนกควรพัฒนา</h3>
                <p className="text-sm text-gray-500">คะแนนเฉลี่ยต่ำสุด</p>
              </div>
            </div>
            <div className="text-center py-4">
              <p className="text-2xl font-bold text-orange-600">{worstPosition.position}</p>
              <p className="text-4xl font-bold text-gray-800 mt-2">{worstPosition.score.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-1">คะแนน</p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bar Chart - คะแนนตามตำแหน่ง */}
          {positionBarData.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <ChartBarIcon className="w-6 h-6 text-blue-600" />
                คะแนนเฉลี่ยแยกตามแผนก
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={positionBarData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="position" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#4F46E5" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Donut Chart - สถานะการประเมิน */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
              สถานะการประเมิน
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={60}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* สรุปสถิติเพิ่มเติม */}
          <div className="bg-white p-6 rounded-2xl shadow-lg lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              สถิติโดยรวม
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl">
                <span className="text-gray-700 font-medium">อัตราการประเมิน</span>
                <span className="text-2xl font-bold text-blue-600">{evaluationRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl">
                <span className="text-gray-700 font-medium">จำนวนแผนก</span>
                <span className="text-2xl font-bold text-green-600">{totalPositions}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-purple-50 rounded-xl">
                <span className="text-gray-700 font-medium">คะแนนสูงสุด</span>
                <span className="text-2xl font-bold text-purple-600">
                  {evaluations.length > 0 ? Math.max(...evaluations.map(e => e.total_score)).toFixed(1) : '0'}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-orange-50 rounded-xl">
                <span className="text-gray-700 font-medium">คะแนนต่ำสุด</span>
                <span className="text-2xl font-bold text-orange-600">
                  {evaluations.length > 0 ? Math.min(...evaluations.map(e => e.total_score)).toFixed(1) : '0'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
          <p className="text-gray-600">
            ข้อมูลอัพเดทล่าสุด: <span className="font-semibold">{new Date().toLocaleDateString('th-TH', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default HR_Dashboard;