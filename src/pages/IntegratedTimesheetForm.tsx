import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const IntegratedTimesheetForm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        employee_id: '',
        nama_driver: '',
        code_customer: '',
        date_timesheets: '',
        time_entry: '',
        km_entry: '',
        time_exit: '',
        km_exit: '',
        is_premium: '0',
        premium_name: '',
        is_vip: '0',
        vip_name: '',
        status_hari_raya: '0',
        status_hari_libur: '0',
        penugasan: '',
        status_approve: '0',
        note_approve: '',
        foto_km_in: '',
        foto_km_out: '',
        lat_masuk: '',
        long_masuk: '',
        lat_keluar: '',
        long_keluar: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('mitra_token');
            const response = await fetch(`${import.meta.env.VITE_URL_API}timesheets/integrated`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: 'Timesheet terintegrasi berhasil disimpan.',
                    confirmButtonColor: '#4d57ef',
                    customClass: {
                        popup: 'rounded-2xl',
                        confirmButton: 'rounded-xl text-sm font-bold px-6 py-2.5'
                    }
                }).then(() => {
                    navigate(-1);
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal',
                    text: data.message || 'Gagal menyimpan timesheet',
                    confirmButtonColor: '#4d57ef',
                    customClass: {
                        popup: 'rounded-2xl',
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
                    popup: 'rounded-2xl',
                    confirmButton: 'rounded-xl text-sm font-bold px-6 py-2.5'
                }
            });
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full px-3 py-2.5 text-sm bg-gray-50/50 border border-gray-200/80 rounded-xl focus:bg-white focus:border-[#4d57ef] focus:ring-4 focus:ring-[#4d57ef]/10 outline-none transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)]";
    const labelClass = "block text-[13px] font-bold text-gray-700 mb-1.5 tracking-tight";

    return (
        <div className="p-4 lg:p-8 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Integrated Timesheet Entry</h1>
                <p className="text-sm font-medium text-gray-500 mt-1">Insert timesheet, location, photos, and approval status in one go.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 lg:p-8 rounded-3xl shadow-sm border border-gray-100/80 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#4d57ef] to-purple-500" />
                
                {/* Driver Info */}
                <div className="mb-10">
                    <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-5">1. Driver Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div>
                            <label className={labelClass}>Employee ID</label>
                            <input required type="text" name="employee_id" value={formData.employee_id} onChange={handleChange} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Driver Name</label>
                            <input required type="text" name="nama_driver" value={formData.nama_driver} onChange={handleChange} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Customer Code</label>
                            <input required type="text" name="code_customer" value={formData.code_customer} onChange={handleChange} className={inputClass} />
                        </div>
                    </div>
                </div>

                {/* Timesheet Info */}
                <div className="mb-10">
                    <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-5">2. Timesheet Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                        <div>
                            <label className={labelClass}>Date</label>
                            <input required type="date" name="date_timesheets" value={formData.date_timesheets} onChange={handleChange} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Time In</label>
                            <input required type="text" placeholder="HH:MM" name="time_entry" value={formData.time_entry} onChange={handleChange} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Time Out</label>
                            <input type="text" placeholder="HH:MM" name="time_exit" value={formData.time_exit} onChange={handleChange} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>KM In</label>
                            <input required type="number" name="km_entry" value={formData.km_entry} onChange={handleChange} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>KM Out</label>
                            <input type="number" name="km_exit" value={formData.km_exit} onChange={handleChange} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Assignment (Penugasan)</label>
                            <input type="text" name="penugasan" value={formData.penugasan} onChange={handleChange} className={inputClass} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                        <div>
                            <label className={labelClass}>Is Premium</label>
                            <select name="is_premium" value={formData.is_premium} onChange={handleChange} className={inputClass}>
                                <option value="0">No</option>
                                <option value="1">Yes</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Is VIP</label>
                            <select name="is_vip" value={formData.is_vip} onChange={handleChange} className={inputClass}>
                                <option value="0">No</option>
                                <option value="1">Yes</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Hari Libur</label>
                            <select name="status_hari_libur" value={formData.status_hari_libur} onChange={handleChange} className={inputClass}>
                                <option value="0">No</option>
                                <option value="1">Yes</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Hari Raya</label>
                            <select name="status_hari_raya" value={formData.status_hari_raya} onChange={handleChange} className={inputClass}>
                                <option value="0">No</option>
                                <option value="1">Yes</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Location & Photos */}
                <div className="mb-10">
                    <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-5">3. Location & Photos (URLs)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-5 p-5 bg-gray-50/50 rounded-2xl border border-gray-100">
                            <div>
                                <label className={labelClass}>Lat In</label>
                                <input type="text" name="lat_masuk" value={formData.lat_masuk} onChange={handleChange} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Long In</label>
                                <input type="text" name="long_masuk" value={formData.long_masuk} onChange={handleChange} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Photo KM In (URL)</label>
                                <input type="text" name="foto_km_in" value={formData.foto_km_in} onChange={handleChange} className={inputClass} placeholder="https://..." />
                            </div>
                        </div>
                        <div className="space-y-5 p-5 bg-gray-50/50 rounded-2xl border border-gray-100">
                            <div>
                                <label className={labelClass}>Lat Out</label>
                                <input type="text" name="lat_keluar" value={formData.lat_keluar} onChange={handleChange} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Long Out</label>
                                <input type="text" name="long_keluar" value={formData.long_keluar} onChange={handleChange} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Photo KM Out (URL)</label>
                                <input type="text" name="foto_km_out" value={formData.foto_km_out} onChange={handleChange} className={inputClass} placeholder="https://..." />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Approval */}
                <div className="mb-8">
                    <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-5">4. Approval Status</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                        <div>
                            <label className={labelClass}>Status Approve</label>
                            <select name="status_approve" value={formData.status_approve} onChange={handleChange} className={inputClass}>
                                <option value="0">Pending</option>
                                <option value="1">Approved</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Approval Note</label>
                            <textarea name="note_approve" value={formData.note_approve} onChange={handleChange} rows={2} className={inputClass}></textarea>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-10 pt-6 border-t border-gray-100">
                    <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 active:scale-95 transition-all">Cancel</button>
                    <button type="submit" disabled={loading} className="px-6 py-2.5 bg-[#4d57ef] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#4d57ef]/20 hover:bg-[#3d45cf] active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all flex items-center justify-center min-w-[140px]">
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : 'Save Timesheet'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default IntegratedTimesheetForm;
