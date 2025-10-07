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
};

export default Content;
