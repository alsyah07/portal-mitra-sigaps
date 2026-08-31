import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { ChevronDown, Building2, Calendar, UserSquare2, RefreshCw, Search, Check } from 'lucide-react';

interface EmployeeOption {
    employee_id: string;
    nama_driver: string;
}

const SearchableSelect = ({ 
    options, 
    value, 
    onChange, 
    placeholder,
    icon: Icon
}: {
    options: { value: string, label: string }[],
    value: string,
    onChange: (val: string) => void,
    placeholder: string,
    icon?: any
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = options.filter(opt => 
        opt.label.toLowerCase().includes(search.toLowerCase()) || 
        opt.value.toLowerCase().includes(search.toLowerCase())
    );

    const selectedOption = options.find(o => o.value === value);

    return (
        <div ref={wrapperRef} className="relative w-full">
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full pl-11 pr-4 py-3.5 text-sm font-bold text-gray-800 bg-gray-50/50 border border-gray-200/80 rounded-2xl cursor-pointer flex items-center justify-between hover:border-indigo-300 hover:bg-white focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 shadow-[0_2px_10px_rgba(0,0,0,0.015)]"
            >
                {Icon && <Icon size={18} className="absolute left-4 text-gray-400 pointer-events-none" />}
                <span className={`truncate pr-2 ${selectedOption ? '' : 'text-gray-400'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown size={18} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute z-[100] w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] overflow-hidden max-h-64 flex flex-col">
                    <div className="p-2 border-b border-gray-100 shrink-0">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                className="w-full pl-9 pr-3 py-2.5 text-sm font-medium bg-gray-50 border border-transparent rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 focus:bg-white transition-all placeholder:text-gray-400"
                                placeholder="Cari..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onClick={e => e.stopPropagation()}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="overflow-y-auto p-1.5 scrollbar-thin">
                        {filteredOptions.length === 0 ? (
                            <div className="p-4 text-center text-sm text-gray-400 font-medium italic">Tidak ditemukan</div>
                        ) : (
                            filteredOptions.map(opt => (
                                <div
                                    key={opt.value}
                                    onClick={() => {
                                        onChange(opt.value);
                                        setIsOpen(false);
                                        setSearch('');
                                    }}
                                    className={`px-3 py-2.5 mb-0.5 rounded-xl cursor-pointer text-sm font-bold transition-all flex items-center justify-between ${
                                        value === opt.value 
                                        ? 'bg-indigo-50 text-indigo-700' 
                                        : 'hover:bg-gray-50 text-gray-700'
                                    }`}
                                >
                                    <span className="truncate pr-4">{opt.label}</span>
                                    {value === opt.value && <Check size={14} className="text-indigo-600 shrink-0" />}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const IntegratedTimesheetForm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [optionsLoading, setOptionsLoading] = useState(true);
    
    const [customers, setCustomers] = useState<{value: string, label: string}[]>([]);
    const [employees, setEmployees] = useState<{value: string, label: string}[]>([]);

    const [formData, setFormData] = useState({
        code_customer: 'KTM',
        date_timesheets: '',
        employee_id: '',
    });

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const token = localStorage.getItem('mitra_token');
                const response = await fetch(`${import.meta.env.VITE_URL_API}form-options?code_customer=${formData.code_customer}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (data.status === 'success') {
                    setCustomers(data.data.customers.map((c: string) => ({ value: c, label: c })));
                    
                    const empOpts = data.data.employees.map((e: EmployeeOption) => ({
                        value: e.employee_id,
                        label: `${e.employee_id} - ${e.nama_driver}`
                    }));
                    setEmployees([
                        { value: '', label: '-- Tarik Semua Driver --' },
                        ...empOpts
                    ]);
                }
            } catch (err) {
                console.error('Failed to fetch options:', err);
            } finally {
                setOptionsLoading(false);
            }
        };
        fetchOptions();
    }, [formData.code_customer]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.code_customer || !formData.date_timesheets) {
            Swal.fire({
                icon: 'warning',
                title: 'Perhatian',
                text: 'Harap isi Code Customer dan Tanggal terlebih dahulu.',
                confirmButtonColor: '#4d57ef',
                customClass: {
                    popup: 'rounded-[2rem]',
                    confirmButton: 'rounded-xl text-sm font-bold px-6 py-2.5'
                }
            });
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('mitra_token');
            const apiUrl = formData.employee_id 
                ? `${import.meta.env.VITE_URL_API}sync_timesheets_portal/${formData.code_customer}/${formData.date_timesheets}/${formData.employee_id}`
                : `${import.meta.env.VITE_URL_API}sync_timesheets_portal/${formData.code_customer}/${formData.date_timesheets}`;
                
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (response.ok && data.status === 'success') {
                Swal.fire({
                    icon: 'success',
                    title: 'Sinkronisasi Berhasil!',
                    text: data.message || 'Timesheet berhasil ditarik dari portal.',
                    confirmButtonColor: '#4d57ef',
                    customClass: {
                        popup: 'rounded-[2rem]',
                        confirmButton: 'rounded-xl text-sm font-bold px-6 py-2.5'
                    }
                }).then(() => {
                    navigate(-1);
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Sinkronisasi Gagal',
                    text: data.message || 'Gagal menarik timesheet dari portal.',
                    confirmButtonColor: '#4d57ef',
                    customClass: {
                        popup: 'rounded-[2rem]',
                        confirmButton: 'rounded-xl text-sm font-bold px-6 py-2.5'
                    }
                });
            }
        } catch (err: any) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message || 'Terjadi kesalahan pada sistem',
                confirmButtonColor: '#4d57ef',
                customClass: {
                    popup: 'rounded-[2rem]',
                    confirmButton: 'rounded-xl text-sm font-bold px-6 py-2.5'
                }
            });
        } finally {
            setLoading(false);
        }
    };

    const inputWrapperClass = "relative flex items-center";
    const inputClass = "w-full pl-11 pr-4 py-3.5 text-sm font-bold text-gray-800 bg-gray-50/50 border border-gray-200/80 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all duration-300 appearance-none shadow-[0_2px_10px_rgba(0,0,0,0.015)]";
    const labelClass = "block text-xs font-black text-gray-400 mb-2 uppercase tracking-[0.15em]";

    return (
        <div className="p-4 lg:p-10 max-w-2xl mx-auto min-h-[calc(100vh-100px)] flex flex-col justify-center">
            <div className="mb-10 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 mb-6 shadow-sm border border-indigo-100">
                    <RefreshCw size={28} className="stroke-[2.5]" />
                </div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-3">Tarik Data Portal</h1>
                <p className="text-[15px] font-medium text-gray-500 max-w-sm mx-auto leading-relaxed">
                    Sinkronkan data timesheet dari portal partner secara otomatis.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-xl shadow-gray-200/20 border border-gray-100 relative overflow-visible group">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-80" />
                
                {optionsLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                        <div className="w-8 h-8 border-4 border-gray-100 border-t-indigo-600 rounded-full animate-spin" />
                        <span className="text-sm font-bold text-gray-400 animate-pulse">Menyiapkan konfigurasi...</span>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div>
                            <label className={labelClass}>Customer Code</label>
                            <SearchableSelect 
                                options={customers} 
                                value={formData.code_customer} 
                                onChange={(val) => setFormData(prev => ({ ...prev, code_customer: val }))} 
                                placeholder="Pilih Customer Code"
                                icon={Building2}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Tanggal Sinkronisasi</label>
                            <div className={inputWrapperClass}>
                                <Calendar size={18} className="absolute left-4 text-gray-400 pointer-events-none" />
                                <input required type="date" name="date_timesheets" value={formData.date_timesheets} onChange={handleChange} className={inputClass} />
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>
                                Employee ID <span className="text-gray-300 font-medium tracking-normal normal-case ml-1">(Opsional)</span>
                            </label>
                            <SearchableSelect 
                                options={employees} 
                                value={formData.employee_id} 
                                onChange={(val) => setFormData(prev => ({ ...prev, employee_id: val }))} 
                                placeholder="-- Tarik Semua Driver --"
                                icon={UserSquare2}
                            />
                            <p className="mt-2 text-xs font-medium text-gray-400 px-1">
                                Jika dikosongkan, seluruh data driver pada tanggal tersebut akan ditarik.
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row justify-end gap-3 mt-12 pt-8 border-t border-gray-50">
                    <button type="button" onClick={() => navigate(-1)} className="w-full sm:w-auto px-8 py-3.5 rounded-2xl text-[13px] font-black uppercase tracking-widest text-gray-500 bg-gray-50 hover:bg-gray-100 transition-all active:scale-95">
                        Batal
                    </button>
                    <button type="submit" disabled={loading || optionsLoading} className="w-full sm:w-auto px-10 py-3.5 bg-gray-900 text-white rounded-2xl text-[13px] font-black uppercase tracking-widest shadow-xl shadow-gray-900/20 hover:bg-indigo-600 hover:shadow-indigo-500/30 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all flex items-center justify-center min-w-[180px]">
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <div className="flex items-center gap-2">
                                <RefreshCw size={16} />
                                <span>Tarik Data</span>
                            </div>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default IntegratedTimesheetForm;
