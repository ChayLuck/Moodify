import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Songs from "./pages/Songs";
import Movies from "./pages/Movies";
import { ToastProvider } from "./context/ToastContext";
import Chatbot from "./components/Chatbot";

import { useState } from "react";

// Asıl içerik (Router'ın içinde çalışacak)
function AppContent() {
  const [openChat, setOpenChat] = useState(false);
  const [showChatHint, setShowChatHint] = useState(true);

  const location = useLocation();

  // Chatbot'un görünmemesi gereken sayfalar
  const hideChatbotRoutes = ["/login", "/signup"];

  const shouldShowChatbot = !hideChatbotRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-800 relative">
      <Navbar />

      {/* ROUTES */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/songs" element={<Songs />} />
        <Route path="/movies" element={<Movies />} />
      </Routes>

      {/* CHATBOT ICON + TOOLTIP - sadece login/signup HARİCİNDE */}
      {shouldShowChatbot && (
        <>
          {/* Tooltip + Icon */}
          <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
            {/* Tooltip */}
            {showChatHint && (
              <div className="relative bg-gray-900 text-white px-3 py-2 rounded-xl shadow-lg text-sm w-max">
                <button
                  onClick={() => setShowChatHint(false)}
                  className="absolute top-1.5 right-2 text-gray-400 hover:text-gray-200 text-[13px]"
                >
                  ×
                </button>

                <p className="font-semibold text-[14px]">Hey there 👋</p>
                <p className="text-gray-300 text-[12px]">
                  Need more recommendations?
                </p>

                <div className="absolute -bottom-2 right-6 w-3 h-3 bg-gray-900 rotate-45" />
              </div>
            )}

            {/* Chatbot Button */}
            <button
              onClick={() => {
                setOpenChat(true);
                setShowChatHint(false); // tıklayınca balon da kapansın
              }}
              className="w-14 h-14 rounded-full shadow-xl hover:scale-105 transition bg-transparent"
            >
              <img
                src="/bot.png"
                alt="chatbot"
                className="w-full h-full object-contain"
              />
            </button>
          </div>

          {/* Chatbot Panel */}
          {openChat && (
            <Chatbot
              onClose={() => setOpenChat(false)}
            />
          )}
        </>
      )}
    </div>
  );
}

// Router + ToastProvider burada sarıyor
function App() {
  return (
    <ToastProvider>
      <Router>
        <AppContent />
      </Router>
    </ToastProvider>
  );
}

export default App;
