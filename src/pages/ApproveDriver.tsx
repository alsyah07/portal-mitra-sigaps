import React, { useState, useEffect } from 'react';
import { Timesheet, UserRating } from '../types';
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
  Star,
  FileText,
  X,
  FileSpreadsheet,
  ChevronDown,
  Search,
  Check,
  Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ApproveDriver() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Data Table State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [driverFilter, setDriverFilter] = useState<string>('all');
  const [exitFilter, setExitFilter] = useState<string>('all');
  const [isDriverDropdownOpen, setIsDriverDropdownOpen] = useState(false);
  const [driverSearchQuery, setDriverSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedTimesheet, setSelectedTimesheet] = useState<Timesheet | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Timesheet>>({});
  const [isExporting, setIsExporting] = useState(false);

  // Expenses State
  const [expenses, setExpenses] = useState<any[]>([]);
  const [expensesLoading, setExpensesLoading] = useState(false);
  const [showExpensesModal, setShowExpensesModal] = useState(false);
  const [currentExpenseEmployee, setCurrentExpenseEmployee] = useState<string>('');
  const [currentExpenseDate, setCurrentExpenseDate] = useState<string>('');
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingList, setRatingList] = useState<UserRating[]>([]);
  const [selectedRating, setSelectedRating] = useState<UserRating | null>(null);
  
  // Plate number state for modal
  const [modalPlateNumber, setModalPlateNumber] = useState<string>('-');

  // Fetch plate from expenses when modal opens
  useEffect(() => {
    if (selectedTimesheet) {
      const fetchPlate = async () => {
        try {
          // 1. Try to fetch from users_driver table using id_timesheets
          try {
            const udRes = await fetch(`${import.meta.env.VITE_URL_API_DRIVER}users_driver_by_timesheet/${selectedTimesheet.id_timesheets_mitra}`);
            const udJson = await udRes.json();
            if (udJson.success && udJson.data && udJson.data.plat_nomor) {
              setModalPlateNumber(udJson.data.plat_nomor);
              return;
            }
          } catch (udErr) {
            console.error('Failed to fetch from users_driver:', udErr);
          }

          // 2. Fallback to daily-expenses-date
          const dateStr = selectedTimesheet.date_timesheets;
          const isUnix = /^\d+$/.test(dateStr);
          const dateObj = isUnix ? new Date(Number(dateStr) * 1000) : new Date(dateStr);
          const formattedDate = dateObj.toISOString().split('T')[0];

          const res = await fetch(`${import.meta.env.VITE_URL_API_DRIVER}daily-expenses-date/${selectedTimesheet.employee_id}/${formattedDate}`);
          const json = await res.json();
          if (json.success && json.data && json.data.length > 0) {
            const plates = json.data.map((e: any) => e.plat_nomor_driver || e.plat_nomor_kendaraan || e.plat_nomor).filter(Boolean);
            if (plates.length > 0) {
              setModalPlateNumber(Array.from(new Set(plates)).join(', '));
              return;
            }
          }
          
          // 3. Fallback to user_ratings
          const ratingPlates = selectedTimesheet.user_ratings?.map(r => r.vehicle_plate).filter(Boolean) || [];
          if (ratingPlates.length > 0) {
            setModalPlateNumber(Array.from(new Set(ratingPlates)).join(', '));
          } else {
            setModalPlateNumber('-');
          }
        } catch (e) {
          setModalPlateNumber('-');
        }
      };
      fetchPlate();
    } else {
      setModalPlateNumber('-');
    }
  }, [selectedTimesheet]);

  const fetchTimesheets = async () => {
    if (!user) return;
    console.log('URL : ', import.meta.env.VITE_URL_API + "datatimesheets/" + user.code_customer);
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

  const handleShowExpenses = async (employeeId: string, date: string) => {
    setCurrentExpenseEmployee(employeeId);
    setCurrentExpenseDate(date);
    setShowExpensesModal(true);
    setExpensesLoading(true);
    setExpenses([]); // Clear previous data
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_API_DRIVER}daily-expenses-date/${employeeId}/${date}`);
      const result = await response.json();
      console.log('URL-BON', import.meta.env.VITE_URL_API_DRIVER + "daily-expenses-date/" + employeeId + "/" + date)
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

  const handleSyncTimesheet = async (ts: Timesheet) => {
    try {
      const result = await Swal.fire({
        title: 'Ambil Data Timesheet?',
        text: `Tarik data timesheet dari portal untuk driver ini?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#4d57ef',
        cancelButtonColor: '#f1f5f9',
        confirmButtonText: 'Ya, Ambil',
        cancelButtonText: 'Batal',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'rounded-xl text-sm font-bold px-6 py-2.5',
          cancelButton: 'rounded-xl text-sm font-bold px-6 py-2.5 text-gray-600 border border-gray-200 hover:bg-gray-50'
        }
      });

      if (result.isConfirmed) {
        const token = localStorage.getItem('mitra_token');
        let tsDate = ts.date_timesheets;
        if (typeof ts.date_timesheets === 'string' && /^\d+$/.test(ts.date_timesheets)) {
            const d = new Date(Number(ts.date_timesheets) * 1000);
            tsDate = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        }

        const response = await fetch(`${import.meta.env.VITE_URL_API}sync_timesheets_portal/${ts.code_customer}/${tsDate}/${ts.employee_id}`, {
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
            title: 'Berhasil',
            text: data.message || 'Data berhasil diambil dari portal',
            confirmButtonColor: '#4d57ef',
            customClass: {
              popup: 'rounded-2xl',
              confirmButton: 'rounded-xl text-sm font-bold px-6 py-2.5'
            }
          });
          fetchTimesheets(); // refresh data
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Gagal',
            text: data.message || 'Gagal mengambil data',
            confirmButtonColor: '#4d57ef',
            customClass: {
              popup: 'rounded-2xl',
              confirmButton: 'rounded-xl text-sm font-bold px-6 py-2.5'
            }
          });
        }
      }
    } catch (error) {
      console.error('Error syncing timesheet:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Terjadi kesalahan pada sistem',
        confirmButtonColor: '#4d57ef',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'rounded-xl text-sm font-bold px-6 py-2.5'
        }
      });
    }
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
    } else if (status === 0) {
      title = 'Batalkan Persetujuan?';
      text = 'Timesheet ini akan dikembalikan ke status Menunggu Persetujuan.';
      icon = 'warning';
      confirmButtonColor = '#e11d48';
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
        } else {
          throw new Error(resultJson.message || 'Gagal memproses persetujuan');
        }
      } catch (err: any) {
        console.error('Failed to update status:', err);
        Swal.fire({
          title: 'Gagal!',
          text: err.message || 'Terjadi kesalahan sistem saat memproses data.',
          icon: 'error',
          confirmButtonColor: '#2563eb',
          customClass: { popup: 'rounded-[32px] px-8 py-6' }
        });
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

  const handleExportExcel = async () => {
    if (filteredData.length === 0) {
      Swal.fire({
        title: 'Tidak Ada Data',
        text: 'Tidak ada data timesheet yang cocok dengan filter saat ini untuk diekspor.',
        icon: 'warning',
        confirmButtonColor: '#1a1f2e',
        customClass: { popup: 'rounded-[32px]' }
      });
      return;
    }

    setIsExporting(true);
    Swal.fire({
      title: 'Mempersiapkan Laporan...',
      text: 'Sedang mengekspor data timesheet & pengeluaran ke Excel. Mohon tunggu...',
      icon: 'info',
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
      customClass: { popup: 'rounded-[32px] px-8 py-6' }
    });

    try {
      // 1. Load SheetJS dynamically from CDN
      const XLSX = await new Promise<any>((resolve, reject) => {
        if ((window as any).XLSX) {
          resolve((window as any).XLSX);
          return;
        }
        const script = document.createElement('script');
        script.src = "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
        script.onload = () => resolve((window as any).XLSX);
        script.onerror = (err) => reject(new Error('Gagal memuat pustaka XLSX dari CDN.'));
        document.body.appendChild(script);
      });

      // 2. Fetch daily expenses in parallel for all filtered records
      const expenseFetches = filteredData.map(async (ts) => {
        const platMobil = ts.user_ratings && ts.user_ratings.length > 0
          ? Array.from(new Set(ts.user_ratings.map(r => r.vehicle_plate).filter(Boolean))).join(', ') || '-'
          : '-';

        try {
          const response = await fetch(`${import.meta.env.VITE_URL_API_DRIVER}daily-expenses-date/${ts.employee_id}/${ts.date_timesheets}`);
          const result = await response.json();
          if (result.success && Array.isArray(result.data)) {
            return {
              id_timesheets_mitra: ts.id_timesheets_mitra,
              employee_id: ts.employee_id,
              date_timesheets: ts.date_timesheets,
              platMobil: platMobil,
              expenses: result.data
            };
          }
        } catch (err) {
          console.error(`Failed to fetch expenses for ${ts.employee_id} on ${ts.date_timesheets}:`, err);
        }
        return {
          id_timesheets_mitra: ts.id_timesheets_mitra,
          employee_id: ts.employee_id,
          date_timesheets: ts.date_timesheets,
          platMobil: platMobil,
          expenses: []
        };
      });

      const timesheetExpenses = await Promise.all(expenseFetches);

      // 3. Prepare Sheet 1 (Timesheet Approval Report) Rows
      const excelRows = filteredData.map((ts, idx) => {
        const driverName = drivers.find(d => d.employee_id === ts.employee_id)?.full_name || 'Verified Transport Partner';
        const kmIn = Number(ts.km_entry) || 0;
        const kmOut = Number(ts.km_exit) || 0;
        const distance = kmOut > kmIn ? kmOut - kmIn : 0;

        const approveStatusRaw = ts.approved_timesheets[0]?.status_approve ?? 0;
        let approveStatus = 'Menunggu Persetujuan';
        if (approveStatusRaw === 1) approveStatus = 'Disetujui';
        else if (approveStatusRaw === -1) approveStatus = 'Ditolak';
        else if (approveStatusRaw === -2) approveStatus = 'Revisi';

        const approveNote = ts.approved_timesheets[0]?.note || '';

        const hasRating = ts.user_ratings && ts.user_ratings.length > 0;
        const avgScore = hasRating
          ? ts.user_ratings!.length > 1
            ? (ts.user_ratings!.reduce((acc, curr) => acc + parseFloat(curr.average_score), 0) / ts.user_ratings!.length).toFixed(2)
            : ts.user_ratings![0].average_score
          : 'N/A';
        const ratingCount = hasRating ? ts.user_ratings!.length : 0;

        // Calculate Expense Summary
        const matchedExpenseItem = timesheetExpenses.find(te => te.id_timesheets_mitra === ts.id_timesheets_mitra);
        const dailyExpensesList = matchedExpenseItem?.expenses || [];
        const totalExpensesValue = dailyExpensesList.reduce((sum: number, exp: any) => sum + (Number(exp.expenses_value) || 0), 0);
        const expensesSummaryStr = dailyExpensesList.map((exp: any) => `${exp.type_pengeluaran || 'Lain-lain'}: Rp ${(exp.expenses_value || 0).toLocaleString('id-ID')} (${exp.expenses_notes || ''})`).join(' | ');

        const platMobil = ts.user_ratings && ts.user_ratings.length > 0
          ? Array.from(new Set(ts.user_ratings.map(r => r.vehicle_plate).filter(Boolean))).join(', ') || '-'
          : '-';

        return {
          'Tanggal': formatDate(ts.date_timesheets),
          'ID Driver': ts.employee_id,
          'Nama Driver': driverName,
          'Plat Mobil': platMobil,
          'Jam Masuk': getDisplayTimeEntry(ts),
          'Odometer Masuk (KM)': kmIn,
          'Jam Keluar': getDisplayTimeExit(ts),
          'Odometer Keluar (KM)': kmOut,
          'Jarak Tempuh (KM)': distance,
          'Premium': ts.is_premium === 1 ? `Ya (${ts.premium_name || 'Standar'})` : 'Tidak',
          'VIP Dedicated': ts.is_vip === 1 ? `Ya (${ts.vip_name || 'Standar'})` : 'Tidak',
          'Hari Raya': ts.status_hari_raya === 1 ? 'Ya' : 'Tidak',
          'Hari Libur': ts.status_hari_libur === 1 ? 'Ya' : 'Tidak',
          'Penugasan': ts.penugasan || '',
          'Rata-rata Rating': avgScore,
          'Total Feedback': ratingCount,
          'Total Pengeluaran (Rp)': totalExpensesValue,
          'Daftar Pengeluaran': expensesSummaryStr,
          'Status Persetujuan': approveStatus,
          'Catatan Admin/Revisi': approveNote,
        };
      });

      // 4. Prepare Sheet 2 (Laporan Pengeluaran Detail) Rows
      const detailedExpensesRows: any[] = [];

      timesheetExpenses.forEach((item) => {
        const driverName = drivers.find(d => d.employee_id === item.employee_id)?.full_name || 'Verified Transport Partner';

        item.expenses.forEach((exp: any) => {
          detailedExpensesRows.push({
            'Tanggal': formatDate(item.date_timesheets),
            'ID Driver': item.employee_id,
            'Nama Driver': driverName,
            'Plat Mobil': item.platMobil || '-',
            'Tipe Pengeluaran': exp.type_pengeluaran || 'Lain-lain',
            'Nilai Pengeluaran (Rp)': exp.expenses_value || 0,
            'Catatan/Keterangan': exp.expenses_notes || '',
            'Lokasi Pengeluaran': exp.lokasi_expenses || '',
          });
        });
      });

      // 5. Create Workbook
      const workbook = XLSX.utils.book_new();

      // 5a. Write Sheet 1
      const worksheet = XLSX.utils.json_to_sheet(excelRows);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Timesheet Approval Report');

      // Set Column Widths for Sheet 1
      const colWidths = [
        { wch: 15 },  // Tanggal
        { wch: 15 },  // ID Driver
        { wch: 25 },  // Nama Driver
        { wch: 18 },  // Plat Mobil
        { wch: 12 },  // Jam Masuk
        { wch: 20 },  // Odometer Masuk
        { wch: 12 },  // Jam Keluar
        { wch: 20 },  // Odometer Keluar
        { wch: 18 },  // Jarak Tempuh
        { wch: 15 },  // Premium
        { wch: 15 },  // VIP
        { wch: 12 },  // Hari Raya
        { wch: 12 },  // Hari Libur
        { wch: 30 },  // Penugasan
        { wch: 15 },  // Rating
        { wch: 15 },  // Feedbacks
        { wch: 22 },  // Total Pengeluaran (Rp)
        { wch: 45 },  // Daftar Pengeluaran
        { wch: 20 },  // Status
        { wch: 35 },  // Catatan
      ];
      worksheet['!cols'] = colWidths;

      // 5b. Write Sheet 2
      const detailedExpensesWorksheet = XLSX.utils.json_to_sheet(
        detailedExpensesRows.length > 0 ? detailedExpensesRows : [
          {
            'Tanggal': '',
            'ID Driver': '',
            'Nama Driver': '',
            'Plat Mobil': '',
            'Tipe Pengeluaran': 'Tidak ada data pengeluaran',
            'Nilai Pengeluaran (Rp)': 0,
            'Catatan/Keterangan': '',
            'Lokasi Pengeluaran': '',
          }
        ]
      );
      XLSX.utils.book_append_sheet(workbook, detailedExpensesWorksheet, 'Laporan Pengeluaran Detail');

      // Set Column Widths for Sheet 2
      const detailedColWidths = [
        { wch: 15 },  // Tanggal
        { wch: 15 },  // ID Driver
        { wch: 25 },  // Nama Driver
        { wch: 18 },  // Plat Mobil
        { wch: 20 },  // Tipe Pengeluaran
        { wch: 22 },  // Nilai Pengeluaran (Rp)
        { wch: 35 },  // Catatan/Keterangan
        { wch: 40 },  // Lokasi Pengeluaran
      ];
      detailedExpensesWorksheet['!cols'] = detailedColWidths;

      // 5c. Group expenses by Plat Mobil and create separate worksheets (tabs)
      const expensesByPlate: { [plate: string]: any[] } = {};

      detailedExpensesRows.forEach((row) => {
        const rawPlate = (row['Plat Mobil'] || '').trim();
        if (rawPlate && rawPlate !== '-') {
          // Excel sheet name validation: max 31 chars, no special chars \ / ? * : [ ]
          const cleanPlate = rawPlate.replace(/[\\\?\*:\/\[\]]/g, '').trim().substring(0, 31);
          if (cleanPlate) {
            if (!expensesByPlate[cleanPlate]) {
              expensesByPlate[cleanPlate] = [];
            }
            expensesByPlate[cleanPlate].push(row);
          }
        }
      });

      // Append separate sheets for each Plat Mobil
      Object.keys(expensesByPlate).sort().forEach((plateName) => {
        const plateRows = expensesByPlate[plateName];
        const plateWorksheet = XLSX.utils.json_to_sheet(plateRows);
        XLSX.utils.book_append_sheet(workbook, plateWorksheet, `EXP - ${plateName}`);
        plateWorksheet['!cols'] = detailedColWidths;
      });

      // 6. Write Workbook File
      const now = new Date();
      const dateString = now.getFullYear() +
        String(now.getMonth() + 1).padStart(2, '0') +
        String(now.getDate()).padStart(2, '0') + '_' +
        String(now.getHours()).padStart(2, '0') +
        String(now.getMinutes()).padStart(2, '0');

      const fileName = `SIGAPS_Timesheet_Report_${dateString}.xlsx`;

      XLSX.writeFile(workbook, fileName);

      Swal.fire({
        title: 'Ekspor Berhasil!',
        text: `Data laporan berhasil diekspor sebagai "${fileName}"`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        customClass: { popup: 'rounded-[32px] px-8 py-6' }
      });
    } catch (err: any) {
      console.error('Failed to export Excel:', err);
      Swal.fire({
        title: 'Ekspor Gagal!',
        text: err.message || 'Terjadi kesalahan saat memproses data Excel.',
        icon: 'error',
        confirmButtonColor: '#2563eb',
        customClass: { popup: 'rounded-[32px] px-8 py-6' }
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusBadge = (status: number, employeeId: string, date: string) => {
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
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleShowExpenses(employeeId, date);
              }}
              className="group/status inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-700 border border-amber-200/50 hover:bg-amber-100 transition-all active:scale-95 shadow-sm"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              PENGELUARAN
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const now = new Date();
                const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
                navigate(`/dashboard/timesheets/calculation/${employeeId}?period=${currentPeriod}`);
              }}
              className="group/status inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-700 border border-blue-200/50 hover:bg-blue-100 transition-all active:scale-95 shadow-sm"
            >
              <FileText size={12} />
              TIMESHEET
            </button>
          </div>
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

    const tsDateVal = ts.date_timesheets;
    const isUnix = /^\d+$/.test(tsDateVal);
    const tsDate = isUnix ? new Date(Number(tsDateVal) * 1000) : new Date(tsDateVal);
    const tsDateStr = tsDate.getFullYear() + '-' + String(tsDate.getMonth() + 1).padStart(2, '0') + '-' + String(tsDate.getDate()).padStart(2, '0');

    const matchesDate =
      (!startDate || tsDateStr >= startDate) &&
      (!endDate || tsDateStr <= endDate);

    const matchesDriver =
      driverFilter === 'all' ||
      ts.employee_id === driverFilter;

    const matchesExit = 
      exitFilter === 'all' || 
      (exitFilter === 'missing' && (!ts.time_exit || ts.time_exit === '-' || ts.time_exit === '00:00')) ||
      (exitFilter === 'present' && (ts.time_exit && ts.time_exit !== '-' && ts.time_exit !== '00:00'));

    const driverName = drivers.find(d => d.employee_id === ts.employee_id)?.full_name || 'Verified Transport Partner';
    const isNotVerifiedTransport = driverName !== 'Verified Transport Partner';

    return matchesSearch && matchesStatus && matchesDate && matchesDriver && matchesExit && isNotVerifiedTransport;
  }).sort((a, b) => {
    const getTsDate = (val: string | undefined) => {
      if (!val) return 0;
      const isUnix = /^\d+$/.test(val);
      return isUnix ? Number(val) * (val.length > 10 ? 1 : 1000) : new Date(val).getTime();
    };
    return getTsDate(b.date_timesheets) - getTsDate(a.date_timesheets);
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
                  <div className="flex flex-col gap-0.5 mt-1">
                    <span className="text-[14px] font-black text-blue-600">
                      {drivers.find(d => d.employee_id === ts.employee_id)?.full_name || 'Unknown Driver'}
                    </span>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <span>ID: {ts.id_timesheets_mitra} • {ts.employee_id}</span>
                      <span className="text-gray-300">•</span>
                      <span>PLAT: {modalPlateNumber}</span>
                    </p>
                  </div>
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
                            readOnly
                            required
                            value={editFormData.employee_id || ''}
                            onChange={e => setEditFormData({ ...editFormData, employee_id: e.target.value })}
                            className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all shadow-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Mitra Customer Code</label>
                          <input
                            type="text"
                            readOnly
                            required
                            value={editFormData.code_customer || ''}
                            onChange={e => setEditFormData({ ...editFormData, code_customer: e.target.value })}
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
                          setEditFormData({ ...editFormData, is_premium: isPremium });
                        }}>
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black uppercase tracking-widest">Premium</span>
                            <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${editFormData.is_premium === 1 ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'}`}>
                              {editFormData.is_premium === 1 && <CheckCircle size={10} />}
                            </div>
                          </div>
                          <input
                            placeholder="Pkg Name"
                            value={(editFormData.premium_name === 'null' || !editFormData.premium_name) ? '' : editFormData.premium_name}
                            onClick={e => e.stopPropagation()}
                            onChange={e => setEditFormData({ ...editFormData, premium_name: e.target.value, is_premium: 1 })}
                            className="bg-transparent border-none p-0 text-xs font-bold focus:ring-0 placeholder:text-gray-300"
                          />
                        </div>
                        <div className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col gap-3 ${editFormData.is_vip === 1 ? 'bg-amber-50/50 border-amber-500' : 'bg-white border-gray-100 opacity-60'}`} onClick={() => {
                          const isVip = editFormData.is_vip === 1 ? 0 : 1;
                          setEditFormData({ ...editFormData, is_vip: isVip });
                        }}>
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black uppercase tracking-widest">VIP dedicated</span>
                            <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${editFormData.is_vip === 1 ? 'bg-amber-600 border-amber-600 text-white' : 'border-gray-300'}`}>
                              {editFormData.is_vip === 1 && <CheckCircle size={10} />}
                            </div>
                          </div>
                          <input
                            placeholder="Unit Name"
                            value={(editFormData.vip_name === 'null' || !editFormData.vip_name) ? '' : editFormData.vip_name}
                            onClick={e => e.stopPropagation()}
                            onChange={e => setEditFormData({ ...editFormData, vip_name: e.target.value, is_vip: 1 })}
                            className="bg-transparent border-none p-0 text-xs font-bold focus:ring-0 placeholder:text-gray-300"
                          />
                        </div>

                        {/* Holiday Status */}
                        <div className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col gap-3 ${editFormData.status_hari_raya === 1 ? 'bg-rose-50/50 border-rose-500' : 'bg-white border-gray-100 opacity-60'}`} onClick={() => setEditFormData({ ...editFormData, status_hari_raya: editFormData.status_hari_raya === 1 ? 0 : 1 })}>
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black uppercase tracking-widest">Hari Raya</span>
                            <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${editFormData.status_hari_raya === 1 ? 'bg-rose-600 border-rose-600 text-white' : 'border-gray-300'}`}>
                              {editFormData.status_hari_raya === 1 && <CheckCircle size={10} />}
                            </div>
                          </div>
                          <span className="text-xs font-bold text-gray-900">Public Holiday</span>
                        </div>

                        <div className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col gap-3 ${editFormData.status_hari_libur === 1 ? 'bg-indigo-50/50 border-indigo-500' : 'bg-white border-gray-100 opacity-60'}`} onClick={() => setEditFormData({ ...editFormData, status_hari_libur: editFormData.status_hari_libur === 1 ? 0 : 1 })}>
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
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Date Timesheet</label>
                          <input
                            type="date"
                            required
                            value={(() => {
                              if (!editFormData.date_timesheets) return '';
                              const isUnix = /^\d+$/.test(editFormData.date_timesheets);
                              const date = isUnix ? new Date(Number(editFormData.date_timesheets) * 1000) : new Date(editFormData.date_timesheets);
                              const year = date.getFullYear();
                              const month = String(date.getMonth() + 1).padStart(2, '0');
                              const day = String(date.getDate()).padStart(2, '0');
                              return `${year}-${month}-${day}`;
                            })()}
                            onChange={e => {
                              const dateStr = e.target.value;
                              const newDate = new Date(dateStr);
                              const isUnix = /^\d+$/.test(editFormData.date_timesheets || '');
                              const newValue = isUnix ? String(Math.floor(newDate.getTime() / 1000)) : dateStr;

                              let updated = { ...editFormData, date_timesheets: newValue };

                              if (updated.time_entry?.includes(' ')) {
                                updated.time_entry = `${dateStr} ${updated.time_entry.split(' ')[1]}`;
                              }
                              if (updated.time_exit?.includes(' ')) {
                                updated.time_exit = `${dateStr} ${updated.time_exit.split(' ')[1]}`;
                              }

                              setEditFormData(updated);
                            }}
                            className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-100 outline-none transition-all shadow-sm"
                          />
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-indigo-100 flex items-center justify-between shadow-sm">
                          <div>
                            <span className="block text-[10px] font-black text-gray-900 uppercase tracking-widest">Time Policy Setup</span>
                            <span className="block text-[9px] text-gray-500 font-bold mt-1">Override to fixed entry (07:30)</span>
                          </div>
                          <div className="flex bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                            <button
                              type="button"
                              onClick={() => {
                                setEditFormData({ ...editFormData, time_entry: selectedTimesheet?.time_entry, time_exit: selectedTimesheet?.time_exit });
                              }}
                              className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${!editFormData.time_entry?.includes('07:30') ? 'bg-white shadow-sm text-indigo-600 ring-1 ring-indigo-100' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                              Custom Entry
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                let currentEntry = editFormData.time_entry || "";
                                // If it has a space, check if the first part is a date
                                if (currentEntry.includes(' ')) {
                                  const parts = currentEntry.split(' ');
                                  if (parts[0].includes('-')) {
                                    // It's a date prefix, keep it
                                    setEditFormData({ ...editFormData, time_entry: `${parts[0]} 07:30:00` });
                                  } else {
                                    // It was likely corrupted (e.g., "06:32 07:30:00"), reset to just time
                                    setEditFormData({ ...editFormData, time_entry: '07:30' });
                                  }
                                } else {
                                  // Just time, override it
                                  setEditFormData({ ...editFormData, time_entry: '07:30' });
                                }
                              }}
                              className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${editFormData.time_entry?.includes('07:30') ? 'bg-indigo-600 shadow-md text-white' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                              Fixed Entry
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
                                  setEditFormData({ ...editFormData, time_entry: updateTimeValue(editFormData.time_entry, e.target.value) });
                                }}
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-100 outline-none"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Entry KM</label>
                              <input
                                type="text"
                                value={editFormData.km_entry || ''}
                                onChange={e => setEditFormData({ ...editFormData, km_entry: e.target.value })}
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
                                  setEditFormData({ ...editFormData, time_exit: updateTimeValue(editFormData.time_exit, e.target.value) });
                                }}
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-100 outline-none"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Exit KM</label>
                              <input
                                type="text"
                                value={editFormData.km_exit || ''}
                                onChange={e => setEditFormData({ ...editFormData, km_exit: e.target.value })}
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
                            onChange={e => setEditFormData({ ...editFormData, penugasan: e.target.value })}
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
                          {getStatusBadge(ts.approved_timesheets[0]?.status_approve ?? 0, ts.employee_id, ts.date_timesheets)}
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Code Customer</p>
                          <p className="font-mono text-sm font-black text-blue-600 bg-blue-50/50 px-4 py-2 rounded-xl border border-blue-100 inline-block tracking-tight">{ts.code_customer}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-8 pt-8 border-t border-gray-200/60">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Daily Insentif</p>
                          <div className="flex flex-wrap gap-3">
                            {ts.is_premium === 1 && (
                              <span className="px-4 py-2 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-xl border border-blue-100 flex items-center gap-2 shadow-sm">
                                <CheckCircle size={14} className="text-blue-500" /> Premium {(ts.premium_name && ts.premium_name !== 'null') ? `(${ts.premium_name})` : ''}
                              </span>
                            )}
                          {ts.is_vip === 1 && (
                            <span className="px-4 py-2 bg-amber-50 text-amber-700 text-[11px] font-bold rounded-xl border border-amber-100 flex items-center gap-2 shadow-sm">
                              <CheckCircle size={14} className="text-amber-500" /> VIP {(ts.vip_name && ts.vip_name !== 'null') ? `(${ts.vip_name})` : ''}
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
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Plat Nomor</p>
                          <p className="font-mono text-sm font-black text-gray-700 bg-gray-100/50 px-4 py-2 rounded-xl border border-gray-200 inline-block tracking-tight">{modalPlateNumber}</p>
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
                            <p className="text-[11px] font-bold text-gray-500 mt-0.5">{formatDate(ts.date_timesheets)}</p>
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
                            <p className="text-[11px] font-bold text-gray-500 mt-0.5">{formatDate(ts.date_timesheets)}</p>
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
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Bukti Odometer Masuk
                            </div>
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
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                              Bukti Odometer Keluar
                            </div>
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
                <Clock size={12} /> Last updated: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} {new Date().toLocaleTimeString()}
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
                    {/* <button 
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
                    </button> */}
                    <button
                      onClick={() => handleApprove(ts.id_timesheets_mitra, 1)}
                      className="px-6 py-2.5 rounded-xl font-bold text-sm bg-[#1a1f2e] text-white hover:bg-blue-600 transition-all flex items-center gap-2 shadow-lg"
                    >
                      <CheckCircle size={16} /> Setujui
                    </button>
                  </>
                ) : (ts.approved_timesheets[0]?.status_approve ?? 0) === 1 ? (
                  <button
                    onClick={() => handleApprove(ts.id_timesheets_mitra, 0)}
                    className="px-6 py-2.5 rounded-xl font-bold text-sm text-rose-600 bg-rose-50 hover:bg-rose-100 transition-all flex items-center gap-2 shadow-md hover:shadow-lg active:scale-95"
                  >
                    <XCircle size={16} /> Batal Approve
                  </button>
                ) : null}
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  };
  const renderRatingModal = () => {
    if (ratingList.length === 0) return null;

    const questions = [
      { id: 'q1_score', label: 'Driving Safety' },
      { id: 'q2_score', label: 'Technical Skills' },
      { id: 'q3_score', label: 'Vehicle Condition' },
      { id: 'q4_score', label: 'Communication' },
      { id: 'q5_score', label: 'Punctuality' },
      { id: 'q6_score', label: 'Personal Appearance' },
      { id: 'q7_score', label: 'Etiquette' },
      { id: 'q8_score', label: 'Documentation' },
    ];

    return (
      <AnimatePresence>
        {showRatingModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRatingModal(false)}
              className="absolute inset-0 bg-[#0a0a0b]/80 backdrop-blur-xl"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="p-8 bg-[#fcfcfa] border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="h-14 w-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500">
                    <Star size={28} className="fill-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 tracking-tight">
                      {selectedRating ? 'Rating Details' : 'Passenger Ratings'}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {selectedRating ? (
                        <>
                          <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100 uppercase tracking-widest">Score: {selectedRating.average_score}</span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{selectedRating.passenger_name} • {selectedRating.vehicle_plate}</span>
                        </>
                      ) : (
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{ratingList.length} total feedback received</span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowRatingModal(false)}
                  className="h-10 w-10 flex items-center justify-center rounded-xl bg-gray-100 text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-8 flex-1 overflow-y-auto custom-scrollbar bg-gray-50/30">
                {!selectedRating ? (
                  /* List View */
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Select Passenger Feedback</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {ratingList.map((rate) => (
                        <button
                          key={rate.id}
                          onClick={() => setSelectedRating(rate)}
                          className="flex flex-col p-6 bg-white border border-gray-100 rounded-3xl hover:bg-amber-50 hover:border-amber-200 transition-all group/item shadow-sm hover:shadow-md"
                        >
                          <div className="flex items-center justify-between w-full mb-4">
                            <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 group-hover/item:scale-110 transition-transform">
                              <Star size={18} className="fill-amber-500" />
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-black text-amber-600 leading-none">{rate.average_score}</div>
                              <div className="text-[8px] font-black text-amber-600/50 uppercase tracking-tighter mt-1">Avg Score</div>
                            </div>
                          </div>

                          <div className="text-left w-full">
                            <div className="text-sm font-black text-gray-900 group-hover/item:text-amber-700 transition-colors">{rate.passenger_name}</div>
                            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                              {rate.vehicle_plate}
                              <div className="h-1 w-1 rounded-full bg-gray-300" />
                              {new Date(rate.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between w-full">
                            <span className="text-[8px] font-black text-gray-300 uppercase tracking-[0.2em]">View Details</span>
                            <ChevronRight size={14} className="text-gray-300 group-hover/item:text-amber-500 group-hover/item:translate-x-1 transition-all" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Detail View */
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      {questions.map((q) => (
                        <div key={q.id} className="p-4 bg-gray-50/50 border border-gray-100 rounded-2xl flex items-center justify-between">
                          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{q.label}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-black text-gray-900">{selectedRating[q.id as keyof UserRating]}</span>
                            <Star size={12} className="fill-amber-500 text-amber-500" />
                          </div>
                        </div>
                      ))}
                    </div>

                    {selectedRating.q10_comment && (
                      <div className="p-6 bg-blue-50/30 border border-blue-100/50 rounded-3xl space-y-2">
                        <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Additional Feedback</h4>
                        <p className="text-sm font-bold text-gray-700 leading-relaxed italic">"{selectedRating.q10_comment}"</p>
                      </div>
                    )}

                    {/* <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <div className={`h-2.5 w-2.5 rounded-full ${selectedRating.is_bonus_qualified ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`} />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                          Bonus Eligibility: {selectedRating.is_bonus_qualified ? 'QUALIFIED' : 'NOT ELIGIBLE'}
                        </span>
                      </div>
                      <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Submitted on {new Date(selectedRating.created_at).toLocaleDateString()}</span>
                    </div> */}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between gap-4">
                {selectedRating && ratingList.length > 1 && (
                  <button
                    onClick={() => setSelectedRating(null)}
                    className="px-6 py-3 bg-white border border-gray-200 text-gray-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2"
                  >
                    <ChevronLeft size={16} /> Back to List
                  </button>
                )}
                <button
                  onClick={() => setShowRatingModal(false)}
                  className="ml-auto px-8 py-3 bg-[#1a1f2e] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-blue-600 transition-all active:scale-95"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
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
      {renderRatingModal()}

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
            className={`px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${statusFilter === 'pending'
              ? 'bg-[#1a1f2e] text-white shadow-lg'
              : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
              }`}
          >
            <Clock size={14} />
            Waiting Approval
          </button>
          <button
            onClick={() => { setStatusFilter('approved'); setCurrentPage(1); }}
            className={`px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${statusFilter === 'approved'
              ? 'bg-[#1a1f2e] text-white shadow-lg'
              : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
              }`}
          >
            <CheckCircle size={14} />
            Approved History
          </button>
        </div>
      </div>

      {/* Overview Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Logs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="p-6 bg-white border border-gray-200 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 group flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Transaksi</span>
            <h4 className="text-3xl font-black text-gray-900 tracking-tight leading-none">
              {filteredData.length}
            </h4>
            <p className="text-[10px] font-bold text-gray-400 mt-1">Timesheet Mitra Terfilter</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-blue-50 border border-blue-100/50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-300">
            <FileText size={20} />
          </div>
        </motion.div>

        {/* Pending Approval */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="p-6 bg-white border border-gray-200 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 group flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              Menunggu Approval
            </span>
            <h4 className="text-3xl font-black text-gray-900 tracking-tight leading-none">
              {filteredData.filter(ts => (ts.approved_timesheets[0]?.status_approve ?? 0) === 0).length}
            </h4>
            <p className="text-[10px] font-bold text-gray-400 mt-1">Butuh Verifikasi Segera</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform duration-300">
            <Clock size={20} />
          </div>
        </motion.div>

        {/* Total Distance */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="p-6 bg-white border border-gray-200 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 group flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Jarak Tempuh</span>
            <h4 className="text-2xl font-black text-gray-900 tracking-tight leading-none">
              {filteredData.reduce((sum, ts) => {
                const entry = Number(ts.km_entry) || 0;
                const exit = Number(ts.km_exit) || 0;
                return sum + (exit > entry ? exit - entry : 0);
              }, 0).toLocaleString('id-ID')} <span className="text-xs font-bold text-gray-400">KM</span>
            </h4>
            <p className="text-[10px] font-bold text-gray-400 mt-1">Akumulasi Jarak Driver</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform duration-300">
            <Truck size={20} />
          </div>
        </motion.div>

        {/* Average Rating */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="p-6 bg-white border border-gray-200 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 group flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rata-rata Rating</span>
            <h4 className="text-3xl font-black text-gray-900 tracking-tight leading-none flex items-center gap-1.5">
              {(() => {
                const rated = filteredData.filter(ts => ts.user_ratings && ts.user_ratings.length > 0);
                if (rated.length === 0) return 'N/A';
                const avg = rated.reduce((sum, ts) => {
                  const itemAvg = ts.user_ratings!.reduce((acc, curr) => acc + parseFloat(curr.average_score), 0) / ts.user_ratings!.length;
                  return sum + itemAvg;
                }, 0) / rated.length;
                return avg.toFixed(2);
              })()}
              {filteredData.some(ts => ts.user_ratings && ts.user_ratings.length > 0) && (
                <Star size={18} className="fill-amber-500 text-amber-500 inline-block mb-1" />
              )}
            </h4>
            <p className="text-[10px] font-bold text-gray-400 mt-1">Kualitas Layanan Driver</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform duration-300">
            <Star size={20} className="fill-amber-500" />
          </div>
        </motion.div>
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
          <div className="p-6 border-b border-gray-100 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 bg-[#fcfcfa]/50">
            <div className="flex items-center flex-wrap gap-4">
              <div className="flex items-center gap-2 pr-4 border-r border-gray-100">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Per Page</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  className="bg-gray-50 border-none text-xs font-bold rounded-lg px-2 py-1 focus:ring-0 cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                </select>
              </div>
              <span className="text-sm font-bold text-gray-400 pr-4 border-r border-gray-100">Total: {filteredData.length} records</span>

              {/* Excel Export Button */}
              <button
                onClick={handleExportExcel}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md shadow-emerald-100 hover:shadow-lg active:scale-95 cursor-pointer"
                title="Unduh laporan dalam format Excel"
              >
                <FileSpreadsheet size={14} />
                {isExporting ? 'Mengekspor...' : 'Export Excel'}
              </button>
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
                  <option value="all">Status: Semua</option>
                  <option value="pending">Status: Pending</option>
                  <option value="approved">Status: Approved</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronRight size={14} className="rotate-90" />
                </div>
              </div>
              <div className="relative">
                <select
                  value={exitFilter}
                  onChange={(e) => { setExitFilter(e.target.value); setCurrentPage(1); }}
                  className="appearance-none border border-gray-200 rounded-xl px-4 py-2 pr-10 text-sm bg-white hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer font-bold"
                >
                  <option value="all">Jam Keluar: Semua</option>
                  <option value="missing">Belum Ada Jam Keluar</option>
                  <option value="present">Sudah Ada Jam Keluar</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronRight size={14} className="rotate-90" />
                </div>
              </div>

              <div className="relative z-40">
                <div
                  onClick={() => setIsDriverDropdownOpen(!isDriverDropdownOpen)}
                  className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-2 text-sm bg-white hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer font-bold min-w-[200px]"
                >
                  <span className="truncate">
                    {driverFilter === 'all' 
                      ? 'Driver: Semua' 
                      : drivers.find(d => d.employee_id === driverFilter)?.full_name || 'Driver: Semua'}
                  </span>
                  <ChevronDown size={14} className="text-gray-400 ml-2 shrink-0" />
                </div>
                
                {isDriverDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-30"
                      onClick={() => setIsDriverDropdownOpen(false)}
                    />
                    <div className="absolute top-full mt-2 w-full min-w-[250px] bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[300px] right-0 sm:right-auto">
                      <div className="p-2 border-b border-gray-100 shrink-0">
                        <div className="relative">
                          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Cari driver..."
                            value={driverSearchQuery}
                            onChange={(e) => setDriverSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 text-sm bg-gray-50 border border-transparent rounded-lg focus:outline-none focus:bg-white focus:border-blue-200 focus:ring-2 focus:ring-blue-100 transition-all"
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="overflow-y-auto flex-1 p-1">
                        <div
                          onClick={() => {
                            setDriverFilter('all');
                            setCurrentPage(1);
                            setIsDriverDropdownOpen(false);
                            setDriverSearchQuery('');
                          }}
                          className={`flex items-center justify-between px-3 py-2.5 text-sm rounded-lg cursor-pointer transition-colors ${
                            driverFilter === 'all' ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-gray-50 text-gray-700 font-medium'
                          }`}
                        >
                          Driver: Semua
                          {driverFilter === 'all' && <Check size={14} />}
                        </div>
                        {drivers
                          .filter(driver => driver.full_name?.toLowerCase().includes(driverSearchQuery.toLowerCase()))
                          .map(driver => (
                            <div
                              key={driver.employee_id}
                              onClick={() => {
                                setDriverFilter(driver.employee_id);
                                setCurrentPage(1);
                                setIsDriverDropdownOpen(false);
                                setDriverSearchQuery('');
                              }}
                              className={`flex items-center justify-between px-3 py-2.5 text-sm rounded-lg cursor-pointer transition-colors ${
                                driverFilter === driver.employee_id ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-gray-50 text-gray-700 font-medium'
                              }`}
                            >
                              <span className="truncate pr-2">{driver.full_name}</span>
                              {driverFilter === driver.employee_id && <Check size={14} className="shrink-0" />}
                            </div>
                          ))}
                          
                        {drivers.filter(driver => driver.full_name?.toLowerCase().includes(driverSearchQuery.toLowerCase())).length === 0 && (
                          <div className="px-3 py-4 text-center text-sm text-gray-400 font-medium">
                            Driver tidak ditemukan
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                    className="border border-gray-200 rounded-xl px-4 py-2 text-xs font-bold bg-white hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                  <div className="absolute -top-2 left-2 px-1 bg-white text-[8px] font-black text-gray-400 uppercase tracking-widest">Dari</div>
                </div>
                <span className="text-gray-300">/</span>
                <div className="relative">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                    className="border border-gray-200 rounded-xl px-4 py-2 text-xs font-bold bg-white hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                  <div className="absolute -top-2 left-2 px-1 bg-white text-[8px] font-black text-gray-400 uppercase tracking-widest">Sampai</div>
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
                  <th className="px-8 py-5">Schedule & Jarak Tempuh</th>
                  <th className="px-8 py-5">Premium</th>
                  <th className="px-8 py-5">VIP</th>
                  <th className="px-8 py-5">Hari Raya</th>
                  <th className="px-8 py-5">Hari Libur</th>
                  <th className="px-8 py-5">Rating</th>
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
                        {/* <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/50 flex items-center justify-center text-blue-600 font-bold text-xs group-hover:scale-110 transition-all duration-500">
                           {ts.employee_id.substring(0, 2)}
                         </div> */}
                        <div>
                          <div className="font-black text-gray-900 tracking-tight text-[15px]">{drivers.find(d => d.employee_id === ts.employee_id)?.full_name || 'Verified Transport Partner'}</div>
                          <div className="text-[10px] text-blue-600 font-black uppercase tracking-widest mt-0.5">{ts.employee_id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-6">
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
                        <div className="h-10 w-px bg-gray-100" />
                        <div className="space-y-1">
                          <span className="block text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Jarak Tempuh</span>
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-lg text-[11px] font-bold border border-emerald-100">
                            {(() => {
                              const entry = Number(ts.km_entry) || 0;
                              const exit = Number(ts.km_exit) || 0;
                              const diff = exit > entry ? exit - entry : 0;
                              return `${diff.toLocaleString('id-ID')} KM`;
                            })()}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      {ts.is_premium === 1 ? (
                        <div className="flex flex-col items-start gap-1">
                          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-lg text-[10px] font-bold border border-blue-200/50">
                            <CheckCircle size={10} className="fill-blue-50" /> Ya
                          </span>
                          {ts.premium_name && ts.premium_name !== 'null' && (
                            <span className="text-[9px] font-bold text-gray-400 truncate max-w-[100px]" title={ts.premium_name}>{ts.premium_name}</span>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-400 px-2 py-0.5 rounded-lg text-[10px] font-semibold border border-gray-200/50">
                          <XCircle size={10} className="text-gray-300" /> Tidak
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      {ts.is_vip === 1 ? (
                        <div className="flex flex-col items-start gap-1">
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 px-2.5 py-0.5 rounded-lg text-[10px] font-bold border border-amber-200/50">
                            <CheckCircle size={10} className="fill-amber-50" /> Ya
                          </span>
                          {ts.vip_name && ts.vip_name !== 'null' && (
                            <span className="text-[9px] font-bold text-gray-400 truncate max-w-[100px]" title={ts.vip_name}>{ts.vip_name}</span>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-400 px-2 py-0.5 rounded-lg text-[10px] font-semibold border border-gray-200/50">
                          <XCircle size={10} className="text-gray-300" /> Tidak
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      {ts.status_hari_raya === 1 ? (
                        <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-600 px-2.5 py-0.5 rounded-lg text-[10px] font-bold border border-rose-200/50">
                          <CheckCircle size={10} className="fill-rose-50" /> Ya
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-400 px-2 py-0.5 rounded-lg text-[10px] font-semibold border border-gray-200/50">
                          <XCircle size={10} className="text-gray-300" /> Tidak
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      {ts.status_hari_libur === 1 ? (
                        <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-lg text-[10px] font-bold border border-indigo-200/50">
                          <CheckCircle size={10} className="fill-indigo-50" /> Ya
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-400 px-2 py-0.5 rounded-lg text-[10px] font-semibold border border-gray-200/50">
                          <XCircle size={10} className="text-gray-300" /> Tidak
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      {ts.user_ratings && ts.user_ratings.length > 0 ? (
                        <button
                          onClick={() => {
                            setRatingList(ts.user_ratings || []);
                            setSelectedRating(ts.user_ratings && ts.user_ratings.length === 1 ? ts.user_ratings[0] : null);
                            setShowRatingModal(true);
                          }}
                          className="flex items-center gap-2 bg-amber-50 text-amber-600 px-4 py-2 rounded-xl text-[10px] font-black border border-amber-200/50 hover:bg-amber-100 transition-all shadow-sm group/rate"
                        >
                          <Star size={14} className="fill-amber-500 text-amber-500 group-hover/rate:rotate-12 transition-transform" />
                          LIHAT RATING
                          <span className="ml-auto flex items-center gap-1 bg-amber-100/50 px-2 py-1 rounded-lg border border-amber-200/50 shadow-inner">
                            <span className="text-[11px] font-black text-amber-700">
                              {ts.user_ratings.length > 1
                                ? (ts.user_ratings.reduce((acc, curr) => acc + parseFloat(curr.average_score), 0) / ts.user_ratings.length).toFixed(2)
                                : ts.user_ratings[0].average_score
                              }
                            </span>
                            <Star size={10} className="fill-amber-500 text-amber-500" />
                          </span>
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-gray-300 italic tracking-widest">N/A</span>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleShowExpenses(ts.employee_id, ts.date_timesheets)}
                          className="px-3 py-2 text-emerald-600 bg-emerald-50/50 hover:bg-emerald-100 rounded-xl transition-all shadow-sm border border-emerald-100 flex items-center gap-2 active:scale-95 group/exp"
                          title="Daily Expenses"
                        >
                          <Banknote size={16} className="group-hover/exp:scale-110 transition-transform" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Pengeluaran</span>
                        </button>
                        <button
                          onClick={() => {
                            const now = new Date();
                            const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
                            navigate(`/dashboard/timesheets/calculation/${ts.employee_id}?period=${currentPeriod}`);
                          }}
                          className="px-3 py-2 text-blue-600 bg-blue-50/50 hover:bg-blue-100 rounded-xl transition-all shadow-sm border border-blue-100 flex items-center gap-2 active:scale-95 group/ts"
                          title="View Monthly Timesheet"
                        >
                          <FileText size={16} className="group-hover/ts:scale-110 transition-transform" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Timesheet</span>
                        </button>
                        <button
                          onClick={() => handleSyncTimesheet(ts)}
                          className="px-3 py-2 text-indigo-600 bg-indigo-50/50 hover:bg-indigo-100 rounded-xl transition-all shadow-sm border border-indigo-100 flex items-center gap-2 active:scale-95 group/sync"
                          title="Ambil Data Timesheet Portal"
                        >
                          <Download size={16} className="group-hover/sync:scale-110 transition-transform" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Ambil Data</span>
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
                            <button
                              disabled={!ts.time_exit || ts.time_exit === '-'}
                              onClick={() => handleApprove(ts.id_timesheets_mitra, 1)}
                              className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all active:scale-90 ${(!ts.time_exit || ts.time_exit === '-')
                                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100'
                                }`}
                              title={(!ts.time_exit || ts.time_exit === '-') ? "Missing Exit Time" : "Approve Now"}
                            >
                              <CheckCircle size={18} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 ml-2 border-l border-gray-100 pl-3">
                            <div className="h-10 px-3 flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl">
                              {(ts.approved_timesheets[0]?.status_approve ?? 0) === 1 ? (
                                <CheckCircle size={14} className="text-emerald-500" />
                              ) : (
                                <XCircle size={14} className="text-rose-500" />
                              )}
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Finalized</span>
                            </div>
                            {(ts.approved_timesheets[0]?.status_approve ?? 0) === 1 && (
                              <button
                                onClick={() => handleApprove(ts.id_timesheets_mitra, 0)}
                                className="h-10 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/50 rounded-xl transition-all active:scale-95 flex items-center gap-1.5 shadow-sm group/cancel"
                                title="Batal Approve"
                              >
                                <XCircle size={14} className="group-hover/cancel:rotate-12 transition-transform" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Batal Approve</span>
                              </button>
                            )}
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
              className="relative w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-[16px] bg-amber-100 flex items-center justify-center text-amber-600 shadow-sm border border-amber-200/50">
                    <Wallet size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900 tracking-tight uppercase">Pengeluaran</h3>
                    <div className="flex items-center gap-2.5 mt-0.5">
                      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest">
                        <span className="text-gray-400">Logs for</span>
                        <span className="text-blue-600">{currentExpenseEmployee}</span>
                        <div className="h-1 w-1 rounded-full bg-gray-300" />
                        <span className="text-gray-900">{formatDate(currentExpenseDate)}</span>
                      </div>
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

              <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
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
