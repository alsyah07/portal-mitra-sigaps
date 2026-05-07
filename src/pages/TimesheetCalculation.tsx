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
  const { user } = useAuth();
  
  const period = searchParams.get('period') || new Date().toISOString().slice(0, 7); // YYYY-MM
  const [loading, setLoading] = useState(true);
  const [driverInfo, setDriverInfo] = useState<Driver | null>(null);
  const [data, setData] = useState<{ timesheets: Timesheet[], agreement: Agreement | null }>({
    timesheets: [],
    agreement: null
  });
  
  const reportRef = React.useRef<HTMLDivElement>(null);

  const exportToPDF = async () => {
    if (!reportRef.current) return;
    
    const element = reportRef.current;
    const { jsPDF } = (window as any).jspdf;
    const html2canvas = (window as any).html2canvas;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 1600,
        onclone: (clonedDoc: any) => {
          const noPrints = clonedDoc.querySelectorAll('.no-print');
          noPrints.forEach((el: any) => el.style.display = 'none');

          const container = clonedDoc.querySelector('.print-container');
          if (container) {
            container.style.width = '1400px';
            container.style.padding = '40px';
            container.style.margin = '0 auto';
            container.style.backgroundColor = '#ffffff';
            container.style.borderRadius = '0';
          }

          const tables = clonedDoc.getElementsByTagName('table');
          for (let table of tables) {
            table.style.borderCollapse = 'collapse';
            table.style.width = '100%';
            table.style.border = '1px solid #d1d5db';
          }

          const cells = clonedDoc.querySelectorAll('th, td');
          cells.forEach((cell: any) => {
            cell.style.border = '1px solid #d1d5db';
            cell.style.padding = '10px 6px';
            cell.style.verticalAlign = 'middle';
            cell.style.textAlign = 'center';
            cell.style.fontSize = '9px';
          });

          const headers = clonedDoc.querySelectorAll('th');
          headers.forEach((th: any) => {
            th.style.fontWeight = '900';
            th.style.textTransform = 'uppercase';
            th.style.letterSpacing = '0.05em';
          });

          const allElements = clonedDoc.getElementsByTagName('*');
          for (let i = 0; i < allElements.length; i++) {
            const el = allElements[i];
            const props = ['color', 'backgroundColor', 'borderColor'];
            const style = window.getComputedStyle(el);
            
            props.forEach(prop => {
              const val = (style as any)[prop];
              if (val && val.includes('okl')) {
                if (prop === 'color') el.style.color = '#111827';
                else if (prop === 'backgroundColor') {
                   if (el.tagName === 'TH' || el.classList.contains('header-blue')) el.style.backgroundColor = '#1e3a5f';
                   else if (el.classList.contains('sub-header-blue')) el.style.backgroundColor = '#2c4a73';
                   else if (el.classList.contains('weekend-row')) el.style.backgroundColor = '#fff1f2';
                   else if (el.classList.contains('footer-dark')) el.style.backgroundColor = '#111827';
                   else el.style.backgroundColor = 'transparent';
                }
                else el.style[prop as any] = '#d1d5db';
              }
            });

            if (el.classList.contains('header-blue')) { el.style.backgroundColor = '#1e3a5f'; el.style.color = '#ffffff'; }
            if (el.classList.contains('sub-header-blue')) { el.style.backgroundColor = '#2c4a73'; el.style.color = '#ffffff'; }
            if (el.classList.contains('weekend-row')) { el.style.backgroundColor = '#fff1f2'; el.style.color = '#e11d48'; }
            if (el.classList.contains('footer-dark')) { el.style.backgroundColor = '#111827'; el.style.color = '#ffffff'; }
          }
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const renderWidth = pdfWidth - 20; 
      const imgProps = pdf.getImageProperties(imgData);
      const renderHeight = (imgProps.height * renderWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 10, 10, renderWidth, renderHeight);
      window.open(pdf.output('bloburl'), '_blank');
    } catch (error) {
      console.error("PDF Generation failed:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Fetch driver info for profile details
        const driverRes = await fetch(`${import.meta.env.VITE_URL_API_DRIVER}drivers/code_company/${user?.code_customer}`);
        const driverData = await driverRes.json();
        const rawDriver = driverData.data.find((d: any) => d.employee_id === employeeId);
        if (rawDriver) {
          setDriverInfo({
            ...rawDriver,
            nama_lengkap: rawDriver.full_name || rawDriver.nama_lengkap
          });
        }

        // 2. Fetch timesheets and agreement data
        const res = await fetch(`${import.meta.env.VITE_URL_API}timesheets-mitra-firebase/${employeeId}/${user?.code_customer}`);
        const result = await res.json();
        if (result.status === 'success') {
          setData(result.data);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user && employeeId) fetchData();
  }, [employeeId, user]);

  // Helper to generate days for the table
  const generateDays = () => {
    if (!period) return [];
    const [year, month] = period.split('-').map(Number);
    
    let startDate: Date, endDate: Date;
    const cutOff = data.agreement?.cutOffDate; // e.g. "21-20"
    
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
      const isWeekend = dayName === 'Saturday' || dayName === 'Sunday';
      
      // Find matching timesheet
      const timesheet = data.timesheets.find(ts => {
        if (!ts.date_timesheets) return false;
        
        const isUnix = /^\d+$/.test(ts.date_timesheets);
        const tsDate = isUnix ? new Date(Number(ts.date_timesheets) * 1000) : new Date(ts.date_timesheets);
        
        // Use YYYY-MM-DD string comparison to be safe across timezones
        const dStr = tsDate.getFullYear() + '-' + String(tsDate.getMonth() + 1).padStart(2, '0') + '-' + String(tsDate.getDate()).padStart(2, '0');
        const currentStr = yearNum + '-' + String(monthNum + 1).padStart(2, '0') + '-' + String(dayNum).padStart(2, '0');
        
        return dStr === currentStr;
      });

      // Calculation logic
      let workHours = 0;
      let displayWork = "-";
      let displayTotal = "-";
      
      if (timesheet && timesheet.time_entry && timesheet.time_exit) {
        const [h1, m1] = timesheet.time_entry.split(':').map(Number);
        const [h2, m2] = timesheet.time_exit.split(':').map(Number);
        const diffMinutes = (h2 * 60 + m2) - (h1 * 60 + m1);
        
        // Use 1 hour break if they work more than 4 hours
        const breakMinutes = diffMinutes > 240 ? 60 : 0;
        workHours = (diffMinutes - breakMinutes) / 60;
        
        displayWork = `${Math.floor(workHours)}:00`;
        displayTotal = `${Math.floor(workHours)}:00`;
      }

      const upahPerJam = parseInt(data.agreement?.upahPerJam || "0");
      const insentif = Math.round(workHours) * upahPerJam;
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
        premium: timesheet?.is_premium ? parseInt(data.agreement?.tunjanganMobilMewah || "0") : 0,
        vip: timesheet?.is_vip ? parseInt(data.agreement?.tunjanganKonsumsiVIP || "0") : 0,
        holiday: timesheet?.status_hari_libur ? parseInt(data.agreement?.insentifLiburNasional || "0") : 0,
        religious: timesheet?.status_hari_raya ? parseInt(data.agreement?.tunjanganHariRaya || "0") : 0,
        performanceRate: performanceRate,
        isWeekend
      });

      current.setDate(current.getDate() + 1);
    }
    return daysList;
  };

  const days = generateDays();

  // Summary Totals
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
      <style dangerouslySetInnerHTML={{ __html: `
        @media print, screen {
          .print-container { color: #111827 !important; background-color: #ffffff !important; }
          .header-blue { background-color: #1e3a5f !important; color: #ffffff !important; }
          .sub-header-blue { background-color: #2c4a73 !important; color: #ffffff !important; }
          .weekend-row { background-color: #fff1f2 !important; color: #e11d48 !important; }
          .footer-dark { background-color: #111827 !important; color: #ffffff !important; }
          .border-std { border-color: #e5e7eb !important; }
          .bg-std-light { background-color: #fcfcfa !important; }
        }
      `}} />

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

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        ref={reportRef} 
        className="bg-white border border-gray-100 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden print-container border-std"
      >
        <div className="p-10 border-b border-gray-100 bg-gradient-to-br from-gray-50/50 to-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/30 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="space-y-6 flex-1"
            >
              <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase flex items-center gap-4">
                <motion.div 
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="h-10 w-1.5 bg-gradient-to-b from-blue-600 to-blue-400 rounded-full origin-top" 
                />
                Timesheet Calculation
                <span className="text-sm font-bold text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full lowercase tracking-normal">verified report</span>
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <motion.div 
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-[2.5rem] p-8 shadow-sm"
                >
                   <table className="w-full border-collapse text-[12px]">
                    <tbody>
                      <MetaRow label="Employee Name" value={driverInfo?.nama_lengkap || '-'} />
                      <MetaRow label="Position" value="Driver Specialist" />
                      <MetaRow label="Employee Status" value="Active / Job Holder" isLast={false} />
                      <MetaRow label="Users Name" value={data.agreement?.userName || (data.agreement?.clientName ? `${data.agreement.clientName} - 1` : '-')} isLast={false} />
                      <MetaRow label="Employer Name" value={data.agreement?.clientName || '-'} isLast={false} />
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
                </motion.div>

                <div className="grid grid-cols-2 gap-4">
                   <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-[2rem] text-white shadow-lg shadow-blue-100"
                   >
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Total Insentif</p>
                      <p className="text-2xl font-black tracking-tighter">Rp {totals.insentif.toLocaleString()}</p>
                   </motion.div>
                   <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="bg-white border border-gray-100 p-6 rounded-[2rem] shadow-sm"
                   >
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Performance Rate</p>
                      <div className="flex items-end gap-2">
                        <p className="text-2xl font-black text-gray-900 tracking-tighter">{avgPerformance}</p>
                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-lg mb-1">avg/month</span>
                      </div>
                   </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[10px] table-fixed">
            <thead>
              <tr className="header-blue font-black uppercase tracking-widest text-center">
                <th rowSpan={2} className="w-14 px-1 py-5 border-r border-white/5">No.</th>
                <th colSpan={4} className="px-1 py-3 border-r border-white/5 border-b border-white/5">Working Time</th>
                <th colSpan={3} className="px-1 py-3 border-r border-white/5 border-b border-white/5">Total Work Time Insentif</th>
                <th colSpan={4} className="px-1 py-3 border-r border-white/5 border-b border-white/5">Other Daily Insentif</th>
                <th rowSpan={2} className="w-24 px-1 py-5 border-r border-white/5">Performance Rate</th>
                <th rowSpan={2} className="px-1 py-5">Remarks</th>
              </tr>
              <tr className="sub-header-blue font-bold uppercase text-[7.5px] text-center">
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
            <motion.tbody 
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.03 } }
              }}
              className="font-bold text-gray-700"
            >
              {days.map((day, idx) => (
                <motion.tr 
                  key={idx} 
                  variants={{
                    hidden: { opacity: 0, x: -10 },
                    visible: { opacity: 1, x: 0 }
                  }}
                  className={`border-b border-gray-100 transition-colors duration-300 ${
                    day.isWeekend ? 'weekend-row' : 'hover:bg-blue-50/40'
                  }`}
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
                    {day.performanceRate > 0 ? (
                      <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md text-[9px] border border-emerald-100">{day.performanceRate.toFixed(2)}</span>
                    ) : '-'}
                  </td>
                  <td className="px-2 py-3 italic text-gray-300 text-[8px] text-center">-</td>
                </motion.tr>
              ))}
            </motion.tbody>
            <tfoot>
               <tr className="footer-dark font-black uppercase text-[10px] text-center">
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
