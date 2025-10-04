import React  from "react";

const Content = ({userRole = '', userName = ''}) => {
    const roleLabels = {
        supervisor: 'หัวหน้างาน (Supervisor)',
        employee: 'พนักงาน (Employee)',
        hr: 'ฝ่ายบุคคล (HR)'
    };
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
