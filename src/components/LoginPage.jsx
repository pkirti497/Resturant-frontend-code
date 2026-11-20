import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  UtensilsCrossed, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Crown, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  Hotel,
  AlertCircle
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('administrator@greenvalley.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeRoleTab, setActiveRoleTab] = useState('Administrator'); // 'Administrator' or 'Admin'

  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSelectRole = (role) => {
    setActiveRoleTab(role);
    if (role === 'Administrator') {
      setEmail('administrator@greenvalley.com');
      setPassword('admin123');
    } else {
      setEmail('admin@greenvalley.com');
      setPassword('admin123');
    }
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setErrorMessage(result.message || 'Login failed. Please check credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
      {/* Background glowing gradients */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 sm:p-10 relative z-10 space-y-7 border border-slate-100">
        
        {/* BRAND LOGO & TITLE */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 mx-auto flex items-center justify-center text-white shadow-xl shadow-orange-500/30">
            <UtensilsCrossed className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">The Green Valley</h1>
            <p className="text-xs sm:text-sm text-slate-500 font-extrabold mt-1">Hotel & Restaurant Billing Portal</p>
          </div>
        </div>

        {/* 2 ROLES SWITCHER (Administrator & Admin) */}
        <div className="space-y-2">
          <label className="block text-center text-xs font-black text-slate-400 uppercase tracking-wider">
            Select Role to Quick-Fill
          </label>
          <div className="grid grid-cols-2 gap-2 bg-[#F4F7FE] p-1.5 rounded-2xl border border-slate-200/60">
            <button
              type="button"
              onClick={() => handleSelectRole('Administrator')}
              className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeRoleTab === 'Administrator'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Crown className={`w-4 h-4 ${activeRoleTab === 'Administrator' ? 'text-amber-300' : 'text-purple-600'}`} />
              <span>Administrator</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectRole('Admin')}
              className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeRoleTab === 'Admin'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <ShieldCheck className={`w-4 h-4 ${activeRoleTab === 'Admin' ? 'text-emerald-300' : 'text-blue-600'}`} />
              <span>Admin</span>
            </button>
          </div>

          <p className="text-[11px] text-center text-slate-500 font-bold">
            {activeRoleTab === 'Administrator' 
              ? '👑 Full Access: Dashboard, POS, Rooms, Bookings, Reports & Settings' 
              : '🛡️ Operations Access: Dashboard, POS, Rooms, Bookings & Billing'}
          </p>
        </div>

        {/* ERROR NOTIFICATION */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-xs font-bold animate-in fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-wide mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                required
                className="w-full pl-11 pr-4 py-3 bg-[#F4F7FE] border border-slate-200/60 rounded-2xl text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-wide mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full pl-11 pr-12 py-3 bg-[#F4F7FE] border border-slate-200/60 rounded-2xl text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-sm font-black shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Login as {activeRoleTab}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* DEMO INFO FOOTER */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-1">
          <p className="text-[11px] font-black text-slate-600">Preset Credentials:</p>
          <div className="flex flex-col gap-1 text-[11px] text-slate-500 font-bold">
            <div>👑 <strong className="text-slate-700">Administrator:</strong> administrator@greenvalley.com / admin123</div>
            <div>🛡️ <strong className="text-slate-700">Admin:</strong> admin@greenvalley.com / admin123</div>
          </div>
        </div>

      </div>
    </div>
  );
}
