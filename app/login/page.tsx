"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
// No Navbar or sidebar on login page
import { apiRequest } from "../api/config";
// Note: using generic apiRequest; role-specific endpoints handled by endpoint selection

export default function LoginPage() {
  const router = useRouter();
  const [userType, setUserType] = useState("student");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
  let endpoint = "/login-check-student";
  if (userType === "teacher") endpoint = "/login-check-teacher";
  if (userType === "admin") endpoint = "/login-check-admin";
      // Send both user_id and username for backward compatibility with current backend parameter usage
      const response = await apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify({ user_id: username, username: username, password }),
      });
      if (response.status === "success") {
        // Set login flag and user info in localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("isLoggedIn", "true");
          // Save user info if available in response
          console.log('Login response:', response);
          if (response.user) {
            console.log('User data from backend:', response.user);
            const normalized = { ...response.user };
            // Normalize role flags for consistency
            if (userType === 'teacher') {
              normalized.user_type = 'teacher';
              normalized.is_teacher = true;
            } else if (userType === 'admin') {
              // Force admin flags even if backend forgot (defensive)
              normalized.user_type = 'admin';
              normalized.is_admin = true;
            } else {
              normalized.user_type = 'student';
            }
            localStorage.setItem("currentUser", JSON.stringify(normalized));
          } else {
            console.log('No user data in response, saving minimal info');
            // If backend does not return user info, save at least the username
            const minimal:any = { user_id: username };
            if (userType === 'admin') { minimal.user_type='admin'; minimal.is_admin = true; }
            if (userType === 'teacher') { minimal.user_type='teacher'; minimal.is_teacher = true; }
            localStorage.setItem("currentUser", JSON.stringify(minimal));
          }
        }
        router.push("/");
      } else {
        setError(response.message || "Login failed");
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Login</h2>
        <div className="mb-4">
          <label className="block mb-1 font-semibold text-gray-800">User Type</label>
          <select
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
            className="w-full border rounded px-3 py-2 text-gray-900 bg-gray-100"
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold text-gray-800">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border rounded px-3 py-2 text-gray-900 bg-gray-100"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block mb-1 font-semibold text-gray-800">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2 text-gray-900 bg-gray-100"
            required
          />
        </div>
        {error && (
          <div className="mb-4 text-red-700 text-sm font-semibold">{error}</div>
        )}
        <button
          type="submit"
          className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 rounded transition-colors"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        <div className="mt-4 text-sm text-center text-gray-700">
          Don't have an account?{' '}
          <span
            className="text-blue-700 hover:underline cursor-pointer"
            onClick={() => router.push("/signup")}
          >
            Sign up
          </span>
        </div>
      </form>
    </div>
  );
}
