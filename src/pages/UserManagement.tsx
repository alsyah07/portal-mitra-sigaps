import React, { useState, useEffect } from 'react';
import { User, Role } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Check, 
  AlertCircle,
  MoreVertical,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function UserManagement() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentUser, setCurrentUser] = useState<Partial<User & { password?: string }>>({});

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_URL_API}users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.status === 'success') {
        setUsers(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to fetch users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = (mode: 'add' | 'edit', user?: User) => {
    setModalMode(mode);
    if (mode === 'edit' && user) {
      setCurrentUser(user);
    } else {
      setCurrentUser({
        nama_customer: '',
        code_customer: '',
        email: '',
        password: '',
        status: 1,
        role: [{ role: 'customer' } as any]
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentUser({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = modalMode === 'add' 
        ? `${import.meta.env.VITE_URL_API}users` 
        : `${import.meta.env.VITE_URL_API}users/${currentUser.id_users}`;
      
      const method = modalMode === 'add' ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(currentUser)
      });

      const result = await response.json();
      if (result.status === 'success') {
        fetchUsers();
        handleCloseModal();
      } else {
        alert(result.message);
      }
    } catch (err) {
      console.error('Operation failed:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_API}users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      if (result.status === 'success') {
        fetchUsers();
      } else {
        alert(result.message);
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const filteredUsers = users.filter(user => 
    user.nama_customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.code_customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">User Management</h3>
          <p className="text-sm font-medium text-gray-500">Manage portal users and their access roles.</p>
        </div>
        <button 
          onClick={() => handleOpenModal('add')}
          className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#16304f] text-white px-5 py-3 rounded-2xl text-sm font-bold shadow-lg transition-all active:scale-95"
        >
          <UserPlus size={18} />
          Add New User
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-[2rem] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search users by name, email, or code..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Email</th>
                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Roles</th>
                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium">Loading users...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium">No users found.</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id_users} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center text-[#1e3a5f] font-black text-sm">
                          {user.nama_customer.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{user.nama_customer}</p>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{user.code_customer}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 font-medium">{user.email}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {user.role && user.role.length > 0 ? (
                          user.role.map(r => (
                            <span key={r.id_role} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-lg uppercase tracking-wider border border-blue-100">
                              {r.role}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider italic">No Role</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${
                        user.status === 1 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {user.status === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal('edit', user)}
                          className="p-2 text-gray-400 hover:text-[#1e3a5f] hover:bg-[#1e3a5f]/5 rounded-xl transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id_users)}
                          className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add/Edit */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-black text-gray-900 tracking-tight">
                    {modalMode === 'add' ? 'Add New User' : 'Edit User'}
                  </h4>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                    {modalMode === 'add' ? 'Create portal credentials' : 'Update account details'}
                  </p>
                </div>
                <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 rounded-2xl transition-colors">
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Customer Name</label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all font-bold"
                      value={currentUser.nama_customer || ''}
                      onChange={(e) => setCurrentUser({...currentUser, nama_customer: e.target.value})}
                      placeholder="e.g. Permata Solusindo"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Customer Code</label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all font-bold"
                      value={currentUser.code_customer || ''}
                      onChange={(e) => setCurrentUser({...currentUser, code_customer: e.target.value})}
                      placeholder="e.g. SGP01"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                  <input 
                    required
                    type="email" 
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all font-bold"
                    value={currentUser.email || ''}
                    onChange={(e) => setCurrentUser({...currentUser, email: e.target.value})}
                    placeholder="name@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    {modalMode === 'add' ? 'Password' : 'New Password (Optional)'}
                  </label>
                  <input 
                    required={modalMode === 'add'}
                    type="password" 
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all font-bold"
                    value={currentUser.password || ''}
                    onChange={(e) => setCurrentUser({...currentUser, password: e.target.value})}
                    placeholder="••••••••"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Status</label>
                    <select 
                      className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all font-bold appearance-none"
                      value={currentUser.status || 1}
                      onChange={(e) => setCurrentUser({...currentUser, status: parseInt(e.target.value)})}
                    >
                      <option value={1}>Active</option>
                      <option value={0}>Inactive</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Role</label>
                    <select 
                      className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all font-bold appearance-none"
                      value={currentUser.role?.[0]?.role || 'customer'}
                      onChange={(e) => setCurrentUser({
                        ...currentUser, 
                        role: [{ role: e.target.value } as any]
                      })}
                    >
                      <option value="customer">Customer</option>
                      <option value="superadmin">Superadmin</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 py-4 rounded-2xl text-sm font-black text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] py-4 rounded-2xl text-sm font-black text-white bg-[#1e3a5f] hover:bg-[#16304f] shadow-lg shadow-[#1e3a5f]/20 transition-all active:scale-95"
                  >
                    {modalMode === 'add' ? 'Create User Account' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
