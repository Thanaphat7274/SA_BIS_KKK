import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";

const HR_Dashboard = () => {
  // ตัวอย่างข้อมูล
  const barData = [
    { department: "HR", score: 82 },
    { department: "Sales", score: 75 },
    { department: "IT", score: 90 },
    { department: "Finance", score: 85 },
  ];

  const donutData = [
    { name: "ประเมินเสร็จแล้ว", value: 70 },
    { name: "ยังไม่ประเมิน", value: 30 },
  ];

  const COLORS = ["#4F46E5", "#E0E7FF"];

  // คำนวณสรุป
  const avgScore =
    barData.reduce((sum, d) => sum + d.score, 0) / barData.length;
  const bestDept = barData.reduce((a, b) => (a.score > b.score ? a : b));
  const worstDept = barData.reduce((a, b) => (a.score < b.score ? a : b));

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
      <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
        {/* Bar Chart */}
        

        {/* Donut Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-md ">
          <h2 className="text-lg font-semibold mb-4 text-gray-700 flex justify-center">
            สถานะการประเมิน
          </h2>
          <div className="flex justify-center click">
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