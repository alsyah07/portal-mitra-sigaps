import React, { useState, useEffect } from 'react';
import { Timesheet } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import Swal from 'sweetalert2';
import { 
  FileCheck, 
  CheckCircle, 
  XCircle, 
  Clock,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Filter,
  Eye,
  History,
  ShieldCheck,
  Pencil,
  Truck,
  Ban,
  Wallet,
  ReceiptText,
  Banknote,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ApproveDriver() {
  const { user, token } = useAuth();
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Data Table State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [selectedTimesheet, setSelectedTimesheet] = useState<Timesheet | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Timesheet>>({});
  
  // Expenses State
  const [expenses, setExpenses] = useState<any[]>([]);
  const [expensesLoading, setExpensesLoading] = useState(false);
  const [showExpensesModal, setShowExpensesModal] = useState(false);
  const [currentExpenseEmployee, setCurrentExpenseEmployee] = useState<string>('');
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);

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
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_API_DRIVER}drivers/code_company/${user.code_customer}`);
      const result = await response.json();
      if (result.data) {
        setDrivers(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch drivers:', err);
    }
  };

  const handleShowExpenses = async (employeeId: string) => {
    setCurrentExpenseEmployee(employeeId);
    setShowExpensesModal(true);
    setExpensesLoading(true);
    try {
      const response = await fetch(`http://localhost:8299/api/v1/daily-expenses/${employeeId}`);
      const result = await response.json();
      if (result.success) {
        setExpenses(result.data);
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setExpensesLoading(false);
    }
  };

  useEffect(() => {
    fetchTimesheets();
    fetchDrivers();
  }, [user]);

  const getTimeValue = (val: string | undefined) => {
    if (!val) return '';
    if (val.includes(' ')) return val.split(' ')[1].substring(0, 5);
    return val.substring(0, 5);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    // Check if it's unix timestamp (digits only)
    const isUnix = /^\d+$/.test(dateStr);
    const date = isUnix ? new Date(Number(dateStr) * 1000) : new Date(dateStr);
    
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const updateTimeValue = (current: string | undefined, newVal: string) => {
    if (!current) return newVal;
    if (!current.includes(' ')) return newVal;
    return `${current.split(' ')[0]} ${newVal}:00`;
  };

  const handleApprove = async (id: number, status: number) => {
    let title = 'Apakah Anda yakin?';
    let text = 'Anda ingin menyetujui timesheet ini?';
    let icon: 'warning' | 'info' | 'success' | 'error' = 'info';
    let confirmButtonColor = '#2563eb';
    let showInput = false;

    if (status === 1) {
      title = 'Setujui Timesheet?';
      text = 'Catatan ini akan ditandai sebagai terverifikasi.';
      icon = 'success';
    } else if (status === -1) {
      title = 'Tolak Timesheet?';
      text = 'Harap berikan alasan penolakan:';
      icon = 'error';
      confirmButtonColor = '#e11d48';
      showInput = true;
    } else if (status === -2) {
      title = 'Minta Revisi?';
      text = 'Harap berikan instruksi untuk revisi:';
      icon = 'warning';
      confirmButtonColor = '#d97706';
      showInput = true;
    }

    const result = await Swal.fire({
      title,
      text,
      icon,
      input: showInput ? 'textarea' : undefined,
      inputPlaceholder: showInput ? 'Masukkan alasan di sini...' : undefined,
      showCancelButton: true,
      confirmButtonColor,
      cancelButtonColor: '#f1f5f9',
      confirmButtonText: 'Ya, Lanjutkan',
      cancelButtonText: 'Batal',
      inputValidator: (value) => {
        if (showInput && !value) {
          return 'Anda harus memberikan alasan!';
        }
      },
      customClass: {
        popup: 'rounded-[32px] border-none shadow-2xl',
        title: 'font-black tracking-tight',
        confirmButton: 'rounded-xl px-6 py-3 font-bold text-sm',
        cancelButton: 'rounded-xl px-6 py-3 font-bold text-sm text-gray-500'
      }
    });

    if (result.isConfirmed) {
      try {
        const note = result.value || '';
        const response = await fetch(`${import.meta.env.VITE_URL_API}approve_timesheets/${user?.code_customer}/${id}?status=${status}&note=${encodeURIComponent(note)}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const resultJson = await response.json();
        
        if (resultJson.status === 'success') {
          setTimesheets(prev => prev.map(t => t.id_timesheets_mitra === id ? { 
            ...t, 
            approved_timesheets: [resultJson.data]
          } : t));
          
          if (selectedTimesheet?.id_timesheets_mitra === id) {
            setSelectedTimesheet(prev => prev ? { ...prev, approved_timesheets: [resultJson.data] } : null);
          }

          Swal.fire({
            title: 'Berhasil!',
            text: `Data telah berhasil diproses.`,
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
            customClass: { popup: 'rounded-[32px] px-8 py-6' }
          });
        }
      } catch (err) {
        console.error('Failed to update status:', err);
        Swal.fire('Kesalahan', 'Gagal memperbarui status', 'error');
      }
    }
  };

  const handleUpdateTimesheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTimesheet) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_URL_API}edit_timesheets/${user?.code_customer}/${selectedTimesheet.id_timesheets_mitra}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editFormData),
      });
      const result = await response.json();
      if (result.status === 'success') {
        setTimesheets(prev => prev.map(t => t.id_timesheets_mitra === selectedTimesheet.id_timesheets_mitra ? { ...t, ...editFormData } : t));
        setSelectedTimesheet(prev => prev ? { ...prev, ...editFormData } : null);
        setIsEditing(false);
        Swal.fire({
          title: 'Updated!',
          text: 'Record has been successfully modified.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          customClass: { popup: 'rounded-[32px] px-8 py-6' }
        });
      }
    } catch (err) {
      console.error('Failed to update timesheet:', err);
      Swal.fire('Error', 'Failed to synchronize updates with the master node.', 'error');
    }
  };

  const handleEditClick = (ts: Timesheet) => {
    if ((ts.approved_timesheets[0]?.status_approve ?? 0) === 1) {
      Swal.fire({
        title: 'Access Denied',
        text: 'This record is already approved and cannot be modified.',
        icon: 'warning',
        confirmButtonColor: '#1a1f2e',
        customClass: { popup: 'rounded-[32px]' }
      });
      return;
    }
    setSelectedTimesheet(ts);
    setEditFormData(ts);
    setIsEditing(true);
  };

  const getStatusBadge = (status: number, employeeId: string) => {
    switch (status) {
      case 1:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200/50">
            <div className="h-1 w-1 rounded-full bg-emerald-500" />
            Disetujui
          </span>
        );
      case -1:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700 border border-rose-200/50">
            <div className="h-1 w-1 rounded-full bg-rose-500" />
            Ditolak
          </span>
        );
      case -2:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200/50">
            <div className="h-1 w-1 rounded-full bg-amber-500" />
            Revisi
          </span>
        );
      default:
        return (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleShowExpenses(employeeId);
            }}
            className="group/status inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-700 border border-amber-200/50 hover:bg-amber-100 transition-all active:scale-95 shadow-sm"
          >
            <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            PENGELUARAN
          </button>
        );
    }
  };

  const getDisplayTimeEntry = (ts: Timesheet) => {
    return ts.time_entry || '-';
  };

  const getDisplayTimeExit = (ts: Timesheet) => {
    return ts.time_exit || '-';
  };

  const filteredData = timesheets.filter(ts => {
    const searchLow = search.toLowerCase();
    const currentStatus = ts.approved_timesheets[0]?.status_approve ?? 0;
    
    const matchesSearch = 
      ts.employee_id.toLowerCase().includes(searchLow) || 
      ts.code_customer.toLowerCase().includes(searchLow) ||
      (ts.penugasan || '').toLowerCase().includes(searchLow);
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'pending' && currentStatus === 0) ||
      (statusFilter === 'approved' && currentStatus === 1) ||
      (statusFilter === 'rejected' && currentStatus === -1);

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const renderDetailModal = () => {
    if (!selectedTimesheet) return null;
    const ts = selectedTimesheet;
    
    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setSelectedTimesheet(null);
              setIsEditing(false);
            }}
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-7xl bg-white rounded-[48px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border border-white/20"
          >
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100">
                  {isEditing ? <Pencil size={24} /> : <FileCheck size={24} />}
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">{isEditing ? 'Edit Timesheet' : 'Detail Timesheet'}</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">ID: {ts.id_timesheets_mitra} • {ts.employee_id}</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setSelectedTimesheet(null);
                  setIsEditing(false);
                }}
                className="p-3 bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-2xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
              {isEditing ? (
                <form id="edit-timesheet-form" onSubmit={handleUpdateTimesheet} className="space-y-10">
                  {/* Edit Form Content - Kept mostly intact */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.25em] flex items-center gap-2 px-1">
                        <ShieldCheck size={12} /> Operational Core
                      </h4>
                      <div className="space-y-4 p-6 bg-gray-50/50 border border-gray-100 rounded-[32px]">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Employee ID</label>
                          <input 
                            type="text" 
                            required
                            value={editFormData.employee_id || ''}
                            onChange={e => setEditFormData({...editFormData, employee_id: e.target.value})}
                            className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all shadow-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Mitra Customer Code</label>
                          <input 
                            type="text" 
                            required
                            value={editFormData.code_customer || ''}
                            onChange={e => setEditFormData({...editFormData, code_customer: e.target.value})}
                            className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all shadow-sm"
                          />
                        </div>
                      </div>

                      <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.25em] flex items-center gap-2 px-1">
                        <Truck size={12} /> Daily Insentif
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col gap-3 ${editFormData.is_premium === 1 ? 'bg-blue-50/50 border-blue-500' : 'bg-white border-gray-100 opacity-60'}`} onClick={() => {
                          const isPremium = editFormData.is_premium === 1 ? 0 : 1;
                          setEditFormData({...editFormData, is_premium: isPremium});
                        }}>
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black uppercase tracking-widest">Premium</span>
                            <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${editFormData.is_premium === 1 ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'}`}>
                              {editFormData.is_premium === 1 && <CheckCircle size={10} />}
                            </div>
                          </div>
                          <input 
                            placeholder="Pkg Name"
                            value={editFormData.premium_name || ''}
                            onClick={e => e.stopPropagation()}
                            onChange={e => setEditFormData({...editFormData, premium_name: e.target.value, is_premium: 1})}
                            className="bg-transparent border-none p-0 text-xs font-bold focus:ring-0 placeholder:text-gray-300"
                          />
                        </div>
                        <div className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col gap-3 ${editFormData.is_vip === 1 ? 'bg-amber-50/50 border-amber-500' : 'bg-white border-gray-100 opacity-60'}`} onClick={() => {
                          const isVip = editFormData.is_vip === 1 ? 0 : 1;
                          setEditFormData({...editFormData, is_vip: isVip});
                        }}>
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black uppercase tracking-widest">VIP dedicated</span>
                            <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${editFormData.is_vip === 1 ? 'bg-amber-600 border-amber-600 text-white' : 'border-gray-300'}`}>
                              {editFormData.is_vip === 1 && <CheckCircle size={10} />}
                            </div>
                          </div>
                          <input 
                            placeholder="Unit Name"
                            value={editFormData.vip_name || ''}
                            onClick={e => e.stopPropagation()}
                            onChange={e => setEditFormData({...editFormData, vip_name: e.target.value, is_vip: 1})}
                            className="bg-transparent border-none p-0 text-xs font-bold focus:ring-0 placeholder:text-gray-300"
                          />
                        </div>

                        {/* Holiday Status */}
                        <div className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col gap-3 ${editFormData.status_hari_raya === 1 ? 'bg-rose-50/50 border-rose-500' : 'bg-white border-gray-100 opacity-60'}`} onClick={() => setEditFormData({...editFormData, status_hari_raya: editFormData.status_hari_raya === 1 ? 0 : 1})}>
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black uppercase tracking-widest">Hari Raya</span>
                            <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${editFormData.status_hari_raya === 1 ? 'bg-rose-600 border-rose-600 text-white' : 'border-gray-300'}`}>
                              {editFormData.status_hari_raya === 1 && <CheckCircle size={10} />}
                            </div>
                          </div>
                          <span className="text-xs font-bold text-gray-900">Public Holiday</span>
                        </div>

                        <div className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col gap-3 ${editFormData.status_hari_libur === 1 ? 'bg-indigo-50/50 border-indigo-500' : 'bg-white border-gray-100 opacity-60'}`} onClick={() => setEditFormData({...editFormData, status_hari_libur: editFormData.status_hari_libur === 1 ? 0 : 1})}>
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black uppercase tracking-widest">Hari Libur</span>
                            <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${editFormData.status_hari_libur === 1 ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300'}`}>
                              {editFormData.status_hari_libur === 1 && <CheckCircle size={10} />}
                            </div>
                          </div>
                          <span className="text-xs font-bold text-gray-900">Weekend/Off</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h4 className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.25em] flex items-center gap-2 px-1">
                        <MapPin size={12} /> Work Hour Insentif
                      </h4>
                      <div className="p-8 bg-indigo-50/30 border border-indigo-100/50 rounded-[32px] space-y-8">
                        <div className="bg-white p-4 rounded-2xl border border-indigo-100 flex items-center justify-between shadow-sm">
                          <div>
                            <span className="block text-[10px] font-black text-gray-900 uppercase tracking-widest">Time Policy Setup</span>
                            <span className="block text-[9px] text-gray-500 font-bold mt-1">Override to fixed schedule (07:00 - 16:00)</span>
                          </div>
                          <div className="flex bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                            <button
                              type="button"
                              onClick={() => {
                                setEditFormData({...editFormData, time_entry: selectedTimesheet?.time_entry, time_exit: selectedTimesheet?.time_exit});
                              }}
                              className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${!editFormData.time_entry?.includes('07:00:00') ? 'bg-white shadow-sm text-indigo-600 ring-1 ring-indigo-100' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                              Standard
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                let newEntry = editFormData.time_entry;
                                let newExit = editFormData.time_exit;
                                if (newEntry) newEntry = newEntry.split(' ')[0] + ' 07:00:00';
                                if (newExit) newExit = newExit.split(' ')[0] + ' 16:00:00';
                                setEditFormData({...editFormData, time_entry: newEntry, time_exit: newExit});
                              }}
                              className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${editFormData.time_entry?.includes('07:00:00') && editFormData.time_exit?.includes('16:00:00') ? 'bg-indigo-600 shadow-md text-white' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                              Fixed Schedule
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 relative">
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 bg-white border border-indigo-100 rounded-full flex items-center justify-center text-indigo-300 z-10 hidden md:flex">
                            <ChevronRight size={14} />
                          </div>
                          <div className="space-y-4">
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Check-In Time</label>
                              <input 
                                type="time" 
                                value={getTimeValue(editFormData.time_entry)}
                                onChange={e => {
                                  setEditFormData({...editFormData, time_entry: updateTimeValue(editFormData.time_entry, e.target.value)});
                                }}
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-100 outline-none"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Entry KM</label>
                              <input 
                                type="text" 
                                value={editFormData.km_entry || ''}
                                onChange={e => setEditFormData({...editFormData, km_entry: e.target.value})}
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-100 outline-none"
                              />
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Check-Out Time</label>
                              <input 
                                type="time" 
                                value={getTimeValue(editFormData.time_exit)}
                                onChange={e => {
                                  setEditFormData({...editFormData, time_exit: updateTimeValue(editFormData.time_exit, e.target.value)});
                                }}
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-100 outline-none"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Exit KM</label>
                              <input 
                                type="text" 
                                value={editFormData.km_exit || ''}
                                onChange={e => setEditFormData({...editFormData, km_exit: e.target.value})}
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-100 outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5 pt-6 border-t border-indigo-100">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Penugasan</label>
                          <input 
                            type="text" 
                            value={editFormData.penugasan || ''}
                            onChange={e => setEditFormData({...editFormData, penugasan: e.target.value})}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-100 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Read-only view */}
                  <div className="space-y-6">
                    <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.25em] flex items-center gap-2 px-1">
                      <ShieldCheck size={12} />Operasional
                    </h4>
                    <div className="p-8 bg-gray-50/50 border border-gray-100 rounded-[32px] space-y-8">
                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Status Saat Ini</p>
                          {getStatusBadge(ts.approved_timesheets[0]?.status_approve ?? 0, ts.employee_id)}
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Code Customer</p>
                          <p className="font-mono text-sm font-black text-blue-600 bg-blue-50/50 px-4 py-2 rounded-xl border border-blue-100 inline-block tracking-tight">{ts.code_customer}</p>
                        </div>
                      </div>

                      <div className="pt-8 border-t border-gray-200/60">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Daily Insentif</p>
                        <div className="flex flex-wrap gap-3">
                          {ts.is_premium === 1 && (
                            <span className="px-4 py-2 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-xl border border-blue-100 flex items-center gap-2 shadow-sm">
                              <CheckCircle size={14} className="text-blue-500" /> Premium {ts.premium_name ? `(${ts.premium_name})` : ''}
                            </span>
                          )}
                          {ts.is_vip === 1 && (
                            <span className="px-4 py-2 bg-amber-50 text-amber-700 text-[11px] font-bold rounded-xl border border-amber-100 flex items-center gap-2 shadow-sm">
                              <CheckCircle size={14} className="text-amber-500" /> VIP {ts.vip_name ? `(${ts.vip_name})` : ''}
                            </span>
                          )}
                          {ts.status_hari_raya === 1 && (
                            <span className="px-4 py-2 bg-rose-50 text-rose-700 text-[11px] font-bold rounded-xl border border-rose-100 flex items-center gap-2 shadow-sm">
                              <CheckCircle size={14} className="text-rose-500" /> HARI RAYA
                            </span>
                          )}
                          {ts.status_hari_libur === 1 && (
                            <span className="px-4 py-2 bg-indigo-50 text-indigo-700 text-[11px] font-bold rounded-xl border border-indigo-100 flex items-center gap-2 shadow-sm">
                              <CheckCircle size={14} className="text-indigo-500" /> HARI LIBUR
                            </span>
                          )}
                          {!ts.is_premium && !ts.is_vip && !ts.status_hari_raya && !ts.status_hari_libur && (
                            <span className="px-4 py-2 bg-gray-50 text-gray-400 text-[11px] font-bold rounded-xl border border-gray-200 flex items-center gap-2">
                              Pengiriman Standar
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.25em] flex items-center gap-2 px-1">
                      <MapPin size={12} /> Insentif Jam Kerja
                    </h4>
                    <div className="p-8 bg-indigo-50/30 border border-indigo-100/50 rounded-[32px] space-y-8">
                      <div className="grid grid-cols-2 gap-8 relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 bg-white border border-indigo-100 rounded-full flex items-center justify-center text-indigo-300 z-10 hidden md:flex">
                          <ChevronRight size={14} />
                        </div>
                        <div className="space-y-4">
                          <div>
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Masuk</p>
                            <p className="font-mono text-xl font-black text-gray-900 tracking-tighter">{getDisplayTimeEntry(ts)}</p>
                            <p className="text-[11px] font-bold text-gray-500 mt-0.5">{ts.date_timesheets || '-'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Odometer</p>
                            <p className="font-mono text-sm font-black bg-white px-2 py-1 rounded border border-indigo-100 inline-block text-indigo-700">{ts.km_entry ? Number(ts.km_entry).toLocaleString('en-US') : '0'} KM</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Keluar</p>
                            <p className="font-mono text-xl font-black text-gray-900 tracking-tighter">{getDisplayTimeExit(ts)}</p>
                            <p className="text-[11px] font-bold text-gray-500 mt-0.5">{ts.date_timesheets || '-'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Odometer</p>
                            <p className="font-mono text-sm font-black bg-white px-2 py-1 rounded border border-indigo-100 inline-block text-indigo-700">{ts.km_exit ? Number(ts.km_exit).toLocaleString('en-US') : '0'} KM</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 pt-8 border-t border-indigo-100/30">
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Penugasan</p>
                        <div className="p-5 bg-white/80 border border-indigo-100 rounded-[24px] shadow-sm backdrop-blur-sm">
                          <p className="text-sm font-bold text-gray-700 leading-relaxed italic">
                            "{ts.approved_timesheets[0]?.note || "Tidak ada catatan administrasi atau detail insentif untuk data ini."}"
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Maps Section (Full Width) */}
                  {ts.lokasi_timesheets.length > 0 && (
                    <div className="pt-10 border-t border-gray-100">
                      <h4 className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.25em] mb-6 flex items-center gap-2 px-1">
                        <MapPin size={12} /> Bukti Geografis (Peta)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Entry Map */}
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                              <MapPin size={14} className="text-emerald-400" />
                              Lokasi Masuk
                            </p>
                            <p className="text-[10px] text-gray-400 font-medium ml-5">
                              Lat: {ts.lokasi_timesheets[0].lat_masuk} | Long: {ts.lokasi_timesheets[0].long_masuk}
                            </p>
                          </div>
                          
                          <div className="w-full h-64 rounded-[40px] overflow-hidden border-2 border-indigo-50 shadow-lg bg-gray-50 group relative">
                            <iframe 
                              width="100%" 
                              height="100%" 
                              frameBorder="0" 
                              style={{ border: 0 }}
                              src={`https://maps.google.com/maps?q=${ts.lokasi_timesheets[0].lat_masuk},${ts.lokasi_timesheets[0].long_masuk}&z=18&output=embed`}
                              allowFullScreen
                            />
                            <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-black/5 rounded-[40px]" />
                          </div>
                        </div>

                        {/* Exit Map */}
                        {ts.lokasi_timesheets[0].lat_keluar && ts.lokasi_timesheets[0].long_keluar && (
                          <div className="space-y-4">
                            <div className="space-y-1">
                              <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <MapPin size={14} className="text-rose-400" />
                                Lokasi Keluar
                              </p>
                              <p className="text-[10px] text-gray-400 font-medium ml-5">
                                Lat: {ts.lokasi_timesheets[0].lat_keluar} | Long: {ts.lokasi_timesheets[0].long_keluar}
                              </p>
                            </div>
                            
                            <div className="w-full h-64 rounded-[40px] overflow-hidden border-2 border-indigo-50 shadow-lg bg-gray-50 group relative">
                              <iframe 
                                width="100%" 
                                height="100%" 
                                frameBorder="0" 
                                style={{ border: 0 }}
                                src={`https://maps.google.com/maps?q=${ts.lokasi_timesheets[0].lat_keluar},${ts.lokasi_timesheets[0].long_keluar}&z=18&output=embed`}
                                allowFullScreen
                              />
                              <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-black/5 rounded-[40px]" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Photo Evidence Section */}
                  {ts.foto_timesheets.length > 0 && (
                    <div className="pt-10 border-t border-gray-100">
                      <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.25em] mb-6 flex items-center gap-2 px-1">
                        <Eye size={12} /> Bukti Visual (Odometer)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {ts.foto_timesheets[0].foto_km_in && (
                          <div className="space-y-4">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Bukti Odometer Masuk
                            </p>
                            <div className="group relative overflow-hidden rounded-[32px] border-2 border-gray-100 bg-gray-50 shadow-sm transition-all hover:shadow-xl hover:border-blue-200 cursor-zoom-in">
                              <img 
                                src={ts.foto_timesheets[0].foto_km_in} 
                                alt="KM Entry" 
                                className="w-full h-72 object-cover transition-transform duration-700 group-hover:scale-110" 
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        )}
                        {ts.foto_timesheets[0].foto_km_out && (
                          <div className="space-y-4">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                              Bukti Odometer Keluar
                            </p>
                            <div className="group relative overflow-hidden rounded-[32px] border-2 border-gray-100 bg-gray-50 shadow-sm transition-all hover:shadow-xl hover:border-blue-200 cursor-zoom-in">
                              <img 
                                src={ts.foto_timesheets[0].foto_km_out} 
                                alt="KM Exit" 
                                className="w-full h-72 object-cover transition-transform duration-700 group-hover:scale-110" 
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-5 border-t border-gray-100 flex items-center justify-between bg-[#fcfcfa] shrink-0">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Clock size={12} /> Last updated: {new Date().toLocaleTimeString()}
              </span>
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setSelectedTimesheet(null);
                    setIsEditing(false);
                  }}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-100 transition-all"
                >
                  Tutup
                </button>
                {isEditing ? (
                  <button 
                    form="edit-timesheet-form"
                    type="submit"
                    className="px-6 py-2.5 rounded-xl font-bold text-sm bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all"
                  >
                    Simpan Perubahan
                  </button>
                ) : (ts.approved_timesheets[0]?.status_approve ?? 0) === 0 ? (
                  <>
                    <button 
                      onClick={() => handleApprove(ts.id_timesheets_mitra, -1)}
                      className="px-6 py-2.5 rounded-xl font-bold text-sm text-rose-600 bg-rose-50 hover:bg-rose-100 transition-all flex items-center gap-2"
                    >
                      <Ban size={16} /> Tolak
                    </button>
                    <button 
                      onClick={() => handleApprove(ts.id_timesheets_mitra, -2)}
                      className="px-6 py-2.5 rounded-xl font-bold text-sm text-amber-600 bg-amber-50 hover:bg-amber-100 transition-all flex items-center gap-2"
                    >
                      <History size={16} /> Revisi
                    </button>
                    <button 
                      onClick={() => handleApprove(ts.id_timesheets_mitra, 1)}
                      className="px-6 py-2.5 rounded-xl font-bold text-sm bg-[#1a1f2e] text-white hover:bg-blue-600 transition-all flex items-center gap-2 shadow-lg"
                    >
                      <CheckCircle size={16} /> Setujui
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-8 max-w-full mx-auto"
    >
      {renderDetailModal()}

      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <div className="h-8 w-1.5 bg-blue-600 rounded-full" />
            Approval Center
          </h3>
          <p className="text-sm font-medium text-gray-500">Manage and audit daily logs from your transport partners.</p>
        </div>
        <div className="flex items-center p-1.5 bg-white border border-gray-200 rounded-[24px] shadow-sm">
          <button
            onClick={() => { setStatusFilter('pending'); setCurrentPage(1); }}
            className={`px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              statusFilter === 'pending' 
                ? 'bg-[#1a1f2e] text-white shadow-lg' 
                : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Clock size={14} />
            Waiting Approval
          </button>
          <button
            onClick={() => { setStatusFilter('approved'); setCurrentPage(1); }}
            className={`px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              statusFilter === 'approved' 
                ? 'bg-[#1a1f2e] text-white shadow-lg' 
                : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <CheckCircle size={14} />
            Approved History
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-80 flex items-center justify-center bg-white border border-gray-200 rounded-3xl shadow-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="h-16 w-16 border-4 border-gray-100 border-t-blue-600 animate-spin rounded-full transition-all"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <FileCheck size={20} className="text-blue-600" />
              </div>
            </div>
            <span className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em] animate-pulse">Syncing Cloud Database</span>
          </div>
        </div>
      ) : timesheets.length === 0 ? (
        <div className="h-80 flex flex-col items-center justify-center bg-white border border-gray-200 rounded-3xl border-dashed">
          <div className="p-6 bg-gray-50 rounded-full mb-4">
            <Clock size={40} className="text-gray-300" />
          </div>
          <p className="text-gray-900 font-bold text-lg">No pending approvals</p>
          <p className="text-gray-400 text-sm mt-1">Great job! All logs for today have been processed.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-[32px] overflow-hidden shadow-sm ring-1 ring-black/[0.02]">
          {/* Table Controls */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-[#fcfcfa]/50">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 pr-4 border-r border-gray-100">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Per Page</span>
                <select 
                  value={itemsPerPage}
                  onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  className="bg-gray-50 border-none text-xs font-bold rounded-lg px-2 py-1 focus:ring-0 cursor-pointer"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <span className="text-sm font-bold text-gray-400">Total: {filteredData.length} records</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Search driver or code..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  className="w-full sm:w-64 border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-sm bg-white hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                />
                <Filter size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="appearance-none border border-gray-200 rounded-xl px-4 py-2 pr-10 text-sm bg-white hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer font-bold"
                >
                  <option value="pending">Status: Pending</option>
                  <option value="approved">Status: Approved</option>
                  <option value="rejected">Status: Rejected</option>
                  <option value="all">Every Status</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronRight size={14} className="rotate-90" />
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#fcfcfa]/80 text-gray-500 text-[11px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-8 py-5">No</th>
                  <th className="px-8 py-5">Date</th>
                  <th className="px-8 py-5">Driver Info</th>
                  <th className="px-8 py-5">Schedule In/Out</th>
                  <th className="px-8 py-5">Premium</th>   
                  <th className="px-8 py-5">VIP</th>   
                  <th className="px-8 py-5">Hari Raya</th>
                  <th className="px-8 py-5">Hari Libur</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 uppercase tracking-tight">
                {paginatedData.length > 0 ? paginatedData.map((ts, index) => (
                  <motion.tr 
                    key={ts.id_timesheets_mitra}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-blue-50/30 group transition-all duration-300"
                  >
                    <td className="px-8 py-6 text-sm font-medium text-gray-400">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span className="text-[13px] font-black text-gray-900 tracking-tight">{formatDate(ts.date_timesheets)}</span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                       <div className="flex items-center gap-4">
                         <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/50 flex items-center justify-center text-blue-600 font-bold text-xs group-hover:scale-110 transition-all duration-500">
                           {ts.employee_id.substring(0, 2)}
                         </div>
                         <div>
                           <div className="font-black text-gray-900 tracking-tight text-[15px]">{drivers.find(d => d.employee_id === ts.employee_id)?.full_name || 'Verified Transport Partner'}</div>
                           <div className="text-[10px] text-blue-600 font-black uppercase tracking-widest mt-0.5">{ts.employee_id}</div>
                         </div>
                       </div>
                    </td>
                    
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-8">
                        <div className="space-y-1">
                           <span className="block text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Check Entry</span>
                           <div className="flex items-center gap-2">
                             <span className="font-mono font-black text-gray-900 text-[14px]">{getDisplayTimeEntry(ts)}</span>
                             <span className="text-[10px] font-black text-blue-600/60 bg-blue-50 px-1.5 py-0.5 rounded-lg border border-blue-100/50">{ts.km_entry ? Number(ts.km_entry).toLocaleString('en-US') : '0'} KM</span>
                           </div>
                        </div>
                        <div className="h-10 w-px bg-gray-100" />
                        <div className="space-y-1">
                           <span className="block text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Check Exit</span>
                           <div className="flex items-center gap-2">
                             <span className="font-mono font-black text-gray-900 text-[14px]">{getDisplayTimeExit(ts)}</span>
                             <span className="text-[10px] font-black text-indigo-600/60 bg-indigo-50 px-1.5 py-0.5 rounded-lg border border-indigo-100/50">{ts.km_exit ? Number(ts.km_exit).toLocaleString('en-US') : '0'} KM</span>
                           </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      {ts.is_premium === 1 ? (
                        <div className="flex flex-col items-start gap-1">
                          <span className="inline-flex items-center gap-1 bg-blue-50/80 text-blue-600 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-200/50">
                            <CheckCircle size={10} /> Ya
                          </span>
                          {ts.premium_name && <span className="text-[9px] font-bold text-gray-400 truncate max-w-[100px]">{ts.premium_name}</span>}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-rose-50/50 text-rose-500 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-rose-100">
                          <XCircle size={10} /> Tidak
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      {ts.is_vip === 1 ? (
                        <div className="flex flex-col items-start gap-1">
                          <span className="inline-flex items-center gap-1 bg-amber-50/80 text-amber-600 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-amber-200/50">
                            <CheckCircle size={10} /> Ya
                          </span>
                          {ts.vip_name && <span className="text-[9px] font-bold text-gray-400 truncate max-w-[100px]">{ts.vip_name}</span>}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-rose-50/50 text-rose-500 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-rose-100">
                          <XCircle size={10} /> Tidak
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      {ts.status_hari_raya === 1 ? (
                        <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-600 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-rose-200/50">
                          <CheckCircle size={10} /> Ya
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-rose-50/50 text-rose-500 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-rose-100 opacity-60">
                          <XCircle size={10} /> Tidak
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      {ts.status_hari_libur === 1 ? (
                        <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-indigo-200/50">
                          <CheckCircle size={10} /> Ya
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-rose-50/50 text-rose-500 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-rose-100 opacity-60">
                          <XCircle size={10} /> Tidak
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleShowExpenses(ts.employee_id)}
                          className="px-3 py-2 text-emerald-600 bg-emerald-50/50 hover:bg-emerald-100 rounded-xl transition-all shadow-sm border border-emerald-100 flex items-center gap-2 active:scale-95 group/exp"
                          title="Daily Expenses"
                        >
                          <Banknote size={16} className="group-hover/exp:scale-110 transition-transform" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Pengeluaran</span>
                        </button>
                        <button 
                          onClick={() => setSelectedTimesheet(ts)}
                          className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all shadow-sm ring-1 ring-transparent hover:ring-blue-100"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        {(ts.approved_timesheets[0]?.status_approve ?? 0) !== 1 && (
                          <button 
                            onClick={() => handleEditClick(ts)}
                            className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all shadow-sm ring-1 ring-transparent hover:ring-indigo-100"
                            title="Edit Record"
                          >
                            <Pencil size={18} />
                          </button>
                        )}
                        {(ts.approved_timesheets[0]?.status_approve ?? 0) === 0 ? (
                          <div className="flex items-center gap-1.5 ml-2 border-l border-gray-100 pl-3">
                             {/* <button 
                              onClick={() => handleApprove(ts.id_timesheets_mitra, -2)}
                              className="p-2.5 text-gray-400 hover:text-amber-600 hover:bg-white rounded-xl transition-all shadow-sm"
                              title="Revision"
                            >
                              <History size={18} />
                            </button> */}
                            <button 
                              onClick={() => handleApprove(ts.id_timesheets_mitra, 1)}
                              className="h-10 w-10 bg-[#1a1f2e] text-white rounded-xl flex items-center justify-center hover:bg-blue-600 transition-all shadow-lg active:scale-90"
                              title="Approve Now"
                            >
                              <CheckCircle size={18} />
                            </button>
                          </div>
                        ) : (
                          <div className="h-10 px-3 flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl">
                            {(ts.approved_timesheets[0]?.status_approve ?? 0) === 1 ? (
                              <CheckCircle size={14} className="text-emerald-500" />
                            ) : (
                              <XCircle size={14} className="text-rose-500" />
                            )}
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Finalized</span>
                          </div>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                )) : (
                  <tr>
                    <td colSpan={9} className="px-8 py-24 text-center">
                      <div className="flex flex-col items-center gap-4 text-gray-300">
                        <div className="h-20 w-20 rounded-[28px] bg-gray-50 flex items-center justify-center border border-gray-100 shadow-inner">
                          <Filter size={32} />
                        </div>
                        <div className="max-w-xs">
                           <p className="font-black text-gray-900 uppercase tracking-widest text-[13px]">No Active Matches</p>
                           <p className="text-xs font-medium text-gray-400 mt-1">Adjust your filters or search query to find relevant timesheet logs.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-8 py-5 border-t border-gray-100 flex items-center justify-between bg-white text-sm">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-100 rounded-xl font-bold font-sans text-[13px] text-gray-500 hover:bg-gray-50 disabled:opacity-30 flex items-center gap-2 transition-all shadow-sm uppercase tracking-widest"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`h-9 w-9 rounded-xl text-xs font-black transition-all ${currentPage === i + 1 ? 'bg-[#1a1f2e] text-white shadow-xl shadow-gray-200 scale-105' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages || 1, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-4 py-2 border border-gray-100 rounded-xl font-bold font-sans text-[13px] text-gray-500 hover:bg-gray-50 disabled:opacity-30 flex items-center gap-2 transition-all shadow-sm uppercase tracking-widest"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
      {/* Expenses Modal */}
      <AnimatePresence>
        {showExpensesModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExpensesModal(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-[16px] bg-amber-100 flex items-center justify-center text-amber-600 shadow-sm border border-amber-200/50">
                    <Wallet size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900 tracking-tight uppercase">Pengeluaran</h3>
                    <div className="flex items-center gap-2.5 mt-0.5">
                      <p className="text-[9px] font-bold text-gray-400 tracking-widest uppercase">
                        Logs for {currentExpenseEmployee}
                      </p>
                      {!expensesLoading && expenses.length > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="h-1 w-1 rounded-full bg-gray-300" />
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[8px] font-black rounded-lg border border-blue-100 uppercase">{expenses.length} Records</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {!expensesLoading && expenses.length > 0 && (
                    <div className="hidden md:flex flex-col items-end pr-6 border-r border-gray-200">
                      <span className="text-[8px] font-black text-amber-600 uppercase tracking-[0.2em] mb-0.5">Total Accumulation</span>
                      <span className="text-xl font-black text-gray-900 tracking-tighter">
                         Rp {expenses.reduce((sum, exp) => sum + (exp.expenses_value || 0), 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                  )}
                  <button 
                    onClick={() => setShowExpensesModal(false)}
                    className="h-10 w-10 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-white hover:shadow-sm rounded-xl transition-all border border-transparent hover:border-gray-200"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {/* Mobile Total Display */}
                {!expensesLoading && expenses.length > 0 && (
                  <div className="md:hidden mb-4 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex justify-between items-center">
                    <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest">Total Accumulation</span>
                    <span className="text-lg font-black text-gray-900 tracking-tighter">Rp {expenses.reduce((sum, exp) => sum + (exp.expenses_value || 0), 0).toLocaleString('id-ID')}</span>
                  </div>
                )}

                {expensesLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <div className="h-8 w-8 border-3 border-amber-100 border-t-amber-500 rounded-full animate-spin" />
                    <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Fetching Expense Records...</p>
                  </div>
                ) : expenses.length > 0 ? (
                  <div className="space-y-3">
                    {expenses.map((exp, i) => (
                      <div key={exp.id} className="p-6 bg-gray-50/50 border border-gray-100 rounded-[2rem] flex items-center gap-8 group hover:border-amber-200 hover:bg-white transition-all shadow-sm">
                        {/* Col 1: Photo */}
                        <div 
                          onClick={() => exp.expenses_photo_cloud && setSelectedReceipt(exp.expenses_photo_cloud)}
                          className="h-20 w-20 rounded-[24px] bg-white border border-gray-200 overflow-hidden shadow-sm flex-shrink-0 cursor-zoom-in hover:scale-105 transition-transform active:scale-95"
                        >
                           {exp.expenses_photo_cloud ? (
                             <img src={exp.expenses_photo_cloud} alt="Receipt" className="h-full w-full object-cover" />
                           ) : (
                             <div className="h-full w-full flex items-center justify-center text-gray-300">
                               <ReceiptText size={28} />
                             </div>
                           )}
                        </div>

                        {/* Col 2: Date Calendar Style */}
                        <div className="flex flex-col items-center justify-center bg-white border border-gray-100 rounded-[20px] px-4 py-3 min-w-[80px] shadow-sm group-hover:border-amber-100 transition-colors">
                          <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">{new Date(exp.date_expenses).toLocaleDateString('id-ID', { month: 'short' })}</span>
                          <span className="text-2xl font-black text-gray-900 leading-none">{new Date(exp.date_expenses).toLocaleDateString('id-ID', { day: '2-digit' })}</span>
                          <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{new Date(exp.date_expenses).getFullYear()}</span>
                        </div>

                        {/* Col 3: Description & Location */}
                        <div className="flex-1 min-w-0">
                           <div className="text-[14px] font-black text-gray-900 uppercase tracking-tight mb-2 truncate">{exp.expenses_notes || 'General Expense'}</div>
                           <div className="flex items-center gap-2.5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">
                             <div className="h-5 w-5 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
                               <MapPin size={12} />
                             </div>
                             {exp.lokasi_expenses}
                           </div>
                        </div>

                        {/* Col 4: Type Column (DEDICATED) */}
                        <div className="w-40 flex-shrink-0 flex items-center justify-center">
                           <div className="px-4 py-2 bg-blue-50/50 text-blue-600 text-[10px] font-black rounded-xl border border-blue-100 uppercase tracking-widest shadow-sm flex items-center gap-2">
                             <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                             {exp.type_pengeluaran}
                           </div>
                        </div>

                        {/* Col 5: Value Column */}
                        <div className="text-right w-40 flex-shrink-0">
                           <div className="text-[22px] font-black text-gray-900 tracking-tighter leading-none">Rp {exp.expenses_value?.toLocaleString('id-ID')}</div>
                           <div className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mt-1.5 flex items-center justify-end gap-1.5">
                             <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Verified
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
                    <Wallet size={48} className="text-gray-300 mb-4" />
                    <p className="font-black text-gray-900 uppercase tracking-widest text-xs">No Expenses Logged</p>
                    <p className="text-[10px] font-bold text-gray-400 mt-1">This driver has no expense records for the selected period.</p>
                  </div>
                )}
              </div>

              <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                <button 
                  onClick={() => setShowExpensesModal(false)}
                  className="px-6 py-3 bg-gray-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg active:scale-95"
                >
                  Close Records
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Receipt Pop-up Modal */}
      <AnimatePresence>
        {selectedReceipt && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedReceipt(null)}
              className="absolute inset-0 bg-gray-950/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative max-w-4xl w-full bg-white rounded-[2rem] overflow-hidden shadow-2xl"
            >
              <div className="absolute top-4 right-4 z-10">
                <button 
                  onClick={() => setSelectedReceipt(null)}
                  className="h-12 w-12 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white rounded-2xl transition-all border border-white/20 shadow-xl group"
                >
                  <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                </button>
              </div>
              <div className="p-2 bg-white">
                <img 
                  src={selectedReceipt} 
                  alt="Full Receipt" 
                  className="w-full h-auto max-h-[80vh] object-contain rounded-2xl shadow-inner" 
                />
              </div>
              <div className="p-6 bg-gray-50 flex items-center justify-between border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                    <ReceiptText size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900 uppercase tracking-tight">Detail Bukti Pengeluaran</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">High-Resolution Digital Log</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedReceipt(null)}
                  className="px-6 py-2 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 transition-all shadow-md active:scale-95"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
