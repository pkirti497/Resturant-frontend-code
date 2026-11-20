import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft, Crown } from 'lucide-react';

export default function ProtectedRoute({ allowedRoles, children }) {
  const { isAuthenticated, user, switchRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If specific roles are required and current user is not authorized
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return (
      <div className="min-h-[500px] flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-white rounded-3xl border border-rose-100 shadow-xl max-w-lg w-full p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl mx-auto flex items-center justify-center shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 bg-rose-100 text-rose-700 text-xs font-black rounded-full uppercase tracking-wider">
              Restricted Area
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-2">Administrator Access Required</h2>
            <p className="text-sm text-slate-500 font-bold leading-relaxed">
              You are currently logged in as <span className="text-blue-600 font-black">"{user?.role}"</span> ({user?.email}). This section contains critical system settings reserved exclusively for the <span className="text-purple-600 font-black">Administrator</span> role.
            </p>
          </div>

          <div className="bg-[#F4F7FE] p-4 rounded-2xl text-xs font-bold text-slate-600 border border-slate-200/60 text-left space-y-2">
            <p className="font-black text-slate-800">Your Current Permissions ({user?.role}):</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-500">
              <li>Restaurant POS & Orders &bull; <span className="text-emerald-600 font-bold">Allowed</span></li>
              <li>Rooms & Bookings &bull; <span className="text-emerald-600 font-bold">Allowed</span></li>
              <li>Billing & Invoices &bull; <span className="text-emerald-600 font-bold">Allowed</span></li>
              <li>System Configurations &bull; <span className="text-rose-500 font-bold">Administrator Only</span></li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Link 
              to="/" 
              className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
            <button 
              onClick={() => switchRole('Administrator')}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl text-sm font-black shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Crown className="w-4 h-4 text-amber-300" /> Switch to Administrator
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
