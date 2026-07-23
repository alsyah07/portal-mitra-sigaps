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
  const [driverDetail, setDriverDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (selectedDriver) {
      fetchDriverDetail(selectedDriver.employee_id);
    } else {
      setDriverDetail(null);
    }
  }, [selectedDriver]);

  const fetchDriverDetail = async (employeeId: string) => {
    try {
      setLoadingDetail(true);
      const res = await fetch(`https://api_rekruitmen_go.sigapdriver.com/detail-data-by-employee/${employeeId}`);
      const data = await res.json();
      setDriverDetail(data?.data || data);
    } catch (err) {
      console.error('Failed to fetch driver details', err);
    } finally {
      setLoadingDetail(false);
    }
  };

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
                <th className="px-8 py-5">Usia</th>
                <th className="px-8 py-5">No. KTP</th>
                <th className="px-8 py-5">Profile</th>
                <th className="px-8 py-5">Phone</th>
                <th className="px-8 py-5">Address</th>
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
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} className="text-gray-400" />
                          <span className="text-xs font-bold text-gray-700">{driver.usia} Tahun</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <IdCard size={12} className="text-gray-400" />
                          <span className="text-xs font-bold text-gray-700">{driver.ktp_number}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div
                        onClick={() => setSelectedDriver(driver)}
                        className="flex flex-col cursor-pointer group/profile"
                      >
                        <span className="text-sm font-black text-blue-600 hover:underline tracking-tight transition-all">{driver.nama_lengkap}</span>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{driver.employee_id}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-bold text-gray-700">{driver.phonenumber || '-'}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-bold text-gray-400 line-clamp-2 max-w-[150px]">{driver.home_address || '-'}</span>
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDriver(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-[#f8fafc] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] ring-1 ring-white/50"
            >
              {/* Header Cover */}
              <div className="relative h-36 shrink-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-20 w-32 h-32 bg-blue-400/30 rounded-full blur-2xl"></div>

                <button
                  onClick={() => setSelectedDriver(null)}
                  className="absolute top-5 right-5 p-2.5 bg-black/10 hover:bg-black/20 rounded-2xl text-white transition-all backdrop-blur-md"
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
                <div className="absolute -bottom-12 left-10 p-1.5 bg-[#f8fafc] rounded-[2rem] shadow-lg">
                  <div className="h-24 w-24 rounded-[1.6rem] bg-white overflow-hidden border border-gray-100 group cursor-pointer">
                    <img
                      src={selectedDriver.foto || `https://ui-avatars.com/api/?name=${selectedDriver.nama_lengkap}&background=1e3a5f&color=fff&bold=true&font-size=0.4`}
                      alt={selectedDriver.nama_lengkap}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="pt-16 pb-10 px-10 overflow-y-auto">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <h4 className="text-3xl font-black text-slate-800 tracking-tight">{selectedDriver.nama_lengkap}</h4>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-[10px] font-black uppercase tracking-widest">
                        Personnel Detail
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-4 py-2 bg-emerald-100/50 text-emerald-700 text-[11px] font-black rounded-xl uppercase tracking-wider border border-emerald-200/50 flex items-center gap-2 shadow-sm backdrop-blur-sm">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      Active status
                    </span>
                  </div>
                </div>

                {loadingDetail ? (
                  <div className="mt-16 flex flex-col items-center justify-center py-12">
                    <div className="h-12 w-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-4" />
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Retrieving Data...</p>
                  </div>
                ) : (
                  <div className="mt-10 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Identification Card */}
                      <div className="p-7 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-blue-100/50"></div>
                        <div className="relative">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 shadow-sm border border-blue-100/50">
                              <IdCard size={20} strokeWidth={2.5} />
                            </div>
                            <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Identification</span>
                          </div>
                          <div className="space-y-5">
                            <div className="grid grid-cols-2 gap-5">
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Employee Code</p>
                                <p className="text-sm font-black text-slate-800 tracking-tight">{selectedDriver.employee_id}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">NPWP</p>
                                <p className="text-sm font-black text-slate-800 tracking-tight">{driverDetail?.form2?.no_npwp || '-'}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">KTP Number</p>
                              <p className="text-sm font-black text-slate-800 tracking-tight">{driverDetail?.form2?.no_ktp || selectedDriver.ktp_number || '-'}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Birth Date</p>
                                <p className="text-sm font-black text-slate-800 tracking-tight">{selectedDriver.birth_date || '-'}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Age / Gender</p>
                                <p className="text-sm font-black text-slate-800 tracking-tight">{selectedDriver.usia || '-'} Years / {driverDetail?.form2?.gender || '-'}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Religion</p>
                                <p className="text-sm font-black text-slate-800 tracking-tight">{driverDetail?.form2?.agama || '-'}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Marital Status</p>
                                <p className="text-sm font-black text-slate-800 tracking-tight">{driverDetail?.form2?.status_pernikahan || '-'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Contact Card */}
                      <div className="p-7 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-indigo-100/50"></div>
                        <div className="relative">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 shadow-sm border border-indigo-100/50">
                              <Building2 size={20} strokeWidth={2.5} />
                            </div>
                            <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Contact Information</span>
                          </div>
                          <div className="space-y-5">
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Phone Number</p>
                              <p className="text-sm font-black text-slate-800 tracking-tight">{driverDetail?.form1?.no_telphone || selectedDriver.phonenumber || '-'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Domicile Address</p>
                              <p className="text-sm font-bold text-slate-600 tracking-tight leading-relaxed">{driverDetail?.form2?.alamat_tempat_tinggal || selectedDriver.home_address || '-'}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Emergency Contact</p>
                              <p className="text-sm font-black text-slate-800 tracking-tight">{driverDetail?.form2?.nama_kontak_darurat || '-'} <span className="text-slate-500 font-bold ml-1">({driverDetail?.form2?.telpone_kontak_darurat || '-'})</span></p>
                              <p className="text-[11px] font-black text-indigo-500 uppercase tracking-widest mt-1">{driverDetail?.form2?.hubungan_kontak_darurat || '-'}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Qualifications Card */}
                      <div className="p-7 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/50 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-emerald-100/50"></div>
                        <div className="relative">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 shadow-sm border border-emerald-100/50">
                              <ShieldCheck size={20} strokeWidth={2.5} />
                            </div>
                            <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Qualifications & License</span>
                          </div>
                          <div className="space-y-5">
                            <div className="grid grid-cols-2 gap-5">
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Education</p>
                                <p className="text-sm font-black text-slate-800 tracking-tight">{driverDetail?.form2?.pendidikan_terakhir || '-'}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Defensive Driving</p>
                                <p className="text-sm font-black text-slate-800 tracking-tight">{driverDetail?.form2?.defensive_driving || '-'}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                              {driverDetail?.form2?.sim_a_nomor && (
                                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">SIM A</p>
                                  <p className="text-sm font-black text-slate-800 tracking-tight">{driverDetail.form2.sim_a_nomor}</p>
                                  <p className="text-[10px] font-bold text-slate-500 mt-0.5">Valid: {driverDetail.form2.sim_a_masa_berlaku?.substring(0, 10)}</p>
                                </div>
                              )}
                              {driverDetail?.form2?.sim_b1_nomor && (
                                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">SIM B1</p>
                                  <p className="text-sm font-black text-slate-800 tracking-tight">{driverDetail.form2.sim_b1_nomor}</p>
                                  <p className="text-[10px] font-bold text-slate-500 mt-0.5">Valid: {driverDetail.form2.sim_b1_masa_berlaku?.substring(0, 10)}</p>
                                </div>
                              )}
                              {driverDetail?.form2?.sim_b2_nomor && (
                                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">SIM B2</p>
                                  <p className="text-sm font-black text-slate-800 tracking-tight">{driverDetail.form2.sim_b2_nomor}</p>
                                  <p className="text-[10px] font-bold text-slate-500 mt-0.5">Valid: {driverDetail.form2.sim_b2_masa_berlaku?.substring(0, 10)}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Languages & Recommendation Card */}
                      <div className="p-7 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50/50 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-orange-100/50"></div>
                        <div className="relative">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-orange-50 rounded-2xl text-orange-600 shadow-sm border border-orange-100/50">
                              <Users size={20} strokeWidth={2.5} />
                            </div>
                            <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Languages & Referrals</span>
                          </div>
                          <div className="space-y-5">
                            <div className="grid grid-cols-2 gap-5">
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">English</p>
                                <p className="text-sm font-black text-slate-800 tracking-tight">{driverDetail?.form2?.bahasa_inggris || '-'}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Japanese</p>
                                <p className="text-sm font-black text-slate-800 tracking-tight">{driverDetail?.form2?.bahasa_jepang || '-'}</p>
                              </div>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Recommendation Info</p>
                              <p className="text-sm font-black text-slate-800 tracking-tight">{driverDetail?.form1?.nama_rekomendasi || '-'}</p>
                              {driverDetail?.form1?.no_telphone_rekomendasi && <p className="text-xs font-bold text-slate-500 mt-0.5">{driverDetail.form1.no_telphone_rekomendasi}</p>}

                              {driverDetail?.form1?.nama_pt_rekomendasi && (
                                <div className="mt-3 pt-3 border-t border-slate-200">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Recommendation PT</p>
                                  <p className="text-xs font-black text-slate-700 tracking-tight">{driverDetail.form1.nama_pt_rekomendasi}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Customer Info Card */}
                    {/* <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-[2rem] border border-blue-100/50 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-40 h-40 bg-white/40 rounded-full blur-3xl -mr-10 -mt-10"></div>
                      <div className="flex items-center gap-5 relative">
                        <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-white">
                          <Briefcase size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-blue-500 uppercase tracking-widest mb-1">Assigned Customer / Company Unit</p>
                          <p className="text-lg font-black text-slate-800 tracking-tight">{selectedDriver.company_name}</p>
                        </div>
                      </div>
                    </div> */}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
