import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from './images/logo.png'; // Left-side illustration logo
import TalentHubImage from './images/talenthub.png';
import { Slot } from '@radix-ui/react-slot';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://localhost:3000/api/login', { email, password });
      const user = response.data;
      if (response.status === 200) {
        const userData = response.data.user;
        const token = response.data.token;
        localStorage.setItem('user', JSON.stringify({ id: userData.id, role: userData.role, email: userData.email }));
        localStorage.setItem('token', token);

        if (userData.role === 'admin') navigate('/admin-dashboard');
        else if (userData.role === 'power_user') navigate('/power-user-dashboard');
        else if (userData.role === 'user') navigate('/user-details', { state: { candidate: user } });
      } else setError('Invalid credentials');
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please check your email or password.');
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Left Section (Hidden in mobile view) */}
      <div className="hidden md:flex w-1/2 bg-white flex-col items-center justify-center p-6 relative">
        <img src={logo} alt="Illustration" className="w-4/5 object-contain mb-32 mt-24" />
        <p className="text-xs text-gray-500 absolute bottom-5 w-full text-center">
          Top-rated technology expertise for your digital journey
        </p>
      </div>

      {/* Right Section */}
      <div className="w-full md:w-1/2 bg-white flex flex-col items-center p-6 justify-start mt-10 md:mt-24">
        {/* Logo and Title */}
        <div className="flex items-center justify-center space-x-4 mb-6 md:mt-0">
          <img src={TalentHubImage} alt="OneVector Logo" className="w-[60px] h-[80px]" />
          <h1 className="text-6xl font-normal text-gray-800">TalentHub</h1>
        </div>

        <h3 className="text-3xl font-bold text-gray-800 text-left w-full max-w-[450px] mb-5 mt-10 md:mt-8">
          Login
        </h3>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-[450px] mb-8">
          <input
            type="email"
            placeholder="Enter Your username or Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full h-[60px] p-4 mb-5 border border-gray-300 rounded-xl text-xl text-gray-800 focus:outline-none transition-all duration-300 hover:scale-105 focus:ring-2 focus:ring-gray-500"
          />
          <input
            type="password"
            placeholder="Enter Your Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full h-[60px] p-4 mb-5 border border-gray-300 rounded-xl text-xl text-gray-800 focus:outline-none transition-all duration-300 hover:scale-105 focus:ring-2 focus:ring-gray-500"
          />
          <div className="flex justify-center">
            <Slot asChild>
              <button
                type="submit"
                className="w-[50%] py-3 rounded-xl text-white font-bold bg-gradient-to-r from-[#15BACD] to-[#094DA2] text-xl cursor-pointer hover:scale-105 transition-transform duration-300 focus:ring-2 focus:ring-gray-500"
              >
                Login
              </button>
            </Slot>
          </div>
        </form>

        {/* Bottom Text (Visible only on Mobile) */}
        <p className="text-xs text-gray-500 mt-6 text-center px-4 block md:hidden">
          Top-rated technology expertise for your digital journey
        </p>

        {/* Error Message */}
        {error && <p className="text-red-600 mt-4">{error}</p>}
      </div>
    </div>
  );
}

export default Login;
