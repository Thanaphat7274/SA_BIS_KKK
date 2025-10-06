import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
const AddEmployee = () => {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [hireDate, setHireDate] = useState("");
  const [error, setError] = useState({ firstname: "", lastname: "", hireDate: "" });
  const navigate = useNavigate();
  const handleSignup = (e) => {
    e.preventDefault();
    let hasError = false;
    let newError = { firstname: "", lastname: "", hireDate: "" };
    if (!firstname) {
      newError.firstname = "กรุณากรอกชื่อจริง";
      hasError = true;
    }
    if (!lastname) {
      newError.lastname = "กรุณากรอกนามสกุล";
      hasError = true;
    }
    if (!hireDate) {
      newError.hireDate = "กรุณาเลือกวันจ้าง";
      hasError = true;
    } 
    setError(newError);
    if (hasError) return;

    fetch('/api/addEmployee', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstname, lastname, hiredate: hireDate })
    })
    .then(res => res.json())
    .then(data => alert(data.message))
    //.then(data => navigate("/login"));
    // alert("signed up")
    // navigate("/login")

  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm bg-white p-8 rounded-lg shadow-md mt-8">
        <h2 className="text-2xl font-bold mb-6 text-center">เพิ่มพนักงาน</h2>
        <form onSubmit={handleSignup} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium mb-1">Firstname</label>
            <input
              type="text"
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your firstname"
            />
            {error.firstname && (
              <p className="text-red-500 text-xs mt-1">{error.firstname}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1">lastname</label>
            <input
              type="text"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
            />
            {error.lastname && (
              <p className="text-red-500 text-xs mt-1">{error.lastname}</p>
            )}
          </div>

          {/* Confirm Password */}
          {/* <div>
            <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Confirm your password"
            />
            {error.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{error.confirmPassword}</p>
            )}
          </div> */}

          {/* Hire Date */}
          <div>
            <label className="block text-sm font-medium mb-1">Hire date</label>
            <input
              type="date"
              value={hireDate}
              onChange={(e) => setHireDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {hireDate && (
              <p className="text-sm text-gray-600 mt-1">เลือก: {hireDate}</p>
            )}
            {error.hireDate && (
              <p className="text-red-500 text-xs mt-1">{error.hireDate}</p>
            )}
          </div>

          {/* Signup button */}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            เพิ่มพนักงาน
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddEmployee;
