import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const navigate = useNavigate();
  const { email, password } = formData;

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);

      if (response.data) {
        // 1. Token'ı yerel hafızaya kaydet (Tarayıcı kapatılsa bile giriş açık kalır)
        localStorage.setItem('user', JSON.stringify(response.data));
        
        alert("Giriş Başarılı! Hoşgeldiniz 🎵");
        navigate('/dashboard'); // Dashboard'a yönlendir
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Giriş başarısız!");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-900">
      <div className="bg-gray-800 p-10 rounded-lg shadow-xl w-96 border border-gray-700">
        <h1 className="text-3xl font-bold text-green-500 mb-6 text-center">Giriş Yap</h1>
        
        <form onSubmit={onSubmit} className="space-y-4">
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
            Giriş Yap
          </button>
        </form>

        <p className="text-gray-400 text-sm text-center mt-4">
          Hesabın yok mu? <Link to="/signup" className="text-green-400 hover:underline">Kayıt Ol</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;