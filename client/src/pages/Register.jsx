import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
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

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(
  `${API_BASE}/api/auth/register`,
  form
);

// If backend returns token
if (res.data.token) {
  localStorage.setItem("token", res.data.token);
}

alert("Registration successful");
navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="min-h-screen bg-[#4d73f8] flex items-center justify-center px-6">
    <div className="w-full max-w-6xl flex items-center justify-between gap-20">

      {/* Left Side Form */}
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-10">

     <h2 className="text-4xl font-bold text-black mb-2">
  Registration
</h2>

        <div className="w-16 h-1 bg-blue-600 mb-8 rounded"></div>

        <form onSubmit={handleRegister} className="space-y-5">

          <input
            type="text"
            name="name"
            placeholder="Enter your name"
            value={form.name}
            onChange={handleChange}
            className="w-full border-2 border-gray-200 rounded-lg px-5 py-4 outline-none focus:border-blue-500 text-lg"
          />

          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
            className="w-full border-2 border-gray-200 rounded-lg px-5 py-4 outline-none focus:border-blue-500 text-lg"
          />

          <input
            type="password"
            name="password"
            placeholder="Create password"
            value={form.password}
            onChange={handleChange}
            className="w-full border-2 border-gray-200 rounded-lg px-5 py-4 outline-none focus:border-blue-500 text-lg"
          />

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              className="w-5 h-5"
            />
            <span className="text-gray-600 text-sm">
              I accept all terms & conditions
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4d73f8] hover:bg-blue-700 text-white py-4 rounded-lg text-lg font-semibold transition"
          >
            {loading ? "Creating..." : "Register Now"}
          </button>
        </form>

        <p className="text-center mt-8 text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#4d73f8] font-semibold"
          >
            Login now
          </Link>
        </p>
      </div>

      {/* Right Side Text */}
      <div className="hidden lg:flex flex-col text-white">
        <h1 className="text-8xl font-extrabold leading-none">
          Document
        </h1>

        <h1 className="text-8xl font-extrabold leading-none mt-4">
          Signature
        </h1>

        <h1 className="text-8xl font-extrabold leading-none mt-4">
          App
        </h1>
      </div>

    </div>
  </div>
);
}