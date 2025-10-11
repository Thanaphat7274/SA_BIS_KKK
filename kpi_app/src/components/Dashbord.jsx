import React from "react";

import HR_Dashboard from "./HR_Dashboard";
import Supervisor_Dashboard from "./Supervisor_Dashboard";

const Dashboard = ({ userRole, userName }) => {

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
            <HR_Dashboard />
        );
    }
    else if(userRole === 'supervisor') {
        return (
            <Supervisor_Dashboard />
        );
    }else if(userRole === 'employee' || userRole === 'emp') {
        return (
            <div className="p-4">
                <h1 className="text-2xl font-bold">Dashboard for Employee</h1>
            </div>
        );
    }
};
export default Dashboard;