import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "../context/ToastContext";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const { showToast } = useToast(); // ✅ Global toast
  const navigate = useNavigate();
  const { username, email, password } = formData;

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      showToast("error", "Password must be at least 6 characters long.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        formData
      );

      if (response.data) {
        showToast("success", "Successfully registered! 🎉 You can log in now.");

        // kısa bir gecikme ile login sayfasına yönlendirelim
        setTimeout(() => navigate("/login"), 1200);
      }
    } catch (error) {
      console.error(error);
      showToast(
        "error",
        error.response?.data?.message || "An error occurred while registering."
      );
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-mainBg/90 relative">
      {/* SIGNUP CARD */}
      <div className="bg-mainBg p-10 rounded-lg shadow-xl w-96 border border-gray-700">
        <h1 className="text-3xl font-bold text-indigo-400 mb-6 text-center">
          Sign Up
        </h1>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-mainText text-sm">Username</label>
            <input
              type="text"
              name="username"
              value={username}
              onChange={onChange}
              className="w-full p-2 mt-1 bg-indigo-400/20 text-mainText rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="username"
              required
            />
          </div>

          <div>
            <label className="text-mainText text-sm">E-mail</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              className="w-full p-2 mt-1 bg-indigo-400/20 text-mainText rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="sample@gmail.com"
              required
            />
          </div>

          <div>
            <label className="text-mainText text-sm">Password</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={onChange}
              className="w-full p-2 mt-1 bg-indigo-400/20 text-mainText rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="******"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            Sign Up
          </button>
        </form>

        <p className="text-mainText text-sm text-center mt-4">
          Do you already have an account?{" "}
          <Link to="/login" className="text-indigo-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
