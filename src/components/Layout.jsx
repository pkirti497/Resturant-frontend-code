import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  ClipboardList, 
  BedDouble, 
  CalendarDays, 
  Receipt, 
  BarChart3, 
  Settings as SettingsIcon, 
  Search, 
  Bell, 
  Calendar, 
  Clock, 
  Menu, 
  X,
  User,
  Camera,
  LogOut,
  Lock,
  Crown,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  ChevronRight,
  Star,
  Hotel
} from 'lucide-react';

export default function Layout() {
  const { user, logout, switchRole, updateUser, isAdministrator, isAdmin } = useAuth();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [toastMessage, setToastMessage] = useState(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/dashboard/admin-info`)
      .then(res => res.json())
      .then(data => {
        if (data?.notifications) {
          setNotifications(data.notifications);
        }
      })
      .catch(err => console.error("Error fetching notifications:", err));
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLogout = () => {
    setProfileDropdownOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

  const handleRoleSwitch = async (targetRole) => {
    const res = await switchRole(targetRole);
    if (res.success) {
      showToast(`Switched to ${targetRole} Role!`);
    } else {
      showToast(res.message || `Could not switch to ${targetRole}`);
    }
    setProfileDropdownOpen(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim() !== '') {
      showToast(`Searching for "${searchQuery}" in Rooms...`);
      navigate(`/rooms?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxMB = 2;
      const maxBytes = maxMB * 1024 * 1024;
      if (file.size > maxBytes) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        alert(`⚠️ Profile image is too large (${sizeMB} MB)! Maximum limit is ${maxMB} MB. Please upload a smaller image.`);
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const newAvatar = reader.result;
        updateUser({ avatar: newAvatar });
        showToast("Profile image updated successfully!");
        setProfileDropdownOpen(false);

        fetch(`${API_BASE_URL}/api/dashboard/update-admin-avatar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatar: newAvatar })
        }).catch(err => console.warn("Avatar sync error:", err));
      };
      reader.readAsDataURL(file);
    }
  };

  const formattedDate = currentDateTime.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  const formattedTime = currentDateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Navigation Items with concise, non-overflowing micro-badges and unique color identities
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
      restrictedTo: 'Administrator',
      badge: 'Admin',
      iconBg: 'bg-slate-200 text-slate-800 group-hover:bg-slate-800 group-hover:text-white',
      activeGradient: 'from-slate-800 via-slate-900 to-black shadow-slate-800/30',
      activeBadge: 'bg-amber-400/30 text-amber-200',
      badgeBg: 'bg-slate-100 text-slate-700 border border-slate-200'
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F7FE] font-sans text-slate-800 flex overflow-x-hidden selection:bg-blue-500 selection:text-white text-base relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl text-xs font-black animate-in fade-in slide-in-from-bottom-5 flex items-center gap-2.5 border border-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          {toastMessage}
        </div>
      )}

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm transition-opacity" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* ============================================================== */}
      {/* 🌟 VIBRANT, LUXURIOUS & COLORFUL SIDEBAR (NO TEXT OVERLAP) 🌟 */}
      {/* ============================================================== */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-84 min-w-[320px] bg-white border-r border-slate-200/90 flex flex-col justify-between transition-all duration-300 shadow-[4px_0_24px_rgba(0,0,0,0.03)] overflow-x-hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden">
          
          {/* 1. HOTEL BRANDING & LUXURY LOGO HEADER */}
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
                  <h1 className="font-black text-slate-900 text-xl leading-tight tracking-tight mt-0.5 truncate">
                    Green Valley
                  </h1>
                  <p className="text-xs text-slate-500 font-extrabold truncate">Hotel & Resorts POS</p>
                </div>
              </div>

              <button 
                onClick={() => setSidebarOpen(false)} 
                className="lg:hidden p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* 2. USER ROLE & PROFILE BADGE CARD IN SIDEBAR */}
            <div className="mt-4 p-3 rounded-2xl bg-gradient-to-r from-[#F4F7FE] to-blue-50/50 border border-slate-200/70 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative flex-shrink-0">
                  <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-300 border border-white shadow-xs">
                    <img 
                      src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"} 
                      alt="Avatar" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-slate-900 leading-tight truncate">
                    {user?.name || "Admin Manager"}
                  </h4>
                  <div className="flex items-center gap-1 mt-0.5">
                    {isAdministrator ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-purple-700 bg-purple-100/90 px-1.5 py-0.5 rounded-md">
                        <Crown className="w-3 h-3 text-purple-600" /> Administrator
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-blue-700 bg-blue-100/90 px-1.5 py-0.5 rounded-md">
                        <ShieldCheck className="w-3 h-3 text-blue-600" /> Admin
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1 flex-shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online
              </span>
            </div>
          </div>

          {/* 3. COLORFUL NAVIGATION ITEMS (NO HOVER TEXT OVERLAP) */}
          <div className="px-3.5 py-3.5 flex-1 overflow-x-hidden">
            <div className="px-3 pb-2 text-[11px] font-black uppercase tracking-wider text-slate-400">
              Operations Menu
            </div>
            
            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                const isRestrictedForUser = item.restrictedTo && item.restrictedTo !== user?.role;

                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`group w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-[16px] font-black transition-colors duration-150 relative ${
                      isActive 
                        ? `bg-gradient-to-r ${item.activeGradient} text-white shadow-lg border border-white/20` 
                        : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/90'
                    }`}
                  >
                    {/* Left Icon + Title Container */}
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

                      {/* Item Title: Guaranteed to truncate cleanly, never wrap or overlap */}
                      <span className="tracking-tight truncate block">{item.name}</span>
                    </div>

                    {/* Right Badge Container: flex-shrink-0 prevents squishing */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {isRestrictedForUser ? (
                        <span className="flex items-center gap-1 text-[10px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-lg border border-amber-200">
                          <Lock className="w-3 h-3" /> Admin
                        </span>
                      ) : (
                        <span 
                          className={`text-[10px] font-black px-2 py-0.5 rounded-lg transition-all ${
                            isActive 
                              ? item.activeBadge 
                              : item.badgeBg
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}

                      {/* Active Indicator Arrow */}
                      {isActive && (
                        <ChevronRight className="w-4 h-4 text-white/90 animate-pulse" />
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* 4. LUXURIOUS RESORT BANNER CARD (FOOTER) */}
          <div className="p-4 mx-3.5 mb-3.5 rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white shadow-xl relative overflow-hidden border border-slate-700/50 flex-shrink-0">
            <div className="rounded-2xl overflow-hidden mb-2.5 h-20 relative shadow-md border border-white/10 group">
              <img 
                src="https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=400&q=80" 
                alt="Green Valley Resort" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
              <span className="absolute bottom-2 left-2 text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 shadow-sm flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> 5-Star Experience
              </span>
            </div>

            <div className="text-center space-y-0.5">
              <h4 className="text-xs font-black text-white tracking-tight">Green Valley Grand Resort</h4>
              <p className="text-[10px] text-blue-300 font-bold">24×7 Smart Billing & Hospitality</p>
              
              {/* <div className="pt-1.5 flex items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1 text-[9px] font-black bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> Cloud Synced11
                </span>
                <span className="text-[10px] text-slate-400 font-bold">v2.5 Pro</span>
              </div> */}
            </div>
          </div>

        </div>
      </aside>

      {/* ============================================================== */}
      {/* 🌟 MAIN APPLICATION CONTENT CONTAINER 🌟 */}
      {/* ============================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP POLISHED HEADER NAVBAR */}
        <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200/80 h-20 px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="lg:hidden p-2.5 rounded-2xl text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <form onSubmit={handleSearchSubmit} className="relative max-w-lg w-full">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Search className="w-5 h-5" />
              </span>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rooms by no, guest name, phone, type..." 
                className="w-full pl-12 pr-12 py-3 bg-[#F4F7FE] border border-slate-200/80 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-bold shadow-xs transition-all"
              />
              <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[11px] font-black text-slate-400">
                ↵ Enter
              </span>
            </form>
          </div>

          <div className="flex items-center gap-5">
            {/* Live Clock & Calendar */}
            <div className="hidden md:flex items-center gap-3 text-xs text-slate-700 bg-[#F4F7FE] px-4 py-2.5 rounded-2xl font-black shadow-xs border border-slate-200/60">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>{formattedDate}</span>
              <div className="w-px h-3.5 bg-slate-300 mx-1"></div>
              <Clock className="w-4 h-4 text-blue-600" />
              <span>{formattedTime}</span>
            </div>

            {/* Notifications Bell */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setNotificationOpen(!notificationOpen)} 
                className="relative p-3 rounded-2xl bg-[#F4F7FE] text-slate-600 hover:bg-slate-200 cursor-pointer transition-colors shadow-xs"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse"></span>
              </button>

              {notificationOpen && (
                <div className="absolute right-0 mt-3 w-84 bg-white rounded-3xl shadow-2xl border border-slate-100 p-5 space-y-4 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
                      <Bell className="w-4 h-4 text-blue-600" /> System Notifications
                    </h4>
                    <span className="text-[10px] bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full font-black border border-blue-200">
                      Live
                    </span>
                  </div>
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div key={n.id} className="p-3 bg-[#F4F7FE] rounded-2xl text-xs space-y-1">
                          <p className="font-bold text-slate-800">{n.text}</p>
                          <span className="text-[10px] text-slate-400 font-extrabold">{n.time}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 font-bold text-center py-4">No notifications yet</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative pl-4 border-l border-slate-200" ref={profileRef}>
              <div 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-3.5 cursor-pointer select-none group"
              >
                <div className={`w-11 h-11 rounded-2xl overflow-hidden border-2 shadow-sm relative bg-slate-200 transition-transform group-hover:scale-105 ${
                  isAdministrator ? 'border-purple-500 shadow-purple-500/20' : 'border-blue-500 shadow-blue-500/20'
                }`}>
                  <img 
                    src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"} 
                    alt="User Avatar" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="hidden md:block text-left">
                  <h4 className="font-black text-sm text-slate-900 leading-tight">
                    {user?.name || (isAdministrator ? "Main Administrator" : "Operations Admin")}
                  </h4>
                  <div className="flex items-center gap-1 mt-0.5">
                    {isAdministrator ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md">
                        <Crown className="w-3 h-3 text-purple-600" /> Administrator
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md">
                        <ShieldCheck className="w-3 h-3 text-blue-600" /> Admin
                      </span>
                    )}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </div>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-3 w-76 bg-white rounded-3xl shadow-2xl border border-slate-100 p-4 space-y-3 z-50 animate-in fade-in zoom-in-95">
                  <div className="p-3 bg-[#F4F7FE] rounded-2xl">
                    <p className="text-xs font-black text-slate-900">{user?.name || "Logged In User"}</p>
                    <p className="text-[11px] font-extrabold text-slate-500 truncate">{user?.email}</p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Role:</span>
                      <span className={`text-[11px] font-black px-2 py-0.5 rounded-md ${
                        isAdministrator ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {user?.role || 'Administrator'}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-2xl text-center space-y-2">
                    <p className="text-[11px] font-black text-slate-600">Change Profile Avatar</p>
                    <label className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black cursor-pointer shadow-md transition-colors">
                      <Camera className="w-3.5 h-3.5" /> Upload Photo
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                  
                  <div className="pt-1 border-t border-slate-100">
                    <p className="px-3 py-1 text-[10px] font-black uppercase text-slate-400">Quick Role Switch</p>
                    {isAdministrator ? (
                      <button 
                        onClick={() => handleRoleSwitch('Admin')} 
                        className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-black text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-2.5 cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-blue-600" /> Switch to Admin Role
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleRoleSwitch('Administrator')} 
                        className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-black text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors flex items-center gap-2.5 cursor-pointer"
                      >
                        <Crown className="w-4 h-4 text-purple-600" /> Switch to Administrator Role
                      </button>
                    )}
                  </div>

                  <div className="pt-1 border-t border-slate-100">
                    <button 
                      onClick={handleLogout} 
                      className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-black text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2.5 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" /> Logout Session
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* PAGE CONTENT CONTAINER */}
        <main className="p-8 space-y-8 max-w-7xl mx-auto w-full flex-1">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
