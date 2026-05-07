import React, { useState, useEffect } from 'react';
import { Driver } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Search,
  Filter,
  Eye,
  Pencil,
  Clock,
  UserSquare2,
  ChevronLeft,
  ChevronRight,
  X,
  ShieldCheck,
  Building2,
  IdCard,
  Briefcase,
  MapPin,
  ExternalLink
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

export default function DriverDatabase() {
  const { user } = useAuth();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [driverPage, setDriverPage] = useState(1);
  const [driverItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  const fetchDrivers = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_URL_API_DRIVER}drivers/code_company/${user.code_customer}`);
      console.log(`${import.meta.env.VITE_URL_API_DRIVER}drivers/code_company/${user.code_customer}`);
      const result = await response.json();
      
      if (result.data) {
        // Map the new API structure to our Driver interface
        const mappedDrivers: Driver[] = result.data.map((d: any) => ({
          id: d.employee_id,
          driver_code: d.employee_id,
          employee_id: d.employee_id,
          nama_lengkap: d.full_name,
          phone: d.phonenumber || '-',
          foto: d.photo, 
          status: 'Active',
          company_name: d.company_name,
          iwo_name: d.iwo_name,
          user_name: d.user_name,
          code_customer: d.code_customer,
          phonenumber: d.phonenumber,
          home_address: d.home_address,
          phone_number2: d.phone_number2,
          phone_number3: d.phone_number3,
          ktp_number: d.ktp_number,
          birth_date: d.birth_date,
          usia: d.usia,
          company_id: d.company_id
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
    d.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.id.includes(searchTerm)
  );

  const paginatedDrivers = filteredDrivers.slice((driverPage - 1) * driverItemsPerPage, driverPage * driverItemsPerPage);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-8 max-w-full mx-auto"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <div className="h-8 w-1.5 bg-blue-600 rounded-full shadow-sm shadow-blue-200" />
            Driver Database
          </h3>
          <p className="text-sm font-medium text-gray-500">Registry of all active logistics personnel for {user?.nama_customer}.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {drivers.length} Active Drivers
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-[32px] overflow-hidden shadow-sm ring-1 ring-black/[0.02]">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-[#fcfcfa]/50">
          <div className="relative group w-full max-w-sm">
            <input
              type="text"
              placeholder="Search by name, ID or employee code..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setDriverPage(1); }}
              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm bg-white hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium"
            />
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <div className="flex items-center gap-3">
            <button className="bg-white border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm">
              <Filter size={14} />
              Filter
            </button>
            <button className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-600 transition-all flex items-center gap-2 shadow-lg shadow-gray-200 active:scale-95">
              <UserSquare2 size={14} />
              Add New Driver
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#fcfcfa]/80 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-gray-100">
              <tr>
                <th className="px-8 py-5">No</th>
                <th className="px-8 py-5">Photo</th>
                <th className="px-8 py-5">Profile</th>
                <th className="px-8 py-5">Phone</th>
                <th className="px-8 py-5">Address</th>
                <th className="px-8 py-5">Company / Project</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-10 w-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest italic">Synchronizing Cluster...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedDrivers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                       <Search size={32} className="text-gray-200" />
                       <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No matching records found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedDrivers.map((driver, index) => (
                  <motion.tr 
                    key={driver.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-blue-50/40 group transition-all duration-300"
                  >
                    <td className="px-8 py-6 text-xs font-black text-gray-300">{(driverPage - 1) * driverItemsPerPage + index + 1}</td>
                    <td className="px-8 py-6">
                      <div 
                        onClick={() => setSelectedDriver(driver)}
                        className="relative shrink-0 w-fit cursor-pointer group/photo hover:scale-110 transition-all duration-300"
                      >
                        <div className="h-12 w-12 rounded-2xl p-0.5 bg-gradient-to-tr from-blue-500 to-indigo-600 shadow-md group-hover/photo:shadow-blue-200">
                          <img 
                            src={driver.foto || `https://ui-avatars.com/api/?name=${driver.nama_lengkap}&background=fff&color=1e3a5f&bold=true&font-size=0.4`} 
                            alt={driver.nama_lengkap}
                            className="w-full h-full rounded-[14px] object-cover bg-white"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white" title="Active" />
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div 
                        onClick={() => setSelectedDriver(driver)}
                        className="flex flex-col cursor-pointer group/profile"
                      >
                        <span className="text-sm font-black text-gray-900 tracking-tight group-hover/profile:text-blue-600 transition-colors">{driver.nama_lengkap}</span>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{driver.employee_id}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-bold text-gray-700">{driver.phonenumber || '-'}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-bold text-gray-400 line-clamp-2 max-w-[150px]">{driver.home_address || '-'}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <Building2 size={12} className="text-gray-400" />
                          <span className="text-xs font-bold text-gray-700 truncate max-w-[200px]">{driver.company_name}</span>
                        </div>
                        {/* <div className="flex items-center gap-1.5">
                          <Briefcase size={12} className="text-gray-400" />
                          <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{driver.iwo_name}</span>
                        </div> */}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setSelectedDriver(driver)}
                          title="View Details"
                          className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        >
                          <Eye size={18} />
                        </button>
                        {/* <button 
                          title="Edit Profile"
                          className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        >
                          <Pencil size={18} />
                        </button> */}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Standardized Pagination Footer */}
        <div className="px-8 py-5 border-t border-gray-100 flex items-center justify-between bg-white text-sm">
          <button 
            onClick={() => setDriverPage(p => Math.max(1, p - 1))}
            disabled={driverPage === 1}
            className="px-4 py-2 border border-gray-100 rounded-xl font-bold font-sans text-[11px] text-gray-400 hover:bg-gray-50 disabled:opacity-30 flex items-center gap-2 transition-all shadow-sm uppercase tracking-widest"
          >
            <ChevronLeft size={16} /> Prev
          </button>
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.ceil(filteredDrivers.length / driverItemsPerPage) }).map((_, i) => (
              <button
                key={i}
                onClick={() => setDriverPage(i + 1)}
                className={`h-9 w-9 rounded-xl text-[10px] font-black transition-all ${driverPage === i + 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 scale-110' : 'text-gray-400 hover:bg-gray-50'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setDriverPage(p => Math.min(Math.ceil(filteredDrivers.length / driverItemsPerPage) || 1, p + 1))}
            disabled={driverPage === Math.ceil(filteredDrivers.length / driverItemsPerPage) || filteredDrivers.length === 0}
            className="px-4 py-2 border border-gray-100 rounded-xl font-bold font-sans text-[11px] text-gray-400 hover:bg-gray-50 disabled:opacity-30 flex items-center gap-2 transition-all shadow-sm uppercase tracking-widest"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Driver Detail Modal */}
      <AnimatePresence>
        {selectedDriver && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDriver(null)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="relative h-32 bg-gradient-to-r from-blue-600 to-indigo-700">
                <button 
                  onClick={() => setSelectedDriver(null)}
                  className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-colors"
                >
                  <X size={20} />
                </button>
                <div className="absolute -bottom-12 left-10 p-1.5 bg-white rounded-[2rem] shadow-xl">
                   <div className="h-24 w-24 rounded-[1.75rem] bg-gray-100 overflow-hidden border-2 border-gray-50">
                      <img 
                        src={selectedDriver.foto || `https://ui-avatars.com/api/?name=${selectedDriver.nama_lengkap}&background=1e3a5f&color=fff&bold=true&font-size=0.4`} 
                        alt={selectedDriver.nama_lengkap} 
                        className="w-full h-full object-cover"
                      />
                   </div>
                </div>
              </div>

              <div className="pt-16 pb-10 px-10">
                <div className="flex items-end justify-between">
                  <div>
                    <h4 className="text-2xl font-black text-gray-900 tracking-tight">{selectedDriver.nama_lengkap}</h4>
                    <p className="text-sm font-black text-blue-600 uppercase tracking-widest mt-1">Personnel Detail</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-lg uppercase tracking-wider border border-emerald-100 flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Active status
                    </span>
                  </div>
                </div>

                <div className="mt-10 grid grid-cols-2 gap-6">
                  {/* Identification Card */}
                  <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 group hover:border-blue-200 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2.5 bg-white rounded-xl text-blue-600 shadow-sm">
                        <IdCard size={18} />
                      </div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Identification</span>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Employee Code</p>
                        <p className="text-sm font-black text-gray-900 tracking-tight mt-0.5">{selectedDriver.employee_id}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">KTP Number</p>
                        <p className="text-sm font-black text-gray-900 tracking-tight mt-0.5">{selectedDriver.ktp_number || '-'}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Birth Date</p>
                          <p className="text-sm font-black text-gray-900 tracking-tight mt-0.5">{selectedDriver.birth_date || '-'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Age</p>
                          <p className="text-sm font-black text-gray-900 tracking-tight mt-0.5">{selectedDriver.usia || '-'} Years</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Deployment Card */}
                  <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 group hover:border-indigo-200 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2.5 bg-white rounded-xl text-indigo-600 shadow-sm">
                        <Building2 size={18} />
                      </div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact & Deployment</span>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone Number</p>
                        <p className="text-sm font-black text-gray-900 tracking-tight mt-0.5">{selectedDriver.phonenumber || '-'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Home Address</p>
                        <p className="text-[11px] font-bold text-gray-600 tracking-tight mt-0.5 leading-relaxed">{selectedDriver.home_address || '-'}</p>
                      </div>
                      {/* <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Company Unit</p>
                        <p className="text-sm font-black text-gray-900 tracking-tight mt-0.5">{selectedDriver.company_name}</p>
                      </div> */}
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                      <Briefcase size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Customer Name</p>
                      <p className="text-sm font-black text-gray-900 tracking-tight">{selectedDriver.company_name}</p>
                    </div>
                  </div>
                  {/* <button className="h-10 w-10 bg-white hover:bg-blue-600 hover:text-white rounded-xl flex items-center justify-center text-blue-600 transition-all shadow-sm active:scale-95">
                    <ExternalLink size={18} />
                  </button> */}
                </div>

                {/* <div className="mt-8 flex gap-3">
                  <button 
                    onClick={() => setSelectedDriver(null)}
                    className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl text-sm font-black transition-all active:scale-95"
                  >
                    Close Registry
                  </button>
                  <button className="flex-[2] py-4 bg-[#1e3a5f] hover:bg-blue-600 text-white rounded-2xl text-sm font-black transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
                    <Pencil size={16} /> Edit Personnel Profile
                  </button>
                </div> */}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
