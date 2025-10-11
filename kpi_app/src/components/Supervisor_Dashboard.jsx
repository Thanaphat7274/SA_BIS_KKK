import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts";
import { UsersIcon, ClipboardDocumentCheckIcon, ChartBarIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const Supervisor_Dashboard = () => {
  // ข้อมูลสมาชิกในทีม
  const teamMembers = [
    { id: 1, name: "สมชาย ใจดี", position: "Developer", lastScore: 4.5, status: "ประเมินแล้ว", trend: "up" },
    { id: 2, name: "สมหญิง รักงาน", position: "Designer", lastScore: 4.2, status: "ประเมินแล้ว", trend: "stable" },
    { id: 3, name: "วิชัย มานะ", position: "Tester", lastScore: 3.8, status: "รอการประเมิน", trend: "down" },
    { id: 4, name: "นภา สวยงาม", position: "Developer", lastScore: 4.7, status: "ประเมินแล้ว", trend: "up" },
    { id: 5, name: "สมศักดิ์ ขยัน", position: "Analyst", lastScore: 4.0, status: "รอการประเมิน", trend: "stable" },
    { id: 6, name: "พิมพ์ใจ ซื่อสัตย์", position: "Developer", lastScore: 4.3, status: "ประเมินแล้ว", trend: "up" },
  ];

  // ข้อมูลคะแนนตามตำแหน่ง
  const scoresByPosition = [
    { position: "Developer", avgScore: 4.5, count: 3 },
    { position: "Designer", avgScore: 4.2, count: 1 },
    { position: "Tester", avgScore: 3.8, count: 1 },
    { position: "Analyst", avgScore: 4.0, count: 1 },
  ];

  // สถานะการประเมิน
  const evaluationStatus = [
    { name: "ประเมินแล้ว", value: 4 },
    { name: "รอการประเมิน", value: 2 },
  ];

  const COLORS = ["#10B981", "#F59E0B"];

  // คำนวณสถิติ
  const totalMembers = teamMembers.length;
  const evaluated = teamMembers.filter(m => m.status === "ประเมินแล้ว").length;
  const pending = totalMembers - evaluated;
  const avgTeamScore = (teamMembers.reduce((sum, m) => sum + m.lastScore, 0) / totalMembers).toFixed(2);
  const highestScorer = teamMembers.reduce((a, b) => (a.lastScore > b.lastScore ? a : b));
  const needsAttention = teamMembers.filter(m => m.lastScore < 4.0 || m.trend === "down");

  const getTrendIcon = (trend) => {
    if (trend === "up") return "↑";
    if (trend === "down") return "↓";
    return "→";
  };

  const getTrendColor = (trend) => {
    if (trend === "up") return "text-green-600";
    if (trend === "down") return "text-red-600";
    return "text-gray-600";
  };

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">📊 Supervisor Dashboard</h1>
        <p className="text-gray-600">ภาพรวมประสิทธิภาพของเราทีม</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm font-medium">สมาชิกในทีม</h3>
              <p className="text-3xl font-bold text-gray-800 mt-2">{totalMembers}</p>
            </div>
            <UsersIcon className="h-12 w-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm font-medium">ประเมินแล้ว</h3>
              <p className="text-3xl font-bold text-gray-800 mt-2">{evaluated}</p>
            </div>
            <ClipboardDocumentCheckIcon className="h-12 w-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm font-medium">รอการประเมิน</h3>
              <p className="text-3xl font-bold text-gray-800 mt-2">{pending}</p>
            </div>
            <ExclamationTriangleIcon className="h-12 w-12 text-orange-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm font-medium">คะแนนเฉลี่ยทีม</h3>
              <p className="text-3xl font-bold text-gray-800 mt-2">{avgTeamScore}</p>
            </div>
            <ChartBarIcon className="h-12 w-12 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6">
        {/* Evaluation Status Pie */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            สถานะการประเมิน
          </h2>
          <div className="flex justify-center">
            <PieChart width={300} height={250}>
              <Pie
                data={evaluationStatus}
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={50}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label={(entry) => `${entry.value} คน`}
              >
                {evaluationStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>
        </div>
      </div>

      {/* Scores by Position Bar Chart */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          คะแนนเฉลี่ยตามตำแหน่ง
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={scoresByPosition}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="position" />
            <YAxis domain={[0, 5]} />
            <Tooltip />
            <Bar dataKey="avgScore" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Team Members Table */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          รายชื่อสมาชิกในทีม
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="text-left p-3 font-semibold text-gray-700">ชื่อ</th>
                <th className="text-left p-3 font-semibold text-gray-700">ตำแหน่ง</th>
                <th className="text-center p-3 font-semibold text-gray-700">คะแนนล่าสุด</th>
                <th className="text-center p-3 font-semibold text-gray-700">สถานะ</th>
                <th className="text-center p-3 font-semibold text-gray-700">การกระทำ</th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.map((member) => (
                <tr key={member.id} className="border-b hover:bg-gray-50 transition">
                  <td className="p-3 font-medium text-gray-800">{member.name}</td>
                  <td className="p-3 text-gray-600">{member.position}</td>
                  <td className="p-3 text-center">
                    <span className={`font-bold ${member.lastScore >= 4.0 ? 'text-green-600' : 'text-orange-600'}`}>
                      {member.lastScore.toFixed(1)}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      member.status === "ประเมินแล้ว" 
                        ? "bg-green-100 text-green-700" 
                        : "bg-orange-100 text-orange-700"
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-lg text-xs transition">
                      ดูรายละเอียด
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Needs Attention Section */}
      {needsAttention.length > 0 && (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-3 text-orange-800 flex items-center">
            <ExclamationTriangleIcon className="h-6 w-6 mr-2" />
            สมาชิกที่ต้องให้ความสนใจ
          </h2>
          <div className="space-y-2">
            {needsAttention.map((member) => (
              <div key={member.id} className="bg-white p-3 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">{member.name}</p>
                  <p className="text-sm text-gray-600">{member.position}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">คะแนน: <span className="font-bold text-orange-600">{member.lastScore}</span></p>
                  <p className={`text-xs ${getTrendColor(member.trend)}`}>
                    แนวโน้ม: {member.trend === "down" ? "ลดลง" : member.trend === "up" ? "เพิ่มขึ้น" : "คงที่"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Performer Highlight */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-xl shadow-lg">
        <h2 className="text-lg font-semibold mb-2">🏆 พนักงานยอดเยี่ยม</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">{highestScorer.name}</p>
            <p className="text-green-100">{highestScorer.position}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-green-100">คะแนนสูงสุด</p>
            <p className="text-4xl font-bold">{highestScorer.lastScore}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Supervisor_Dashboard;
