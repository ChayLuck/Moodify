import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "../context/ToastContext";
import { Eye, EyeOff, ArrowRight, Film, Music, Sparkles } from "lucide-react";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const { showToast } = useToast();
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
    <div className="h-[calc(100vh-75px)] w-full flex relative overflow-hidden bg-mainBg dark:bg-slate-900">
      {/* Left Side - Background with Dynamic Overlay */}
      <div 
        className="absolute inset-0 w-1/2 bg-cover bg-center dark:opacity-80"
        style={{
          backgroundImage: "url('/loginImg.jpeg')",
        }}
      >
        <div className="absolute inset-0 bg-black/20 dark:bg-black/40"></div>
      </div>

      {/* Left Content */}
      <div className="w-1/2 flex flex-col justify-center items-start text-white p-12 relative z-10">
        <div className="max-w-md">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-5xl font-bold">Moodify</h1>
          </div>
          <p className="text-xl text-gray-200 mb-10 mt-4">
            Discover movies and music that match your mood
          </p>
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Film className="w-6 h-6 text-indigo-300" />
              </div>
              <div>
                <p className="font-semibold text-white">Personalized Recommendations</p>
                <p className="text-sm text-gray-300">Movies matched to your mood</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-purple-300" />
              </div>
              <div>
                <p className="font-semibold text-white">Mood-Based Curation</p>
                <p className="text-sm text-gray-300">Content matched to your feelings</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Music className="w-6 h-6 text-cyan-300" />
              </div>
              <div>
                <p className="font-semibold text-white">Curated Tracks</p>
                <p className="text-sm text-gray-300">Perfect soundtrack for every moment</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-1/2 flex items-center justify-center p-12 bg-white dark:bg-slate-800">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-mainText mb-2">Join Moodify</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Create an account and start discovering</p>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="text-mainText text-sm font-medium block mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={username}
                onChange={onChange}
                placeholder="Choose a username"
                className="w-full px-4 py-3 bg-gray-100 dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 text-mainText placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                required
              />
            </div>

            <div>
              <label className="text-mainText text-sm font-medium block mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={onChange}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-gray-100 dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 text-mainText placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                required
              />
            </div>

            <div>
              <label className="text-mainText text-sm font-medium block mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={onChange}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 text-mainText placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-mainText transition"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">Must be at least 6 characters</p>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-300"
            >
              Create Account
            </button>
          </form>

          <p className="text-mainText text-sm text-center mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 font-semibold transition"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;