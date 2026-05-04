import React, { useState } from 'react';
import { User } from '../types';
import { LogIn, ShieldCheck, Mail, Lock, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginProps {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        onLogin(data.user);
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
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px] overflow-hidden rounded-[32px] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-100"
      >
        <div className="relative bg-gray-900 p-10 text-center overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-indigo-600/10 blur-3xl" />
          
          <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[24px] bg-white/10 backdrop-blur-md border border-white/10 shadow-2xl">
            <ShieldCheck size={40} className="text-blue-400" />
          </div>
          <h1 className="relative text-3xl font-black tracking-tight text-white font-serif italic">Mitra<span className="text-blue-400">Portal</span></h1>
          <p className="relative mt-2 text-sm font-medium text-gray-400 uppercase tracking-[0.2em]">Management Access</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-10">
          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }}
              className="mb-8 rounded-2xl bg-rose-50 p-4 text-xs font-bold text-rose-600 border border-rose-100/50 flex items-center gap-3"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
              {error}
            </motion.div>
          )}
          
          <div className="space-y-8">
            <div className="group">
              <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-3 ml-1 group-focus-within:text-blue-600 transition-colors">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-300 group-focus-within:text-blue-400 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-2xl border-2 border-gray-50 bg-gray-50/50 py-4 pl-12 pr-4 text-sm font-bold tracking-tight outline-none focus:border-blue-600 focus:bg-white focus:ring-0 transition-all placeholder:text-gray-300"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>
            
            <div className="group">
              <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-3 ml-1 group-focus-within:text-blue-600 transition-colors">
                Secure Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-300 group-focus-within:text-blue-400 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-2xl border-2 border-gray-50 bg-gray-50/50 py-4 pl-12 pr-4 text-sm font-bold tracking-tight outline-none focus:border-blue-600 focus:bg-white focus:ring-0 transition-all placeholder:text-gray-300"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="relative group flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gray-900 py-4.5 font-black text-white shadow-xl shadow-gray-200 transition-all hover:bg-blue-600 hover:shadow-blue-200 active:scale-95 disabled:opacity-70"
            >
              <div className="relative z-10 flex items-center gap-3">
                {loading ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />}
                <span className="uppercase tracking-[0.1em] text-xs">Authorize Entry</span>
              </div>
            </button>
          </div>
          
          <div className="mt-10 flex items-center justify-center gap-2">
             <div className="h-px w-8 bg-gray-100" />
             <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">System v2.0.4</span>
             <div className="h-px w-8 bg-gray-100" />
          </div>
        </form>
      </motion.div>
    </div>
  );
}
