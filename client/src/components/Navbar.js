import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";

const NAV_H = 80; // px

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

  const isActive = (path) =>
    location.pathname === path
      ? "border-b-2 border-indigo-500 pb-1"
      : "opacity-80 hover:opacity-100 transition";

  return (
    <nav
      className="bg-mainBg text-mainText shadow-lg border-b border-gray-200 dark:border-gray-800"
      style={{ height: NAV_H }}
    >
      <div className="mx-auto max-w-7xl h-full px-4 md:px-6 flex items-center justify-between">
        {/* Logo (asla kaymasın) */}
        <Link
          to="/"
          className="text-2xl font-bold text-indigo-400 leading-none whitespace-nowrap shrink-0"
        >
          Moodify
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3 md:gap-6 flex-nowrap">
          {user ? (
            <>
              {/* Linkler küçük ekranda gizli (wrap yapmasın diye) */}
              <div className="hidden md:flex items-center gap-6">
                <Link to="/dashboard" className={`${isActive("/dashboard")} whitespace-nowrap`}>
                  Dashboard
                </Link>
                <Link to="/songs" className={`${isActive("/songs")} whitespace-nowrap`}>
                  Songs
                </Link>
                <Link to="/movies" className={`${isActive("/movies")} whitespace-nowrap`}>
                  Movies
                </Link>
              </div>

              {/* Profile / Actions */}
              <div className="flex items-center gap-3 md:gap-4 border-l border-gray-300 dark:border-gray-700 pl-3 md:pl-4">
                <Link to="/profile" className="flex items-center">
                  <img
                    src={user.profileIcon || "/icons/default.png"}
                    alt="Profile"
                    className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover
                               border border-gray-300 dark:border-gray-700
                               hover:opacity-80 transition shrink-0"
                  />
                </Link>

                {/* Logout küçük ekranda daha kompakt */}
                <button
                  onClick={handleLogout}
                  className="bg-red-700 hover:bg-red-500 text-white
                           px-4 md:px-5 py-2 rounded-full
                           font-bold transition shadow-lg shadow-indigo-500/20 whitespace-nowrap"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className={`${isActive("/login")} whitespace-nowrap`}>
                Login
              </Link>

              <Link
                to="/signup"
                className="bg-indigo-500 hover:bg-indigo-600
                           text-white px-4 md:px-5 py-2 rounded-full
                           font-bold transition shadow-lg shadow-indigo-500/20 whitespace-nowrap"
              >
                Sign Up
              </Link>
            </>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-full
                       bg-gray-200 dark:bg-gray-800 hover:scale-110 transition shrink-0"
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
