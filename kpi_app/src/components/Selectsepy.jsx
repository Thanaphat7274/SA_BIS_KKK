import React from "react";
import { useNavigate } from 'react-router-dom';
import { UserGroupIcon, BriefcaseIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

const Selectsepy = ({ userRole, userName , userFullName }) => {
    const [sel_emp, setSelectedEmployee] = React.useState("");
    const [sel_position, setSelectedPosition] = React.useState("");
    const [warn_msg, setWarningMessage] = React.useState("");
    const [employees, setEmployees] = React.useState([]);
    const [positions, setPositions] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const navigate = useNavigate();
    
    // ดึงข้อมูลจาก database เมื่อ component โหลด
    React.useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // ดึงข้อมูลพนักงาน
                const empResponse = await fetch('/api/employees'); // เปลี่ยน URL ตาม API ของคุณ
                const empData = await empResponse.json();
                setEmployees(empData);
                
                // ดึงข้อมูลตำแหน่ง
                const posResponse = await fetch('/api/positions'); // เปลี่ยน URL ตาม API ของคุณ
                const posData = await posResponse.json();
                setPositions(posData);
                
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setWarningMessage('ไม่สามารถดึงข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!sel_emp || !sel_position) {
            setWarningMessage("กรุณาเลือกพนักงานและตำแหน่งงาน");
            
             // นำทางไปหน้า Evaluation โดยไม่ส่ง state
            navigate('/evaluation', { 
                // state: { employee: selectedEmployeeData, 
                // position: selectedPositionData } 
            });

        } 
        else {
            setWarningMessage("");
            const selectedEmployeeData = employees.find(
                emp => emp.id === sel_emp);
            const selectedPositionData = positions.find(
                pos => pos.id === sel_position);
            navigate('/evaluation', { 
                state: { employee: selectedEmployeeData, 
                        position: selectedPositionData } 
            });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex justify-center items-center p-6">
                <div className="bg-white p-8 rounded-2xl shadow-lg">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
                        <p className="text-gray-600 text-lg font-medium">กำลังโหลดข้อมูล...</p>
                    </div>
                </div>
            </div>
        );
    }

    const selectedEmployee = employees.find(emp => emp.id === sel_emp);
    const selectedPosition = positions.find(pos => pos.id === sel_position);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-3">
                        เลือกพนักงานเพื่อประเมิน
                    </h1>
                    <p className="text-gray-600 text-lg">
                        กรุณาเลือกพนักงานและตำแหน่งงานที่ต้องการประเมิน KPI
                    </p>
                </div>

                {/* Main Form Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
                    <form onSubmit={handleSubmit} className="space-y-6" aria-label="ฟอร์มเลือกพนักงาน">
                        
                        {/* Employee Selection */}
                        <div className="space-y-3">
                            <label className="flex items-center text-lg font-semibold text-gray-700 mb-2">
                                <UserGroupIcon className="h-6 w-6 mr-2 text-blue-600" />
                                เลือกพนักงาน
                            </label>
                            <select 
                                className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all text-lg bg-gray-50 hover:bg-white cursor-pointer" 
                                value={sel_emp} 
                                onChange={(e) => {
                                    setSelectedEmployee(e.target.value);
                                    setWarningMessage("");
                                }}
                                aria-label="เลือกพนักงาน"
                                aria-invalid={!!warn_msg}
                                disabled={loading}
                            >
                                <option value="" disabled>-- เลือกพนักงาน --</option>
                                {employees.map((emp) => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.name} ({emp.employeeCode})
                                    </option>
                                ))}
                            </select>
                            
                            {/* Selected Employee Preview */}
                            {selectedEmployee && (
                                <div className="mt-3 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                                    <p className="text-sm text-gray-600">พนักงานที่เลือก:</p>
                                    <p className="text-lg font-semibold text-blue-700">
                                        {selectedEmployee.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        รหัส: {selectedEmployee.employeeCode}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Position Selection */}
                        <div className="space-y-3">
                            <label className="flex items-center text-lg font-semibold text-gray-700 mb-2">
                                <BriefcaseIcon className="h-6 w-6 mr-2 text-blue-600" />
                                เลือกตำแหน่งงาน
                            </label>
                            <select 
                                className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all text-lg bg-gray-50 hover:bg-white cursor-pointer" 
                                value={sel_position} 
                                onChange={(e) => {
                                    setSelectedPosition(e.target.value);
                                    setWarningMessage("");
                                }}
                                aria-label="เลือกตำแหน่งงาน"
                                aria-invalid={!!warn_msg}
                            >
                                <option value="" disabled>-- เลือกตำแหน่งงาน --</option>
                                {positions.map((pos) => (
                                    <option key={pos.id} value={pos.id}>
                                        {pos.title}
                                    </option>
                                ))}
                            </select>

                            {/* Selected Position Preview */}
                            {selectedPosition && (
                                <div className="mt-3 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
                                    <p className="text-sm text-gray-600">ตำแหน่งที่เลือก:</p>
                                    <p className="text-lg font-semibold text-green-700">
                                        {selectedPosition.title}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Warning Message */}
                        {warn_msg && (
                            <div className="flex items-center gap-3 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-pulse">
                                <ExclamationCircleIcon className="h-6 w-6 text-red-600 flex-shrink-0" />
                                <p className="text-red-700 font-medium">{warn_msg}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex justify-center pt-4">
                            <button 
                                type="submit" 
                                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-300 transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center gap-3 min-w-[200px] justify-center" 
                                aria-label="ยืนยันการเลือกพนักงาน"
                                // เปิดปิดปุ่มถ้ายังไม่ได้เลือกพนักงานหรือเลือกตำแหน่ง
                                // disabled={!sel_emp || !sel_position}
                            >
                                <CheckCircleIcon className="h-6 w-6" />
                                <span>ยืนยันและเริ่มประเมิน</span>
                            </button>
                        </div>
                    </form>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
                        <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                            <UserGroupIcon className="h-5 w-5 mr-2 text-blue-600" />
                            พนักงานทั้งหมด
                        </h3>
                        <p className="text-3xl font-bold text-blue-600">{employees.length}</p>
                        <p className="text-sm text-gray-500 mt-1">รายการพนักงานในระบบ</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
                        <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                            <BriefcaseIcon className="h-5 w-5 mr-2 text-green-600" />
                            ตำแหน่งงาน
                        </h3>
                        <p className="text-3xl font-bold text-green-600">{positions.length}</p>
                        <p className="text-sm text-gray-500 mt-1">ตำแหน่งที่มีในระบบ</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Selectsepy;
