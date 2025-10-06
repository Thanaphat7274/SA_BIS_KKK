import React from "react";
import { useNavigate } from 'react-router-dom';
const Selectsepy = ({ userRole, userName }) => {
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
            <div className="p-4 flex justify-center items-center">
                <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
            </div>
        );
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold">กรุณาเลือกข้อมูลพนักงานจากเมนูด้านล่าง</h1>
            <form onSubmit={handleSubmit} 
                className="mt-4 flex flex-col gap-3 max-w-sm" 
                aria-label="ฟอร์มเลือกพนักงาน">
                
                <select 
                    className="mt-2 p-2 border border-gray-300 rounded" 
                    value={sel_emp} 
                    onChange={(e) => setSelectedEmployee(e.target.value)}
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

                <select 
                    className="mt-2 p-2 border border-gray-300 rounded" 
                    value={sel_position} 
                    onChange={(e) => setSelectedPosition(e.target.value)}
                    aria-label="เลือกตำแหน่งงาน"
                    aria-invalid={!!warn_msg}
                >
                    <option value="" disabled>-- ตำแหน่งงาน --</option>
                    {positions.map((pos) => (
                        <option key={pos.id} value={pos.id}>
                            {pos.title}
                        </option>
                    ))}
                </select>

                {warn_msg && <p className="text-red-500">{warn_msg}</p>}

                <div className="flex justify-center">
                    <button 
                        type="submit" 
                        className="self-start mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors cursor-pointer w-auto" 
                        aria-label="ยืนยันการเลือกพนักงาน"
                    >
                        ยืนยัน
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Selectsepy;
