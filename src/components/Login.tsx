import React, { useState } from 'react';
import { User } from '../types';
import { LogIn, Mail, Lock, Loader2, Instagram, Facebook, Linkedin, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginProps {
  onLogin: (user: User, token: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_URL_API}login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        onLogin(data.data, data.token);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans overflow-hidden">
      {/* Left Side: Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center z-0 scale-110 transition-transform duration-[10000ms] ease-out"
          style={{ backgroundImage: 'url("/login_hero_luxury_logo_sigap_bg.png")' }}
        />
        <div className="absolute inset-0 bg-black/60 z-10 backdrop-blur-[2px]" />
        
        {/* Hero Content */}
        <div className="relative z-20 flex flex-col justify-between w-full p-16">
          {/* Logo */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10"
          >
            <img src="/logo_sigaps.png" alt="SIGAP Logo" className="h-8 w-auto object-contain brightness-0 invert" />
          </motion.div>

          {/* Welcome Text */}
          <div className="space-y-6">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-6xl font-black text-white leading-tight tracking-tighter"
            >
              Welcome back!<br />
              <span className="text-blue-500 text-5xl">To Portal Mitra SIGAP</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-gray-400 text-lg max-w-md leading-relaxed"
            >
              Manage your driver network, monitor daily timesheets, and streamline operational workflows through our secure SIGAP partner portal.
            </motion.p>
            
            {/* Social Icons */}
            
          </div>

          {/* Copyright */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-500 text-xs font-medium"
          >
            © 2025 Sigap. All Rights Reserved
          </motion.p>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-16 bg-white relative">
        <div className="w-full max-w-[420px] space-y-10">
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col"
            >
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                Portal Mitra <span className="text-blue-600">SIGAP</span>
              </h2>
            </motion.div>
            <motion.p 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-gray-400 font-medium pl-1"
            >
              Please enter your authorized credentials to access the partner management system.
            </motion.p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-bold"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500 ml-1">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-100/50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-300"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500 ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-100/50 border-none rounded-2xl py-4 pl-12 pr-12 text-sm font-bold text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-300"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input type="checkbox" className="peer appearance-none h-5 w-5 rounded-lg border-2 border-gray-200 checked:bg-blue-600 checked:border-blue-600 transition-all cursor-pointer" />
                  <div className="absolute opacity-0 peer-checked:opacity-100 text-white pointer-events-none transition-opacity">
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M0 11l2-2 5 5L18 3l2 2L7 18z" /></svg>
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-500 group-hover:text-gray-700 transition-colors">Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3 group"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span className="text-lg">Login</span>
                  <div className="h-1.5 w-1.5 rounded-full bg-white group-hover:animate-ping" />
                </>
              )}
            </button>
          </form>

          {/* System Version */}
          <div className="pt-10 flex flex-col items-center gap-2">
            <div className="h-px w-full bg-gray-100" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">System v1.0.0</span>
          </div>
        </div>

        {/* Decorative corner element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full opacity-50" />
      </div>
    </div>
  );
}
