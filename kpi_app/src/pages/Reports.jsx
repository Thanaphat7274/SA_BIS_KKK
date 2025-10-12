import React, { useState, useEffect } from 'react';
import { EyeIcon, DocumentTextIcon, CalendarIcon } from '@heroicons/react/24/outline';
import EvaluationDetailModal from '../components/EvaluationDetailModal';

const Reports = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [evaluationDetails, setEvaluationDetails] = useState({}); // เก็บรายละเอียดการประเมินรวม e_comment
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'evaluated', 'not-evaluated', 'confirmed'
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchEmployees();
    fetchEvaluations();
  }, [selectedYear]);

  useEffect(() => {
    // ดึงรายละเอียดการประเมินเพื่อเช็ค e_comment
    if (evaluations.length > 0) {
      fetchEvaluationDetails();
    }
  }, [evaluations]);

  const fetchEvaluationDetails = async () => {
    const details = {};
    for (const evaluation of evaluations) {
      try {
        const response = await fetch(`http://localhost:8080/api/evaluations/${evaluation.appraisal_id}`);
        if (response.ok) {
          const data = await response.json();
          details[evaluation.appraisal_id] = {
            e_comment: data.e_comment || null,
            m_comment: data.m_comment || null
          };
        }
      } catch (error) {
        console.error(`Error fetching details for ${evaluation.appraisal_id}:`, error);
      }
    }
    setEvaluationDetails(details);
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/employees');
      if (response.ok) {
        const data = await response.json();
        setAllEmployees(data || []);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

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

  // กรองข้อมูลตามสถานะ
  const getFilteredData = () => {
    const currentYear = selectedYear || new Date().getFullYear();
    const evaluatedEmpIds = evaluations
      .filter(e => e.year === parseInt(currentYear))
      .map(e => e.emp_id);
    
    if (statusFilter === 'evaluated') {
      // กรองเฉพาะพนักงานที่ประเมินแล้วแต่ยังไม่ได้ยืนยัน (ไม่มี e_comment)
      return evaluations.filter(evaluation => {
        const details = evaluationDetails[evaluation.appraisal_id];
        return !details || !details.e_comment || details.e_comment.trim() === '';
      });
    } else if (statusFilter === 'confirmed') {
      // กรองเฉพาะพนักงานที่ยืนยันผลการประเมินแล้ว (มี e_comment)
      return evaluations.filter(evaluation => {
        const details = evaluationDetails[evaluation.appraisal_id];
        return details && details.e_comment && details.e_comment.trim() !== '';
      });
    } else if (statusFilter === 'not-evaluated') {
      // หาพนักงานที่ยังไม่ได้ประเมินในปีที่เลือก (ไม่รวม HR และ Supervisor)
      return allEmployees
        .filter(emp => {
          // กรอง HR และ Supervisor ออก
          const isHR = emp.role === 'hr' || emp.role === 'HR';
          const isSupervisor = emp.role === 'supervisor' || emp.role === 'Supervisor';
          // กรองคนที่ยังไม่ได้ประเมิน
          const notEvaluated = !evaluatedEmpIds.includes(emp.emp_id);
          
          return !isHR && !isSupervisor && notEvaluated;
        })
        .map(emp => ({
          emp_id: emp.emp_id,
          first_name: emp.first_name,
          last_name: emp.last_name,
          position_name: emp.position_name || '-',
          year: parseInt(currentYear),
          total_score: null,
          evaluated_at: null,
          status: 'not-evaluated'
        }));
    } else if (statusFilter === 'all') {
      // แสดงทั้งหมด: รวมพนักงานที่ประเมินแล้ว + พนักงานที่ยังไม่ได้ประเมิน
      const notEvaluatedEmployees = allEmployees
        .filter(emp => {
          const isHR = emp.role === 'hr' || emp.role === 'HR';
          const isSupervisor = emp.role === 'supervisor' || emp.role === 'Supervisor';
          const notEvaluated = !evaluatedEmpIds.includes(emp.emp_id);
          return !isHR && !isSupervisor && notEvaluated;
        })
        .map(emp => ({
          emp_id: emp.emp_id,
          first_name: emp.first_name,
          last_name: emp.last_name,
          position_name: emp.position_name || '-',
          year: parseInt(currentYear),
          total_score: null,
          evaluated_at: null,
          status: 'not-evaluated'
        }));
      
      // รวมพนักงานที่ประเมินแล้วกับที่ยังไม่ประเมิน
      return [...evaluations, ...notEvaluatedEmployees];
    }
    return evaluations;
  };

  const filteredData = getFilteredData();
  
  // นับจำนวนพนักงานที่ไม่ใช่ HR และ Supervisor
  const nonHREmployees = allEmployees.filter(emp => 
    emp.role !== 'hr' && emp.role !== 'HR' && 
    emp.role !== 'supervisor' && emp.role !== 'Supervisor'
  );
  
  // นับ evaluations ที่ไม่ใช่ HR และ Supervisor และตรงกับปีที่เลือก
  const currentYear = parseInt(selectedYear) || new Date().getFullYear();
  const nonHREvaluations = evaluations.filter(e => {
    const emp = allEmployees.find(emp => emp.emp_id === e.emp_id);
    return emp && 
      emp.role !== 'hr' && emp.role !== 'HR' && 
      emp.role !== 'supervisor' && emp.role !== 'Supervisor' && 
      e.year === currentYear;
  });
  
  // นับจำนวนพนักงานที่ยืนยันผลการประเมินแล้ว (ไม่รวม HR และ Supervisor)
  const confirmedEvaluations = evaluations.filter(evaluation => {
    const emp = allEmployees.find(emp => emp.emp_id === evaluation.emp_id);
    const isNotHR = emp && emp.role !== 'hr' && emp.role !== 'HR';
    const isNotSupervisor = emp && emp.role !== 'supervisor' && emp.role !== 'Supervisor';
    const details = evaluationDetails[evaluation.appraisal_id];
    return isNotHR && isNotSupervisor && details && details.e_comment && details.e_comment.trim() !== '';
  });
  const confirmedCount = confirmedEvaluations.length;
  
  // นับจำนวนพนักงานที่รอยืนยัน (ประเมินแล้วแต่ยังไม่ได้ยืนยัน) (ไม่รวม HR และ Supervisor)
  const waitingConfirmEvaluations = evaluations.filter(evaluation => {
    const emp = allEmployees.find(emp => emp.emp_id === evaluation.emp_id);
    const isNotHR = emp && emp.role !== 'hr' && emp.role !== 'HR';
    const isNotSupervisor = emp && emp.role !== 'supervisor' && emp.role !== 'Supervisor';
    const details = evaluationDetails[evaluation.appraisal_id];
    return isNotHR && isNotSupervisor && (!details || !details.e_comment || details.e_comment.trim() === '');
  });
  const waitingConfirmCount = waitingConfirmEvaluations.length;
  
  // หาพนักงานที่ประเมินแล้วในปีนี้
  const evaluatedEmpIdsThisYear = evaluations
    .filter(e => e.year === currentYear)
    .map(e => e.emp_id);
  
  // นับพนักงานที่ยังไม่ประเมินในปีนี้ (ไม่นับ HR และ Supervisor)
  const notEvaluatedEmployees = nonHREmployees.filter(emp => 
    !evaluatedEmpIdsThisYear.includes(emp.emp_id)
  );
  const notEvaluatedCount = notEvaluatedEmployees.length;

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* กรองตามปี */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CalendarIcon className="w-4 h-4 inline mr-1" />
                กรองตามปี
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

            {/* กรองตามสาขา (เตรียมไว้) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DocumentTextIcon className="w-4 h-4 inline mr-1" />
                กรองตามสาขา
              </label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled
              >
                <option value="">-- ทั้งหมด --</option>
                <option value="1">สาขาหลัก</option>
                <option value="2">สาขา 2</option>
              </select>
              <p className="text-xs text-gray-400 mt-1">* ยังไม่พร้อมใช้งาน</p>
            </div>

            {/* สถิติ */}
            <div className="flex items-center justify-center bg-blue-50 rounded-lg p-3">
              <div className="text-center">
                <p className="text-sm text-gray-600">จำนวนทั้งหมด</p>
                <p className="text-3xl font-bold text-blue-600">{filteredData.length}</p>
                <p className="text-xs text-gray-500">รายการ</p>
              </div>
            </div>
          </div>

          {/* ปุ่มกรองตามสถานะ */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ทั้งหมด ({nonHREmployees.length})
            </button>
            <button
              onClick={() => setStatusFilter('confirmed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === 'confirmed'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ✅ ยืนยันแล้ว ({confirmedCount})
            </button>
            <button
              onClick={() => setStatusFilter('evaluated')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === 'evaluated'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ⏳ รอยืนยัน ({waitingConfirmCount})
            </button>

            <button
              onClick={() => setStatusFilter('not-evaluated')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === 'not-evaluated'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ⚠ ยังไม่ประเมิน ({notEvaluatedCount})
            </button>
          </div>
        </div>

        {/* สถิติสรุป */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">ประเมินแล้ว</div>
            <div className="text-3xl font-bold text-green-600">{nonHREvaluations.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">ยังไม่ประเมิน</div>
            <div className="text-3xl font-bold text-orange-600">
              {notEvaluatedCount}
            </div>
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
            <div className="text-3xl font-bold text-purple-600">
              {evaluations.length > 0
                ? Math.max(...evaluations.map(e => e.total_score)).toFixed(2)
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
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3">กำลังโหลด...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      <DocumentTextIcon className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                      <p>ไม่มีข้อมูล{statusFilter === 'not-evaluated' ? 'พนักงานที่ยังไม่ได้ประเมิน' : 'การประเมิน'}</p>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((evaluation, index) => (
                    <tr key={`${evaluation.emp_id}_${evaluation.appraisal_id || index}`} className="hover:bg-gray-50">
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
                        {evaluation.evaluated_at ? (
                          new Date(evaluation.evaluated_at).toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })
                        ) : (
                          <span className="text-orange-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {evaluation.total_score !== null ? (
                          <span className={`text-2xl font-bold ${getScoreColor(evaluation.total_score)}`}>
                            {evaluation.total_score.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-orange-500 font-semibold">ยังไม่ประเมิน</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        {evaluation.status === 'not-evaluated' ? (
                          <span className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg">
                            ⚠ ยังไม่ประเมิน
                          </span>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <button
                              onClick={() => handleViewDetail(evaluation)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <EyeIcon className="w-4 h-4" />
                              ดูรายละเอียด
                            </button>
                            {(() => {
                              const details = evaluationDetails[evaluation.appraisal_id];
                              const isConfirmed = details && details.e_comment && details.e_comment.trim() !== '';
                              return isConfirmed ? (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                                  ✅ ยืนยันแล้ว
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
                                  ⏳ รอยืนยัน
                                </span>
                              );
                            })()}
                          </div>
                        )}
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
