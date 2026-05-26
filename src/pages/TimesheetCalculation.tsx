import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  Download
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Timesheet, Agreement, Driver } from '../types';

export default function TimesheetCalculation() {
  const { employeeId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  
  const period = searchParams.get('period') || new Date().toISOString().slice(0, 7); // YYYY-MM
  const [loading, setLoading] = useState(true);
  const [driverInfo, setDriverInfo] = useState<Driver | null>(null);
  const [data, setData] = useState<{ timesheets: Timesheet[], agreement: Agreement | null }>({
    timesheets: [],
    agreement: null
  });
  
  const reportRef = React.useRef<HTMLDivElement>(null);
  const printRef = React.useRef<HTMLDivElement>(null);

  const exportToPDF = async () => {
    if (!printRef.current) return;
    
    const element = printRef.current;
    const { jsPDF } = (window as any).jspdf;
    const html2canvas = (window as any).html2canvas;

    try {
      const canvas = await html2canvas(element, {
        scale: 2, 
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#ffffff",
        height: element.scrollHeight,
        windowHeight: element.scrollHeight + 1000,
        onclone: (clonedDoc: any) => {
          // 1. Sanitize modern CSS colors (oklch/oklab) to prevent parser crash
          const allElements = clonedDoc.getElementsByTagName('*');
          for (let i = 0; i < allElements.length; i++) {
            const el = allElements[i];
            const style = window.getComputedStyle(el);
            const properties = ['color', 'backgroundColor', 'borderColor'];

            properties.forEach(prop => {
              const value = (style as any)[prop];
              if (value && (value.includes('oklch') || value.includes('oklab'))) {
                if (prop === 'color') el.style.color = '#111827';
                else if (prop === 'backgroundColor') {
                  if (!value.includes('rgb(254, 226, 226)')) { 
                    el.style.backgroundColor = el.tagName === 'TH' ? '#1e3a5f' : '#ffffff';
                  }
                }
                else el.style[prop as any] = '#000000';
              }
            });

            if (style.boxShadow.includes('okl') || style.backgroundImage.includes('okl')) {
              el.style.boxShadow = 'none';
              el.style.backgroundImage = 'none';
            }
          }

          // 2. Setup the print template
          const template = clonedDoc.getElementById('formal-print-template');
          if (template) {
            template.style.display = 'block';
            template.style.opacity = '1';
            template.style.position = 'static';
            template.style.width = '1580px';
            template.style.padding = '0';
            template.style.margin = '0';
          }
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'legal',
        compress: true,
        initialView: 'FitH'
      });

      const margin = 5; 
      const pdfWidth = pdf.internal.pageSize.getWidth() - (margin * 2);
      const pdfHeight = pdf.internal.pageSize.getHeight() - (margin * 2);
      const imgProps = pdf.getImageProperties(imgData);
      
      let renderWidth = pdfWidth;
      let renderHeight = (imgProps.height * pdfWidth) / imgProps.width;

      // Proportional scaling check
      if (renderHeight > pdfHeight) {
        renderHeight = pdfHeight;
        renderWidth = (imgProps.width * renderHeight) / imgProps.height;
      }

      pdf.addImage(imgData, 'PNG', margin, margin, renderWidth, renderHeight);
      window.open(pdf.output('bloburl'), '_blank');
    } catch (error) {
      console.error("PDF Generation failed:", error);
    }
  };

  const normalizeDate = (dateVal: string) => {
    if (!dateVal) return null;
    const d = /^\d+$/.test(dateVal) ? new Date(Number(dateVal) * 1000) : new Date(dateVal);
    if (isNaN(d.getTime())) return null;
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log(`Fetching data for Employee: ${employeeId}, Customer: ${user?.code_customer}`);
        
        const driverRes = await fetch(`${import.meta.env.VITE_URL_API_DRIVER}drivers/code_company/${user?.code_customer}`);
        const driverData = await driverRes.json();
        const rawDriver = driverData.data.find((d: any) => d.employee_id === employeeId);
        if (rawDriver) {
          setDriverInfo({
            ...rawDriver,
            nama_lengkap: rawDriver.full_name || rawDriver.nama_lengkap
          });
        }

        const res = await fetch(`${import.meta.env.VITE_URL_API}timesheets-mitra-firebase/${employeeId}/${user?.code_customer}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const result = await res.json();
        console.log('Calculation Data Received:', result);
        
        if (result.status === 'success') {
          setData(result.data);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user && employeeId && token) fetchData();
  }, [employeeId, user, token]);

  const generateDays = () => {
    if (!period) return [];
    const [year, month] = period.split('-').map(Number);
    
    let startDate: Date, endDate: Date;
    const cutOff = data.agreement?.cutOffDate;
    
    if (cutOff && cutOff.includes('-')) {
      const [startD, endD] = cutOff.split('-').map(Number);
      startDate = new Date(year, month - 2, startD);
      endDate = new Date(year, month - 1, endD);
    } else {
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0);
    }

    const daysList = [];
    let current = new Date(startDate);
    let dayCounter = 1;

    while (current <= endDate) {
      const dateObj = new Date(current);
      const dayNum = dateObj.getDate();
      const monthNum = dateObj.getMonth();
      const yearNum = dateObj.getFullYear();
      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
      const dayIndex = dateObj.getDay(); // 0 (Sun) - 6 (Sat)
      
      const workDayConfig = data.agreement?.hari_kerja?.find(hk => {
        const fbIdx = Number(hk.day_index);
        return fbIdx === dayIndex || (fbIdx === 7 && dayIndex === 0);
      });

      const isWeekend = workDayConfig 
        ? Number(workDayConfig.iwo_workdays_status) !== 1 
        : (data.agreement?.workDays?.length 
            ? !data.agreement.workDays.includes(dayName) 
            : (dayName === 'Saturday' || dayName === 'Sunday'));
      
      const currentStr = yearNum + '-' + String(monthNum + 1).padStart(2, '0') + '-' + String(dayNum).padStart(2, '0');
      const rawTimesheet = data.timesheets.find(ts => {
        if (!ts.date_timesheets) return false;
        return normalizeDate(ts.date_timesheets) === currentStr;
      });

      const isApproved = rawTimesheet?.approved_timesheets?.[0]?.status_approve === 1;
      const timesheet = isApproved ? rawTimesheet : null;

      let workHours = 0;
      let displayWork = "-";
      let displayTotal = "-";
      
      if (timesheet && timesheet.time_entry && timesheet.time_exit) {
        const [h1, m1] = timesheet.time_entry.split(':').map(Number);
        const [h2, m2] = timesheet.time_exit.split(':').map(Number);
        const diffMinutes = (h2 * 60 + m2) - (h1 * 60 + m1);
        const breakMinutes = diffMinutes > 240 ? 60 : 0;
        const netMinutes = Math.max(0, diffMinutes - breakMinutes);
        
        const workHoursOnly = Math.floor(netMinutes / 60);
        const workMinutesOnly = netMinutes % 60;
        
        displayWork = `${workHoursOnly}:${String(workMinutesOnly).padStart(2, '0')}`;
        
        const decimalMinutes = workMinutesOnly >= 45 ? 0.75 : (workMinutesOnly >= 30 ? 0.5 : 0);
        workHours = workHoursOnly + decimalMinutes;
        
        displayTotal = String(workHours);
      }

      const upahPerJam = parseInt(data.agreement?.upahPerJam || "0");
      const insentif = isApproved ? (workHours * upahPerJam) : 0;
      const performanceRate = timesheet ? parseFloat(timesheet.performance_rate || "0") : 0;

      daysList.push({
        no: `Day ${dayCounter++}`,
        date: dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-'),
        day: dayName,
        in: timesheet?.time_entry || "-",
        out: timesheet?.time_exit || "-",
        totalWork: displayWork,
        effective: displayTotal,
        insentif: insentif,
        premium: (isApproved && timesheet?.is_premium) ? parseInt(data.agreement?.tunjanganMobilMewah || "0") : 0,
        vip: (isApproved && timesheet?.is_vip) ? parseInt(data.agreement?.tunjanganKonsumsiVIP || "0") : 0,
        holiday: (isApproved && (timesheet?.status_hari_libur || isWeekend)) ? parseInt(data.agreement?.insentifLiburNasional || "0") : 0,
        religious: (isApproved && timesheet?.status_hari_raya) ? parseInt(data.agreement?.tunjanganHariRaya || "0") : 0,
        performanceRate: performanceRate,
        isWeekend,
        penugasan: timesheet?.penugasan || ""
      });

      current.setDate(current.getDate() + 1);
    }
    return daysList;
  };

  const days = generateDays();

  const totals = days.reduce((acc, day) => {
    acc.insentif += day.insentif;
    acc.premium += day.premium;
    acc.vip += day.vip;
    acc.holiday += day.holiday;
    acc.religious += day.religious;
    if (day.performanceRate > 0) {
      acc.totalPerf += day.performanceRate;
      acc.perfCount += 1;
    }
    return acc;
  }, { insentif: 0, premium: 0, vip: 0, holiday: 0, religious: 0, totalPerf: 0, perfCount: 0 });

  const avgPerformance = totals.perfCount > 0 ? (totals.totalPerf / totals.perfCount).toFixed(2) : '-';

  if (loading) return <div className="p-10 text-center font-black text-gray-400 animate-pulse">GENERATING CALCULATION ENGINE...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-[1600px] mx-auto"
    >
      <div className="flex items-center justify-between no-print px-4">
        <button 
          onClick={() => navigate(-1)}
          className="group flex items-center gap-3 text-gray-400 hover:text-blue-600 font-bold text-sm transition-all duration-300"
        >
          <div className="p-2 rounded-xl bg-gray-50 group-hover:bg-blue-50 transition-colors">
            <ChevronLeft size={18} />
          </div>
          Back to List
        </button>
        <div className="flex items-center gap-4">
          <button 
            onClick={exportToPDF}
            className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-[#1e3a5f] to-[#2c4a73] rounded-2xl text-xs font-black uppercase tracking-[0.15em] text-white hover:shadow-2xl hover:shadow-blue-200/50 hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
          >
            <Download size={16} /> Review PDF Report
          </button>
        </div>
      </div>

      {/* Main UI View (Modern Style) */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        ref={reportRef} 
        className="bg-white border border-gray-100 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden"
      >
        <div className="p-10 border-b border-gray-100 bg-gradient-to-br from-gray-50/50 to-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/30 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-6 flex-1">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase flex items-center gap-4">
                <div className="h-10 w-1.5 bg-gradient-to-b from-blue-600 to-blue-400 rounded-full" />
                Timesheet Calculation
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
                   <table className="w-full border-collapse text-[12px]">
                    <tbody>
                      <MetaRow label="Employee Name" value={driverInfo?.nama_lengkap || '-'} />
                      <MetaRow label="Position" value="Driver Specialist" />
                      <MetaRow label="Employee Status" value="Active / Job Holder" />
                      <MetaRow label="Users Name" value={data.agreement?.userName || (data.agreement?.clientName ? `${data.agreement.clientName} - 1` : '-')} />
                      <MetaRow label="Employer Name" value={data.agreement?.clientName || '-'} />
                      <MetaRow label="Date Period" value={(() => {
                        if (!period) return '-';
                        const [year, month] = period.split('-').map(Number);
                        const cutOff = data.agreement?.cutOffDate;
                        let start, end;
                        if (cutOff && cutOff.includes('-')) {
                            const [startD, endD] = cutOff.split('-').map(Number);
                            start = new Date(year, month - 2, startD).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                            end = new Date(year, month - 1, endD).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                        } else {
                            const lastDay = new Date(year, month, 0).getDate();
                            start = new Date(year, month - 1, 1).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                            end = new Date(year, month - 1, lastDay).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                        }
                        return `${start} - ${end}`;
                      })()} isLast={true} />
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-[2rem] text-white shadow-lg shadow-blue-100">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Total Insentif</p>
                      <p className="text-2xl font-black tracking-tighter">Rp {totals.insentif.toLocaleString()}</p>
                   </div>
                   <div className="bg-white border border-gray-100 p-6 rounded-[2rem] shadow-sm">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Performance Rate</p>
                      <div className="flex items-end gap-2">
                        <p className="text-2xl font-black text-gray-900 tracking-tighter">{avgPerformance}</p>
                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-lg mb-1">avg/month</span>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[10px] table-fixed">
            <thead>
              <tr className="bg-[#1e3a5f] text-white font-black uppercase tracking-widest text-center">
                <th rowSpan={2} className="w-14 px-1 py-5 border-r border-white/5">No.</th>
                <th colSpan={4} className="px-1 py-3 border-r border-white/5 border-b border-white/5">Working Time</th>
                <th colSpan={3} className="px-1 py-3 border-r border-white/5 border-b border-white/5">Total Work Time Insentif</th>
                <th colSpan={4} className="px-1 py-3 border-r border-white/5 border-b border-white/5">Other Daily Insentif</th>
                <th rowSpan={2} className="w-24 px-1 py-5 border-r border-white/5">Performance Rate</th>
                <th rowSpan={2} className="px-1 py-5">Remarks</th>
              </tr>
              <tr className="bg-[#2c4a73] text-white font-bold uppercase text-[7.5px] text-center">
                <th className="px-1 py-3 border-r border-white/5">Date</th>
                <th className="px-1 py-3 border-r border-white/5">Day</th>
                <th className="px-1 py-3 border-r border-white/5">Start</th>
                <th className="px-1 py-3 border-r border-white/5">End</th>
                <th className="px-1 py-3 border-r border-white/5">Work</th>
                <th className="px-1 py-3 border-r border-white/5">Total</th>
                <th className="px-1 py-3 border-r border-white/5">Insentif</th>
                <th className="px-1 py-3 border-r border-white/5">Premium Car</th>
                <th className="px-1 py-3 border-r border-white/5">VIP User</th>
                <th className="px-1 py-3 border-r border-white/5">Holiday</th>
                <th className="px-1 py-3 border-r border-white/5">Religious Day</th>
              </tr>
            </thead>
            <tbody className="font-bold text-gray-700">
              {days.map((day, idx) => (
                <tr 
                  key={idx} 
                  className={`border-b border-gray-100 hover:bg-blue-50/40 transition-colors ${day.isWeekend ? 'bg-red-50 text-red-600' : ''}`}
                >
                  <td className="px-2 py-3 border-r border-gray-100 text-center font-black text-gray-400">{day.no.split(' ')[1]}</td>
                  <td className="px-2 py-3 border-r border-gray-100 whitespace-nowrap text-center font-mono">{day.date}</td>
                  <td className="px-2 py-3 border-r border-gray-100 text-center uppercase text-[8px]">{day.day}</td>
                  <td className="px-2 py-3 border-r border-gray-100 text-center font-mono">{day.in}</td>
                  <td className="px-2 py-3 border-r border-gray-100 text-center font-mono">{day.out}</td>
                  <td className="px-2 py-3 border-r border-gray-100 text-center">{day.totalWork}</td>
                  <td className="px-2 py-3 border-r border-gray-100 text-center">{day.effective}</td>
                  <td className="px-2 py-3 border-r border-gray-100 text-center font-mono">{day.insentif > 0 ? day.insentif.toLocaleString() : '-'}</td>
                  <td className="px-2 py-3 border-r border-gray-100 text-center font-mono">{day.premium > 0 ? day.premium.toLocaleString() : '-'}</td>
                  <td className="px-2 py-3 border-r border-gray-100 text-center font-mono">{day.vip > 0 ? day.vip.toLocaleString() : '-'}</td>
                  <td className="px-2 py-3 border-r border-gray-100 text-center font-mono">{day.holiday > 0 ? day.holiday.toLocaleString() : '-'}</td>
                  <td className="px-2 py-3 border-r border-gray-100 text-center font-mono">{day.religious > 0 ? day.religious.toLocaleString() : '-'}</td>
                  <td className="px-2 py-3 border-r border-gray-100 text-center">
                    {day.performanceRate > 0 ? <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md text-[9px] border border-emerald-100">{day.performanceRate.toFixed(2)}</span> : '-'}
                  </td>
                  <td className="px-2 py-3 italic text-gray-500 text-[8px] text-center">
                    {day.penugasan}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
               <tr className="bg-gray-900 text-white font-black uppercase text-[10px] text-center">
                 <td colSpan={5} className="px-2 py-6">Summary Calculation</td>
                 <td className="px-2 py-6 opacity-40">-</td>
                 <td className="px-2 py-6 opacity-40">-</td>
                 <td className="px-2 py-6 text-blue-400 font-mono">{totals.insentif.toLocaleString()}</td>
                 <td className="px-2 py-6 font-mono">{totals.premium.toLocaleString()}</td>
                 <td className="px-2 py-6 font-mono">{totals.vip.toLocaleString()}</td>
                 <td className="px-2 py-6 font-mono">{totals.holiday.toLocaleString()}</td>
                 <td className="px-2 py-6 font-mono">{totals.religious.toLocaleString()}</td>
                 <td className="px-2 py-6 text-emerald-400 font-mono">{avgPerformance}</td>
                 <td className="px-2 py-6 text-[8px] tracking-[0.2em] font-black opacity-60">Report Finalized</td>
               </tr>
            </tfoot>
          </table>
        </div>
      </motion.div>

      {/* Hidden Formal Print Template (Strictly for PDF Capture) */}
      <div 
        id="formal-print-template"
        ref={printRef}
        style={{ 
          display: 'block', 
          opacity: 0,
          position: 'absolute',
          left: '-20000px',
          top: '0',
          width: '2600px', // Even wider for larger fonts + extra column
          backgroundColor: 'white',
          padding: '0',
          margin: '0'
        }}
      >
        <div className="p-10 bg-white">
          <h2 className="text-3xl font-bold text-black uppercase mb-8 tracking-tighter">
            Timesheet Calculation
          </h2>
          
          <div className="flex justify-between items-start mb-8">
            <div className="w-[900px]">
               <table className="w-full border-collapse border border-black text-[13px]">
                <tbody>
                  <PrintMetaRow label="Employee Name" value={driverInfo?.nama_lengkap || '-'} />
                  <PrintMetaRow label="Position" value="Driver" />
                  <PrintMetaRow label="Employee Status" value="MITRA PRIORITAS" />
                  <PrintMetaRow label="Employer Company" value={data.agreement?.clientName || '-'} />
                  <PrintMetaRow label="Working Period" value={(() => {
                    if (!period) return '-';
                    const [year, month] = period.split('-').map(Number);
                    const cutOff = data.agreement?.cutOffDate;
                    let start, end;
                    if (cutOff && cutOff.includes('-')) {
                        const [startD, endD] = cutOff.split('-').map(Number);
                        start = new Date(year, month - 2, startD).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-');
                        end = new Date(year, month - 1, endD).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-');
                    } else {
                        const lastDay = new Date(year, month, 0).getDate();
                        start = new Date(year, month - 1, 1).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-');
                        end = new Date(year, month - 1, lastDay).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-');
                    }
                    return `${start}      ${end}`;
                  })()} isLast={true} />
                </tbody>
              </table>
            </div>

            <div className="w-[500px]">
               <div className="border border-black flex flex-col h-[150px]">
                  <div className="bg-gray-100 border-b border-black px-4 py-2 text-[12px] font-bold uppercase text-center">
                    Acknowledged by :
                  </div>
                  <div className="flex-1" />
                  <div className="border-t border-black h-10" />
               </div>
            </div>
          </div>

          <table className="w-full border-collapse text-[13px] table-fixed border border-black">
            <thead>
              <tr className="bg-[#1e3a5f] text-white font-bold uppercase text-center">
                <th rowSpan={2} className="w-24 px-1 py-4 border border-black text-[14px]">No.</th>
                <th colSpan={4} className="px-1 py-3 border border-black text-[14px]">Working Time</th>
                <th colSpan={3} className="px-1 py-3 border border-black text-[14px]">Total Work Time Insentif</th>
                <th colSpan={5} className="px-1 py-3 border border-black text-[14px]">Other Daily Insentif</th>
                <th rowSpan={2} className="px-1 py-4 border border-black text-[14px]">Remarks</th>
              </tr>
              <tr className="bg-[#1e3a5f] text-white font-bold uppercase text-[11px] text-center">
                <th className="px-1 py-2 border border-black">Date</th>
                <th className="px-1 py-2 border border-black">Day</th>
                <th className="px-1 py-2 border border-black">Start</th>
                <th className="px-1 py-2 border border-black">End</th>
                <th className="px-1 py-2 border border-black">Work</th>
                <th className="px-1 py-2 border border-black">Total</th>
                <th className="px-1 py-2 border border-black">Insentif</th>
                <th className="px-1 py-2 border border-black">Premium Car</th>
                <th className="px-1 py-2 border border-black">VIP User</th>
                <th className="px-1 py-2 border border-black">Holiday</th>
                <th className="px-1 py-2 border border-black">Religious Day</th>
                <th className="px-1 py-2 border border-black bg-emerald-700">Perf. Rate</th>
              </tr>
            </thead>
            <tbody className="font-bold text-black bg-white">
              {days.map((day, idx) => (
                <tr 
                  key={idx} 
                  style={day.isWeekend ? { backgroundColor: '#fee2e2', color: '#be123c' } : {}}
                >
                  <td className="px-1 py-2 border border-black text-center font-bold" style={day.isWeekend ? { backgroundColor: '#fee2e2', color: '#be123c' } : {}}>Day {idx + 1}</td>
                  <td className="px-1 py-2 border border-black text-center font-mono text-[11px]" style={day.isWeekend ? { backgroundColor: '#fee2e2', color: '#be123c' } : {}}>{day.date}</td>
                  <td className="px-1 py-2 border border-black text-center uppercase text-[10px]" style={day.isWeekend ? { backgroundColor: '#fee2e2', color: '#be123c' } : {}}>{day.day}</td>
                  <td className="px-1 py-2 border border-black text-center font-mono" style={day.isWeekend ? { backgroundColor: '#fee2e2', color: '#be123c' } : {}}>{day.in}</td>
                  <td className="px-1 py-2 border border-black text-center font-mono" style={day.isWeekend ? { backgroundColor: '#fee2e2', color: '#be123c' } : {}}>{day.out}</td>
                  <td className="px-1 py-2 border border-black text-center" style={day.isWeekend ? { backgroundColor: '#fee2e2', color: '#be123c' } : {}}>{day.totalWork}</td>
                  <td className="px-1 py-2 border border-black text-center" style={day.isWeekend ? { backgroundColor: '#fee2e2', color: '#be123c' } : {}}>{day.effective}</td>
                  <td className="px-1 py-2 border border-black text-center font-mono" style={day.isWeekend ? { backgroundColor: '#fee2e2', color: '#be123c' } : {}}>{day.insentif > 0 ? day.insentif.toLocaleString() : ''}</td>
                  <td className="px-1 py-2 border border-black text-center font-mono" style={day.isWeekend ? { backgroundColor: '#fee2e2', color: '#be123c' } : {}}>{day.premium > 0 ? day.premium.toLocaleString() : ''}</td>
                  <td className="px-1 py-2 border border-black text-center font-mono" style={day.isWeekend ? { backgroundColor: '#fee2e2', color: '#be123c' } : {}}>{day.vip > 0 ? day.vip.toLocaleString() : ''}</td>
                  <td className="px-1 py-2 border border-black text-center font-mono" style={day.isWeekend ? { backgroundColor: '#fee2e2', color: '#be123c' } : {}}>{day.holiday > 0 ? day.holiday.toLocaleString() : ''}</td>
                  <td className="px-1 py-2 border border-black text-center font-mono" style={day.isWeekend ? { backgroundColor: '#fee2e2', color: '#be123c' } : {}}>{day.religious > 0 ? day.religious.toLocaleString() : ''}</td>
                  <td className="px-1 py-2 border border-black text-center font-bold text-emerald-600" style={day.isWeekend ? { backgroundColor: '#fee2e2', color: '#be123c' } : {}}>{day.performanceRate > 0 ? day.performanceRate.toFixed(1) : ''}</td>
                  <td className="px-1 py-2 border border-black italic text-center" style={day.isWeekend ? { backgroundColor: '#fee2e2', color: '#be123c' } : {}}>
                    {day.penugasan}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
               <tr className="bg-white font-bold uppercase text-[14px] text-center border border-black">
                 <td colSpan={5} className="px-2 py-4 border border-black"></td>
                 <td className="px-2 py-4 border border-black">
                    {(() => {
                      const totalWorkMinutes = days.reduce((acc, d) => {
                        if (d.totalWork && d.totalWork !== "-") {
                          const [h, m] = d.totalWork.split(':').map(Number);
                          return acc + (h * 60 + m);
                        }
                        return acc;
                      }, 0);
                      const totalWorkHoursPart = Math.floor(totalWorkMinutes / 60);
                      const totalWorkMinsPart = totalWorkMinutes % 60;
                      return `${totalWorkHoursPart}:${String(totalWorkMinsPart).padStart(2, '0')}`;
                    })()}
                 </td>
                 <td className="px-2 py-4 border border-black"></td>
                 <td className="px-2 py-4 border border-black font-mono">{totals.insentif.toLocaleString()}</td>
                 <td className="px-2 py-4 border border-black font-mono">{totals.premium.toLocaleString()}</td>
                 <td className="px-2 py-4 border border-black font-mono">{totals.vip.toLocaleString()}</td>
                 <td className="px-2 py-4 border border-black font-mono">{totals.holiday.toLocaleString()}</td>
                 <td className="px-2 py-4 border border-black font-mono">{totals.religious.toLocaleString()}</td>
                 <td className="px-2 py-4 border border-black text-emerald-700">{avgPerformance}</td>
                 <td className="px-2 py-4 border border-black"></td>
               </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

function MetaRow({ label, value, isLast = false }: { label: string, value: string, isLast?: boolean }) {
  return (
    <tr className={!isLast ? 'border-b border-gray-100' : ''}>
      <td className="w-48 py-3.5 font-black text-gray-400 uppercase tracking-widest text-[9px]">{label}</td>
      <td className="py-3.5 font-black text-gray-900 tracking-tight pl-4 border-l border-gray-100">{value}</td>
    </tr>
  );
}

function PrintMetaRow({ label, value, isLast = false }: { label: string, value: string, isLast?: boolean }) {
  return (
    <tr className={!isLast ? 'border-b border-black' : ''}>
      <td className="w-48 py-2 px-4 font-bold text-black uppercase tracking-widest text-[12px] bg-gray-100">{label}</td>
      <td className="py-2 px-4 font-bold text-black tracking-tight border-l border-black text-[13px]">{value}</td>
    </tr>
  );
}
