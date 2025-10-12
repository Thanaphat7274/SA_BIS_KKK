import React, { useState, useEffect } from 'react';
import { EyeIcon, DocumentTextIcon, CalendarIcon } from '@heroicons/react/24/outline';
import EvaluationDetailModal from '../components/EvaluationDetailModal';

const Reports = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchEvaluations();
  }, [selectedYear]);

  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      let url = 'http://localhost:8080/api/evaluations';
      if (selectedYear) {
        url += `?year=${selectedYear}`;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setEvaluations(data || []);
      }
    } catch (error) {
      console.error('Error fetching evaluations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (evaluation) => {
    setSelectedEvaluation(evaluation);
    setShowDetailModal(true);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreGrade = (score) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B+';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C+';
    if (score >= 50) return 'C';
    return 'D';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                รายงานผลการประเมิน KPI
              </h1>
              <p className="text-gray-600">
                ดูรายละเอียดและสรุปผลการประเมินของพนักงาน
              </p>
            </div>
            <DocumentTextIcon className="w-10 h-10 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ฟิลเตอร์ */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-4">
            <CalendarIcon className="w-6 h-6 text-gray-400" />
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                กรองตามปี
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- ทั้งหมด --</option>
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return (
                    <option key={year} value={year}>
                      {year + 543}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="text-sm text-gray-600">
              จำนวน: <span className="font-bold text-blue-600">{evaluations.length}</span> รายการ
            </div>
          </div>
        </div>

        {/* สถิติสรุป */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">ทั้งหมด</div>
            <div className="text-3xl font-bold text-gray-800">{evaluations.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">คะแนนเฉลี่ย</div>
            <div className="text-3xl font-bold text-blue-600">
              {evaluations.length > 0
                ? (evaluations.reduce((sum, e) => sum + e.total_score, 0) / evaluations.length).toFixed(2)
                : '0.00'}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">คะแนนสูงสุด</div>
            <div className="text-3xl font-bold text-green-600">
              {evaluations.length > 0
                ? Math.max(...evaluations.map(e => e.total_score)).toFixed(2)
                : '0.00'}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">คะแนนต่ำสุด</div>
            <div className="text-3xl font-bold text-red-600">
              {evaluations.length > 0
                ? Math.min(...evaluations.map(e => e.total_score)).toFixed(2)
                : '0.00'}
            </div>
          </div>
        </div>

        {/* ตารางรายการ */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    พนักงาน
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ตำแหน่ง
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ปี
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    วันที่ประเมิน
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    คะแนนรวม
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    เกรด
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3">กำลังโหลด...</span>
                      </div>
                    </td>
                  </tr>
                ) : evaluations.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                      <DocumentTextIcon className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                      <p>ไม่มีข้อมูลการประเมิน</p>
                    </td>
                  </tr>
                ) : (
                  evaluations.map((evaluation, index) => (
                    <tr key={evaluation.appraisal_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-semibold">
                                {evaluation.first_name.charAt(0)}{evaluation.last_name.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {evaluation.first_name} {evaluation.last_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {evaluation.emp_id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {evaluation.position_name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {evaluation.year + 543}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(evaluation.evaluated_at).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`text-2xl font-bold ${getScoreColor(evaluation.total_score)}`}>
                          {evaluation.total_score.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                          getScoreGrade(evaluation.total_score) === 'A' ? 'bg-green-100 text-green-800' :
                          getScoreGrade(evaluation.total_score).startsWith('B') ? 'bg-blue-100 text-blue-800' :
                          getScoreGrade(evaluation.total_score).startsWith('C') ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {getScoreGrade(evaluation.total_score)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <button
                          onClick={() => handleViewDetail(evaluation)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <EyeIcon className="w-4 h-4" />
                          ดูรายละเอียด
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal แสดงรายละเอียด */}
      {showDetailModal && selectedEvaluation && (
        <EvaluationDetailModal
          appraisalId={selectedEvaluation.appraisal_id}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedEvaluation(null);
          }}
        />
      )}
    </div>
  );
};

export default Reports;
