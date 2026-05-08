import React, { useState, useEffect } from 'react';
import { Driver } from '../types';
import { motion } from 'motion/react';
import { 
  Search,
  Filter,
  FileText,
  Building2,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function DriverTimesheets() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchDrivers = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_URL_API_DRIVER}drivers/code_company/${user.code_customer}`);
      const result = await response.json();
      
      if (result.data) {
        const mappedDrivers: Driver[] = result.data.map((d: any) => ({
          id: d.id,
          driver_code: d.employee_id,
          employee_id: d.employee_id,
          nama_lengkap: d.full_name,
          phone: d.phonenumber || '-',
          foto: d.photo || null,
          status: 'Active',
          company_name: d.company_name,
          iwo_name: d.iwo_name,
          user_name: d.user_name,
          code_customer: d.code_customer,
          phonenumber: d.phonenumber,
          home_address: d.home_address
        }));
        setDrivers(mappedDrivers);
      }
    } catch (err) {
      console.error('Failed to fetch drivers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, [user]);

  const filteredDrivers = drivers.filter(d => 
    d.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedDrivers = filteredDrivers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <div className="h-8 w-1.5 bg-blue-600 rounded-full shadow-sm" />
            Driver Timesheets
          </h3>
          <p className="text-sm font-medium text-gray-500">Select a driver to view detailed timesheet calculations and reports.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-[32px] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-[#fcfcfa]/50">
          <div className="relative w-full max-w-sm">
            <input
              type="text"
              placeholder="Search driver by name or ID..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
          </div>
          <button className="bg-white border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all flex items-center gap-2">
            <Filter size={14} />
            Filter Period
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#fcfcfa]/80 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-gray-100">
              <tr>
                <th className="px-8 py-5">No</th>
                <th className="px-8 py-5">Photo</th>
                <th className="px-8 py-5">Driver Info</th>
                <th className="px-8 py-5">Phone</th>
                <th className="px-8 py-5">
                  <div className="flex items-center gap-2">
                    <Calendar size={12} />
                    PERIODE SETTLEMENT
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-gray-400 font-bold uppercase tracking-widest italic">
                    Synchronizing Payroll Data...
                  </td>
                </tr>
              ) : paginatedDrivers.map((driver, index) => (
                <tr key={driver.id} className="hover:bg-blue-50/40 group transition-all">
                  <td className="px-8 py-6 text-xs font-black text-gray-300">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td className="px-8 py-6">
                    <div 
                      onClick={() => navigate(`/dashboard/timesheets/calculation/${driver.employee_id}`)}
                      className="h-10 w-10 rounded-xl bg-gray-100 overflow-hidden border border-gray-200 cursor-pointer hover:scale-110 transition-transform duration-300"
                    >
                       <img 
                        src={driver.foto || `https://ui-avatars.com/api/?name=${driver.nama_lengkap}&background=1e3a5f&color=fff&bold=true`} 
                        alt="" 
                        className="w-full h-full object-cover"
                       />
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div 
                      onClick={() => navigate(`/dashboard/timesheets/calculation/${driver.employee_id}`)}
                      className="flex flex-col cursor-pointer group/info"
                    >
                      <span className="text-sm font-black text-gray-900 group-hover/info:text-blue-600 transition-colors">{driver.nama_lengkap}</span>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{driver.employee_id}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs font-bold text-gray-700">{driver.phonenumber || '-'}</span>
                  </td>
                  {/* <td className="px-8 py-6">
                    <span className="text-[10px] font-bold text-gray-400 line-clamp-2 max-w-[150px]">{driver.home_address || '-'}</span>
                  </td> */}
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      {Array.from({ length: 3 }).map((_, i) => {
                        const date = new Date();
                        const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
                        const label = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
                        const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                        
                        return (
                          <button 
                            key={i}
                            onClick={() => navigate(`/dashboard/timesheets/calculation/${driver.employee_id}?period=${value}`)}
                            className={i === 0 
                              ? "flex items-center gap-1.5 text-[10px] font-black text-white bg-[#6366f1] px-4 py-2 rounded-xl shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 uppercase tracking-widest"
                              : "flex items-center gap-1.5 text-[10px] font-black text-[#3b82f6] bg-white border-2 border-blue-500 px-4 py-2 rounded-xl hover:bg-blue-50 transition-all active:scale-95 uppercase tracking-widest"
                            }
                          >
                            <Calendar size={12} />
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-8 py-5 border-t border-gray-100 flex items-center justify-between bg-white">
           <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="px-4 py-2 border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 disabled:opacity-30"
           >
            Prev
           </button>
           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Page {currentPage} of {Math.ceil(filteredDrivers.length / itemsPerPage) || 1}</span>
           <button 
            disabled={currentPage === Math.ceil(filteredDrivers.length / itemsPerPage)}
            onClick={() => setCurrentPage(p => p + 1)}
            className="px-4 py-2 border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 disabled:opacity-30"
           >
            Next
           </button>
        </div>
      </div>
    </motion.div>
  );
}
