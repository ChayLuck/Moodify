import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user"))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const stored = JSON.parse(localStorage.getItem("user"));
      setUser(stored);
    }, 300);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
    window.location.reload();
  };

  // Aktif link alt çizgi
  const isActive = (path) =>
    location.pathname === path
      ? "border-b-2 border-indigo-500 pb-1"
      : "opacity-80 hover:opacity-100 transition";

  return (
    <nav
      className=" bg-mainBg text-mainText p-4 shadow-lg border-b border-gray-200 dark:border-gray-800"
    >
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold text-indigo-500 flex items-center gap-2"
        >
          Moodify 🎵🎬
        </Link>

        {/* Right side */}
        <div className="flex items-center space-x-6">
          {user ? (
            <>
              <Link to="/dashboard" className={isActive("/dashboard")}>
                Dashboard
              </Link>

              <Link to="/songs" className={isActive("/songs")}>
                Songs
              </Link>

              <Link to="/movies" className={isActive("/movies")}>
                Movies
              </Link>

              {/* Profile / Actions */}
              <div className="flex items-center gap-4 border-l border-gray-300 dark:border-gray-700 pl-4">
                <Link to="/profile">
                  <img
                    src={user.profileIcon || "/icons/default.png"}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover
                               border border-gray-300 dark:border-gray-700
                               hover:opacity-80 transition"
                  />
                </Link>

                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-500
                             text-white px-4 py-2 rounded
                             text-sm font-bold transition"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className={isActive("/login")}>
                Login
              </Link>

              <Link
                to="/signup"
                className="bg-indigo-500 hover:bg-indigo-600
                           text-white px-5 py-2 rounded-full
                           font-bold transition shadow-lg shadow-indigo-500/20"
              >
                Sign Up
              </Link>
            </>
          )}
          {/* 🌗 Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800 hover:scale-110 transition"
            title="Toggle theme"
          >
            {theme === "dark" ? "🌙" : "☀️"}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
