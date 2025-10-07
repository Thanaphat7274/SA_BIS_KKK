import React, { useState } from "react";
import { UserCircleIcon, EnvelopeIcon, PhoneIcon, BuildingOfficeIcon, CalendarIcon, PencilIcon, CheckIcon, XMarkIcon, ChartBarIcon } from "@heroicons/react/24/outline";

const Employee_Profile = ({ userName = "Employee Name" }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: userName || "Employee Name",
    email: "employee@company.com",
    phone: "081-234-5678",
    department: "IT Department",
    position: "Software Developer",
    employeeId: "EMP001",
    joinDate: "15/06/2021",
    supervisor: "Supervisor Name",
    address: "456 ถนนพระราม 9 กรุงเทพฯ 10110",
    emergencyContact: "082-345-6789",
    emergencyName: "ผู้ติดต่อฉุกเฉิน"
  });

  const [editedData, setEditedData] = useState({ ...profileData });

  // Mock KPI data
  const kpiSummary = {
    lastEvaluation: "มกราคม 2025",
    overallScore: 4.2,
    evaluationsCount: 4,
    status: "ผ่านการประเมิน"
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData({ ...profileData });
  };

  const handleSave = () => {
    setProfileData({ ...editedData });
    setIsEditing(false);
    // TODO: Send data to backend API
    console.log("Saving profile data:", editedData);
  };

  const handleCancel = () => {
    setEditedData({ ...profileData });
    setIsEditing(false);
  };

  const handleChange = (field, value) => {
    setEditedData({ ...editedData, [field]: value });
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white rounded-full p-2">
                <UserCircleIcon className="h-20 w-20 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{profileData.fullName}</h1>
                <p className="text-blue-100">{profileData.position}</p>
                <p className="text-sm text-blue-200">รหัสพนักงาน: {profileData.employeeId}</p>
              </div>
            </div>
            <div>
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition"
                >
                  <PencilIcon className="h-5 w-5" />
                  แก้ไขข้อมูล
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                  >
                    <CheckIcon className="h-5 w-5" />
                    บันทึก
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                  >
                    <XMarkIcon className="h-5 w-5" />
                    ยกเลิก
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* KPI Summary Section */}
        <div className="p-6 bg-blue-50 border-b border-blue-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <ChartBarIcon className="h-6 w-6 mr-2 text-blue-600" />
            สรุปผลการประเมิน KPI
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600">การประเมินล่าสุด</p>
              <p className="text-xl font-bold text-gray-900">{kpiSummary.lastEvaluation}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600">คะแนนเฉลี่ย</p>
              <p className="text-xl font-bold text-blue-600">{kpiSummary.overallScore} / 5.0</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600">จำนวนครั้งที่ประเมิน</p>
              <p className="text-xl font-bold text-gray-900">{kpiSummary.evaluationsCount} ครั้ง</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600">สถานะ</p>
              <p className="text-xl font-bold text-blue-600">{kpiSummary.status}</p>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">ข้อมูลส่วนตัว</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <UserCircleIcon className="h-5 w-5 mr-2 text-blue-600" />
                ชื่อ-นามสกุล
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 px-4 py-2 bg-gray-50 rounded-lg">{profileData.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <EnvelopeIcon className="h-5 w-5 mr-2 text-blue-600" />
                อีเมล
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={editedData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 px-4 py-2 bg-gray-50 rounded-lg">{profileData.email}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <PhoneIcon className="h-5 w-5 mr-2 text-blue-600" />
                เบอร์โทรศัพท์
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editedData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 px-4 py-2 bg-gray-50 rounded-lg">{profileData.phone}</p>
              )}
            </div>

            {/* Department */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <BuildingOfficeIcon className="h-5 w-5 mr-2 text-blue-600" />
                แผนก
              </label>
              <p className="text-gray-900 px-4 py-2 bg-gray-50 rounded-lg">{profileData.department}</p>
            </div>

            {/* Position */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <BuildingOfficeIcon className="h-5 w-5 mr-2 text-blue-600" />
                ตำแหน่ง
              </label>
              <p className="text-gray-900 px-4 py-2 bg-gray-50 rounded-lg">{profileData.position}</p>
            </div>

            {/* Supervisor */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <UserCircleIcon className="h-5 w-5 mr-2 text-blue-600" />
                ผู้บังคับบัญชา
              </label>
              <p className="text-gray-900 px-4 py-2 bg-gray-50 rounded-lg">{profileData.supervisor}</p>
            </div>

            {/* Join Date */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
                วันที่เริ่มงาน
              </label>
              <p className="text-gray-900 px-4 py-2 bg-gray-50 rounded-lg">{profileData.joinDate}</p>
            </div>

            {/* Employee ID */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <BuildingOfficeIcon className="h-5 w-5 mr-2 text-blue-600" />
                รหัสพนักงาน
              </label>
              <p className="text-gray-900 px-4 py-2 bg-gray-50 rounded-lg">{profileData.employeeId}</p>
            </div>

            {/* Address */}
            <div className="space-y-2 md:col-span-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <BuildingOfficeIcon className="h-5 w-5 mr-2 text-blue-600" />
                ที่อยู่
              </label>
              {isEditing ? (
                <textarea
                  value={editedData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 px-4 py-2 bg-gray-50 rounded-lg">{profileData.address}</p>
              )}
            </div>

            {/* Emergency Contact Name */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <UserCircleIcon className="h-5 w-5 mr-2 text-red-600" />
                ผู้ติดต่อฉุกเฉิน
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.emergencyName}
                  onChange={(e) => handleChange("emergencyName", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 px-4 py-2 bg-gray-50 rounded-lg">{profileData.emergencyName}</p>
              )}
            </div>

            {/* Emergency Contact Phone */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <PhoneIcon className="h-5 w-5 mr-2 text-red-600" />
                เบอร์โทรติดต่อฉุกเฉิน
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editedData.emergencyContact}
                  onChange={(e) => handleChange("emergencyContact", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 px-4 py-2 bg-gray-50 rounded-lg">{profileData.emergencyContact}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Employee_Profile;
