import React, { useState, useEffect } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";
import { UserCircleIcon, ChartBarIcon, TrophyIcon, CalendarIcon, ArrowTrendingUpIcon } from "@heroicons/react/24/outline";

const Employee_Dashboard = ({ userName }) => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(`/api/dashboard/employee/${userName}`);
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userName) {
      fetchDashboardData();
    }
  }, [userName]);

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
  const currentScore = dashboardData.currentScore || 0;
  const avgScore = dashboardData.avgScore || 0;
  const improvement = dashboardData.improvement || "0.00";
  const rank = dashboardData.rank || "N/A";
  const competencyScores = dashboardData.competencyScores || [];
  const recentEvaluations = dashboardData.recentEvaluations || [];

  const getProgressColor = (progress) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-orange-500";
  };

  const getStatusColor = (status) => {
    if (status === "ใกล้เสร็จ") return "bg-green-100 text-green-700";
    if (status === "กำลังดำเนินการ") return "bg-blue-100 text-blue-700";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">📈 Employee Dashboard</h1>
        <p className="text-gray-600">ภาพรวมผลการประเมินของคุณ</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm font-medium">คะแนนปัจจุบัน</h3>
              <p className="text-3xl font-bold text-gray-800 mt-2">{currentScore}</p>
            </div>
            <UserCircleIcon className="h-12 w-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm font-medium">คะแนนเฉลี่ย</h3>
              <p className="text-3xl font-bold text-gray-800 mt-2">{avgScore}</p>
            </div>
            <ChartBarIcon className="h-12 w-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm font-medium">การพัฒนา</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">{improvement}</p>
            </div>
            <ArrowTrendingUpIcon className="h-12 w-12 text-purple-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm font-medium">อันดับในบริษัท</h3>
              <p className="text-3xl font-bold text-gray-800 mt-2">{rank}</p>
            </div>
            <TrophyIcon className="h-12 w-12 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6">
        {/* Competency Radar */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
            <ChartBarIcon className="h-5 w-5 mr-2 text-purple-600" />
            คะแนนตามสมรรถนะ
          </h2>
          <div className="flex justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={competencyScores}>
                <PolarGrid />
                <PolarAngleAxis dataKey="competency" />
                <PolarRadiusAxis domain={[0, 5]} />
                <Radar name="คะแนน" dataKey="score" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      

      {/* Recent Evaluations Table */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2 text-green-600" />
          ประวัติการประเมินล่าสุด
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="text-left p-3 font-semibold text-gray-700 w-28">วันที่</th>
                <th className="text-left p-3 font-semibold text-gray-700 w-32">ผู้ประเมิน</th>
                <th className="text-center p-3 font-semibold text-gray-700 w-20">คะแนน</th>
                <th className="text-left p-3 font-semibold text-gray-700">ความคิดเห็นของผู้ประเมิน</th>
                <th className="text-left p-3 font-semibold text-gray-700">ความคิดเห็นของผู้ถูกประเมิน</th>
              </tr>
            </thead>
            <tbody>
              {recentEvaluations.map((evaluation, index) => (
                <tr key={index} className="border-b hover:bg-gray-50 transition">
                  <td className="p-3 text-gray-600">{evaluation.date}</td>
                  <td className="p-3 font-medium text-gray-800">{evaluation.evaluator}</td>
                  <td className="p-3 text-center">
                    <span className={`font-bold ${evaluation.score >= 4.0 ? 'text-green-600' : 'text-orange-600'}`}>
                      {evaluation.score.toFixed(1)}
                    </span>
                  </td>
                  <td className="p-3 text-gray-600">
                    <div className="max-w-xs">
                      <p className="text-sm">{evaluation.evaluatorComment}</p>
                    </div>
                  </td>
                  <td className="p-3 text-gray-600">
                    <div className="max-w-xs">
                      <p className="text-sm italic text-blue-700">{evaluation.employeeComment}</p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Motivational Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
        <h2 className="text-lg font-semibold mb-2 flex items-center">
          <TrophyIcon className="h-6 w-6 mr-2" />
          ข้อความกำลังใจ
        </h2>
        <p className="text-blue-50 text-lg">
          คุณกำลังทำได้ดีมาก! คะแนนของคุณเพิ่มขึ้นอย่างต่อเนื่อง ขอให้รักษาผลงานที่ดีไว้และพัฒนาต่อไป 🚀
        </p>
      </div>
    </div>
  );
};

export default Employee_Dashboard;
