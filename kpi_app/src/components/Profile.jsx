import React from "react";
import HR_Profile from "./HR_Profile";
import Supervisor_Profile from "./Supervisor_Profile";
import Employee_Profile from "./Employee_Profile";

const Content = ({ userRole, userName }) => {
    
    if (userRole === 'hr') {
        return <HR_Profile userName={userName} />;
    }
    else if (userRole === 'supervisor') {
        return <Supervisor_Profile userName={userName} />;
    }
    else if (userRole === 'employee' || userRole === 'emp') {
        return <Employee_Profile userName={userName} />;
    }

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold text-gray-800 text-center">KPI Overview</h2>
            <p className="mt-2 text-gray-600 text-center">
                This is the content area where you can display KPI-related information.
            </p>
        </div>
    );
};

export default Content;
