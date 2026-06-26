import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/api/auth/login`, form);

      localStorage.setItem("token", res.data.token);

      alert("Login successful");
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#4d73f8] flex items-center justify-center px-6">
      <div className="w-full max-w-6xl flex items-center justify-between gap-20">
        <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-10">
          <h2 className="!text-gray-900 text-3xl font-bold mb-2">
            Login
          </h2>

          <div className="w-20 h-1 bg-blue-600 rounded mb-8"></div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border-2 border-gray-300 rounded-lg px-5 py-4 text-gray-900 placeholder-gray-400 outline-none focus:border-blue-600"
            />

            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full border-2 border-gray-300 rounded-lg px-5 py-4 text-gray-900 placeholder-gray-400 outline-none focus:border-blue-600"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4d73f8] hover:bg-blue-700 text-white py-4 rounded-lg font-semibold transition"
            >
              {loading ? "Logging in..." : "Login Now"}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-700">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-[#4d73f8] font-semibold">
              Register now
            </Link>
          </p>
        </div>

        <div className="hidden lg:flex flex-col text-white">
          <h1 className="!text-white text-7xl font-extrabold leading-tight">
            Document
          </h1>
          <h1 className="!text-white text-7xl font-extrabold leading-tight mt-10">
            Signature
          </h1>
          <h1 className="!text-white text-7xl font-extrabold leading-tight mt-10">
            App
          </h1>
        </div>
      </div>
    </div>
  );
}