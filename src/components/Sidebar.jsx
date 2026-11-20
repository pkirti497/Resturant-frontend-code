import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  ClipboardList, 
  BedDouble, 
  CalendarDays, 
  Receipt, 
  BarChart3, 
  Settings as SettingsIcon, 
  X,
  Hotel,
  Star,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();

  const navItems = [
    { 
      name: 'Dashboard', 
      path: '/', 
      icon: LayoutDashboard,
      badge: 'Live',
      iconBg: 'bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
      activeGradient: 'from-blue-600 via-indigo-600 to-blue-700 shadow-blue-500/30',
      activeBadge: 'bg-white/20 text-white',
      badgeBg: 'bg-blue-50 text-blue-700 border border-blue-200'
    },
    { 
      name: 'Restaurant POS', 
      path: '/RestaurantPOS', 
      icon: UtensilsCrossed,
      badge: 'POS 🔥',
      iconBg: 'bg-amber-100 text-amber-600 group-hover:bg-orange-500 group-hover:text-white',
      activeGradient: 'from-amber-500 via-orange-500 to-rose-500 shadow-orange-500/30',
      activeBadge: 'bg-white/20 text-white',
      badgeBg: 'bg-orange-50 text-orange-700 border border-orange-200'
    },
    { 
      name: 'Orders', 
      path: '/orders', 
      icon: ClipboardList,
      badge: 'Orders',
      iconBg: 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white',
      activeGradient: 'from-emerald-500 via-teal-600 to-emerald-700 shadow-emerald-500/30',
      activeBadge: 'bg-white/20 text-white',
      badgeBg: 'bg-emerald-50 text-emerald-700 border border-emerald-200'
    },
    { 
      name: 'Rooms', 
      path: '/rooms', 
      icon: BedDouble,
      badge: 'Rooms',
      iconBg: 'bg-cyan-100 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white',
      activeGradient: 'from-cyan-600 via-sky-600 to-blue-700 shadow-cyan-500/30',
      activeBadge: 'bg-white/20 text-white',
      badgeBg: 'bg-cyan-50 text-cyan-700 border border-cyan-200'
    },
    { 
      name: 'Bookings', 
      path: '/bookings', 
      icon: CalendarDays,
      badge: 'Book',
      iconBg: 'bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white',
      activeGradient: 'from-purple-600 via-violet-600 to-indigo-700 shadow-purple-500/30',
      activeBadge: 'bg-white/20 text-white',
      badgeBg: 'bg-purple-50 text-purple-700 border border-purple-200'
    },
    { 
      name: 'Billing', 
      path: '/billing', 
      icon: Receipt,
      badge: 'Bills',
      iconBg: 'bg-rose-100 text-rose-600 group-hover:bg-rose-600 group-hover:text-white',
      activeGradient: 'from-rose-500 via-pink-600 to-rose-700 shadow-rose-500/30',
      activeBadge: 'bg-white/20 text-white',
      badgeBg: 'bg-rose-50 text-rose-700 border border-rose-200'
    },
    { 
      name: 'Reports', 
      path: '/reports', 
      icon: BarChart3,
      badge: 'Stats',
      iconBg: 'bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white',
      activeGradient: 'from-indigo-600 via-purple-600 to-indigo-800 shadow-indigo-500/30',
      activeBadge: 'bg-white/20 text-white',
      badgeBg: 'bg-indigo-50 text-indigo-700 border border-indigo-200'
    },
    { 
      name: 'Settings', 
      path: '/settings', 
      icon: SettingsIcon, 
      badge: 'Admin',
      iconBg: 'bg-slate-200 text-slate-800 group-hover:bg-slate-800 group-hover:text-white',
      activeGradient: 'from-slate-800 via-slate-900 to-black shadow-slate-800/30',
      activeBadge: 'bg-amber-400/30 text-amber-200',
      badgeBg: 'bg-slate-100 text-slate-700 border border-slate-200'
    },
  ];

  return (
    <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-84 min-w-[320px] bg-white border-r border-slate-200/90 flex flex-col justify-between transition-all duration-300 shadow-[4px_0_24px_rgba(0,0,0,0.03)] overflow-x-hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
      <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden">
        
        {/* BRANDING */}
        <div className="p-6 border-b border-slate-100/90 bg-gradient-to-b from-slate-50/80 to-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 flex items-center justify-center text-white shadow-xl shadow-orange-500/25 border border-white/40 flex-shrink-0">
                <Hotel className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1 text-[10px] font-black tracking-widest uppercase text-amber-600">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  <span>5-Star Luxury</span>
                </div>
                <h1 className="font-black text-slate-900 text-xl leading-tight tracking-tight mt-0.5 truncate">Green Valley</h1>
                <p className="text-xs text-slate-500 font-extrabold truncate">Hotel & Resorts POS</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* NAVIGATION LINKS (NO OVERLAP) */}
        <div className="px-3.5 py-3.5 flex-1 overflow-x-hidden">
          <div className="px-3 pb-2 text-[11px] font-black uppercase tracking-wider text-slate-400">
            Operations Menu
          </div>
          
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen && setSidebarOpen(false)}
                  className={`group w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-[16px] font-black transition-colors duration-150 relative ${
                    isActive 
                      ? `bg-gradient-to-r ${item.activeGradient} text-white shadow-lg border border-white/20` 
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/90'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                    <div 
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-200 flex-shrink-0 ${
                        isActive 
                          ? 'bg-white/20 text-white backdrop-blur-md' 
                          : `${item.iconBg} group-hover:scale-105`
                      }`}
                    >
                      <Icon className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <span className="tracking-tight truncate block">{item.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span 
                      className={`text-[10px] font-black px-2 py-0.5 rounded-lg transition-all ${
                        isActive ? item.activeBadge : item.badgeBg
                      }`}
                    >
                      {item.badge}
                    </span>
                    {isActive && (
                      <ChevronRight className="w-4 h-4 text-white/90 animate-pulse" />
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* FOOTER RESORT CARD */}
        <div className="p-4 mx-3.5 mb-3.5 rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white shadow-xl relative overflow-hidden border border-slate-700/50 flex-shrink-0">
          <div className="rounded-2xl overflow-hidden mb-2.5 h-20 relative shadow-md border border-white/10 group">
            <img 
              src="https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=400&q=80" 
              alt="Resort" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
            <span className="absolute bottom-2 left-2 text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 shadow-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> 5-Star Luxury
            </span>
          </div>
          <div className="text-center space-y-0.5">
            <h4 className="text-xs font-black text-white tracking-tight">Green Valley Grand Resort</h4>
            <p className="text-[10px] text-blue-300 font-bold">24×7 Smart Billing System</p>
          </div>
        </div>

      </div>
    </aside>
  );
}
