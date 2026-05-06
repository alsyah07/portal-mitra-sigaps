import React, { useState, useEffect } from 'react';
import { Timesheet } from '../types';
import { motion } from 'motion/react';
import { 
  Users, 
  Clock,
  CheckCircle,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Overview() {
  const { user, token } = useAuth();
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const navigate = useNavigate();

  const fetchTimesheets = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_API}datatimesheets/${user.code_customer}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.status === 'success' || result.status === 200) {
        setTimesheets(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch timesheets:', err);
    }
  };

  useEffect(() => {
    fetchTimesheets();
  }, [user]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-10 max-w-full mx-auto"
    >
      <div className="space-y-1">
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">Business Overview</h3>
          <p className="text-sm font-medium text-gray-500">Real-time performance metrics and logistical data.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white border border-gray-200 rounded-[2rem] p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] group relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
              <Users size={120} />
            </div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Total Workforce</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-gray-900 tracking-tighter">1,240</span>
              <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-lg">+12.5%</span>
            </div>
            <p className="text-[11px] text-gray-400 font-medium mt-4 italic">Active across all active regions</p>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white border border-gray-200 rounded-[2rem] p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border-l-8 border-l-amber-500 overflow-hidden relative group"
        >
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
              <Clock size={120} />
            </div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Waiting Review</p>
            <p className="text-4xl font-black text-gray-900 tracking-tighter">
              {timesheets.filter(t => (t.approved_timesheets[0]?.status_approve ?? 0) === 0).length}
            </p>
            <div className="mt-6 flex items-center gap-2">
              <div className="h-2 flex-1 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: '45%' }} />
              </div>
              <span className="text-[10px] font-bold text-amber-600">Urgent</span>
            </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-gray-900 rounded-[2rem] p-8 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] text-white relative group overflow-hidden"
        >
            <div className="absolute -bottom-10 -right-10 p-8 opacity-10 blur-xl">
              <CheckCircle size={200} />
            </div>
            <p className="text-xs font-bold text-white/40 uppercase tracking-[0.2em] mb-4">Success Rate</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black tracking-tighter">98.2<span className="text-xl text-white/40">%</span></span>
            </div>
            <div className="mt-8">
              <button onClick={() => navigate('/dashboard/approve')} className="group/btn flex items-center gap-2 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-2xl text-xs font-bold transition-all border border-white/5">
                View Details
                <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
