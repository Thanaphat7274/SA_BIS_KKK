import React from "react";

import HR_Dashboard from "./HR_Dashboard";
import Supervisor_Dashboard from "./Supervisor_Dashboard";
import Employee_Dashboard from "./Employee_Dashboard";

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
            <Supervisor_Dashboard userName={userName} />
        );
    }else if(userRole === 'employee' || userRole === 'emp') {
        return (
            <Employee_Dashboard userName={userName} />
        );
    }
};
export default Dashboard;