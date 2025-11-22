import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Songs from './pages/Songs';
import Movies from './pages/Movies';
import { ToastProvider } from "./context/ToastContext";

function App() {
  return (
   <ToastProvider>
    <Router>
      {/* Arka planı koyu gri yapıyoruz (Dark Mode hissi) */}
      <div className="min-h-screen bg-gray-800">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/songs" element={<Songs />} />
          <Route path="/movies" element={<Movies />} />
        </Routes>
      </div>
    </Router>
   </ToastProvider> 
  );
}

export default App;