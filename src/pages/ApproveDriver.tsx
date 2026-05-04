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
  X
} from 'lucide-react';

export default function ApproveDriver() {
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Data Table State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [selectedTimesheet, setSelectedTimesheet] = useState<Timesheet | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Timesheet>>({});

  const fetchTimesheets = async () => {
    try {
      const response = await fetch('/api/timesheets');
      const data = await response.json();
      setTimesheets(data);
    } catch (err) {
      console.error('Failed to fetch timesheets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimesheets();
  }, []);

  const handleApprove = async (id: number, status: number) => {
    let title = 'Are you sure?';
    let text = 'You want to approve this timesheet?';
    let icon: 'warning' | 'info' | 'success' | 'error' = 'info';
    let confirmButtonColor = '#2563eb';

    if (status === 1) {
      title = 'Approve Timesheet?';
      text = 'This record will be marked as verified.';
      icon = 'success';
    } else if (status === -1) {
      title = 'Reject Timesheet?';
      text = 'This record will be rejected and the driver may need to resubmit.';
      icon = 'warning';
      confirmButtonColor = '#e11d48';
    } else if (status === -2) {
      title = 'Request Revision?';
      text = 'The driver will be notified to revise this record.';
      icon = 'info';
      confirmButtonColor = '#d97706';
    }

    const result = await Swal.fire({
      title,
      text,
      icon,
      showCancelButton: true,
      confirmButtonColor,
      cancelButtonColor: '#f1f5f9',
      confirmButtonText: 'Yes, proceed',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'rounded-[32px] border-none shadow-2xl',
        title: 'font-black tracking-tight',
        confirmButton: 'rounded-xl px-6 py-3 font-bold text-sm',
        cancelButton: 'rounded-xl px-6 py-3 font-bold text-sm text-gray-500'
      }
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch('/api/timesheets/approve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, status }),
        });
        const data = await response.json();
        if (data.success) {
          setTimesheets(prev => prev.map(t => t.id_timesheets_mitra === id ? { ...t, status_approved: status } : t));
          Swal.fire({
            title: 'Success!',
            text: `Record has been updated successfully.`,
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
            customClass: { popup: 'rounded-[32px] px-8 py-6' }
          });
        }
      } catch (err) {
        console.error('Failed to update status:', err);
        Swal.fire('Error', 'Failed to update status', 'error');
      }
    }
  };

  const handleUpdateTimesheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTimesheet) return;

    try {
      const response = await fetch(`/api/timesheets/${selectedTimesheet.id_timesheets_mitra}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });
      const data = await response.json();
      if (data.success) {
        setTimesheets(prev => prev.map(t => t.id_timesheets_mitra === selectedTimesheet.id_timesheets_mitra ? { ...t, ...editFormData } : t));
        setSelectedTimesheet(prev => prev ? { ...prev, ...editFormData } : null);
        setIsEditing(false);
        Swal.fire({
          title: 'Success',
          text: 'Timesheet log has been successfully updated.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          customClass: { popup: 'rounded-[32px]' }
        });
      }
    } catch (err) {
      console.error('Failed to update timesheet:', err);
      Swal.fire('Error', 'Failed to synchronize updates with the master node.', 'error');
    }
  };

  const handleEditClick = (ts: Timesheet) => {
    setSelectedTimesheet(ts);
    setEditFormData(ts);
    setIsEditing(true);
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200/50">
            <div className="h-1 w-1 rounded-full bg-emerald-500" />
            Approved
          </span>
        );
      case -1:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700 border border-rose-200/50">
            <div className="h-1 w-1 rounded-full bg-rose-500" />
            Rejected
          </span>
        );
      case -2:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200/50">
            <div className="h-1 w-1 rounded-full bg-amber-500" />
            Revision
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200/50">
            <div className="h-1 w-1 rounded-full bg-amber-500 animate-pulse" />
            Pending
          </span>
        );
    }
  };

  const filteredData = timesheets.filter(ts => {
    const searchLow = search.toLowerCase();
    const matchesSearch = 
      ts.employee_id.toLowerCase().includes(searchLow) || 
      ts.code_customer.toLowerCase().includes(searchLow) ||
      (ts.task || '').toLowerCase().includes(searchLow);
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'pending' && ts.status_approved === 0) ||
      (statusFilter === 'approved' && ts.status_approved === 1) ||
      (statusFilter === 'rejected' && ts.status_approved === -1);

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
            className="relative w-full max-w-4xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100">
                  {isEditing ? <Pencil size={24} /> : <FileCheck size={24} />}
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">{isEditing ? 'Revise Logistical Record' : 'Timesheet Log Detail'}</h3>
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
                        <Truck size={12} /> Service Tiers
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col gap-3 ${editFormData.is_premium === 1 ? 'bg-blue-50/50 border-blue-500' : 'bg-white border-gray-100 opacity-60'}`} onClick={() => setEditFormData({...editFormData, is_premium: editFormData.is_premium === 1 ? 0 : 1})}>
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
                        <div className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col gap-3 ${editFormData.is_vip === 1 ? 'bg-amber-50/50 border-amber-500' : 'bg-white border-gray-100 opacity-60'}`} onClick={() => setEditFormData({...editFormData, is_vip: editFormData.is_vip === 1 ? 0 : 1})}>
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
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h4 className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.25em] flex items-center gap-2 px-1">
                        <MapPin size={12} /> Logistical Metrics
                      </h4>
                      <div className="p-8 bg-indigo-50/30 border border-indigo-100/50 rounded-[32px] space-y-8">
                        <div className="grid grid-cols-2 gap-8 relative">
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 bg-white border border-indigo-100 rounded-full flex items-center justify-center text-indigo-300 z-10 hidden md:flex">
                            <ChevronRight size={14} />
                          </div>
                          <div className="space-y-4">
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Check-In Time</label>
                              <input 
                                type="text" 
                                value={editFormData.time_entry || ''}
                                onChange={e => setEditFormData({...editFormData, time_entry: e.target.value})}
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
                                type="text" 
                                value={editFormData.time_exit || ''}
                                onChange={e => setEditFormData({...editFormData, time_exit: e.target.value})}
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
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Geographical Node</label>
                          <input 
                            type="text" 
                            value={editFormData.site_name || ''}
                            onChange={e => setEditFormData({...editFormData, site_name: e.target.value})}
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
                      <ShieldCheck size={12} /> Operational Core
                    </h4>
                    <div className="p-8 bg-gray-50/50 border border-gray-100 rounded-[32px] space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                          {getStatusBadge(ts.status_approved)}
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Customer</p>
                          <p className="font-mono text-sm font-black text-gray-900 bg-white px-3 py-1.5 rounded-lg border border-gray-200 inline-block">{ts.code_customer}</p>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-gray-200/60">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Service Tiers</p>
                        <div className="flex gap-3">
                          {ts.is_premium === 1 && (
                            <span className="px-3 py-1.5 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-lg border border-blue-100 flex items-center gap-1.5">
                              <CheckCircle size={12} /> Premium {ts.premium_name ? `(${ts.premium_name})` : ''}
                            </span>
                          )}
                          {ts.is_vip === 1 && (
                            <span className="px-3 py-1.5 bg-amber-50 text-amber-700 text-[11px] font-bold rounded-lg border border-amber-100 flex items-center gap-1.5">
                              <CheckCircle size={12} /> VIP {ts.vip_name ? `(${ts.vip_name})` : ''}
                            </span>
                          )}
                          {!ts.is_premium && !ts.is_vip && <span className="text-sm font-bold text-gray-400">Standard Run</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.25em] flex items-center gap-2 px-1">
                      <MapPin size={12} /> Logistical Metrics
                    </h4>
                    <div className="p-8 bg-indigo-50/30 border border-indigo-100/50 rounded-[32px] space-y-8">
                      <div className="grid grid-cols-2 gap-8 relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 bg-white border border-indigo-100 rounded-full flex items-center justify-center text-indigo-300 z-10 hidden md:flex">
                          <ChevronRight size={14} />
                        </div>
                        <div className="space-y-4">
                          <div>
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Check-In</p>
                            <p className="font-mono text-xl font-black text-gray-900 tracking-tighter">{ts.time_entry?.split(' ')[1] || '-'}</p>
                            <p className="text-[11px] font-bold text-gray-500 mt-0.5">{ts.time_entry?.split(' ')[0] || '-'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Odometer</p>
                            <p className="font-mono text-sm font-black bg-white px-2 py-1 rounded border border-indigo-100 inline-block text-indigo-700">{ts.km_entry ? Number(ts.km_entry).toLocaleString('en-US') : '0'} KM</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Check-Out</p>
                            <p className="font-mono text-xl font-black text-gray-900 tracking-tighter">{ts.time_exit?.split(' ')[1] || '-'}</p>
                            <p className="text-[11px] font-bold text-gray-500 mt-0.5">{ts.time_exit?.split(' ')[0] || '-'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Odometer</p>
                            <p className="font-mono text-sm font-black bg-white px-2 py-1 rounded border border-indigo-100 inline-block text-indigo-700">{ts.km_exit ? Number(ts.km_exit).toLocaleString('en-US') : '0'} KM</p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-indigo-100">
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Location Node</p>
                        <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                          <MapPin size={14} className="text-indigo-400" />
                          {ts.site_name || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
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
                  Close
                </button>
                {isEditing ? (
                  <button 
                    form="edit-timesheet-form"
                    type="submit"
                    className="px-6 py-2.5 rounded-xl font-bold text-sm bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all"
                  >
                    Save Changes
                  </button>
                ) : ts.status_approved === 0 ? (
                  <>
                    <button 
                      onClick={() => handleApprove(ts.id_timesheets_mitra, -2)}
                      className="px-6 py-2.5 rounded-xl font-bold text-sm text-amber-600 bg-amber-50 hover:bg-amber-100 transition-all flex items-center gap-2"
                    >
                      <History size={16} /> Request Revision
                    </button>
                    <button 
                      onClick={() => handleApprove(ts.id_timesheets_mitra, 1)}
                      className="px-6 py-2.5 rounded-xl font-bold text-sm bg-[#1a1f2e] text-white hover:bg-blue-600 transition-all flex items-center gap-2 shadow-lg"
                    >
                      <CheckCircle size={16} /> Approve Log
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
        <div className="hidden lg:flex items-center gap-2 p-1 bg-white border border-gray-200 rounded-2xl shadow-sm">
          <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold border border-blue-100 flex items-center gap-2">
            <Clock size={14} /> 
            Recent Logs
          </div>
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
                  <option value="all">Every Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
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
                  <th className="px-8 py-5">Driver Info</th>
                  <th className="px-8 py-5">Schedule In/Out</th>
                  <th className="px-8 py-5">Premium</th>   
                  <th className="px-8 py-5">VIP</th>   
                  <th className="px-8 py-5">Status</th>
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
                       <div className="flex items-center gap-4">
                         <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/50 flex items-center justify-center text-blue-600 font-bold text-xs group-hover:scale-110 transition-all duration-500">
                           {ts.employee_id.substring(0, 2)}
                         </div>
                         <div>
                           <div className="font-black text-gray-900 tracking-tight text-[15px]">{ts.employee_id}</div>
                           <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">Verified Logistical Partner</div>
                         </div>
                       </div>
                    </td>
                    
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-8">
                        <div className="space-y-1">
                           <span className="block text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Check Entry</span>
                           <div className="flex items-center gap-2">
                             <span className="font-mono font-black text-gray-900 text-[14px]">{ts.time_entry?.split(' ')[1] || '-'}</span>
                             <span className="text-[10px] font-black text-blue-600/60 bg-blue-50 px-1.5 py-0.5 rounded-lg border border-blue-100/50">{ts.km_entry ? Number(ts.km_entry).toLocaleString('en-US') : '0'} KM</span>
                           </div>
                        </div>
                        <div className="h-10 w-px bg-gray-100" />
                        <div className="space-y-1">
                           <span className="block text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Check Exit</span>
                           <div className="flex items-center gap-2">
                             <span className="font-mono font-black text-gray-900 text-[14px]">{ts.time_exit?.split(' ')[1] || '-'}</span>
                             <span className="text-[10px] font-black text-indigo-600/60 bg-indigo-50 px-1.5 py-0.5 rounded-lg border border-indigo-100/50">{ts.km_exit ? Number(ts.km_exit).toLocaleString('en-US') : '0'} KM</span>
                           </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      {ts.is_premium === 1 ? (
                        <div className="flex flex-col items-start gap-1">
                          <span className="inline-flex items-center gap-1 bg-blue-50/80 text-blue-600 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-200/50">
                            <CheckCircle size={10} /> Active
                          </span>
                          {ts.premium_name && <span className="text-[9px] font-bold text-gray-400 truncate max-w-[100px]">{ts.premium_name}</span>}
                        </div>
                      ) : (
                        <span className="text-gray-300 font-black px-2">-</span>
                      )}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      {ts.is_vip === 1 ? (
                        <div className="flex flex-col items-start gap-1">
                          <span className="inline-flex items-center gap-1 bg-amber-50/80 text-amber-600 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-amber-200/50">
                            <CheckCircle size={10} /> Active
                          </span>
                          {ts.vip_name && <span className="text-[9px] font-bold text-gray-400 truncate max-w-[100px]">{ts.vip_name}</span>}
                        </div>
                      ) : (
                        <span className="text-gray-300 font-black px-2">-</span>
                      )}
                    </td>
                    <td className="px-8 py-6">{getStatusBadge(ts.status_approved)}</td>
                    <td className="px-8 py-6 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setSelectedTimesheet(ts)}
                          className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all shadow-sm ring-1 ring-transparent hover:ring-blue-100"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleEditClick(ts)}
                          className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all shadow-sm ring-1 ring-transparent hover:ring-indigo-100"
                          title="Edit Record"
                        >
                          <Pencil size={18} />
                        </button>
                        {ts.status_approved === 0 ? (
                          <div className="flex items-center gap-1.5 ml-2 border-l border-gray-100 pl-3">
                             <button 
                              onClick={() => handleApprove(ts.id_timesheets_mitra, -2)}
                              className="p-2.5 text-gray-400 hover:text-amber-600 hover:bg-white rounded-xl transition-all shadow-sm"
                              title="Revision"
                            >
                              <History size={18} />
                            </button>
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
                            {ts.status_approved === 1 ? (
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
                    <td colSpan={6} className="px-8 py-24 text-center">
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
    </motion.div>
  );
}
