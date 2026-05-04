import React, { useState, useEffect } from 'react';
import { Driver } from '../types';
import { motion } from 'motion/react';
import { 
  Users, 
  Search,
  Filter,
  Eye,
  Pencil,
  Clock,
  UserSquare2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function DriverDatabase() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [driverPage, setDriverPage] = useState(1);
  const [driverItemsPerPage] = useState(5);

  const fetchDrivers = async () => {
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
    fetchDrivers();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-8 max-w-full mx-auto"
    >
      <div className="space-y-1">
        <h3 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
          <div className="h-8 w-1.5 bg-blue-600 rounded-full" />
          Driver Database
        </h3>
        <p className="text-sm font-medium text-gray-500">Manage and monitor all registered active drivers.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-[32px] overflow-hidden shadow-sm ring-1 ring-black/[0.02]">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-[#fcfcfa]/50">
          <div className="relative group w-full max-w-sm">
            <input
              type="text"
              placeholder="Search by name, ID or phone..."
              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-sm bg-white hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium"
            />
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <div className="flex items-center gap-3">
            <button className="bg-white border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm">
              <Filter size={14} />
              Filter
            </button>
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
              {drivers.slice((driverPage - 1) * driverItemsPerPage, driverPage * driverItemsPerPage).map((driver, index) => (
                <motion.tr 
                  key={driver.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-blue-50/30 group transition-all duration-300"
                >
                  <td className="px-8 py-6 text-sm font-medium text-gray-400">{(driverPage - 1) * driverItemsPerPage + index + 1}</td>
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
                    <div className="flex justify-end gap-2">
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

        {/* Standardized Driver Pagination Footer */}
        <div className="px-8 py-5 border-t border-gray-100 flex items-center justify-between bg-white text-sm">
          <button 
            onClick={() => setDriverPage(p => Math.max(1, p - 1))}
            disabled={driverPage === 1}
            className="px-4 py-2 border border-gray-100 rounded-xl font-bold font-sans text-[13px] text-gray-500 hover:bg-gray-50 disabled:opacity-30 flex items-center gap-2 transition-all shadow-sm uppercase tracking-widest"
          >
            <ChevronLeft size={16} /> Prev
          </button>
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.ceil(drivers.length / driverItemsPerPage) }).map((_, i) => (
              <button
                key={i}
                onClick={() => setDriverPage(i + 1)}
                className={`h-9 w-9 rounded-xl text-xs font-black transition-all ${driverPage === i + 1 ? 'bg-[#1a1f2e] text-white shadow-xl shadow-gray-200 scale-105' : 'text-gray-400 hover:bg-gray-50'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setDriverPage(p => Math.min(Math.ceil(drivers.length / driverItemsPerPage) || 1, p + 1))}
            disabled={driverPage === Math.ceil(drivers.length / driverItemsPerPage)}
            className="px-4 py-2 border border-gray-100 rounded-xl font-bold font-sans text-[13px] text-gray-500 hover:bg-gray-50 disabled:opacity-30 flex items-center gap-2 transition-all shadow-sm uppercase tracking-widest"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
