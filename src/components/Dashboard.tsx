import { useState, useEffect } from 'react';
import { User, Timesheet, Driver } from '../types';
import { 
  Users, 
  FileCheck, 
  LayoutDashboard, 
  LogOut, 
  Menu, 
  X, 
  CheckCircle, 
  XCircle, 
  Clock,
  MapPin,
  Calendar,
  ChevronRight,
  Filter,
  Eye,
  History,
  ExternalLink,
  Map,
  ShieldCheck,
  Pencil,
  Truck,
  UserSquare2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Swal from 'sweetalert2';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [activeMenu, setActiveMenu] = useState('approve');
  
  // Data Table State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [selectedTimesheet, setSelectedTimesheet] = useState<Timesheet | null>(null);

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

  const fetchDrivers = async () => {
    // In a real app, this would be an API call
    // Using sample data based on the screenshot
    const sampleDrivers: Driver[] = [
      { id: 1, driver_code: 'DR16081', nama_lengkap: 'Ichsan Al Azis', phone: '081510932431', foto: 'https://i.pravatar.cc/150?u=1' },
      { id: 2, driver_code: 'DR11041', nama_lengkap: 'Syariful Amran', phone: '081381619450', foto: 'https://i.pravatar.cc/150?u=2' },
      { id: 3, driver_code: 'DR16061', nama_lengkap: 'Taufik Hidayat', phone: '081289557261', foto: 'https://i.pravatar.cc/150?u=3' },
      { id: 7, driver_code: 'DR18027', nama_lengkap: 'Temporary BMI', phone: '082122163005', foto: 'https://i.pravatar.cc/150?u=7' },
      { id: 8, driver_code: 'DR17123', nama_lengkap: 'Jojo Sukarno', phone: '081288480174', foto: 'https://i.pravatar.cc/150?u=8' },
    ];
    setDrivers(sampleDrivers);
  };

  useEffect(() => {
    fetchTimesheets();
    fetchDrivers();
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
            customClass: {
              popup: 'rounded-[32px] px-8 py-6'
            }
          });
        }
      } catch (err) {
        console.error('Failed to update status:', err);
        Swal.fire('Error', 'Failed to update status', 'error');
      }
    }
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

  // Filter and Pagination Logic
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

  const renderTable = () => (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_1px_2px_0_rgba(0,0,0,0.06)] overflow-hidden">
      {/* Table Controls */}
      <div className="p-4 flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-500">Show</span>
          <div className="relative group">
            <select 
              value={itemsPerPage}
              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="appearance-none border border-gray-200 rounded-xl px-4 py-2 pr-10 text-sm bg-gray-50/50 hover:bg-white hover:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-100/50 transition-all cursor-pointer ring-offset-2"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-blue-500 transition-colors">
              <ChevronRight size={14} className="rotate-90" />
            </div>
          </div>
          <span className="text-sm font-medium text-gray-500">entries</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Search driver or code..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm bg-gray-50/50 hover:bg-white hover:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-100/50 transition-all"
            />
            <Filter size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <div className="relative group">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="appearance-none w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm bg-gray-50/50 hover:bg-white hover:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-100/50 transition-all cursor-pointer"
            >
              <option value="all">Status: Semua</option>
              <option value="pending">Status: Pending</option>
              <option value="approved">Status: Approved</option>
              <option value="rejected">Status: Rejected</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-blue-500 transition-colors">
              <ChevronRight size={14} className="rotate-90" />
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto border-t border-gray-100">
        <table className="w-full text-left">
          <thead className="bg-[#fcfcfa]/60 text-gray-500 text-[11px] font-bold uppercase tracking-wider">
            <tr>
              <th className="px-4 py-4.5">Driver Info</th>
              <th className="px-4 py-4.5 text-center">Mitra Code</th>
              <th className="px-4 py-4.5">Schedule In/Out</th>
              <th className="px-4 py-4.5">Task Description</th>
              <th className="px-4 py-4.5">Status</th>
              <th className="px-4 py-4.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedData.length > 0 ? paginatedData.map((ts, index) => (
              <motion.tr 
                key={ts.id_timesheets_mitra}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50 group/row transition-all duration-300"
              >
                <td className="px-4 py-4 whitespace-nowrap">
                   <div className="flex items-center gap-4">
                     <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/50 flex items-center justify-center text-blue-600 font-bold text-xs ring-4 ring-transparent group-hover/row:ring-blue-50 transition-all">
                       {ts.employee_id.substring(ts.employee_id.length - 2)}
                     </div>
                     <div>
                       <div className="font-bold text-gray-900 tracking-tight">{ts.employee_id}</div>
                       <div className="text-[11px] text-gray-400 font-medium">Verified Driver</div>
                     </div>
                   </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-center">
                  <span className="font-mono text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">
                    {ts.code_customer}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-6">
                    <div className="space-y-1">
                       <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-tighter">Check In</span>
                       <div className="flex items-center gap-1.5">
                         <span className="font-mono font-bold text-gray-900 text-sm">{ts.time_entry.split(' ')[1]}</span>
                         <span className="text-[10px] font-bold text-blue-500/80 italic">{ts.km_entry}km</span>
                       </div>
                    </div>
                    <div className="h-8 w-px bg-gray-100" />
                    <div className="space-y-1">
                       <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-tighter">Check Out</span>
                       <div className="flex items-center gap-1.5">
                         <span className="font-mono font-bold text-gray-900 text-sm">{ts.time_exit.split(' ')[1]}</span>
                         <span className="text-[10px] font-bold text-indigo-500/80 italic">{ts.km_exit}km</span>
                       </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 min-w-[200px]">
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-1 group-hover/row:line-clamp-none transition-all">
                    {ts.task || 'Routine Logistical Support'}
                  </p>
                </td>
                <td className="px-4 py-4">{getStatusBadge(ts.status_approved)}</td>
                <td className="px-4 py-4 text-right whitespace-nowrap">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => setSelectedTimesheet(ts)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedTimesheet(ts);
                        // Future: trigger edit mode
                        Swal.fire({
                          title: 'Edit Mode',
                          text: 'Direct editing feature is being initialized.',
                          icon: 'info',
                          timer: 2000,
                          showConfirmButton: false,
                          customClass: { popup: 'rounded-[32px]' }
                        });
                      }}
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      title="Edit Record"
                    >
                      <Pencil size={18} />
                    </button>
                    {ts.status_approved === 0 ? (
                      <>
                        <button 
                          onClick={() => handleApprove(ts.id_timesheets_mitra, -2)} // Assuming -2 is Revision
                          className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                          title="Request Revision"
                        >
                          <History size={18} />
                        </button>
                        <button 
                          onClick={() => handleApprove(ts.id_timesheets_mitra, -1)}
                          className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                          title="Reject"
                        >
                          <XCircle size={18} />
                        </button>
                        <button 
                          onClick={() => handleApprove(ts.id_timesheets_mitra, 1)}
                          className="bg-[#1a1f2e] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-600 transition-all shadow-lg active:scale-95 flex items-center gap-2 ml-1"
                        >
                          <CheckCircle size={14} />
                          Approve
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg border border-gray-100">
                        {ts.status_approved === 1 ? (
                          <CheckCircle size={14} className="text-emerald-500" />
                        ) : (
                          <XCircle size={14} className="text-rose-500" />
                        )}
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Finalized</span>
                      </div>
                    )}
                  </div>
                </td>
              </motion.tr>
            )) : (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-4 text-gray-400">
                    <div className="p-4 bg-gray-50 rounded-2xl">
                      <Filter size={32} />
                    </div>
                    <p className="font-medium">No results found matching your criteria</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between bg-[#fcfcfa]/30 gap-6">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest flex items-center gap-2">
          Page <span className="text-gray-900 font-bold">{currentPage}</span> of <span className="text-gray-900 font-bold">{totalPages || 1}</span>
          <span className="h-1 w-1 rounded-full bg-gray-300 mx-1" />
          Total <span className="text-gray-900 font-bold">{filteredData.length}</span> records
        </p>
        <div className="flex items-center gap-3">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="px-5 py-2.5 border border-gray-200 bg-white rounded-xl text-sm font-bold text-gray-700 disabled:opacity-30 hover:bg-gray-50 transition-all shadow-sm active:scale-95"
          >
            Previous
          </button>
          
          <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-2xl border border-gray-200/50">
            {[...Array(totalPages)].map((_, i) => (
              <button 
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-9 h-9 rounded-xl text-xs font-bold transition-all duration-300 ${currentPage === i + 1 ? 'bg-white text-blue-600 shadow-md scale-110' : 'text-gray-500 hover:bg-white/50'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button 
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage(p => p + 1)}
            className="px-5 py-2.5 border border-gray-200 bg-white rounded-xl text-sm font-bold text-gray-700 disabled:opacity-30 hover:bg-gray-50 transition-all shadow-sm active:scale-95"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
  
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
            onClick={() => setSelectedTimesheet(null)}
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
                  <FileCheck size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">Timesheet Log Detail</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">ID: {ts.id_timesheets_mitra} • {ts.employee_id}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTimesheet(null)}
                className="p-3 bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-2xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
              {/* Status Banner */}
              <div className={`p-6 rounded-3xl border flex items-center justify-between ${
                ts.status_approved === 1 ? 'bg-emerald-50 border-emerald-100' : 
                ts.status_approved === -1 ? 'bg-rose-50 border-rose-100' : 
                'bg-amber-50 border-amber-100'
              }`}>
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
                    ts.status_approved === 1 ? 'bg-emerald-500 text-white' : 
                    ts.status_approved === -1 ? 'bg-rose-500 text-white' : 
                    'bg-amber-500 text-white'
                  }`}>
                    {ts.status_approved === 1 ? <CheckCircle size={24} /> : 
                     ts.status_approved === -1 ? <XCircle size={24} /> : 
                     <Clock size={24} />}
                  </div>
                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                      ts.status_approved === 1 ? 'text-emerald-600/60' : 
                      ts.status_approved === -1 ? 'text-rose-600/60' : 
                      'text-amber-600/60'
                    }`}>Log Status</p>
                    <p className={`text-lg font-black tracking-tight ${
                      ts.status_approved === 1 ? 'text-emerald-900' : 
                      ts.status_approved === -1 ? 'text-rose-900' : 
                      'text-amber-900'
                    }`}>
                      {ts.status_approved === 1 ? 'Approved & Verified' : 
                       ts.status_approved === -1 ? 'Log Rejected' : 
                       'Awaiting Operations Approval'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Submission Date</p>
                   <p className="text-sm font-bold text-gray-900">{new Date(ts.created_at).toLocaleString('id-ID')}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Logistical Metrics */}
                <div className="space-y-6">
                  <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.25em] flex items-center gap-2">
                    <MapPin size={12} className="text-blue-500" /> Logistical Checkpoints
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 bg-white border border-gray-100 rounded-3xl shadow-sm space-y-3">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Initial KM</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-gray-900">{ts.km_entry}</span>
                        <span className="text-xs font-bold text-gray-400">km</span>
                      </div>
                      <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5 pt-2 border-t border-gray-50">
                        <Clock size={12} /> {ts.time_entry.split(' ')[1]}
                      </p>
                    </div>
                    <div className="p-5 bg-white border border-gray-100 rounded-3xl shadow-sm space-y-3">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Final KM</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-gray-900">{ts.km_exit}</span>
                        <span className="text-xs font-bold text-gray-400">km</span>
                      </div>
                      <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5 pt-2 border-t border-gray-50">
                        <Clock size={12} /> {ts.time_exit.split(' ')[1]}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 bg-[#fafafa] border border-gray-100 rounded-3xl space-y-4">
                    <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Task Description</h5>
                    <p className="text-sm font-medium text-gray-700 leading-relaxed italic border-l-2 border-blue-500 pl-4 bg-white/50 py-3 rounded-r-xl">
                      "{ts.task || 'Routine Logistical Support - No specific task description provided.'}"
                    </p>
                  </div>

                  {/* Tier Badges */}
                  <div className="flex flex-wrap gap-2">
                    {ts.is_premium === 1 && (
                      <div className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-100">
                        <ExternalLink size={12} /> {ts.premium_name || 'Premium Service'}
                      </div>
                    )}
                    {ts.is_vip === 1 && (
                      <div className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-amber-100">
                        <ShieldCheck size={12} /> {ts.vip_name || 'VIP Dedicated'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Proof of Service (Images & GPS) */}
                <div className="space-y-6">
                  <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.25em] flex items-center gap-2">
                    <Map size={12} className="text-blue-500" /> Proof of Service
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">In Measurement</p>
                      <div className="aspect-[4/3] rounded-2xl bg-gray-100 border border-gray-100 overflow-hidden relative group">
                        {ts.foto_km_in ? (
                          <img src={ts.foto_km_in} alt="KM In" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">No Image</div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/50 to-transparent">
                          <p className="text-[8px] text-white font-bold tracking-tighter truncate opacity-80">
                            {ts.lat_masuk}, {ts.long_masuk}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Out Measurement</p>
                      <div className="aspect-[4/3] rounded-2xl bg-gray-100 border border-gray-100 overflow-hidden relative group">
                        {ts.foto_km_out ? (
                          <img src={ts.foto_km_out} alt="KM Out" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">No Image</div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/50 to-transparent">
                          <p className="text-[8px] text-white font-bold tracking-tighter truncate opacity-80">
                            {ts.lat_keluar}, {ts.long_keluar}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-1 rounded-[28px] bg-gray-50 border border-gray-100 overflow-hidden shadow-inner">
                    <div className="h-44 w-full rounded-[24px] overflow-hidden bg-gray-200 relative group">
                      {ts.lat_masuk && ts.long_masuk ? (
                        <iframe 
                          title="Entry Location Map"
                          width="100%" 
                          height="100%" 
                          frameBorder="0" 
                          scrolling="no" 
                          marginHeight={0} 
                          marginWidth={0} 
                          src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(ts.long_masuk)-0.005},${parseFloat(ts.lat_masuk)-0.005},${parseFloat(ts.long_masuk)+0.005},${parseFloat(ts.lat_masuk)+0.005}&layer=mapnik&marker=${ts.lat_masuk},${ts.long_masuk}`}
                          className="grayscale-[0.2] contrast-[1.1]"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                          <MapPin size={24} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">GPS Data Unavailable</span>
                        </div>
                      )}
                      
                      <div className="absolute top-3 right-3">
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${ts.lat_masuk},${ts.long_masuk}`}
                          target="_blank"
                          rel="noreferrer"
                          className="h-8 w-8 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg flex items-center justify-center text-blue-600 shadow-lg hover:scale-110 active:scale-95 transition-all"
                          title="Open in Full Google Maps"
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            {ts.status_approved === 0 && (
              <div className="p-8 border-t border-gray-100 bg-[#fcfcfc] flex items-center justify-end gap-4 shrink-0">
                <button 
                  onClick={() => {
                    Swal.fire({
                      title: 'Edit Mode',
                      text: 'Data correction interface is opening...',
                      icon: 'info',
                      timer: 1500,
                      showConfirmButton: false,
                      customClass: { popup: 'rounded-[32px]' }
                    });
                  }}
                  className="px-6 py-4 bg-gray-100 text-gray-700 rounded-3xl text-xs font-black shadow-sm hover:bg-gray-200 transition-all active:scale-95 uppercase tracking-widest flex items-center gap-2"
                >
                  <Pencil size={16} /> Edit Data
                </button>
                <button 
                  onClick={() => { handleApprove(ts.id_timesheets_mitra, -1); setSelectedTimesheet(null); }}
                  className="px-8 py-4 bg-white border border-gray-200 text-rose-600 rounded-3xl text-xs font-black shadow-sm hover:bg-rose-50 hover:border-rose-100 transition-all active:scale-95 uppercase tracking-widest"
                >
                  Reject Record
                </button>
                <button 
                  onClick={() => { handleApprove(ts.id_timesheets_mitra, 1); setSelectedTimesheet(null); }}
                  className="px-12 py-4 bg-blue-600 text-white rounded-3xl text-xs font-black shadow-xl shadow-blue-200 hover:bg-[#1a1f2e] transition-all hover:-translate-y-0.5 active:scale-95 uppercase tracking-[0.1em] flex items-center gap-3"
                >
                  <CheckCircle size={18} /> Approve Log
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </AnimatePresence>
    );
  };

  return (
    <div className="flex h-screen bg-[#f8f9fa] font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-gray-900/20 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {renderDetailModal()}
      
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 ${sidebarCollapsed ? 'w-20' : 'w-72'} bg-white border-r border-gray-100 transition-all duration-500 ease-in-out lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full overflow-hidden">
          {/* Sidebar Header */}
          <div className="h-24 flex items-center justify-between px-6 border-b border-gray-50 shrink-0 relative transition-all duration-300">
            {!sidebarCollapsed ? (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
              >
                <div className="bg-blue-600 h-10 w-10 shrink-0 flex items-center justify-center rounded-xl text-white shadow-[0_8px_16px_-4px_rgba(37,99,235,0.3)]">
                  <FileCheck size={22} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-blue-600 tracking-tighter leading-none text-xl">SIGAP</span>
                  <span className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] mt-0.5 whitespace-nowrap">Driver Portal</span>
                </div>
              </motion.div>
            ) : (
              <div className="mx-auto h-12 w-12 flex items-center justify-center text-blue-600 bg-blue-50 rounded-2xl border border-blue-100/50 shadow-sm transition-all duration-500">
                <FileCheck size={24} strokeWidth={2.5} />
              </div>
            )}
            
            {/* Collapse Toggle - Dark Square Style from Screenshot */}
            {!sidebarCollapsed && (
              <button 
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:flex h-11 w-11 bg-[#1a1f2e] text-white rounded-xl items-center justify-center hover:bg-black transition-all shadow-[0_4px_12px_rgba(0,0,0,0.15)] active:scale-95 group/toggle"
              >
                <ChevronRight size={20} strokeWidth={2.5} className="rotate-180 transition-transform group-hover:-translate-x-0.5" />
              </button>
            )}

            {sidebarCollapsed && (
              <button 
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 h-8 w-8 bg-white border border-gray-100 rounded-lg items-center justify-center text-gray-400 hover:text-blue-600 shadow-xl z-50 transition-all hover:scale-110 active:scale-90"
              >
                <ChevronRight size={16} strokeWidth={3} />
              </button>
            )}
          </div>

          <nav className={`flex-1 ${sidebarCollapsed ? 'px-3 py-8' : 'p-6'} space-y-5 overflow-y-auto overflow-x-hidden`}>
             {!sidebarCollapsed && (
               <p className="px-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6">Main Navigation</p>
             )}
            <button 
              onClick={() => setActiveMenu('dashboard')}
              title={sidebarCollapsed ? "Overview" : ""}
              className={`flex w-full items-center ${sidebarCollapsed ? 'justify-center h-12 w-12 mx-auto shadow-sm' : 'gap-4 px-6 py-4'} text-sm font-bold rounded-[24px] transition-all duration-300 relative group ${activeMenu === 'dashboard' ? 'bg-[#1a1f2e] text-white shadow-[0_20px_40px_-8px_rgba(26,31,46,0.3)] scale-[1.02]' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900 hover:translate-x-1'}`}
            >
              <LayoutDashboard size={sidebarCollapsed ? 26 : 22} strokeWidth={activeMenu === 'dashboard' ? 2.5 : 2} />
              {!sidebarCollapsed && <span className="tracking-tight">Overview</span>}
              {sidebarCollapsed && activeMenu === 'dashboard' && (
                <motion.div layoutId="active-indicator-pill" className="absolute -left-3 w-1.5 h-10 bg-blue-600 rounded-r-full shadow-[0_0_15px_rgba(37,99,235,0.6)]" />
              )}
            </button>
            <button 
              onClick={() => setActiveMenu('driver')}
              title={sidebarCollapsed ? "Driver Database" : ""}
              className={`flex w-full items-center ${sidebarCollapsed ? 'justify-center h-12 w-12 mx-auto shadow-sm' : 'gap-4 px-6 py-4'} text-sm font-bold rounded-[24px] transition-all duration-300 relative group ${activeMenu === 'driver' ? 'bg-[#1a1f2e] text-white shadow-[0_20px_40px_-8px_rgba(26,31,46,0.3)] scale-[1.02]' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900 hover:translate-x-1'}`}
            >
              <UserSquare2 size={sidebarCollapsed ? 26 : 22} strokeWidth={activeMenu === 'driver' ? 2.5 : 2} />
              {!sidebarCollapsed && <span className="tracking-tight">Driver Database</span>}
              {sidebarCollapsed && activeMenu === 'driver' && (
                <motion.div layoutId="active-indicator-pill" className="absolute -left-3 w-1.5 h-10 bg-blue-600 rounded-r-full shadow-[0_0_15px_rgba(37,99,235,0.6)]" />
              )}
            </button>
            <button 
              onClick={() => setActiveMenu('approve')}
              title={sidebarCollapsed ? "Approval Center" : ""}
              className={`flex w-full items-center ${sidebarCollapsed ? 'justify-center h-12 w-12 mx-auto shadow-sm' : 'gap-4 px-6 py-4'} text-sm font-bold rounded-[24px] transition-all duration-300 relative group ${activeMenu === 'approve' ? 'bg-[#1a1f2e] text-white shadow-[0_20px_40px_-8px_rgba(26,31,46,0.3)] scale-[1.02]' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900 hover:translate-x-1'}`}
            >
              <Users size={sidebarCollapsed ? 26 : 22} strokeWidth={activeMenu === 'approve' ? 2.5 : 2} />
              {!sidebarCollapsed && <span className="tracking-tight">Approval Center</span>}
              {sidebarCollapsed && activeMenu === 'approve' && (
                <motion.div layoutId="active-indicator-pill" className="absolute -left-3 w-1.5 h-10 bg-blue-600 rounded-r-full shadow-[0_0_15px_rgba(37,99,235,0.6)]" />
              )}
            </button>
          </nav>

          {/* User Profile Area - Perfection from Screenshot 1 */}
          <div className={`${sidebarCollapsed ? 'px-3 py-10' : 'px-6 py-10'} mt-auto border-t border-gray-50 bg-white`}>
            {!sidebarCollapsed && (
              <div className="flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-black/[0.01] mb-6">
                <div className="h-12 w-12 shrink-0 flex items-center justify-center rounded-2xl bg-[#4d57ef] text-white font-black text-xl shadow-xl shadow-blue-100">
                  {user.nama_customer.charAt(0)}
                </div>
                <div className="min-w-0 pr-2">
                  <p className="text-[14px] font-black text-gray-900 truncate tracking-tight uppercase">{user.nama_customer}</p>
                  <p className="text-[11px] text-gray-400 uppercase font-black tracking-widest mt-1">CUST-{user.code_customer}</p>
                </div>
              </div>
            )}

            {sidebarCollapsed && (
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-2xl bg-[#4d57ef] text-white font-black text-xl shadow-xl shadow-blue-100 mb-6">
                {user.nama_customer.charAt(0)}
              </div>
            )}

            <button 
              onClick={onLogout}
              title={sidebarCollapsed ? "Disconnect" : ""}
              className={`flex w-full items-center justify-center ${sidebarCollapsed ? 'h-12 w-12 mx-auto rounded-2xl' : 'gap-3 px-6 py-4 rounded-[24px]'} text-sm font-black text-[#f43f5e] bg-[#fff1f2] hover:bg-[#ffe4e6] transition-all duration-300 active:scale-95 group`}
            >
              <LogOut size={sidebarCollapsed ? 22 : 20} className="transition-transform group-hover:translate-x-0.5" />
              {!sidebarCollapsed && <span className="tracking-[0.05em] font-black">Disconnect</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-30">
          <div className="flex items-center gap-6">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-gray-500 bg-gray-50 rounded-xl border border-gray-200">
              <Menu size={20} />
            </button>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                {activeMenu === 'approve' ? 'Timesheet Approval' : activeMenu === 'driver' ? 'Driver Database' : 'Operational Insights'}
              </h1>
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                <Calendar size={12} className="text-blue-500" />
                <span>{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
             <div className="flex flex-col text-right">
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">System Status</span>
               <div className="flex items-center gap-2 justify-end">
                 <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-xs font-bold text-gray-900">Live Services</span>
               </div>
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-[#f8f9fa] scroll-smooth p-4 lg:p-6">
          <motion.div 
            key={activeMenu}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="max-w-full mx-auto"
          >
            {activeMenu === 'approve' ? (
              <div className="space-y-8">
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
                  renderTable()
                )}
              </div>
            ) : activeMenu === 'driver' ? (
              <div className="space-y-8">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                    <div className="h-8 w-1.5 bg-blue-600 rounded-full" />
                    Driver Database
                  </h3>
                  <p className="text-sm font-medium text-gray-500">View and manage driver information and active statuses.</p>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-[32px] overflow-hidden shadow-sm ring-1 ring-black/[0.02]">
                  <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-[#fcfcfa]/50">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-400">Total Drivers:</span>
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-black">{drivers.length}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <input 
                        type="text" 
                        placeholder="Search drivers..."
                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 w-64"
                      />
                      <button className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-600 transition-all flex items-center gap-2">
                        <UserSquare2 size={14} />
                        Add Driver
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-[#fcfcfa]/80 text-gray-500 text-[11px] font-bold uppercase tracking-wider">
                        <tr>
                          <th className="px-8 py-5">No</th>
                          <th className="px-8 py-5">ID</th>
                          <th className="px-8 py-5">Foto</th>
                          <th className="px-8 py-5">Nama Lengkap</th>
                          <th className="px-8 py-5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {drivers.map((driver, index) => (
                          <motion.tr 
                            key={driver.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="hover:bg-blue-50/30 group transition-all duration-300"
                          >
                            <td className="px-8 py-6 text-sm font-medium text-gray-400">{index + 1}</td>
                            <td className="px-8 py-6 text-sm font-bold text-gray-900">{driver.id}</td>
                            <td className="px-8 py-6">
                              <div className="relative group/photo">
                                <div className="h-14 w-14 rounded-full p-1 bg-gradient-to-tr from-gray-200 to-gray-50 group-hover:from-blue-200 group-hover:to-blue-50 transition-all border border-gray-100">
                                  <img 
                                    src={driver.foto || `https://ui-avatars.com/api/?name=${driver.nama_lengkap}&background=4d57ef&color=fff`} 
                                    alt={driver.nama_lengkap}
                                    className="w-full h-full rounded-full object-cover shadow-sm group-hover/photo:scale-110 transition-transform duration-500"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[17px] font-black text-gray-900 tracking-tight">{driver.nama_lengkap}</span>
                                  <div className="h-4 w-8 rounded-full bg-gray-200 animate-pulse" />
                                </div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{driver.driver_code}</span>
                                <div className="flex items-center gap-2 mt-1 text-gray-500 hover:text-blue-600 transition-colors cursor-pointer">
                                  <Clock size={12} className="shrink-0" />
                                  <span className="text-[13px] font-bold">{driver.phone}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                <button className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all shadow-sm">
                                  <Eye size={18} />
                                </button>
                                <button className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all shadow-sm">
                                  <Pencil size={18} />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-10">
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
                        {timesheets.filter(t => t.status_approved === 0).length}
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
                       <button onClick={() => setActiveMenu('approve')} className="group/btn flex items-center gap-2 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-2xl text-xs font-bold transition-all border border-white/5">
                         View Details
                         <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                       </button>
                     </div>
                  </motion.div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
