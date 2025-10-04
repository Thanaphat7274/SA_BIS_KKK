import React, { useState } from "react";
import Sidebar from "../components/Sildebar";
import Content from "../components/Content";
const KPIPage = () => {
  const [showUserContent, setShowUserContent] = useState(false);

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar onUserInfoClick={() => setShowUserContent(true)} />
      <main className="flex-1 overflow-y-auto">
        {showUserContent ? (
          <Content />
        ) : (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800">Welcome</h2>
            <p className="mt-2 text-gray-600">เลือกเมนูหรือคลิกที่ User Info เพื่อแสดงเนื้อหา</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default KPIPage;
