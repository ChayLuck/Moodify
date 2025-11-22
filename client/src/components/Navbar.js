import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  
  // Tarayıcı hafızasından giriş yapmış kullanıcıyı kontrol et
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user'); // Hafızayı temizle
    navigate('/login'); // Giriş sayfasına at
    window.location.reload(); // Sayfayı yenile ki Navbar güncellensin
  };

  return (
    <nav className="bg-gray-900 text-white p-4 shadow-lg border-b border-gray-800">
      <div className="container mx-auto flex justify-between items-center">
        
        {/* LOGO */}
        <Link to="/" className="text-2xl font-bold text-green-500 flex items-center gap-2">
          Moodify 🎵🎬
        </Link>

        {/* LİNKLER */}
        <div className="flex items-center space-x-6">
          
          {user ? (
            // --- GİRİŞ YAPMIŞ KULLANICI İÇİN ---
            <>
              <Link to="/dashboard" className="hover:text-green-400 transition font-medium">
                Dashboard
              </Link>
              
              <Link to="/profile" className="hover:text-green-400 transition font-medium">
                Profilim
              </Link>

              <Link to="/songs" className="hover:text-green-400 transition">
                Şarkılar
              </Link>

              <Link to="/movies" className="hover:text-yellow-400 transition">
                Filmler
              </Link>

              <div className="flex items-center gap-4 border-l border-gray-700 pl-4">
                <span className="text-gray-400 text-sm hidden md:block">
                  {user.username}
                </span>
                
                <button 
                  onClick={handleLogout} 
                  className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded text-sm font-bold transition"
                >
                  Çıkış
                </button>
              </div>
            </>
          ) : (
            // --- GİRİŞ YAPMAMIŞ KULLANICI İÇİN ---
            <>
              <Link to="/login" className="hover:text-green-400 transition">
                Giriş Yap
              </Link>
              
              <Link to="/signup" className="bg-green-600 hover:bg-green-500 text-white px-5 py-2 rounded-full font-bold transition shadow-lg shadow-green-500/20">
                Kayıt Ol
              </Link>
              
            </>
          )}

        </div>
      </div>
    </nav>
  );
};

export default Navbar;