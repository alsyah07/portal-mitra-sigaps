import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  Printer, 
  Download, 
  Calendar as CalendarIcon,
  User,
  Briefcase,
  Building2,
  Clock,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function TimesheetCalculation() {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [driverInfo, setDriverInfo] = useState<any>(null);
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
          // 1. Remove all UI elements that shouldn't be in the PDF
          const noPrints = clonedDoc.querySelectorAll('.no-print');
          noPrints.forEach((el: any) => el.style.display = 'none');

          const container = clonedDoc.querySelector('.print-container');
          if (container) {
            container.style.width = '1400px';
            container.style.padding = '40px';
            container.style.margin = '0 auto';
            container.style.backgroundColor = '#ffffff';
            container.style.borderRadius = '0'; // Clean edges for PDF
          }

          // 2. Precise Table Styling for the "Grid" look
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

          // 3. Header Alignment
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
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate dimensions to fill width while maintaining aspect ratio
      const imgProps = pdf.getImageProperties(imgData);
      const renderWidth = pdfWidth - 20; // 10mm margins
      const renderHeight = (imgProps.height * renderWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 10, 10, renderWidth, renderHeight);
      window.open(pdf.output('bloburl'), '_blank');
    } catch (error) {
      console.error("PDF Generation failed:", error);
    }
  };

  useEffect(() => {
    // Fetch driver info to populate header
    const fetchInfo = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_URL_API_DRIVER}drivers/code_company/${user?.code_customer}`);
        const result = await response.json();
        const driver = result.data.find((d: any) => d.employee_id === employeeId);
        setDriverInfo(driver);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchInfo();
  }, [employeeId, user]);

  // Mock days for the calculation table (matching the image structure)
  const days = Array.from({ length: 31 }, (_, i) => {
    const dayNum = i + 1;
    const isWeekend = [6, 7, 13, 14, 20, 21, 27, 28].includes(dayNum);
    return {
      no: `Day ${dayNum}`,
      date: `${dayNum.toString().padStart(2, '0')}-Mar-26`,
      day: isWeekend ? (dayNum % 7 === 0 ? 'Sunday' : 'Saturday') : 'Monday',
      in: isWeekend ? '' : '08:00',
      out: isWeekend ? '' : '17:00',
      totalWork: isWeekend ? '' : '9:00',
      break: isWeekend ? '' : '1:00',
      effective: isWeekend ? '' : '8:00',
      isWeekend
    };
  });

  if (loading) return <div className="p-10 text-center font-black text-gray-400 animate-pulse">GENERATING CALCULATION ENGINE...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-[1600px] mx-auto"
    >
      {/* Print Styles and Color Compatibility Fix */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print, screen {
          .print-container { 
            color: #111827 !important;
            background-color: #ffffff !important;
          }
          .header-blue { background-color: #1e3a5f !important; color: #ffffff !important; }
          .sub-header-blue { background-color: #2c4a73 !important; color: #ffffff !important; }
          .weekend-row { background-color: #fff1f2 !important; color: #e11d48 !important; }
          .footer-dark { background-color: #111827 !important; color: #ffffff !important; }
          .text-muted { color: #6b7280 !important; }
          .border-std { border-color: #e5e7eb !important; }
          .bg-std-light { background-color: #fcfcfa !important; }
        }
        @media print {
          @page { size: landscape; margin: 10mm; }
          .no-print { display: none !important; }
          .print-container { 
            border: none !important; 
            box-shadow: none !important; 
            margin: 0 !important; 
            padding: 0 !important;
            width: 100% !important;
          }
        }
      `}} />

      {/* Header Actions */}
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

      {/* Main Calculation Container */}
      <div ref={reportRef} className="bg-white border border-gray-200 rounded-[2rem] shadow-sm overflow-hidden overflow-x-auto print-container border-std">
        <div className="p-8 border-b border-gray-100 bg-std-light">
          <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase mb-6 flex items-center gap-3">
            <div className="h-6 w-1 bg-[#2563eb] rounded-full" />
            Detail of Timesheet Calculation
          </h2>
          
          {/* Metadata Table - Structured like the original example */}
          <table className="w-full max-w-2xl border-collapse border border-gray-200 text-[11px]">
            <tbody>
              <MetaRow label="Employee Name" value={driverInfo?.full_name || 'N/A'} />
              <MetaRow label="Position" value="Driver" />
              <MetaRow label="Employee Status" value="Job Holder" />
              <MetaRow label="Users Name" value={driverInfo?.user_name || 'N/A'} />
              <MetaRow label="Employer Name" value={driverInfo?.company_name || 'N/A'} />
              <MetaRow label="Date Period" value="1 Mar 2026 - 31 Mar 2026" />
            </tbody>
          </table>
        </div>

        {/* The Giant Calculation Table */}
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
                <td className="px-2 py-2 border-r border-gray-200 text-center">{!day.isWeekend ? '198,000' : ''}</td>
                <td className="px-2 py-2 border-r border-gray-200 text-center">{!day.isWeekend && idx % 3 === 0 ? '40,000' : ''}</td>
                <td className="px-2 py-2 border-r border-gray-200 text-center">{!day.isWeekend && idx % 5 === 0 ? '50,000' : ''}</td>
                <td className="px-2 py-2 border-r border-gray-200 text-center italic text-gray-300">-</td>
                <td className="px-2 py-2 border-r border-gray-200 text-center italic text-gray-300">-</td>
                <td className="px-2 py-2 border-r border-gray-200 text-center">{!day.isWeekend ? (3.5 + (idx % 10) / 10).toFixed(2) : ''}</td>
                <td className="px-2 py-2 italic text-gray-400 text-[8px]">-</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
             <tr className="footer-dark font-black uppercase text-[9px] text-center">
               <td colSpan={5} className="px-2 py-4">Summary Totals</td>
               <td className="px-2 py-4">12:00</td>
               <td className="px-2 py-4 italic text-white/50">-</td>
               <td className="px-2 py-4">3,330,000</td>
               <td className="px-2 py-4">320,000</td>
               <td className="px-2 py-4">300,000</td>
               <td className="px-2 py-4">-</td>
               <td className="px-2 py-4">-</td>
               <td className="px-2 py-4">3.70</td>
               <td className="px-2 py-4">Generated Report</td>
             </tr>
          </tfoot>
        </table>
        
        {/* Footer for Print Only */}
        <div className="hidden print:flex justify-end p-4">
          <p className="text-[8px] font-bold text-gray-400 italic">
            Generated: {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })} {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })}
          </p>
        </div>
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
