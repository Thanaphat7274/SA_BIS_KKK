import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";

const HR_Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard/hr');
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        }
      } catch (error) {
        console.error("Error fetching HR dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">ไม่พบข้อมูล</p>
      </div>
    );
  }

  // ใช้ข้อมูลจาก API
  const avgScore = dashboardData.avgScore || 0;
  const bestDept = { department: dashboardData.bestDept || "N/A", score: dashboardData.bestScore || 0 };
  const worstDept = { department: dashboardData.worstDept || "N/A", score: dashboardData.worstScore || 0 };
  const barData = dashboardData.departmentScores || [];

  const donutData = [
    { name: "ประเมินเสร็จแล้ว", value: dashboardData.evaluatedCount || 0 },
    { name: "ยังไม่ประเมิน", value: dashboardData.notEvaluatedCount || 0 },
  ];

  const COLORS = ["#4F46E5", "#E0E7FF"];

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">📊 Employee Performance Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl shadow-md text-center">
          <h3 className="text-gray-500 text-sm">คะแนนเฉลี่ย</h3>
          <p className="text-3xl font-bold text-indigo-600">{avgScore.toFixed(1)}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-md text-center">
          <h3 className="text-gray-500 text-sm">คะแนนสูงสุด</h3>
          <p className="text-lg font-semibold text-green-600">{bestDept.department}</p>
          <p className="text-xl">{bestDept.score}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-md text-center">
          <h3 className="text-gray-500 text-sm">คะแนนต่ำสุด</h3>
          <p className="text-lg font-semibold text-red-600">{worstDept.department}</p>
          <p className="text-xl">{worstDept.score}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Bar Chart */}
        {barData.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h2 className="text-lg font-semibold mb-4 text-gray-700 flex justify-center">
              คะแนนเฉลี่ยตามแผนก
            </h2>
            <div className="flex justify-center">
              <BarChart width={400} height={300} data={barData}>
                <XAxis dataKey="department" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Bar dataKey="score" fill="#4F46E5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </div>
          </div>
        )}

        {/* Donut Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-md ">
          <h2 className="text-lg font-semibold mb-4 text-gray-700 flex justify-center">
            สถานะการประเมิน
          </h2>
          <div className="flex justify-center">
            <PieChart width={400} height={300}>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={60}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label
              >
                {donutData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HR_Dashboard;