import React, { useState } from "react";
import Sidebar from "../components/Sildebar";
import Profile from "../components/Profile";
import Dashboard from "../components/Dashbord";
import Selectepy from "../components/Selectsepy";

const KPIPage = () => {
  const [activepage, setActivepage] = useState('dashboard');
  const userRole = localStorage.getItem("role") || "supervisor";
  const userName = localStorage.getItem("username") || "user";
  const userFullName = localStorage.getItem("name") || "User Fullname";
  
  return (
    <div className="flex min-h-screen w-full">
      
      <Sidebar
        userRole={userRole}
        userName={userName}
        userFullName={userFullName}
        activepage={activepage}
        setActivepage={(page) => {setActivepage(page)

        }}
        onUserInfoClick={() => {
          setActivepage('user-profile');  // เปลี่ยนเป็นหน้า user profile แทน
        }}
      />
      <main className="flex-1 overflow-y-auto">
            {activepage === 'user-profile' ? (
              <Profile userRole={userRole} userName={userName} userFullName={userFullName} />
            ) : (
          <>
            {activepage === 'dashboard' && <Dashboard userRole={userRole} userName={userName} userFullName={userFullName} />}
            {activepage === 'evaluation' && <Selectepy userRole={userRole} userName={userName} userFullName={userFullName} />}
            {activepage === 'my-evaluation' && <div className="p-8">ผลการประเมินของฉัน</div>}
            {activepage === 'employees' && <div className="p-8">จัดการพนักงาน</div>}
            {activepage === 'attendance' && <div className="p-8">บันทึกการเข้างาน</div>}
            {activepage === 'reports' && <div className="p-8">รายงาน KPI</div>}

          </>
        )}
      </main>
    </div>
  );
};

export default KPIPage;
