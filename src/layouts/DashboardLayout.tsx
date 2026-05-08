import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  UserSquare2, 
  Users, 
  Menu, 
  LogOut,
  Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const location = useLocation();

  if (!user) return null;

  const getPageTitle = () => {
    if (location.pathname.includes('approve')) return 'Timesheet Approval';
    if (location.pathname.includes('driver')) return 'Driver Database';
    return 'Operational Insights';
  };

  return (
    <div className="flex flex-col h-screen bg-[#f8f9fa] font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900">
      {/* ── TOP NAVBAR ── */}
      <header className="flex items-stretch h-[64px] shrink-0 z-50 relative">
        <div className={`flex items-center justify-center bg-white border-b border-r border-gray-200 shrink-0 overflow-hidden transition-all duration-300 ${
          sidebarCollapsed ? 'w-[72px]' : 'w-[220px]'
        }`}>
          <div className={`transition-all duration-300 ${
            sidebarCollapsed ? 'w-10 h-10' : 'w-32 h-12'
          }`}>
            <img src="/logo_sigaps.png" alt="Logo" className="h-full w-full object-contain" />
          </div>
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setSidebarCollapsed(c => !c)}
          className="h-full aspect-square flex items-center justify-center bg-[#1e3a5f] hover:bg-[#16304f] text-white transition-colors shrink-0 border-b border-[#16304f] active:brightness-90"
          title={sidebarCollapsed ? 'Expand menu' : 'Collapse menu'}
        >
          <Menu size={22} strokeWidth={2.5} />
        </button>

        {/* Header bar */}
        <div className="flex-1 flex items-center justify-between px-6 bg-[#1e3a5f] border-b border-[#16304f]">
          <div className="flex flex-col">
            <h1 className="text-[15px] font-black text-white tracking-tight">
              {getPageTitle()}
            </h1>
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-white/40 uppercase tracking-widest mt-0.5">
              <Calendar size={10} />
              <span>{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 border border-white/10">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold text-white/80">Live Services</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-[#4d57ef] flex items-center justify-center text-white font-black text-sm shadow">
                {user.nama_customer.charAt(0)}
              </div>
              <div className="hidden md:flex flex-col">
                <span className="text-[11px] font-black text-white leading-tight truncate max-w-[120px]">{user.nama_customer}</span>
                <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">CUST-{user.code_customer}</span>
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="h-8 w-8 flex items-center justify-center rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/40 hover:text-white transition-all active:scale-90"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="flex flex-1 min-h-0">
        <aside className={`shrink-0 bg-white border-r border-gray-100 flex flex-col transition-all duration-300 ease-in-out overflow-hidden ${
          sidebarCollapsed ? 'w-[72px]' : 'w-[220px]'
        }`}>
          <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto overflow-x-hidden">
            {!sidebarCollapsed && (
              <p className="px-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Navigation</p>
            )}
            {(() => {
              const isSuperAdmin = user.role?.some(r => r.role === 'superadmin');
              return ([
                { path: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
                { path: '/dashboard/approve',   icon: Users,          label: 'Approval Center' },
                { path: '/dashboard/driver',    icon: UserSquare2,    label: 'Driver Database' },
                { path: '/dashboard/timesheets', icon: Calendar,      label: 'Timesheets' },
                { path: '/dashboard/users',     icon: Users,          label: 'User Management', role: 'superadmin' },
              ] as const).filter(item => {
                if (isSuperAdmin) {
                  return item.role === 'superadmin';
                }
                return item.role !== 'superadmin';
              });
            })().map(({ path, icon: Icon, label }) => (
              <NavLink
                key={path}
                to={path}
                end={path === '/dashboard'}
                className={({ isActive }) => `relative group/nav flex w-full items-center gap-3 py-3 rounded-2xl transition-all duration-200 ${
                  sidebarCollapsed ? 'justify-center px-0' : 'px-4'
                } ${
                  isActive
                    ? 'bg-[#1e3a5f] text-white shadow-md'
                    : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {({ isActive }) => (
                  <>
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    <AnimatePresence>
                      {!sidebarCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.18 }}
                          className="text-sm font-bold tracking-tight overflow-hidden whitespace-nowrap"
                        >
                          {label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {sidebarCollapsed && (
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-xl whitespace-nowrap opacity-0 group-hover/nav:opacity-100 pointer-events-none transition-all duration-150 shadow-xl z-[999]">
                        {label}
                        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
          
          <div className={`border-t border-gray-100 py-4 space-y-2 ${
            sidebarCollapsed ? 'px-3' : 'px-4'
          }`}>
            <div className={`flex items-center gap-3 overflow-hidden ${
              sidebarCollapsed ? 'justify-center' : 'p-3 bg-gray-50 rounded-2xl'
            }`}>
              <div className="h-9 w-9 shrink-0 flex items-center justify-center rounded-xl bg-[#4d57ef] text-white font-black text-sm shadow">
                {user.nama_customer.charAt(0)}
              </div>
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.18 }}
                    className="min-w-0"
                  >
                    <p className="text-[12px] font-black text-gray-900 truncate tracking-tight uppercase">{user.nama_customer}</p>
                    <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest">CUST-{user.code_customer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button
              onClick={logout}
              title="Disconnect"
              className={`flex w-full items-center justify-center gap-2 rounded-xl text-sm font-black text-rose-500 bg-rose-50 hover:bg-rose-100 transition-all active:scale-95 ${
                sidebarCollapsed ? 'h-10 w-10 mx-auto' : 'px-4 py-2.5'
              }`}
            >
              <LogOut size={16} />
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.18 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    Disconnect
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </aside>

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto bg-[#f8f9fa] scroll-smooth p-4 lg:p-6 relative">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
