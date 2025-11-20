import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-gray-900 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-green-500">
          Moodify 🎵🎬
        </Link>

        {/* Linkler */}
        <div className="space-x-4">
          <Link to="/login" className="hover:text-green-400">Giriş Yap</Link>
          <Link to="/signup" className="bg-green-600 px-4 py-2 rounded hover:bg-green-500">
            Kayıt Ol
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;