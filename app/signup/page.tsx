"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
// No Navbar or sidebar on signup page
import { apiRequest } from "../api/config";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    user_id: "",
    password: "",
    given_name: "",
    surname: "",
    age: "",
    school_id: "",
    intended_major: "",
    email: "",
    classOf: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const response = await apiRequest("/sign-up", {
        method: "POST",
        body: JSON.stringify({ ...form, classOf: form.classOf }),
      });
      if (response.status === "success") {
        setSuccess(response.message || "Account created successfully!");
        setTimeout(() => router.push("/login"), 1500);
      } else {
        setError(response.message || "Signup failed");
      }
    } catch (err: any) {
      setError(err.message || "Signup failed");
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
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Sign Up</h2>
        <div className="mb-4">
          <label className="block mb-1 font-semibold text-gray-800">Username</label>
          <input
            type="text"
            name="user_id"
            value={form.user_id}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-gray-900 bg-gray-100"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold text-gray-800">Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-gray-900 bg-gray-100"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold text-gray-800">First Name</label>
          <input
            type="text"
            name="given_name"
            value={form.given_name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-gray-900 bg-gray-100"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold text-gray-800">Last Name</label>
          <input
            type="text"
            name="surname"
            value={form.surname}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-gray-900 bg-gray-100"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold text-gray-800">Age</label>
          <input
            type="text"
            name="age"
            value={form.age}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-gray-900 bg-gray-100"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold text-gray-800">School ID</label>
          <input
            type="text"
            name="school_id"
            value={form.school_id}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-gray-900 bg-gray-100"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold text-gray-800">Intended Major</label>
          <input
            type="text"
            name="intended_major"
            value={form.intended_major}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-gray-900 bg-gray-100"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold text-gray-800">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-gray-900 bg-gray-100"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block mb-1 font-semibold text-gray-800">Class (e.g. 2025)</label>
          <input
            type="number"
            name="classOf"
            value={form.classOf}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-gray-900 bg-gray-100"
            required
          />
        </div>
        {error && (
          <div className="mb-4 text-red-700 text-sm font-semibold">{error}</div>
        )}
        {success && (
          <div className="mb-4 text-green-700 text-sm font-semibold">{success}</div>
        )}
        <button
          type="submit"
          className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 rounded transition-colors"
          disabled={loading}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
        <div className="mt-4 text-sm text-center text-gray-700">
          Already have an account?{' '}
          <span
            className="text-blue-700 hover:underline cursor-pointer"
            onClick={() => router.push("/login")}
          >
            Login
          </span>
        </div>
      </form>
    </div>
  );
}
