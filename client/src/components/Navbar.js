import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Navbar = () => {
  const navigate = useNavigate();

  // localStorage'daki user'ı state'e alıyoruz
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user"))
  );

  // localStorage değiştiğinde Navbar otomatik güncellensin
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

  return (
    <nav className="bg-gray-900 text-white p-4 shadow-lg border-b border-gray-800">
      <div className="container mx-auto flex justify-between items-center">
        {/* LOGO */}
        <Link
          to="/"
          className="text-2xl font-bold text-green-500 flex items-center gap-2"
        >
          Moodify 🎵🎬
        </Link>

        {/* LINKS */}
        <div className="flex items-center space-x-6">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="hover:text-green-400 transition font-medium"
              >
                Dashboard
              </Link>

              <Link
                to="/profile"
                className="hover:text-green-400 transition font-medium"
              >
                My Profile
              </Link>

              <Link to="/songs" className="hover:text-green-400 transition">
                Songs
              </Link>

              <Link to="/movies" className="hover:text-yellow-400 transition">
                Movies
              </Link>

              <div className="flex items-center gap-4 border-l border-gray-700 pl-4">
                {/* PROFILE ICON */}
                <Link to="/profile">
                  <img
                    src={user.profileIcon || "/icons/default.png"}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover border border-gray-700 hover:opacity-80 transition"
                  />
                </Link>

                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded text-sm font-bold transition"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-green-400 transition">
                Login
              </Link>

              <Link
                to="/signup"
                className="bg-green-600 hover:bg-green-500 text-white px-5 py-2 rounded-full font-bold transition shadow-lg shadow-green-500/20"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
