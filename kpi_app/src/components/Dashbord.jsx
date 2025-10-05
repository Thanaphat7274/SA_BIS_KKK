import React from "react";

const Dashboard = ({ userRole, userName }) => {
      const roleLabels = {
        supervisor: 'หัวหน้างาน (Supervisor)',
        employee: 'พนักงาน (Employee)',
        hr: 'ฝ่ายบุคคล (HR)'
    };
    // state สำหรับ select และข้อความเตือน
    const [sel_emp, setSelectedEmployee] = React.useState("");
    const [warn_msg, setWarningMessage] = React.useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!sel_emp) {
            setWarningMessage("กรุณาเลือกพนักงาน");
        } else {
            setWarningMessage("");
            // ทำการส่งข้อมูลหรือเปลี่ยนหน้า
        }
    };

    if(userRole === 'hr') {
        return (
            <div className="p-4">
                <h1 className="text-2xl font-bold">Dashboard for HR</h1>
            </div>
        );
    }
    else if(userRole === 'supervisor') {
        return (
            <div className="p-4">
                <h1 className="text-2xl font-bold">Dashboard for Supervisor</h1>
            </div>
        );
    }
};
export default Dashboard;