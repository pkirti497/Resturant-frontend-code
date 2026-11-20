import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  Building, 
  ShieldCheck, 
  Printer, 
  Crown, 
  Users, 
  UserPlus, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  Mail, 
  KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

export default function SettingsPage() {
  const { user } = useAuth();
  const [hotelName, setHotelName] = useState('Green Valley Hotel & Resorts');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [gstin, setGstin] = useState('09AABCG1234F1Z5');
  const [gstRate, setGstRate] = useState('5');
  const [printerIp, setPrinterIp] = useState('192.168.1.150');
  const [autoPrint, setAutoPrint] = useState(true);

  // Users state
  const [userList, setUserList] = useState([]);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'Admin', phone: '' });
  const [userFormStatus, setUserFormStatus] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const fetchUsers = () => {
    setLoadingUsers(true);
    fetch(`${API_BASE_URL}/api/auth/users`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.users) {
          setUserList(data.users);
        }
      })
      .catch(err => console.error("Error loading users:", err))
      .finally(() => setLoadingUsers(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSave = (section) => {
    alert(`${section} settings saved successfully!`);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) {
      alert("Please fill all required fields!");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUserFormStatus({ type: 'success', message: 'New user added successfully!' });
        setNewUser({ name: '', email: '', password: '', role: 'Admin', phone: '' });
        fetchUsers();
      } else {
        setUserFormStatus({ type: 'error', message: data.message || 'Failed to create user.' });
      }
    } catch (err) {
      setUserFormStatus({ type: 'error', message: 'Could not connect to user creation API.' });
    }

    setTimeout(() => setUserFormStatus(null), 4000);
  };

  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto text-base pb-12">
      
      {/* HEADER BANNER */}
      <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <SettingsIcon className="w-7 h-7 text-blue-600" /> System & Role Access Settings
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-100 text-purple-700 flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 text-purple-600" /> Administrator Only Area
            </span>
          </div>
          <p className="text-sm text-slate-600 font-bold mt-1">
            Configure hotel details, GST rates, printer preferences, and manage Administrator & Admin user roles.
          </p>
        </div>
      </div>

      {/* ROLE PERMISSION MATRIX & USER MANAGEMENT */}
      <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg">Role Permissions & Access Control</h3>
              <p className="text-xs text-slate-500 font-bold">Current security access matrix across hotel & restaurant modules</p>
            </div>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-black text-slate-400 uppercase tracking-wider">
                <th className="pb-3 px-4">System Module</th>
                <th className="pb-3 px-4 text-purple-600 flex items-center gap-1.5">
                  <Crown className="w-4 h-4" /> Administrator Role
                </th>
                <th className="pb-3 px-4 text-blue-600">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> Admin Role
                  </span>
                </th>
                <th className="pb-3 px-4">Access Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
              <tr>
                <td className="py-3 px-4 font-black text-slate-900">Dashboard & Live Stats</td>
                <td className="py-3 px-4 text-emerald-600 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Full View & Analytics</td>
                <td className="py-3 px-4 text-emerald-600"><span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Operations View</span></td>
                <td className="py-3 px-4 text-xs font-black text-slate-500">Shared Access</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-black text-slate-900">Restaurant POS & Billing</td>
                <td className="py-3 px-4 text-emerald-600 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Full Control + Price Edit</td>
                <td className="py-3 px-4 text-emerald-600"><span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Create & Print Orders</span></td>
                <td className="py-3 px-4 text-xs font-black text-slate-500">Shared Access</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-black text-slate-900">Rooms & Bookings</td>
                <td className="py-3 px-4 text-emerald-600 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Add / Edit / Delete Rooms</td>
                <td className="py-3 px-4 text-emerald-600"><span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Check-in & Status Updates</span></td>
                <td className="py-3 px-4 text-xs font-black text-slate-500">Shared Access</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-black text-slate-900">Reports & Financial Analytics</td>
                <td className="py-3 px-4 text-emerald-600 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Revenue & Profit Insights</td>
                <td className="py-3 px-4 text-emerald-600"><span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Daily Sales & Item Counts</span></td>
                <td className="py-3 px-4 text-xs font-black text-slate-500">Shared Access</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-black text-slate-900">System & Role Settings</td>
                <td className="py-3 px-4 text-emerald-600 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Complete Authority</td>
                <td className="py-3 px-4 text-rose-500"><span className="flex items-center gap-1.5"><Lock className="w-4 h-4" /> Restricted (Admin Only)</span></td>
                <td className="py-3 px-4 text-xs font-black text-purple-600">Administrator Exclusive</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* REGISTERED USERS LIST */}
        <div className="pt-6 border-t border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" /> Active System Accounts ({userList.length})
            </h4>
            <button 
              onClick={fetchUsers}
              className="text-xs font-black text-blue-600 hover:underline"
            >
              Refresh Accounts
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userList.map((u, i) => (
              <div key={i} className="p-4 rounded-2xl bg-[#F4F7FE] border border-slate-200/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full overflow-hidden border-2 flex-shrink-0 ${
                    u.role === 'Administrator' ? 'border-purple-500' : 'border-blue-500'
                  }`}>
                    <img src={u.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"} alt={u.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h5 className="font-black text-slate-900 text-sm leading-tight">{u.name}</h5>
                    <p className="text-xs text-slate-500 font-extrabold truncate max-w-[150px]">{u.email}</p>
                  </div>
                </div>

                <span className={`text-[11px] font-black px-2.5 py-1 rounded-full ${
                  u.role === 'Administrator' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ADD NEW USER FORM */}
        <div className="pt-6 border-t border-slate-100 space-y-4">
          <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-emerald-600" /> Create New Staff / Admin User
          </h4>

          {userFormStatus && (
            <div className={`p-3 rounded-2xl text-xs font-black ${
              userFormStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}>
              {userFormStatus.message}
            </div>
          )}

          <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <input 
              type="text" 
              placeholder="Full Name" 
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              required
              className="px-4 py-2.5 bg-[#F4F7FE] border border-slate-200/60 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
            />
            <input 
              type="email" 
              placeholder="Email address" 
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              required
              className="px-4 py-2.5 bg-[#F4F7FE] border border-slate-200/60 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              required
              className="px-4 py-2.5 bg-[#F4F7FE] border border-slate-200/60 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
            />
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="px-4 py-2.5 bg-[#F4F7FE] border border-slate-200/60 rounded-xl text-xs font-black text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="Admin">Admin (Operations)</option>
              <option value="Administrator">Administrator (Full Access)</option>
            </select>
            <button 
              type="submit" 
              className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-500/25 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" /> Add User
            </button>
          </form>
        </div>
      </div>

      {/* PROPERTY AND POS SETTINGS FORMS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* PROPERTY INFORMATION FORM */}
        <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600">
                <Building className="w-5 h-5" />
              </div>
              <h3 className="font-black text-slate-900 text-lg">Property & Business Information</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wide mb-1.5">Hotel / Resort Name</label>
                <input 
                  type="text" 
                  value={hotelName}
                  onChange={(e) => setHotelName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F4F7FE] border border-slate-200/60 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wide mb-1.5">Contact Helpline Phone</label>
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F4F7FE] border border-slate-200/60 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wide mb-1.5">GSTIN Registration Number</label>
                <input 
                  type="text" 
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F4F7FE] border border-slate-200/60 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <button 
            onClick={() => handleSave('Property')}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-black shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all mt-6 cursor-pointer"
          >
            <Save className="w-4 h-4" /> Save Property Changes
          </button>
        </div>

        {/* POS & PRINTER PREFERENCES */}
        <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600">
                <Printer className="w-5 h-5" />
              </div>
              <h3 className="font-black text-slate-900 text-lg">POS & Receipt Preferences</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wide mb-1.5">Default GST Tax Rate (%)</label>
                <input 
                  type="number" 
                  value={gstRate}
                  onChange={(e) => setGstRate(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F4F7FE] border border-slate-200/60 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wide mb-1.5">Kitchen KOT Printer IP Address</label>
                <input 
                  type="text" 
                  value={printerIp}
                  onChange={(e) => setPrinterIp(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F4F7FE] border border-slate-200/60 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none"
                />
              </div>

              <div className="p-4 rounded-2xl bg-[#F4F7FE] flex items-center justify-between">
                <div>
                  <h4 className="font-black text-xs text-slate-900">Auto-Print KOT Slip</h4>
                  <p className="text-xs text-slate-500 font-bold mt-0.5">Send order slip directly to kitchen printer</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={autoPrint}
                  onChange={(e) => setAutoPrint(e.target.checked)}
                  className="w-5 h-5 accent-blue-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <button 
            onClick={() => handleSave('POS Preferences')}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-black shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all mt-6 cursor-pointer"
          >
            <Save className="w-4 h-4" /> Update POS Preferences
          </button>
        </div>

      </div>

    </div>
  );
}
