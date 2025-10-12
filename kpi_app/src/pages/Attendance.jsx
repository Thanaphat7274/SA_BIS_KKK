import React, { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon, CalendarIcon } from '@heroicons/react/24/outline';

const Attendance = () => {
  const [attendances, setAttendances] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedEmpId, setSelectedEmpId] = useState('4'); // Default emp_id = 4
  const [editingAttendance, setEditingAttendance] = useState(null);

  // ดึงข้อมูลพนักงาน
  useEffect(() => {
    fetchEmployees();
  }, []);

  // ดึงข้อมูลการเข้างานเมื่อเปลี่ยน filter
  useEffect(() => {
    fetchAttendances();
  }, [selectedYear, selectedEmpId]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/employees');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchAttendances = async () => {
    try {
      setLoading(true);
      let url = 'http://localhost:8080/api/attendance?';
      const params = [];
      
      if (selectedEmpId) params.push(`emp_id=${selectedEmpId}`);
      if (selectedYear) params.push(`year=${selectedYear}`);
      
      url += params.join('&');
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setAttendances(data || []);
      }
    } catch (error) {
      console.error('Error fetching attendances:', error);
      setMessage('ไม่สามารถดึงข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (attendance) => {
    // ฟังก์ชันนี้จะไม่ถูกใช้แล้ว เนื่องจากไม่มีการแก้ไขข้อมูล
    console.log('Edit disabled');
  };

  const handleDelete = async (attendanceId) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้?')) return;

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/api/attendance/${attendanceId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMessage('ลบข้อมูลสำเร็จ');
        fetchAttendances();
      } else {
        setMessage('ไม่สามารถลบข้อมูลได้');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('ไม่สามารถลบข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'มาทำงาน': return 'bg-green-100 text-green-800';
      case 'สาย': return 'bg-yellow-100 text-yellow-800';
      case 'ลา': return 'bg-blue-100 text-blue-800';
      case 'ขาด': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // คำนวณสถิติ
  const stats = attendances.reduce((acc, att) => {
    acc[att.status] = (acc[att.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                บันทึกการเข้างาน
              </h1>
              <p className="text-gray-600">
                จัดการและติดตามการเข้างานของพนักงาน
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ข้อความแจ้งเตือน */}
        {message && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.includes('สำเร็จ') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message}
            <button onClick={() => setMessage('')} className="float-right font-bold">×</button>
          </div>
        )}

        {/* ฟิลเตอร์ */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">กรองข้อมูล</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                พนักงาน
              </label>
              <select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- ทั้งหมด --</option>
                {employees.map((emp) => (
                  <option key={emp.emp_id} value={emp.emp_id}>
                    {emp.first_name} {emp.last_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ปี
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- ทั้งหมด --</option>
                {Array.from({ length: 10 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return (
                    <option key={year} value={year}>
                      {year + 543} {/* แสดงเป็น พ.ศ. */}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        {/* สถิติ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">มาทำงาน</div>
            <div className="text-2xl font-bold text-green-600">{stats['มาทำงาน'] || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">สาย</div>
            <div className="text-2xl font-bold text-yellow-600">{stats['สาย'] || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">ลา</div>
            <div className="text-2xl font-bold text-blue-600">{stats['ลา'] || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">ขาด</div>
            <div className="text-2xl font-bold text-red-600">{stats['ขาด'] || 0}</div>
          </div>
        </div>

        {/* ตารางข้อมูล */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    วันที่
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    พนักงาน
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    สถานะ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    หมายเหตุ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      กำลังโหลด...
                    </td>
                  </tr>
                ) : attendances.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      ไม่มีข้อมูล
                    </td>
                  </tr>
                ) : (
                  attendances.map((attendance) => (
                    <tr key={attendance.attendance_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
                          {new Date(attendance.date).toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {attendance.first_name} {attendance.last_name}
                        </div>
                        <div className="text-xs text-gray-500">ID: {attendance.emp_id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(attendance.status)}`}>
                          {attendance.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {attendance.remark || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(attendance)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(attendance.attendance_id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="w-5 h-5" />
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
    </div>
  );
};

export default Attendance;
