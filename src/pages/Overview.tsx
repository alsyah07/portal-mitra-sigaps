import React, { useState, useEffect, useMemo } from 'react';
import { Timesheet } from '../types';
import { motion } from 'motion/react';
import { 
  Users, 
  Clock,
  CheckCircle,
  ChevronRight,
  TrendingUp,
  PieChart as PieChartIcon,
  Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ActivityChart, StatusDonut } from '../components/OverviewCharts';

export default function Overview() {
  const { user, token } = useAuth();
  const [data, setData] = useState<any>(null);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_API}dashboard-overview/${user.code_customer}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.status === 'success') {
        setData(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  // Use data from API or defaults
  const activityData = data?.activityData || [];
  const statusStats = data?.statusStats || { pending: 0, approved: 0 };
  const successRate = data?.successRate || "98.2";
  const topDrivers = data?.topDrivers || [];
  const totalWorkforce = data?.totalWorkforce || 1240;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-10 max-w-full mx-auto pb-20"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
            <h3 className="text-3xl font-black text-gray-900 tracking-tight">Operational Insights</h3>
            <p className="text-sm font-medium text-gray-500">Real-time performance metrics and logistical data.</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-2xl shadow-sm">
          <Calendar size={16} className="text-gray-400" />
          <span className="text-xs font-bold text-gray-600">
            {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group relative overflow-hidden"
        >
            <div className="absolute -top-6 -right-6 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-500 group-hover:scale-110">
              <Users size={160} />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-4">Total Workforce</p>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-black text-gray-900 tracking-tighter">{totalWorkforce.toLocaleString()}</span>
              <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-xl flex items-center gap-1">
                <TrendingUp size={12} /> +12.5%
              </span>
            </div>
            <p className="text-xs text-gray-400 font-medium mt-4">Active across all operational zones</p>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-l-8 border-l-amber-500 overflow-hidden relative group"
        >
            <div className="absolute -top-6 -right-6 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-500 group-hover:rotate-12">
              <Clock size={160} />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-4 text-amber-600/60">Pending Review</p>
            <p className="text-5xl font-black text-gray-900 tracking-tighter">
              {statusStats.pending}
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="h-2.5 flex-1 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '45%' }}
                    className="h-full bg-amber-500" 
                  />
              </div>
              <span className="text-[10px] font-extrabold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">URGENT</span>
            </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-gray-900 rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.15)] text-white relative group overflow-hidden"
        >
            <div className="absolute -bottom-10 -right-10 p-8 opacity-10 blur-2xl">
              <CheckCircle size={220} />
            </div>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.25em] mb-4">Operations Score</p>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-black tracking-tighter">{successRate}<span className="text-2xl text-white/40 ml-1">%</span></span>
            </div>
            <div className="mt-8">
              <button onClick={() => navigate('/dashboard/approve')} className="group/btn flex items-center gap-2 bg-white/10 hover:bg-white text-white hover:text-gray-900 px-6 py-3.5 rounded-2xl text-xs font-bold transition-all border border-white/5 shadow-xl">
                View Performance Report
                <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Chart - Spans 2 columns */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl">
                <TrendingUp size={20} />
              </div>
              <div>
                <h4 className="text-lg font-black text-gray-900 leading-none">Timesheet Activity</h4>
                <p className="text-xs font-medium text-gray-400 mt-1">Daily volume trend for the last 14 days</p>
              </div>
            </div>
          </div>
          <ActivityChart data={activityData} />
        </div>

        {/* Status Distribution */}
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex items-center gap-3 mb-10">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <PieChartIcon size={20} />
            </div>
            <div>
              <h4 className="text-lg font-black text-gray-900 leading-none">Approval Status</h4>
              <p className="text-xs font-medium text-gray-400 mt-1">Completion distribution</p>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center h-[200px]">
            <StatusDonut pending={statusStats.pending} approved={statusStats.approved} />
          </div>
          <div className="mt-8 pt-8 border-t border-gray-50">
             <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <span>Efficiency Rate</span>
                <span className="text-emerald-500">Optimized</span>
             </div>
             <div className="mt-2 h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '88%' }}
                  className="h-full bg-emerald-500"
                />
             </div>
          </div>
        </div>
      </div>

      {/* Top Drivers Section */}
      <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Users size={20} />
            </div>
            <div>
              <h4 className="text-lg font-black text-gray-900 leading-none">Top Performing Drivers</h4>
              <p className="text-xs font-medium text-gray-400 mt-1">Based on recent passenger ratings</p>
            </div>
          </div>
          <button onClick={() => navigate('/dashboard/driver-database')} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
            View All Drivers
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {topDrivers.map((driver: any, i: number) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4, backgroundColor: 'rgba(79, 70, 229, 0.05)' }}
              className="flex items-center gap-4 p-4 rounded-3xl border border-gray-50 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-sm group-hover:scale-110 transition-transform overflow-hidden">
                {driver.photo ? (
                  <img src={driver.photo} alt={driver.name} className="w-full h-full object-cover" />
                ) : (
                  driver.name.split(' ').map((n: any) => n[0]).join('')
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-gray-900 truncate">{driver.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-bold text-gray-400">{driver.id}</span>
                  <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md ${
                    driver.status === 'VIP' ? 'bg-amber-100 text-amber-700' : 
                    driver.status === 'Premium' ? 'bg-sky-100 text-sky-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {driver.status}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-amber-500">
                  <span className="text-xs font-black">{driver.rating}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
