import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  UtensilsCrossed, 
  BedDouble, 
  ClipboardList, 
  Receipt, 
  BarChart3, 
  TrendingUp, 
  Users, 
  Sparkles, 
  DollarSign, 
  FileText, 
  Bed, 
  CheckCircle2, 
  ChevronDown, 
  Clock, 
  Crown, 
  ShieldCheck, 
  RefreshCw, 
  ArrowUpRight, 
  ChevronRight, 
  Flame, 
  Star 
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';

export default function Dashboard() {
  const { user, isAdministrator } = useAuth();
  
  // Dynamic stats state initialized with fallback
  const [stats, setStats] = useState({
    todaysSales: 0,
    restaurantSales: 0,
    hotelRevenue: 0,
    occupiedRooms: '0 / 0',
    pendingCheckouts: 0,
    todaysOrders: 0,
    tablesOccupied: '0 / 0',
    averageBill: 0,
    topDish: { name: 'No dish ordered yet', orders: 0, img: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=150&q=80' },
    roomsList: [],
    graphData: []
  });

  const [selectedPeriod, setSelectedPeriod] = useState(7); // 7, 14, 30, 90, or 'custom'
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);
  const [dashStartDate, setDashStartDate] = useState('');
  const [dashEndDate, setDashEndDate] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch dynamic stats from backend
  const fetchDashboardStats = (periodVal = selectedPeriod, sDate = dashStartDate, eDate = dashEndDate) => {
    setIsRefreshing(true);
    let url = `${API_BASE_URL}/api/dashboard/stats`;
    if (periodVal === 'custom' && sDate && eDate) {
      url += `?startDate=${sDate}&endDate=${eDate}`;
    } else {
      url += `?period=${periodVal === 'custom' ? 7 : periodVal}`;
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data && typeof data === 'object') {
          setStats(data);
        }
      })
      .catch(err => console.error("Error fetching dynamic stats:", err))
      .finally(() => setIsRefreshing(false));
  };

  useEffect(() => {
    fetchDashboardStats(selectedPeriod, dashStartDate, dashEndDate);
  }, [selectedPeriod, dashStartDate, dashEndDate]);

  // Calculate highest revenue for proportional chart height
  const maxChartVal = Math.max(
    ...(stats.graphData || []).map(d => Math.max(d.sales || 0, d.hotel || 0, d.total || 0)),
    5000
  );

  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto pb-8">
      
      {/* 1. LUXURY WELCOME BANNER WITH USER ROLE & STATUS */}
      <div className="relative overflow-hidden bg-gradient-to-r from-white via-slate-50 to-blue-50/40 p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className={`px-3.5 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs ${
              isAdministrator 
                ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                : 'bg-blue-100 text-blue-800 border border-blue-200'
            }`}>
              {isAdministrator ? <Crown className="w-3.5 h-3.5 text-amber-500" /> : <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />}
              {isAdministrator ? 'Main Administrator' : 'Operations Admin'}
            </span>
            <span className="text-xs font-black text-amber-600 flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
              <Star className="w-3 h-3 fill-amber-500" /> 5-Star Grand Resort
            </span>
          </div>

          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            Welcome Back, {user?.name || (isAdministrator ? 'Administrator' : 'Admin')} <span className="inline-block animate-bounce">👋</span>
          </h2>
          <p className="text-sm text-slate-600 font-bold max-w-2xl">
            Logged in as <strong className="text-slate-900">{user?.email || 'admin@greenvalley.com'}</strong> &bull; Complete hotel accommodations, dining POS billing & financial analytics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => fetchDashboardStats(selectedPeriod)}
            className="px-5 py-3 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200/80 rounded-2xl text-xs font-black flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Analytics</span>
          </button>
        </div>
      </div>

      {/* 2. TOP 4 GRADIENT METRIC CARDS (100% REAL DATABASE METRICS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Today's Sales */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-md">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-white/20 text-white backdrop-blur-xs flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Live
            </span>
          </div>
          <div className="mt-5">
            <p className="text-xs font-black uppercase tracking-wider text-blue-100">Today's Total Sales</p>
            <h3 className="text-3xl font-black tracking-tight mt-1">₹ {Number(stats.todaysSales || 0).toLocaleString()}</h3>
            <p className="text-xs text-blue-100/90 font-bold mt-1.5 flex items-center gap-1">
              Restaurant POS + Room Bookings
            </p>
          </div>
        </div>

        {/* Hotel Room Revenue */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-md">
              <BedDouble className="w-5 h-5 text-white" />
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-white/20 text-white backdrop-blur-xs flex items-center gap-1">
              Rooms
            </span>
          </div>
          <div className="mt-5">
            <p className="text-xs font-black uppercase tracking-wider text-emerald-100">Hotel Room Revenue</p>
            <h3 className="text-3xl font-black tracking-tight mt-1">₹ {Number(stats.hotelRevenue || 0).toLocaleString()}</h3>
            <p className="text-xs text-emerald-100/90 font-bold mt-1.5 flex items-center gap-1">
              Guest Stays & Advance Bookings
            </p>
          </div>
        </div>

        {/* Occupied Rooms (RED) */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-rose-600 to-red-600 text-white shadow-xl shadow-rose-500/20 relative overflow-hidden flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-md">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-white/20 text-white backdrop-blur-xs flex items-center gap-1">
              Occupied
            </span>
          </div>
          <div className="mt-5">
            <p className="text-xs font-black uppercase tracking-wider text-rose-100">Occupied Rooms</p>
            <h3 className="text-3xl font-black tracking-tight mt-1">{stats.occupiedRoomsCount ?? stats.pendingCheckouts ?? 0} Rooms</h3>
            <p className="text-xs text-rose-100/90 font-bold mt-1.5 flex items-center gap-1">
              {stats.occupiedRooms || "0 / 0"} Booked
            </p>
          </div>
        </div>

        {/* Available Rooms (GREEN) */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-md">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-white/20 text-white backdrop-blur-xs flex items-center gap-1">
              Available
            </span>
          </div>
          <div className="mt-5">
            <p className="text-xs font-black uppercase tracking-wider text-emerald-100">Available Rooms</p>
            <h3 className="text-3xl font-black tracking-tight mt-1">{stats.availableRoomsCount ?? 0} Ready</h3>
            <p className="text-xs text-emerald-100/90 font-bold mt-1.5 flex items-center gap-1">
              Cleaning: {stats.cleaningRoomsCount ?? 0} &bull; Total: {stats.totalRooms ?? 0}
            </p>
          </div>
        </div>
      </div>

      {/* 3. MIDDLE SECTION: REVENUE ANALYTICS + ROOM STATUS + QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        
        {/* REVENUE OVERVIEW & ANALYTICS BAR CHART BOX */}
        <div className="lg:col-span-6 bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" /> Revenue Overview & Analytics
                </h3>
                <p className="text-xs text-slate-400 font-bold mt-0.5">Hotel Room Stays vs Restaurant POS Sales comparison</p>
              </div>

              {/* Interactive Period & Date Range Selector */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <button 
                    onClick={() => setPeriodDropdownOpen(!periodDropdownOpen)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#F4F7FE] hover:bg-slate-200/80 rounded-2xl text-xs font-black text-slate-700 transition-colors cursor-pointer border border-slate-200"
                  >
                    {selectedPeriod === 90 ? 'Last 3 Months (90 Days)' : selectedPeriod === 'custom' ? 'Custom Date Range' : `Last ${selectedPeriod} Days`} <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>

                  {periodDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 z-30 py-2 animate-in fade-in zoom-in-95">
                      {[
                        { days: 7, label: 'Last 7 Days' },
                        { days: 14, label: 'Last 14 Days' },
                        { days: 30, label: 'Last 30 Days (1 Month)' },
                        { days: 90, label: 'Last 3 Months (90 Days)' },
                        { days: 'custom', label: 'Custom Date Range' }
                      ].map(item => (
                        <button
                          key={item.days}
                          onClick={() => {
                            setSelectedPeriod(item.days);
                            setPeriodDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-xs font-black transition-colors ${
                            selectedPeriod === item.days ? 'bg-blue-50 text-blue-600 font-black' : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {selectedPeriod === 'custom' && (
                  <div className="flex items-center gap-2 bg-[#F4F7FE] p-1.5 rounded-2xl border border-slate-200">
                    <input 
                      type="date"
                      value={dashStartDate}
                      onChange={(e) => setDashStartDate(e.target.value)}
                      className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                      title="From Date"
                    />
                    <span className="text-xs text-slate-400 font-black">&rarr;</span>
                    <input 
                      type="date"
                      value={dashEndDate}
                      onChange={(e) => setDashEndDate(e.target.value)}
                      className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                      title="To Date"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Dynamic Legend with Real Totals */}
            <div className="flex flex-wrap items-center gap-5 text-xs font-black pt-3">
              <span className="flex items-center gap-2 bg-blue-50/80 px-3 py-1.5 rounded-xl border border-blue-100">
                <span className="w-3 h-3 rounded-full bg-blue-600"></span> 
                Restaurant: <strong className="text-slate-900">₹ {Number(stats.restaurantSales || 0).toLocaleString()}</strong>
              </span>
              <span className="flex items-center gap-2 bg-emerald-50/80 px-3 py-1.5 rounded-xl border border-emerald-100">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span> 
                Hotel Stays: <strong className="text-slate-900">₹ {Number(stats.hotelRevenue || 0).toLocaleString()}</strong>
              </span>
            </div>
          </div>

          {/* DYNAMIC BARS CONTAINER */}
          <div className="h-64 flex items-end justify-between gap-3 pt-6 px-3 bg-[#F4F7FE] rounded-2xl overflow-x-auto border border-slate-200/60">
            {stats.graphData && stats.graphData.length > 0 ? (
              stats.graphData.map((d, idx) => {
                const restPercent = Math.min(100, Math.round(((d.sales || 0) / maxChartVal) * 88) + 6);
                const hotelPercent = Math.min(100, Math.round(((d.hotel || 0) / maxChartVal) * 88) + 6);
                
                return (
                  <div key={idx} className="flex-1 min-w-[38px] flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="w-full flex items-end justify-center gap-1.5 h-44 relative">
                      {/* Restaurant Sales Bar */}
                      <div 
                        className="w-1/2 bg-gradient-to-t from-blue-600 to-indigo-500 hover:opacity-90 rounded-t-lg transition-all relative cursor-pointer shadow-xs" 
                        style={{ height: `${(d.sales || 0) > 0 ? restPercent : 6}%` }}
                        title={`${d.day} Restaurant Sales: ₹${d.sales || 0}`}
                      ></div>

                      {/* Hotel Revenue Bar */}
                      <div 
                        className="w-1/2 bg-gradient-to-t from-emerald-500 to-teal-400 hover:opacity-90 rounded-t-lg transition-all relative cursor-pointer shadow-xs" 
                        style={{ height: `${(d.hotel || 0) > 0 ? hotelPercent : 6}%` }}
                        title={`${d.day} Hotel Revenue: ₹${d.hotel || 0}`}
                      ></div>
                    </div>
                    <span className="text-[10px] font-black text-slate-500 whitespace-nowrap">{d.day}</span>
                  </div>
                );
              })
            ) : (
              <div className="w-full text-center py-12 text-xs font-bold text-slate-400">Loading graph analytics...</div>
            )}
          </div>
        </div>

        {/* LIVE ROOM STATUS LIST BOX */}
        <div className="lg:col-span-3 bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
              <Bed className="w-5 h-5 text-blue-600" /> Room Status
            </h3>
            <Link to="/rooms" className="text-xs font-black text-blue-600 hover:underline">View All</Link>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {stats.roomsList && stats.roomsList.length > 0 ? (
              stats.roomsList.map((room, idx) => (
                <div key={room._id || idx} className="flex items-center justify-between p-3 bg-[#F4F7FE] rounded-2xl hover:bg-slate-100 transition-colors border border-slate-200/50">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-200 flex-shrink-0">
                      <img 
                        src={room.img || "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=150&q=80"} 
                        alt="Room" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-black text-xs text-slate-900 truncate">Room {room.roomNumber}</h4>
                      <p className="text-[10px] text-slate-400 font-bold truncate">{room.roomType}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black flex-shrink-0 ${
                    room.status === 'Occupied' ? 'bg-rose-50 text-rose-600 border border-rose-200' :
                    room.status === 'Available' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                    'bg-amber-50 text-amber-600 border border-amber-200'
                  }`}>
                    {room.status || 'Available'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 font-bold text-center py-6">No rooms found</p>
            )}
          </div>

          <Link to="/rooms" className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-center rounded-2xl text-xs font-black transition-colors block border border-blue-200">
            + Manage All Rooms
          </Link>
        </div>

        {/* QUICK ACTIONS BUTTONS */}
        <div className="lg:col-span-3 bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" /> Quick Actions
            </h3>
            <span className="text-[10px] font-black text-slate-400 uppercase">Fast Access</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3.5">
            <Link 
              to="/RestaurantPOS" 
              className="p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex flex-col items-center justify-center text-center font-black text-xs gap-1.5 shadow-md shadow-blue-500/25 hover:opacity-95 hover:scale-[1.02] transition-all"
            >
              <FileText className="w-6 h-6" />
              <span>New Bill</span>
              <span className="text-[10px] font-bold text-blue-200">Restaurant POS</span>
            </Link>

            <Link 
              to="/bookings" 
              className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex flex-col items-center justify-center text-center font-black text-xs gap-1.5 shadow-md shadow-emerald-500/25 hover:opacity-95 hover:scale-[1.02] transition-all"
            >
              <BedDouble className="w-6 h-6" />
              <span>Add Booking</span>
              <span className="text-[10px] font-bold text-emerald-200">Reservations</span>
            </Link>

            <Link 
              to="/rooms" 
              className="p-4 rounded-2xl bg-gradient-to-br from-purple-600 to-violet-700 text-white flex flex-col items-center justify-center text-center font-black text-xs gap-1.5 shadow-md shadow-purple-500/25 hover:opacity-95 hover:scale-[1.02] transition-all"
            >
              <Users className="w-6 h-6" />
              <span>Check-in</span>
              <span className="text-[10px] font-bold text-purple-200">Room Counter</span>
            </Link>

            <Link 
              to="/billing" 
              className="p-4 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex flex-col items-center justify-center text-center font-black text-xs gap-1.5 shadow-md shadow-rose-500/25 hover:opacity-95 hover:scale-[1.02] transition-all"
            >
              <Receipt className="w-6 h-6" />
              <span>Invoice</span>
              <span className="text-[10px] font-bold text-rose-200">Tax Receipts</span>
            </Link>
          </div>

          <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-200/60 text-center">
            <span className="text-[11px] font-bold text-blue-900">1-Click Fast Navigation across hotel billing</span>
          </div>
        </div>

      </div>

      {/* 4. LOWER BOTTOM BANNER: RESTAURANT INSIGHTS */}
      <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-blue-600" /> Restaurant & Dining Insights
            </h3>
            <p className="text-xs text-slate-400 font-bold mt-0.5">Real-time table occupancy, live orders & top selling dish analytics</p>
          </div>
          <Link to="/RestaurantPOS" className="text-xs font-black text-blue-600 hover:underline flex items-center gap-1">
            Open Restaurant POS <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Orders */}
          <div className="p-5 rounded-2xl bg-[#F4F7FE] flex items-center justify-between shadow-xs border border-slate-200/60">
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-wide">Total Orders</p>
              <h4 className="text-2xl font-black text-slate-900 mt-1">{stats.todaysOrders || 0}</h4>
              <p className="text-xs text-emerald-600 font-bold mt-1">&uarr; Live count from DB</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-blue-50 text-blue-600">
              <ClipboardList className="w-6 h-6" />
            </div>
          </div>

          {/* Tables Occupied */}
          <div className="p-5 rounded-2xl bg-[#F4F7FE] flex items-center justify-between shadow-xs border border-slate-200/60">
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-wide">Tables Occupied</p>
              <h4 className="text-2xl font-black text-slate-900 mt-1">{stats.tablesOccupied || "0 / 0"}</h4>
              <div className="w-28 bg-slate-200 h-2 rounded-full mt-2.5 overflow-hidden">
                <div 
                  className="bg-orange-500 h-full rounded-full transition-all" 
                  style={{ 
                    width: stats.tablesOccupied && stats.tablesOccupied.includes('/') 
                      ? `${Math.min(100, (parseInt(stats.tablesOccupied.split('/')[0]) / Math.max(1, parseInt(stats.tablesOccupied.split('/')[1]))) * 100)}%` 
                      : '0%' 
                  }}
                ></div>
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-orange-50 text-orange-600">
              <Users className="w-6 h-6" />
            </div>
          </div>

          {/* Average Bill */}
          <div className="p-5 rounded-2xl bg-[#F4F7FE] flex items-center justify-between shadow-xs border border-slate-200/60">
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-wide">Average Ticket</p>
              <h4 className="text-2xl font-black text-slate-900 mt-1">₹ {Number(stats.averageBill || 0).toLocaleString()}</h4>
              <p className="text-xs text-emerald-600 font-bold mt-1">&uarr; Based on real orders</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          {/* Top Selling Dish */}
          <div className="p-5 rounded-2xl bg-[#F4F7FE] flex items-center justify-between shadow-xs border border-slate-200/60">
            <div className="pr-2 min-w-0">
              <p className="text-xs font-black text-slate-400 uppercase tracking-wide">Top Selling Dish</p>
              <h4 className="text-sm font-black text-slate-900 mt-1 truncate">{stats.topDish?.name || 'No orders yet'}</h4>
              <p className="text-xs text-slate-500 font-bold mt-1">{stats.topDish?.orders || 0} items ordered</p>
            </div>
            <div className="w-14 h-14 rounded-xl overflow-hidden shadow-sm flex-shrink-0 bg-slate-100 border border-slate-200">
              <img 
                src={stats.topDish?.img || "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=150&q=80"} 
                alt="Dish" 
                className="w-full h-full object-cover" 
              />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
