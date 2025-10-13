import React from "react";
import { useNavigate } from 'react-router-dom';
import { UserGroupIcon, CheckCircleIcon, ExclamationCircleIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const Selectsepy = ({ userRole, userName , userFullName }) => {
    const [employees, setEmployees] = React.useState([]);
    const [positions, setPositions] = React.useState([]);
    const [evaluations, setEvaluations] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const navigate = useNavigate();
    const currentYear = new Date().getFullYear();
    
    // ดึงข้อมูลจาก database เมื่อ component โหลด
    React.useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // ดึงข้อมูลพนักงาน
                const empResponse = await fetch('http://localhost:8080/api/employees');
                let empData = await empResponse.json();
                if (!Array.isArray(empData)) empData = [];
                console.log('Employees data:', empData);
                setEmployees(empData);
                // ดึงข้อมูลตำแหน่ง
                const posResponse = await fetch('http://localhost:8080/api/positions');
                let posData = await posResponse.json();
                if (!Array.isArray(posData)) posData = [];
                console.log('Positions data:', posData);
                setPositions(posData);
                // ดึงข้อมูลการประเมิน
                const evalResponse = await fetch('http://localhost:8080/api/evaluations');
                let evalData = await evalResponse.json();
                if (!Array.isArray(evalData)) evalData = [];
                console.log('Evaluations data:', evalData);
                setEvaluations(evalData);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // ฟังก์ชันไปหน้าประเมิน
    const handleEvaluate = (employee) => {
        const positionData = (positions || []).find(pos => pos.position_id === employee.position_id);
        
        console.log('Navigating to evaluation with:', {
            employee: employee,
            position: positionData
        });
        
        navigate('/evaluation', { 
            state: { 
                employee: employee, 
                position: positionData 
            } 
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center p-6">
                <div className="bg-white p-8 rounded-2xl shadow-lg">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
                        <p className="text-gray-600 text-lg font-medium">กำลังโหลดข้อมูล...</p>
                    </div>
                </div>
            </div>
        );
    }

    // ดึง emp_id ของ supervisor ที่ล็อกอิน
    const currentEmpId = parseInt(localStorage.getItem('emp_id'));

    // DEBUG LOGS
    console.log('All employees:', employees);
    console.log('Current Supervisor emp_id:', currentEmpId, typeof currentEmpId);
    (employees || []).forEach(emp => {
      console.log('emp_id:', emp.emp_id, 'manager_id:', emp.manager_id, typeof emp.manager_id);
    });

    // กรองเฉพาะลูกน้องของ supervisor (manager_id ตรงกับ emp_id ของผู้ล็อกอิน)
    const mySubordinates = (employees || []).filter(emp => 
        emp.manager_id == currentEmpId && // ใช้ == เพื่อรองรับ string/int
        emp.role !== 'hr' && 
        emp.role !== 'HR'
    );

    console.log('My Subordinates:', mySubordinates);
    
    // หาพนักงานที่ถูกประเมินในปีปัจจุบันแล้ว
    const evaluatedEmployeeIds = (evaluations || [])
        .filter(e => e.year === currentYear)
        .map(e => e.emp_id);
    
    // สร้างข้อมูลสำหรับแสดงในตาราง
    const tableData = mySubordinates.map(emp => {
        const isEvaluated = evaluatedEmployeeIds.includes(emp.emp_id);
        const positionData = (positions || []).find(pos => pos.position_id === emp.position_id);
        
        return {
            ...emp,
            position_name: positionData?.position_name || '-',
            status: isEvaluated ? 'evaluated' : 'not-evaluated'
        };
    });
    
    const evaluatedCount = tableData.filter(emp => emp.status === 'evaluated').length;
    const notEvaluatedCount = tableData.filter(emp => emp.status === 'not-evaluated').length;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                ประเมินพนักงานในทีม
                            </h1>
                            <p className="text-gray-600">
                                เลือกพนักงานที่ต้องการประเมิน KPI ประจำปี {currentYear + 543}
                            </p>
                        </div>
                        <DocumentTextIcon className="w-10 h-10 text-blue-600" />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* สถิติสรุป */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-gray-600">พนักงานในทีม</div>
                                <div className="text-3xl font-bold text-blue-600">{mySubordinates.length}</div>
                            </div>
                            <UserGroupIcon className="w-12 h-12 text-blue-600 opacity-20" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-gray-600">ประเมินแล้ว</div>
                                <div className="text-3xl font-bold text-green-600">{evaluatedCount}</div>
                            </div>
                            <CheckCircleIcon className="w-12 h-12 text-green-600 opacity-20" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-gray-600">ยังไม่ได้ประเมิน</div>
                                <div className="text-3xl font-bold text-orange-600">{notEvaluatedCount}</div>
                            </div>
                            <ExclamationCircleIcon className="w-12 h-12 text-orange-600 opacity-20" />
                        </div>
                    </div>
                </div>

                {/* ตารางรายชื่อพนักงาน */}
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
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        สถานะ
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        จัดการ
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {tableData.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                            <UserGroupIcon className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                                            <p>ไม่มีลูกน้องในการดูแลของคุณ</p>
                                        </td>
                                    </tr>
                                ) : (
                                    tableData.map((employee, index) => (
                                        <tr key={employee.emp_id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {index + 1}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                            <span className="text-blue-600 font-semibold">
                                                                {employee.first_name.charAt(0)}{employee.last_name.charAt(0)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {employee.first_name} {employee.last_name}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            ID: {employee.emp_id}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {employee.position_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                {employee.status === 'evaluated' ? (
                                                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                                        <CheckCircleIcon className="w-4 h-4" />
                                                        ประเมินแล้ว
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                                                        <ExclamationCircleIcon className="w-4 h-4" />
                                                        ยังไม่ประเมิน
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                {employee.status === 'not-evaluated' ? (
                                                    <button
                                                        onClick={() => handleEvaluate(employee)}
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                                    >
                                                        <DocumentTextIcon className="w-4 h-4" />
                                                        ประเมิน
                                                    </button>
                                                ) : (
                                                    <span className="text-sm text-gray-400">
                                                        ประเมินเรียบร้อยแล้ว
                                                    </span>
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
        </div>
    );
};

export default Selectsepy;
