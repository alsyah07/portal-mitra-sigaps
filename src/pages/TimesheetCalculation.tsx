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

      <div className="flex items-center justify-between no-print">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold text-sm transition-all"
        >
          <ChevronLeft size={18} />
          Back to List
        </button>
        <div className="flex items-center gap-3">
          <button 
            onClick={exportToPDF}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1e3a5f] rounded-xl text-xs font-black uppercase tracking-widest text-white hover:bg-blue-600 transition-all shadow-lg shadow-blue-100 active:scale-95"
          >
            <Download size={14} /> Review PDF Report
          </button>
        </div>
      </div>

      <div ref={reportRef} className="bg-white border border-gray-200 rounded-[2rem] shadow-sm overflow-hidden overflow-x-auto print-container border-std">
        <div className="p-8 border-b border-gray-100 bg-std-light">
          <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase mb-6 flex items-center gap-3">
            <div className="h-6 w-1 bg-[#2563eb] rounded-full" />
            Detail of Timesheet Calculation
          </h2>
          
          <table className="w-full max-w-2xl border-collapse border border-gray-200 text-[11px]">
            <tbody>
              <MetaRow label="Employee Name" value={driverInfo?.nama_lengkap || '-'} />
              <MetaRow label="Position" value="Driver" />
              <MetaRow label="Employee Status" value="Job Holder" />
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
              })()} />
            </tbody>
          </table>
        </div>

        <table className="w-full border-collapse text-[9px] table-fixed">
          <thead>
            <tr className="header-blue font-black uppercase tracking-tight text-center">
              <th rowSpan={2} className="w-12 px-1 py-3 border-r border-white/10">No.</th>
              <th colSpan={4} className="px-1 py-2 border-r border-white/10 border-b border-white/10">Working Time</th>
              <th colSpan={3} className="px-1 py-2 border-r border-white/10 border-b border-white/10">Total Work Time Insentif</th>
              <th colSpan={4} className="px-1 py-2 border-r border-white/10 border-b border-white/10">Other Daily Insentif</th>
              <th rowSpan={2} className="w-20 px-1 py-3 border-r border-white/10">Performance Rate</th>
              <th rowSpan={2} className="px-1 py-3">Remarks</th>
            </tr>
            <tr className="sub-header-blue font-bold uppercase text-[7px] text-center">
              <th className="px-1 py-2 border-r border-white/10">Date</th>
              <th className="px-1 py-2 border-r border-white/10">Day</th>
              <th className="px-1 py-2 border-r border-white/10">Start</th>
              <th className="px-1 py-2 border-r border-white/10">End</th>
              <th className="px-1 py-2 border-r border-white/10">Work</th>
              <th className="px-1 py-2 border-r border-white/10">Total</th>
              <th className="px-1 py-2 border-r border-white/10">Insentif</th>
              <th className="px-1 py-2 border-r border-white/10">Premium Car</th>
              <th className="px-1 py-2 border-r border-white/10">VIP User</th>
              <th className="px-1 py-2 border-r border-white/10">Holiday</th>
              <th className="px-1 py-2 border-r border-white/10">Religious Day</th>
            </tr>
          </thead>
          <tbody className="font-bold text-gray-700">
            {days.map((day, idx) => (
              <tr 
                key={idx} 
                className={`border-b border-gray-200 transition-colors ${
                  day.isWeekend ? 'weekend-row' : 'hover:bg-blue-50/30'
                }`}
              >
                <td className="px-2 py-2 border-r border-gray-200 text-center font-black text-gray-400">{day.no}</td>
                <td className="px-2 py-2 border-r border-gray-200 whitespace-nowrap text-center">{day.date}</td>
                <td className="px-2 py-2 border-r border-gray-200 text-center">{day.day}</td>
                <td className="px-2 py-2 border-r border-gray-200 text-center">{day.in}</td>
                <td className="px-2 py-2 border-r border-gray-200 text-center">{day.out}</td>
                <td className="px-2 py-2 border-r border-gray-200 text-center">{day.totalWork}</td>
                <td className="px-2 py-2 border-r border-gray-200 text-center">{day.effective}</td>
                <td className="px-2 py-2 border-r border-gray-200 text-center">{day.insentif > 0 ? day.insentif.toLocaleString() : '-'}</td>
                <td className="px-2 py-2 border-r border-gray-200 text-center">{day.premium > 0 ? day.premium.toLocaleString() : '-'}</td>
                <td className="px-2 py-2 border-r border-gray-200 text-center">{day.vip > 0 ? day.vip.toLocaleString() : '-'}</td>
                <td className="px-2 py-2 border-r border-gray-200 text-center">{day.holiday > 0 ? day.holiday.toLocaleString() : '-'}</td>
                <td className="px-2 py-2 border-r border-gray-200 text-center">{day.religious > 0 ? day.religious.toLocaleString() : '-'}</td>
                <td className="px-2 py-2 border-r border-gray-200 text-center">{day.performanceRate > 0 ? day.performanceRate.toFixed(2) : '-'}</td>
                <td className="px-2 py-2 italic text-gray-400 text-[8px]">-</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
             <tr className="footer-dark font-black uppercase text-[9px] text-center">
               <td colSpan={5} className="px-2 py-4">Summary Totals</td>
               <td className="px-2 py-4">-</td>
               <td className="px-2 py-4">-</td>
               <td className="px-2 py-4">{totals.insentif.toLocaleString()}</td>
               <td className="px-2 py-4">{totals.premium.toLocaleString()}</td>
               <td className="px-2 py-4">{totals.vip.toLocaleString()}</td>
               <td className="px-2 py-4">{totals.holiday.toLocaleString()}</td>
               <td className="px-2 py-4">{totals.religious.toLocaleString()}</td>
               <td className="px-2 py-4">{avgPerformance}</td>
               <td className="px-2 py-4">Generated Report</td>
             </tr>
          </tfoot>
        </table>
      </div>
    </motion.div>
  );
}

function MetaRow({ label, value }: { label: string, value: string }) {
  return (
    <tr className="border-b border-gray-200">
      <td className="w-40 bg-gray-50 px-3 py-2 font-black text-gray-500 uppercase tracking-widest border-r border-gray-200">{label}</td>
      <td className="px-3 py-2 font-bold text-gray-900 tracking-tight">{value}</td>
    </tr>
  );
}
