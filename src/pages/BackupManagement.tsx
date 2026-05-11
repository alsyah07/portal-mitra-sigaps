import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  History, 
  RotateCcw, 
  Search, 
  Filter,
  Calendar as CalendarIcon,
  User,
  ShieldCheck,
  AlertCircle,
  Database,
  ArrowLeft,
  Terminal,
  Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

interface BackupRecord {
  id__audit_trail: number;
  id_timesheets_mitra: number;
  code_customer: string;
  date_timesheets: string;
  time_entry: string;
  km_entry: string;
  time_exit: string;
  km_exit: string;
  is_premium: number;
  premium_name: string;
  is_vip: number;
  vip_name: string;
  penugasan: string;
  created_at: string;
  status_hari_libur: number;
  status_hari_raya: number;
  nama_driver: string;
  employee_id: string;
}

export default function BackupManagement() {
  const { user, token } = useAuth();
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBackup, setSelectedBackup] = useState<BackupRecord | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const isSuperAdmin = user?.role?.some(r => r.role === 'superadmin');
      const targetCustomer = isSuperAdmin ? 'all' : user?.code_customer;
      
      const response = await fetch(`${import.meta.env.VITE_URL_API}backups/${targetCustomer}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.status === 'success') {
        // Map audit_trail data to match the UI's expected structure
        const mappedData = result.data.map((item: any) => {
          let parsedData: any = {};
          try {
            parsedData = typeof item.old_data === 'string' ? JSON.parse(item.old_data) : item.old_data;
          } catch (e) {
            console.error('Failed to parse old_data:', e);
          }

          return {
            id__audit_trail: item.id__audit_trail,
            id_timesheets_mitra: parsedData.id_timesheets_mitra,
            code_customer: item.code_customer,
            date_timesheets: parsedData.date_timesheets,
            time_entry: parsedData.time_entry,
            km_entry: parsedData.km_entry,
            time_exit: parsedData.time_exit,
            km_exit: parsedData.km_exit,
            is_premium: parsedData.is_premium,
            premium_name: parsedData.premium_name,
            is_vip: parsedData.is_vip,
            vip_name: parsedData.vip_name,
            penugasan: parsedData.penugasan,
            created_at: item.created_at || item.audit_date,
            status_hari_libur: parsedData.status_hari_libur,
            status_hari_raya: parsedData.status_hari_raya,
            nama_driver: item.nama_driver || parsedData.nama_driver,
            employee_id: item.employee_id || parsedData.employee_id
          };
        });
        setBackups(mappedData);
      }
    } catch (err) {
      console.error('Failed to fetch backups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchBackups();
  }, [user]);

  const handleRollback = async (id: number) => {
    const confirmResult = await Swal.fire({
      title: 'Konfirmasi Pemulihan',
      text: "Apakah Anda yakin ingin memulihkan versi riwayat ini? Data aktif saat ini akan ditimpa.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Pulihkan Sekarang',
      cancelButtonText: 'Batal',
      customClass: {
        popup: 'rounded-[3rem] border border-gray-100 shadow-2xl',
        title: 'text-2xl font-black text-gray-900',
        confirmButton: 'rounded-2xl px-8 py-3 font-black uppercase text-xs tracking-widest',
        cancelButton: 'rounded-2xl px-8 py-3 font-black uppercase text-xs tracking-widest'
      }
    });

    if (!confirmResult.isConfirmed) return;
    
    try {
      setActionLoading(true);
      const response = await fetch(`${import.meta.env.VITE_URL_API}backups/rollback/${id}`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id_users: user?.id_users })
      });
      const result = await response.json();
      if (result.status === 'success') {
        Swal.fire({
          title: 'Versi Dipulihkan!',
          text: 'Versi backup yang dipilih telah berhasil diterapkan ke record aktif.',
          icon: 'success',
          borderRadius: '2rem',
          confirmButtonColor: '#1e3a5f'
        });
        setSelectedBackup(null);
        fetchBackups();
      } else {
        Swal.fire('Pemulihan Gagal', result.message || 'Terjadi kesalahan sistem saat pemulihan', 'error');
      }
    } catch (err) {
      console.error('Rollback failed:', err);
      Swal.fire('Kesalahan Koneksi', 'Gagal berkomunikasi dengan server backup', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredBackups = backups.filter(b => 
    b.nama_driver?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.employee_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.date_timesheets?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 bg-[#1e3a5f] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-900/20">
              <RotateCcw size={20} />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">System Backups</h1>
          </div>
          <p className="text-sm font-medium text-gray-400 max-w-lg leading-relaxed">
            Manage historical snapshots of timesheet data. Restore previous versions to recover from accidental changes or system errors.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search by driver, ID, or date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-6 py-4 w-[320px] bg-white border border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all shadow-sm group-hover:border-gray-200"
            />
          </div>
          <button className="h-14 w-14 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all shadow-sm hover:border-gray-200">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden min-h-[600px] flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center bg-gray-50/50">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Retrieving Backups...</span>
            </div>
          </div>
        ) : filteredBackups.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Backup Metadata</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Driver Identity</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Snapshot Details</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredBackups.map((backup) => (
                  <motion.tr 
                    key={backup.id__audit_trail}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="group hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all">
                          <Database size={18} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-gray-900">#{backup.id__audit_trail}</span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                            {new Date(backup.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-gray-900 uppercase tracking-tight">{backup.nama_driver || 'N/A'}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">ID: {backup.employee_id || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl">
                          <CalendarIcon size={12} className="text-gray-400" />
                          <span className="text-[11px] font-bold text-gray-600">{backup.date_timesheets}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-xl">
                          <Activity size={12} className="text-blue-500" />
                          <span className="text-[11px] font-black text-blue-600 uppercase">{backup.time_entry} - {backup.time_exit || '--:--'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {user?.role?.some(r => r.role === 'superadmin') && (
                          <button 
                            disabled={actionLoading}
                            onClick={() => handleRollback(backup.id__audit_trail)}
                            title="Restore This Version"
                            className="h-10 w-10 flex items-center justify-center bg-white border border-blue-100 text-blue-500 hover:text-white hover:border-blue-600 hover:bg-blue-600 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
                          >
                            <RotateCcw size={16} />
                          </button>
                        )}
                        <button 
                          onClick={() => setSelectedBackup(backup)}
                          className="px-6 py-2.5 bg-white border border-gray-200 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#1e3a5f] hover:text-white hover:border-[#1e3a5f] transition-all active:scale-95 shadow-sm"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 bg-gray-50/30">
            <div className="h-20 w-20 bg-white rounded-3xl flex items-center justify-center text-gray-200 shadow-xl mb-6">
              <Database size={40} />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">No backups found</h3>
            <p className="text-sm font-medium text-gray-400 text-center max-w-xs">
              System snapshots are automatically created when timesheets are modified.
            </p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedBackup && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-6 md:p-12 overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" 
              onClick={() => setSelectedBackup(null)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-3xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="px-10 py-8 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                    <History size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Version Details</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Audit ID: #{selectedBackup.id__audit_trail}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedBackup(null)}
                  className="h-10 w-10 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-10 flex-1 overflow-y-auto">
                <div className="grid grid-cols-2 gap-8 mb-10">
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-widest border-b border-gray-50 pb-2">Record State</h4>
                    <div className="grid grid-cols-1 gap-4">
                      {[
                        { label: 'Date', value: selectedBackup.date_timesheets, icon: <CalendarIcon size={14}/> },
                        { label: 'Time In', value: selectedBackup.time_entry, icon: <Activity size={14}/> },
                        { label: 'KM In', value: selectedBackup.km_entry, icon: <Terminal size={14}/> },
                        { label: 'Time Out', value: selectedBackup.time_exit || '--:--', icon: <Activity size={14}/> },
                        { label: 'KM Out', value: selectedBackup.km_exit || '--:--', icon: <Terminal size={14}/> },
                      ].map(item => (
                        <div key={item.label} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="text-blue-500">{item.icon}</div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.label}</span>
                          </div>
                          <span className="text-xs font-black text-gray-900">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-widest border-b border-gray-50 pb-2">Status & Meta</h4>
                    <div className="grid grid-cols-1 gap-4">
                      {[
                        { label: 'Premium', value: selectedBackup.is_premium ? 'Active' : 'Disabled', status: selectedBackup.is_premium },
                        { label: 'VIP', value: selectedBackup.is_vip ? 'Active' : 'Disabled', status: selectedBackup.is_vip },
                        { label: 'Holiday', value: selectedBackup.status_hari_libur ? 'Yes' : 'No', status: selectedBackup.status_hari_libur },
                        { label: 'Eid Status', value: selectedBackup.status_hari_raya ? 'Yes' : 'No', status: selectedBackup.status_hari_raya },
                      ].map(item => (
                        <div key={item.label} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.label}</span>
                          <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${item.status ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-500'}`}>
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-[2rem] p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertCircle size={20} className="text-blue-400" />
                    <h5 className="text-sm font-black text-white tracking-tight">Assignment Context</h5>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed font-medium">
                    {selectedBackup.penugasan || 'No assignment description captured for this snapshot.'}
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-10 py-8 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <p className="text-[10px] font-bold text-gray-400 max-w-[200px]">
                  Restoring will create a new audit entry and overwrite current live data.
                </p>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setSelectedBackup(null)}
                    className="px-6 py-4 bg-white border border-gray-200 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:text-gray-900 transition-all"
                  >
                    {user?.role?.some(r => r.role === 'superadmin') ? 'Cancel' : 'Close View'}
                  </button>
                  {user?.role?.some(r => r.role === 'superadmin') && (
                    <button 
                      disabled={actionLoading}
                      onClick={() => handleRollback(selectedBackup.id__audit_trail)}
                      className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-blue-900/20 active:scale-95 flex items-center gap-3 disabled:opacity-50"
                    >
                      {actionLoading ? <RotateCcw className="animate-spin" size={14} /> : <RotateCcw size={14} />}
                      Restore This Version
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
