import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, 
  Search, 
  RefreshCw,
  FileJson,
  Eye,
  Shield,
  History,
  User,
  Terminal,
  Clock,
  ArrowRight,
  Activity,
  Globe,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

interface AuditTrailData {
  id__audit_trail: number;
  code_customer: string;
  id_users: number;
  employee_id: string | null;
  nama_driver: string | null;
  source_table: string;
  action: string;
  old_data: string | null;
  new_data: string | null;
  ip_address: string;
  date_original: string | null;
  audit_date: string;
  status_audit: number;
  keterangan_data: string | null;
  created_at: string;
  updated_at: string | null;
  users: {
    nama_customer: string;
    email: string;
  };
}

export default function AuditOperasional() {
  const { user, token } = useAuth();
  const [data, setData] = useState<AuditTrailData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAudit, setSelectedAudit] = useState<AuditTrailData | null>(null);
  const [activeTab, setActiveTab] = useState<'operational' | 'identity' | 'security'>('operational');

  const fetchAuditData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_URL_API}audit-trail/${user.code_customer}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.status === 'success') {
        setData(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch audit data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRollback = async (id_audit: number) => {
    if (!user) return;
    
    const confirmResult = await Swal.fire({
      title: 'Konfirmasi Rollback',
      text: "Apakah Anda yakin ingin memulihkan record ini ke status sebelumnya? Tindakan ini akan dicatat dan data saat ini akan ditimpa.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Pulihkan!',
      cancelButtonText: 'Batal',
      customClass: {
        popup: 'rounded-[2rem] border border-gray-100 shadow-2xl',
        title: 'text-2xl font-black text-gray-900',
        confirmButton: 'rounded-2xl px-8 py-3 font-black uppercase text-xs tracking-widest',
        cancelButton: 'rounded-2xl px-8 py-3 font-black uppercase text-xs tracking-widest'
      }
    });

    if (!confirmResult.isConfirmed) return;

    try {
      setLoading(true);
      const rollbackUrl = `${import.meta.env.VITE_URL_API}audit-trail/rollback/${id_audit}?id_users=${user?.id_users}`;
      const response = await fetch(rollbackUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.status === 'success') {
        Swal.fire({
          title: 'Berhasil Dipulihkan!',
          text: 'Data telah berhasil dikembalikan ke status sebelumnya.',
          icon: 'success',
          borderRadius: '2rem',
          confirmButtonColor: '#1e3a5f'
        });
        setSelectedAudit(null);
        fetchAuditData();
      } else {
        Swal.fire('Kesalahan', result.message || 'Gagal memulihkan data', 'error');
      }
    } catch (err) {
      console.error('Rollback failed:', err);
      Swal.fire('Kesalahan Koneksi', 'Gagal terhubung ke server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditData();
  }, [user]);

  const filteredData = data.filter(item => {
    // Hide REGISTER actions as requested
    if (item.action === 'REGISTER' || item.action === 'REGISTER_USER') return false;

    const matchesSearch = 
      item.source_table.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nama_driver?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const getActionColor = (action: string) => {
    switch (action.toUpperCase()) {
      case 'LOGIN': return 'bg-sky-50 text-sky-600 border-sky-100';
      case 'UPDATE': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'INSERT': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'DELETE': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'ROLLBACK': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const safeJsonParse = (str: string | null) => {
    if (!str) return null;
    try {
      // If it's already an object, return it
      if (typeof str === 'object') return str;
      return JSON.parse(str);
    } catch (e) {
      // If parsing fails (e.g. truncated data), return the raw string or a partial object
      console.warn('Failed to parse JSON:', str);
      return str; 
    }
  };

  const formatValue = (key: string, value: any) => {
    if (value === null || value === undefined || value === 'null') return '-';
    
    // Check if it's a date_timesheets (Unix timestamp in seconds)
    if (key === 'date_timesheets' && !isNaN(Number(value))) {
      const date = new Date(Number(value) * 1000);
      return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    // Handle boolean-like flags for premium/vip
    if (key === 'is_premium' || key === 'is_vip') {
      return Number(value) === 1 ? 'Aktif' : 'Tidak Aktif';
    }
    
    return String(value);
  };

  const formatJson = (data: any) => {
    if (!data) return 'No data';
    if (typeof data === 'string') return data;
    return JSON.stringify(data, null, 4);
  };

  const renderSection = (title: string, keys: string[], icon: any, data: any, variant: 'old' | 'new') => {
    const parsedData = typeof data === 'string' ? safeJsonParse(data) : data;
    if (!parsedData || typeof parsedData !== 'object') return null;

    const otherData = variant === 'new' 
      ? (typeof selectedAudit?.old_data === 'string' ? safeJsonParse(selectedAudit.old_data) : selectedAudit?.old_data)
      : (typeof selectedAudit?.new_data === 'string' ? safeJsonParse(selectedAudit.new_data) : selectedAudit?.new_data);

    const entries = Object.entries(parsedData);
    const sectionEntries = entries.filter(([key]) => keys.includes(key));
    if (sectionEntries.length === 0) return null;

    return (
      <div className="mb-12 last:mb-0">
        <div className="flex items-center gap-4 mb-6 px-4">
          <div className="h-10 w-10 bg-[#1e3a5f] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-900/20">
            {icon}
          </div>
          <h6 className="text-xs font-black uppercase tracking-[0.3em] text-gray-800">{title}</h6>
        </div>
        
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest w-1/3">Property</th>
                <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Value</th>
                <th className="px-8 py-4 text-right w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sectionEntries.map(([key, value]) => {
                const otherValue = otherData && typeof otherData === 'object' ? (otherData as any)[key] : undefined;
                const isChanged = otherValue !== undefined && JSON.stringify(value) !== JSON.stringify(otherValue);
                
                return (
                  <tr 
                    key={key} 
                    className={`group transition-all duration-300 ${
                      isChanged 
                        ? (variant === 'new' ? 'bg-emerald-50/40' : 'bg-rose-50/40') 
                        : 'hover:bg-gray-50/30'
                    }`}
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`h-6 w-6 rounded-lg flex items-center justify-center ${isChanged ? (variant === 'new' ? 'text-emerald-600 bg-emerald-100/50' : 'text-rose-500 bg-rose-100/50') : 'text-gray-300 bg-gray-50'}`}>
                          {key.includes('time') ? <Clock size={12} /> : key.includes('km') ? <Activity size={12} /> : <Database size={12} />}
                        </div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{key.replace(/_/g, ' ')}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`text-sm font-black tracking-tight ${
                        isChanged 
                          ? (variant === 'new' ? 'text-emerald-700' : 'text-rose-600') 
                          : 'text-gray-800'
                      }`}>
                        {formatValue(key, value)}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      {isChanged && (
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border shadow-sm ${variant === 'new' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-500 border-rose-100'}`}>
                          <div className={`h-1 w-1 rounded-full animate-pulse ${variant === 'new' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                          {variant === 'new' ? 'Updated' : 'Previous'}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderDataGrid = (data: any, title: string, variant: 'old' | 'new') => {
    const parsedData = typeof data === 'string' ? safeJsonParse(data) : data;
    if (!parsedData || typeof parsedData !== 'object') {
      return (
        <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4 py-24 bg-white rounded-[3rem] border-2 border-dashed border-gray-100 shadow-inner">
          <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 text-gray-300">
            <FileJson size={40} strokeWidth={1} />
          </div>
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-300">No Historical Data</p>
        </div>
      );
    }

    const operationalFields = [
      'date_timesheets', 'time_entry', 'km_entry', 
      'time_exit', 'km_exit', 'is_premium', 'premium_name', 
      'is_vip', 'vip_name', 'status_hari_raya', 
      'status_hari_libur', 'penugasan'
    ];

    const identityFields = ['employee_id', 'nama_driver', 'code_customer', 'id_timesheets_mitra'];

    return (
      <div className="pr-2">
        {renderSection('Operational Metrics', operationalFields, <Activity size={16} />, data, variant)}
        {renderSection('Identification', identityFields, <User size={16} />, data, variant)}
        {renderSection('Security & Meta', Object.keys(parsedData).filter(k => !operationalFields.includes(k) && !identityFields.includes(k)), <Shield size={16} />, data, variant)}
      </div>
    );
  };

  const renderChangesPreview = (item: AuditTrailData) => {
    const oldData = safeJsonParse(item.old_data);
    const newData = safeJsonParse(item.new_data);

    if (item.action === 'LOGIN') {
      return (
        <div className="flex items-center gap-2 text-[10px] font-bold text-sky-600 bg-sky-50 px-2.5 py-1.5 rounded-xl border border-sky-100 w-fit shadow-sm">
          <Activity size={12} className="animate-pulse" />
          <span className="tracking-tight">Session Established</span>
        </div>
      );
    }

    // If parsing failed and it's a string (likely truncated)
    if (typeof newData === 'string') {
      return (
        <div className="bg-gray-50/50 p-2 rounded-xl border border-gray-100 max-w-[240px]">
          <p className="text-[10px] font-mono text-gray-400 truncate italic">
            {newData.substring(0, 80)}...
          </p>
        </div>
      );
    }

    if (typeof newData !== 'object' || newData === null) {
      return <span className="text-[10px] text-gray-400 font-medium italic">Data record unavailable</span>;
    }

    const changes: string[] = [];
    Object.keys(newData).forEach(key => {
      const oldVal = oldData && typeof oldData === 'object' ? (oldData as any)[key] : undefined;
      const newVal = (newData as any)[key];
      
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changes.push(key);
      }
    });

    if (changes.length === 0) {
      return (
        <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 bg-emerald-50/50 px-2.5 py-1.5 rounded-xl border border-emerald-100 w-fit">
          <Shield size={12} />
          In-sync
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2 py-1">
        {changes.slice(0, 2).map(key => {
          const oldVal = oldData && typeof oldData === 'object' ? (oldData as any)[key] : null;
          const newVal = (newData as any)[key];
          
          return (
            <div key={key} className="flex flex-col gap-0.5">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5">
                {key.replace(/_/g, ' ')}
              </span>
              <div className="flex items-center gap-1.5 text-[11px] font-black leading-none">
                {oldVal !== null && (
                  <>
                    <span className="text-rose-400 line-through opacity-50 truncate max-w-[80px]">{String(oldVal)}</span>
                    <ArrowRight size={10} className="text-gray-300 shrink-0" />
                  </>
                )}
                <span className="text-emerald-600 truncate max-w-[150px]">{String(newVal)}</span>
              </div>
            </div>
          );
        })}
        {changes.length > 2 && (
          <span className="text-[9px] font-black text-gray-300 uppercase tracking-tighter">+{changes.length - 2} other modifications</span>
        )}
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-20"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#1e3a5f] text-white rounded-2xl shadow-lg shadow-blue-900/20">
              <Shield size={24} strokeWidth={2.5} />
            </div>
            <h3 className="text-3xl font-black text-gray-900 tracking-tight">Audit Trail</h3>
          </div>
          <p className="text-sm font-medium text-gray-500 pl-1">
            Monitoring system-wide activity and operational data modifications.
          </p>
        </div>
        <button 
          onClick={fetchAuditData}
          disabled={loading}
          className="flex items-center gap-2 bg-white border border-gray-200 px-5 py-3 rounded-2xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Refresh Activity
        </button>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Logs', value: filteredData.length, icon: History, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Updates', value: filteredData.filter(d => d.action === 'UPDATE').length, icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Sessions', value: data.filter(d => d.action === 'LOGIN').length, icon: User, color: 'text-sky-600', bg: 'bg-sky-50' },
          { label: 'Integrity', value: '100%', icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
              <p className="text-xl font-black text-gray-900 leading-none">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-white border border-gray-200 rounded-[2.5rem] shadow-[0_4px_30px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row gap-6 justify-between items-center">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by table, action, or driver ID..."
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#1e3a5f]/10 transition-all placeholder:text-gray-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
            <Globe size={14} />
            <span>IP Tracker Active</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Activity & Identity</th>
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Change Description</th>
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Actor</th>
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Timestamp</th>
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <RefreshCw className="animate-spin text-blue-500" size={32} />
                      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Compiling audit logs...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No matching activities found.</p>
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => {
                  return (
                    <tr key={item.id__audit_trail} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-8 py-6 align-top">
                        <div className="flex flex-col gap-4 min-w-[200px]">
                          <div className={`px-4 py-1.5 rounded-2xl border-2 text-[10px] font-black uppercase tracking-[0.2em] w-fit shadow-sm ${getActionColor(item.action)}`}>
                            {item.action}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-2 px-1">Affected Entity</span>
                            <div className="flex items-center gap-3 bg-white border border-gray-100 px-4 py-3 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all group/driver cursor-default">
                              <div className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-inner group-hover/driver:scale-110 transition-transform">
                                {item.action === 'LOGIN' ? <Shield size={18} strokeWidth={2.5} /> : <User size={18} strokeWidth={2.5} />}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-black text-gray-900 truncate">
                                  {item.nama_driver || (item.action === 'LOGIN' ? (item.users?.nama_customer || 'User Session') : 'SYSTEM')}
                                </span>
                                <span className="text-[10px] font-bold text-blue-500/70 tracking-tighter">
                                  {item.employee_id || (item.action === 'LOGIN' ? 'ACCESS' : 'INTERNAL')}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-3 px-1">
                              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Terminal size={10} /> {item.source_table}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-8 py-6 align-top">
                        <div className="min-w-[300px]">
                          {item.keterangan_data ? (
                            <div className="bg-amber-50/50 border border-amber-100/50 p-5 rounded-[2rem] shadow-sm hover:shadow-md transition-all">
                              <div className="flex items-center gap-2 mb-3">
                                <Activity size={14} className="text-amber-500" />
                                <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest">Modified Attributes</span>
                              </div>
                              <p className="text-sm font-bold text-gray-800 leading-relaxed italic">
                                {item.keterangan_data}
                              </p>
                            </div>
                          ) : item.action === 'LOGIN' ? (
                            <div className="bg-sky-50/30 border border-sky-100/50 p-5 rounded-[2rem] flex flex-col items-center justify-center gap-2">
                              <Shield size={24} className="text-sky-400 opacity-50" />
                              <span className="text-[10px] font-black text-sky-600 uppercase tracking-widest">Session Established</span>
                            </div>
                          ) : (
                            <div className="bg-gray-50/30 border border-gray-100/50 p-5 rounded-[2rem] flex flex-col items-center justify-center gap-2">
                              <FileJson size={24} className="text-gray-300 opacity-50" />
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">System Snapshot Logged</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-8 py-6 align-top">
                        <div className="flex items-center gap-3 bg-gray-50/50 p-2 rounded-2xl border border-gray-100 shadow-sm min-w-[180px]">
                          <div className="h-10 w-10 rounded-xl bg-[#1e3a5f] text-white flex items-center justify-center font-black text-sm uppercase shadow-lg shadow-blue-900/20">
                            {item.users?.nama_customer?.charAt(0) || 'S'}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-black text-gray-900 truncate">
                              {item.users?.nama_customer || 'System Process'}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 truncate">
                              {item.users?.email || 'automated@system.com'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-8 py-6 align-top">
                        <div className="flex flex-col bg-white border border-gray-100 p-2.5 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-default">
                          <span className="text-xs font-black text-gray-700 flex items-center gap-1.5 mb-1">
                            <Clock size={12} className="text-blue-500" />
                            {new Date(item.audit_date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400 tracking-tight">
                            {new Date(item.audit_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          <div className="flex items-center gap-1 mt-2 text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-lg border border-blue-100/50 w-fit">
                            <Globe size={10} />
                            <span className="font-mono">{item.ip_address}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-8 py-6 text-right align-top">
                        <div className="flex items-center justify-end gap-3">
                          {item.action === 'UPDATE' && user?.role?.some(r => r.role === 'superadmin' || r.role === 'audit') && (
                            <button 
                              onClick={() => handleRollback(item.id__audit_trail)}
                              title="Restore Previous State"
                              className="h-12 w-12 flex items-center justify-center bg-white border border-rose-100 text-rose-500 hover:text-white hover:border-rose-600 hover:bg-rose-600 rounded-2xl transition-all shadow-sm active:scale-90"
                            >
                              <RotateCcw size={18} />
                            </button>
                          )}
                          <button 
                            onClick={() => setSelectedAudit(item)}
                            title="View Details"
                            className="h-12 w-12 flex items-center justify-center bg-white border border-gray-100 text-gray-400 hover:text-blue-600 hover:border-blue-600 hover:bg-blue-50 rounded-2xl transition-all shadow-sm active:scale-90"
                          >
                            <Eye size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for detailed data diff view */}
      <AnimatePresence>
        {selectedAudit && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/70 backdrop-blur-xl" 
              onClick={() => setSelectedAudit(null)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-7xl h-[85vh] bg-[#f8fafc] rounded-[3.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col border border-white/20"
            >
              {/* Modal Header */}
              <div className="shrink-0 px-12 py-10 border-b border-gray-100 flex items-center justify-between bg-white/50">
                <div className="flex items-center gap-6">
                  <div className={`p-5 rounded-[2rem] border-2 shadow-lg ${getActionColor(selectedAudit.action)}`}>
                    <Database size={28} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h4 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                      Audit Intelligence 
                      <span className="text-blue-600 bg-blue-50 px-4 py-1 rounded-2xl text-sm border border-blue-100 font-black">
                        #{selectedAudit.id__audit_trail}
                      </span>
                    </h4>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] bg-white px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm">
                        <Terminal size={14} className="text-emerald-500" /> {selectedAudit.source_table}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] bg-white px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm">
                        <Globe size={14} className="text-blue-500" /> {selectedAudit.ip_address}
                      </div>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedAudit(null)} 
                  className="h-16 w-16 flex items-center justify-center rounded-[2rem] bg-white border border-gray-100 text-gray-400 hover:text-gray-900 hover:border-gray-300 transition-all shadow-sm active:scale-95 group"
                >
                  <RefreshCw size={24} className="rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                </button>
              </div>

              {/* Modal Content - Simple Minimalist Table */}
              <div className="flex-1 flex flex-col overflow-hidden px-12 pb-12">
                <div className="flex-1 bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                  {/* Simple Header */}
                  <div className="shrink-0 grid grid-cols-12 border-b border-gray-100 px-8 py-5">
                    <div className="col-span-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Property</div>
                    <div className="col-span-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Previous</div>
                    <div className="col-span-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Modified</div>
                  </div>

                  {/* Clean Body */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar px-2">
                    {[
                      { title: 'Operational', fields: ['date_timesheets', 'time_entry', 'km_entry', 'time_exit', 'km_exit', 'is_premium', 'premium_name', 'is_vip', 'vip_name', 'status_hari_raya', 'status_hari_libur', 'penugasan'] }
                    ].map((section) => (
                      <div key={section.title} className="mb-8">
                        <div className="px-6 py-3 border-b border-gray-50 flex items-center justify-between">
                          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-300">{section.title}</span>
                        </div>
                        
                        <div className="divide-y divide-gray-50">
                          {section.fields.map(key => {
                            const oldD = safeJsonParse(selectedAudit.old_data);
                            const newD = safeJsonParse(selectedAudit.new_data);
                            const oldVal = oldD && typeof oldD === 'object' ? (oldD as any)[key] : undefined;
                            const newVal = newD && typeof newD === 'object' ? (newD as any)[key] : undefined;
                            const isChanged = JSON.stringify(oldVal) !== JSON.stringify(newVal);

                            if (oldVal === undefined && newVal === undefined) return null;

                            return (
                              <div key={key} className="grid grid-cols-12 items-center px-6 py-4 hover:bg-gray-50/50 transition-colors">
                                <div className="col-span-4">
                                  <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{key.replace(/_/g, ' ')}</span>
                                </div>
                                
                                <div className="col-span-4">
                                  <span className="text-xs text-gray-400">
                                    {oldVal !== undefined ? formatValue(key, oldVal) : '-'}
                                  </span>
                                </div>

                                <div className="col-span-4 text-right">
                                  <span className={`text-xs ${isChanged ? 'font-black text-emerald-600' : 'font-medium text-gray-800'}`}>
                                    {newVal !== undefined ? formatValue(key, newVal) : '-'}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="shrink-0 px-12 py-10 border-t border-gray-100 bg-white/50 flex items-center justify-between">
                <div className="flex items-center gap-16">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-[#1e3a5f] text-white flex items-center justify-center font-black text-xl shadow-xl shadow-blue-900/30">
                      {selectedAudit.users?.nama_customer?.charAt(0) || 'S'}
                    </div>
                    <div className="flex flex-col">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Authenticated Actor</p>
                      <span className="text-lg font-black text-gray-900 leading-none mb-1">
                        {selectedAudit.users?.nama_customer || 'System Process'}
                      </span>
                      <span className="text-xs font-bold text-gray-400">
                        {selectedAudit.users?.email || 'automated@system.com'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="w-px h-12 bg-gray-200" />

                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-white border border-gray-100 text-blue-500 flex items-center justify-center shadow-md">
                      <Clock size={28} />
                    </div>
                    <div className="flex flex-col">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Timeline Event</p>
                      <span className="text-lg font-black text-gray-900 leading-none mb-1">
                        {new Date(selectedAudit.audit_date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                      <span className="text-xs font-bold text-gray-400">
                        {new Date(selectedAudit.audit_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setSelectedAudit(null)}
                    className="px-8 py-4 bg-white border border-gray-200 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-gray-50 transition-all active:scale-95"
                  >
                    Close
                  </button>
                  {selectedAudit.action === 'UPDATE' && user?.role?.some(r => r.role === 'superadmin' || r.role === 'audit') && (
                    <button 
                      onClick={() => handleRollback(selectedAudit.id__audit_trail)}
                      disabled={loading}
                      className="px-10 py-4 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-rose-900/20 active:scale-95 flex items-center gap-3 disabled:opacity-50"
                    >
                      {loading ? <RefreshCw className="animate-spin" size={14} /> : <History size={14} />}
                      Restore Previous State
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
