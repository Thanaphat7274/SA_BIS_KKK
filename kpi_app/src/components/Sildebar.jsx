import React, { useState } from "react";
import {ClipboardDocumentIcon,ClipboardDocumentCheckIcon,UserGroupIcon,CalendarDaysIcon,CloudArrowUpIcon,Bars4Icon,XMarkIcon,ArrowRightOnRectangleIcon} from '@heroicons/react/24/solid';
import { useNavigate } from "react-router-dom";

const Sidebar = ({ userRole ,
   userName , userFullName ,
   onUserInfoClick = () => {},
   activepage ='dashboard',
   setActivepage = () => {},
  }) => {
    const [isOpen, setIsOpen] = useState(true);
    const navigate = useNavigate();

    // ฟังก์ชัน logout
    const handleLogout = () => {
      // ลบข้อมูลที่เก็บไว้ใน localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userFullName');
      
      // นำทางไปหน้า login
      navigate('/login/');
    };

    const menuStructure = {
    supervisor: [
        {
            key: 'dashboard',
            icon: ClipboardDocumentCheckIcon,
            label: 'แดชบอร์ด',
            page: 'dashboard'
        },
        {
            key: 'evaluation',
            icon: ClipboardDocumentIcon,
            label: 'การประเมิน',
            page: 'evaluation'
        },
    ],
    emp: [
      {
        key: 'dashboard',
        icon: ClipboardDocumentIcon,
        label: 'แดชบอร์ด',
        page: 'dashboard'
      },
      {
        key: 'my-evaluation',
        icon: ClipboardDocumentCheckIcon,
        label: 'ผลการประเมินของฉัน',
        page: 'my-evaluation'
      }
    ],
    hr: [
      {
        key: 'dashboard',
        icon: ClipboardDocumentIcon,
        label: 'แดชบอร์ด',
        page: 'dashboard'
      },
      {
        key: 'employees',
        icon: UserGroupIcon,
        label: 'จัดการพนักงาน',
        page: 'employees'
      },
      {
        key: 'manage-criteria',
        icon: ClipboardDocumentCheckIcon,
        label: 'จัดการเกณฑ์การประเมิน',
        page: 'manage-criteria'
      },
      {
        key: 'attendance',
        icon: CalendarDaysIcon,
        label: 'บันทึกการเข้าทำงาน',
        page: 'attendance'
      },
      {
        key: 'reports',
        icon: CloudArrowUpIcon,
        label: 'รายงาน KPI',
        page: 'reports'
      }
    ]
    };
    const roleLabels = {
        supervisor: 'หัวหน้างาน (Supervisor)',
        employee: 'พนักงาน (Employee)',
        hr: 'ฝ่ายบุคคล (HR)'
    };
    const currentMenu = menuStructure[userRole];
      return (
    <div className={`bg-gradient-to-b from-blue-600 to-blue-800 text-white transition-all duration-300 h-screen sticky top-0 ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className="flex flex-col h-screen">
        
        {/* Header เปิด-ปิด*/}
        <div className={`p-4 flex items-center 
          ${isOpen ? 'justify-between' : 'justify-center'} 
          border-b border-blue-500`
        }>
          {isOpen && 
          <h1 className="text-xl font-bold ml-5">
            ระบบประเมิน KPI
          </h1>
          }
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-blue-950 rounded-lg transition-colors"
           >
            {isOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars4Icon className="w-5 h-5" />}
          </button>
        </div>

        {/* User Info */}
        {isOpen && (
          <button
            type="button"
            onClick={onUserInfoClick}
            className="p-4 border-b border-blue-500 hover:bg-blue-950 transition-colors w-full cursor-pointer"
            aria-label={`เปิดเนื้อหาของ ${userFullName}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center font-bold ml-1">
                {userFullName.charAt(0)}
              </div>
              <div>
                <p className="font-semibold">{userFullName}</p>
                <p className="text-xs text-blue-200">{roleLabels[userRole]}</p>
              </div>
            </div>
          </button>
        )}

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {currentMenu.map((item) => {
              const Icon = item.icon;
              const isActive = activepage === item.page;
              return (
                <li key={item.key}>
                  <button
                    onClick={() => setActivepage(item.page)}
                    title={item.label}
                    className={`w-full flex items-center ${isOpen ? 'gap-4 px-4 justify-start' : 'px-0 justify-center'} py-2 rounded-lg hover:bg-blue-950 transition-colors group text-base
                      ${isActive ? 'bg-blue-900 font-semibold' : ''}`}
                    aria-label={item.label}
                  >
                    <Icon className={`shrink-0 ${isOpen ? 'w-6 h-6' : 'w-5 h-5'}`} />
                    {isOpen && <span className="truncate">{item.label}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer - Logout */}
        <div className="p-4 border-t border-blue-500">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-950 transition-colors"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            {isOpen && <span>ออกจากระบบ</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;