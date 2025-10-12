import React, { useState } from "react";
import { UserCircleIcon, EnvelopeIcon, PhoneIcon, BuildingOfficeIcon, CalendarIcon, PencilIcon, CheckIcon, XMarkIcon, UsersIcon } from "@heroicons/react/24/outline";

const Supervisor_Profile = ({ userName  }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    fullName: userName || "Supervisor Name",
    email: "",
    phone: "",
    department: "",
    position: "",
    employeeId: "",
    joinDate: "",
    teamSize: 0,
    address: "",
    emergencyContact: "",
    emergencyName: ""
  });

  const [editedData, setEditedData] = useState({ ...profileData });
  const [teamStats, setTeamStats] = useState({
    totalMembers: 0,
    pendingEvaluations: 0,
    completedEvaluations: 0,
    avgTeamScore: 0
  });

  // ดึงข้อมูล Profile จาก API
  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/profile/${userName}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        const profile = {
          fullName: data.fullName || userName,
          email: data.email || "",
          phone: data.phone || "",
          department: data.department || "",
          position: data.position || "",
          employeeId: data.employeeId || "",
          joinDate: data.joinDate || "",
          teamSize: data.teamSize || 0,
          address: data.address || "",
          emergencyContact: data.emergencyContact || "",
          emergencyName: data.emergencyName || ""
        };
        
        setProfileData(profile);
        setEditedData(profile);
        
        // ดึงข้อมูล team stats จาก API
        setTeamStats({
          totalMembers: data.teamSize || 0,
          pendingEvaluations: data.pendingEvaluations || 0,
          completedEvaluations: data.completedEvaluations || 0,
          avgTeamScore: data.avgTeamScore || 0
        });
        
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userName && userName !== "user") {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [userName]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData({ ...profileData });
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/profile/${userName}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: editedData.email,
          phone: editedData.phone,
          address: editedData.address,
          emergencyName: editedData.emergencyName,
          emergencyContact: editedData.emergencyContact
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      setProfileData({ ...editedData });
      setIsEditing(false);
      alert('บันทึกข้อมูลสำเร็จ');
    } catch (err) {
      console.error('Error saving profile:', err);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const handleCancel = () => {
    setEditedData({ ...profileData });
    setIsEditing(false);
  };

  const handleChange = (field, value) => {
    setEditedData({ ...editedData, [field]: value });
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

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

        {/* Team Management Section */}
        <div className="p-6 bg-blue-50 border-b border-blue-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <UsersIcon className="h-6 w-6 mr-2 text-blue-600" />
            สรุปการจัดการทีม
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600">สมาชิกในทีม</p>
              <p className="text-xl font-bold text-gray-900">{teamStats.totalMembers} คน</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600">รอการประเมิน</p>
              <p className="text-xl font-bold text-orange-600">{teamStats.pendingEvaluations} คน</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600">ประเมินแล้ว</p>
              <p className="text-xl font-bold text-green-600">{teamStats.completedEvaluations} คน</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600">คะแนนเฉลี่ยทีม</p>
              <p className="text-xl font-bold text-blue-600">{teamStats.avgTeamScore} / 5.0</p>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">ข้อมูลส่วนตัว</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name - Read Only */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <UserCircleIcon className="h-5 w-5 mr-2 text-blue-600" />
                ชื่อ-นามสกุล
              </label>
              <p className="text-gray-900 px-4 py-2 bg-gray-50 rounded-lg">{profileData.fullName}</p>
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

            {/* Department - Read Only */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <BuildingOfficeIcon className="h-5 w-5 mr-2 text-blue-600" />
                แผนก
              </label>
              <p className="text-gray-900 px-4 py-2 bg-gray-50 rounded-lg">{profileData.department}</p>
            </div>

            {/* Position - Read Only */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <BuildingOfficeIcon className="h-5 w-5 mr-2 text-blue-600" />
                ตำแหน่ง
              </label>
              <p className="text-gray-900 px-4 py-2 bg-gray-50 rounded-lg">{profileData.position}</p>
            </div>

            {/* Employee ID - Read Only */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <BuildingOfficeIcon className="h-5 w-5 mr-2 text-blue-600" />
                รหัสพนักงาน
              </label>
              <p className="text-gray-900 px-4 py-2 bg-gray-50 rounded-lg">{profileData.employeeId}</p>
            </div>

            {/* Join Date - Read Only */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
                วันที่เริ่มงาน
              </label>
              <p className="text-gray-900 px-4 py-2 bg-gray-50 rounded-lg">{profileData.joinDate}</p>
            </div>

            {/* Team Size - Read Only */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <UsersIcon className="h-5 w-5 mr-2 text-blue-600" />
                จำนวนสมาชิกในทีม
              </label>
              <p className="text-gray-900 px-4 py-2 bg-gray-50 rounded-lg">{profileData.teamSize} คน</p>
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

        {/* Supervisor Specific Section */}
        <div className="p-6 bg-blue-50 border-t border-blue-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">สิทธิ์และการเข้าถึง (Supervisor)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold text-blue-700 mb-2">การจัดการทีม</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>✓ ดูข้อมูลสมาชิกในทีม</li>
                <li>✓ ประเมิน KPI สมาชิกในทีม</li>
                <li>✓ ตรวจสอบประวัติการประเมิน</li>
              </ul>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold text-blue-700 mb-2">รายงาน</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>✓ ดูรายงานสรุปทีม</li>
                <li>✓ ส่งออกรายงานประเมิน</li>
                <li>✓ วิเคราะห์ผลการปฏิบัติงาน</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Supervisor_Profile;
