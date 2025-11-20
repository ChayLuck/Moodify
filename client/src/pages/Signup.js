import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

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

    try {
      // Backend'e istek atıyoruz (Port 5000)
      const response = await axios.post('http://localhost:5000/api/auth/register', formData);
      
      if (response.data) {
        alert("Kayıt Başarılı! 🎉 Giriş yapabilirsiniz.");
        navigate('/login'); // Başarılıysa giriş sayfasına yönlendir
      }
    } catch (error) {
      console.error(error);
      // Backend'den gelen hata mesajını göster (Örn: "User already exists")
      alert(error.response?.data?.message || "Bir hata oluştu!");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-900">
      <div className="bg-gray-800 p-10 rounded-lg shadow-xl w-96 border border-gray-700">
        <h1 className="text-3xl font-bold text-green-500 mb-6 text-center">Kayıt Ol</h1>
        
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-gray-300 text-sm">Kullanıcı Adı</label>
            <input
              type="text"
              name="username"
              value={username}
              onChange={onChange}
              className="w-full p-2 mt-1 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Kullanıcı adın..."
              required
            />
          </div>

          <div>
            <label className="text-gray-300 text-sm">Email</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              className="w-full p-2 mt-1 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="ornek@email.com"
              required
            />
          </div>

          <div>
            <label className="text-gray-300 text-sm">Şifre</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={onChange}
              className="w-full p-2 mt-1 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="******"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            Kayıt Ol
          </button>
        </form>

        <p className="text-gray-400 text-sm text-center mt-4">
          Zaten hesabın var mı? <Link to="/login" className="text-green-400 hover:underline">Giriş Yap</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;