import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
const Signup = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState({ username: "", password: "", confirmPassword: "" });
  const navigate = useNavigate();
  const handleSignup = (e) => {
    e.preventDefault();
    let hasError = false;
    let newError = { username: "", password: "", confirmPassword: "" };
    if (!username) {
      newError.username = "กรุณากรอกชื่อผู้ใช้";
      hasError = true;
    }
    if (!password) {
      newError.password = "กรุณากรอกรหัสผ่าน";
      hasError = true;
    }
    if (!confirmPassword) {
      newError.confirmPassword = "กรุณายืนยันรหัสผ่าน";
      hasError = true;
    } else if (password !== confirmPassword) {
      newError.confirmPassword = "รหัสผ่านไม่ตรงกัน";
      hasError = true;
    }
    setError(newError);
    if (hasError) return;

    fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => alert(data.message))
    .then(data => navigate("/login"));
    // alert("signed up")
    // navigate("/login")

  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm bg-white p-8 rounded-lg shadow-md mt-8">
        <h2 className="text-2xl font-bold mb-6 text-center">สมัครสมาชิก</h2>
        <form onSubmit={handleSignup} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your username"
            />
            {error.username && (
              <p className="text-red-500 text-xs mt-1">{error.username}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
            />
            {error.password && (
              <p className="text-red-500 text-xs mt-1">{error.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
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
          </div>

          {/* Signup button */}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            สมัครสมาชิก
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
