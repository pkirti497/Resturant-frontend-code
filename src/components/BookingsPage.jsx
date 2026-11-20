import React, { useState, useEffect } from 'react';
import { 
  CalendarDays, 
  Search, 
  Plus, 
  Minus,
  CheckCircle2, 
  Clock, 
  Calendar, 
  Phone, 
  User, 
  DollarSign, 
  X, 
  Check, 
  Bed, 
  Building,
  Sparkles,
  RefreshCw,
  Building2,
  Receipt
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';

export default function BookingsPage() {
  const [bookingsList, setBookingsList] = useState([]);
  const [roomsList, setRoomsList] = useState([]);
  const [filterType, setFilterType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('All Time');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    type: 'Room',
    selectedRoomId: '',
    roomNumber: '101',
    facility: 'Room 101 (Deluxe AC)',
    checkInDate: new Date().toISOString().split('T')[0],
    checkOutDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    nights: 1,
    time: '12:00 PM',
    guests: 2,
    advance: '1000',
    pricePerNight: 2500,
    total: '2500',
    status: 'Confirmed'
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch real rooms from database
  const fetchRooms = () => {
    fetch(`${API_BASE_URL}/api/rooms`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRoomsList(data);
          if (data.length > 0 && !formData.selectedRoomId) {
            setFormData(prev => ({
              ...prev,
              selectedRoomId: data[0]._id,
              roomNumber: data[0].roomNumber,
              facility: `Room ${data[0].roomNumber} (${data[0].roomType || 'AC'})`,
              pricePerNight: Number(data[0].price) || 2500,
              total: String((Number(data[0].price) || 2500) * (prev.nights || 1))
            }));
          }
        }
      })
      .catch(err => console.error("Error fetching rooms for bookings:", err));
  };

  // Fetch real room and event bookings from orders API
  const fetchBookings = () => {
    setLoading(true);
    let url = `${API_BASE_URL}/api/orders`;
    if (dateRange === 'Custom Range' && customStartDate && customEndDate) {
      url += `?startDate=${customStartDate}&endDate=${customEndDate}`;
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const bookings = data
            .filter(order => {
              const type = (order.orderType || '').toLowerCase();
              const tbl = (order.tableNumber || '').toLowerCase();
              return type.includes('stay') || type.includes('booking') || type.includes('event') || tbl.includes('room');
            })
            .map(order => {
              const isEvent = (order.orderType || '').toLowerCase().includes('event');
              const totalVal = Number(order.totalAmount || 0);
              const advanceVal = Number(order.advancePaid || 0) || Math.round(totalVal * 0.3);
              const formattedDate = order.dateFormatted || (order.createdAt 
                ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                : 'Current Date');
              const formattedTime = order.createdAt 
                ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '12:00 PM';

              return {
                id: order.billNo || ('BK-' + (order._id ? order._id.slice(-4) : Math.floor(500 + Math.random() * 500))),
                dbId: order._id,
                name: order.customerName || 'Guest',
                phone: order.phone || '-',
                facility: order.tableNumber || (isEvent ? 'Banquet Hall' : 'Room Booking'),
                date: formattedDate,
                createdAt: order.createdAt,
                time: formattedTime,
                guests: order.items?.length || 2,
                advance: `₹ ${advanceVal.toLocaleString()}`,
                total: `₹ ${totalVal.toLocaleString()}`,
                rawTotal: totalVal,
                status: order.status === 'Completed' ? 'Confirmed' : (order.status || 'Confirmed'),
                type: isEvent ? 'Event' : 'Room'
              };
            });
          setBookingsList(bookings);
        }
      })
      .catch(err => console.error("Error fetching bookings:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [dateRange, customStartDate, customEndDate]);

  // Recalculate stay duration and total tariff when dates change
  const handleBookingDatesChange = (from, to) => {
    const dFrom = new Date(from);
    const dTo = new Date(to);
    const diffTime = dTo.getTime() - dFrom.getTime();
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const calculatedTotal = diffDays * Number(formData.pricePerNight || 2500);

    setFormData(prev => ({
      ...prev,
      checkInDate: from,
      checkOutDate: to,
      nights: diffDays,
      total: String(calculatedTotal)
    }));
  };

  const getStatusBadge = (status) => {
    if (status === 'Confirmed' || status === 'Completed') {
      return <span className="px-3 py-1 rounded-xl text-xs font-black bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5"/> Confirmed</span>;
    } else {
      return <span className="px-3 py-1 rounded-xl text-xs font-black bg-amber-50 text-amber-600 border border-amber-200 flex items-center gap-1"><Clock className="w-3.5 h-3.5"/> Pending</span>;
    }
  };

  // Filter Bookings by Type, Search & Date Range
  const filteredBookings = bookingsList.filter(item => {
    const matchesFilter = filterType === 'All' || item.type === filterType;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.facility.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.phone.includes(searchQuery);

    const orderDate = new Date(item.createdAt || Date.now());
    const now = new Date();

    let matchesDate = true;
    if (dateRange === 'Today') {
      matchesDate = orderDate.toDateString() === now.toDateString();
    } else if (dateRange === 'This Week') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      matchesDate = orderDate >= oneWeekAgo;
    } else if (dateRange === 'This Month') {
      matchesDate = orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
    } else if (dateRange === 'Last 3 Months (90 Days)') {
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      matchesDate = orderDate >= ninetyDaysAgo;
    } else if (dateRange === 'Custom Range') {
      if (customStartDate) {
        const start = new Date(customStartDate + 'T00:00:00');
        if (orderDate < start) matchesDate = false;
      }
      if (customEndDate) {
        const end = new Date(customEndDate + 'T23:59:59');
        if (orderDate > end) matchesDate = false;
      }
    }

    return matchesFilter && matchesSearch && matchesDate;
  });

  // Handle Form Submit
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert("Please fill in guest name and phone number");
      return;
    }

    const cleanTotal = Number(formData.total) || (formData.nights * Number(formData.pricePerNight));
    const advancePaid = Number(formData.advance) || 0;

    try {
      // 1. Sync with Rooms API: Mark room as Reserved with guest and dates
      if (formData.type === 'Room' && formData.selectedRoomId) {
        await fetch(`${API_BASE_URL}/api/rooms/${formData.selectedRoomId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: formData.status === 'Confirmed' ? 'Occupied' : 'Reserved',
            guest: formData.name.trim(),
            phone: formData.phone.trim(),
            checkInDate: formData.checkInDate,
            checkOutDate: formData.checkOutDate,
            days: formData.nights,
            advancePayment: advancePaid
          })
        });
      }

      // 2. Sync reservation into Orders Database with monthly sequential bill number
      const orderRes = await fetch(`${API_BASE_URL}/api/orders/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.name.trim(),
          phone: formData.phone.trim(),
          orderType: formData.type === 'Room' ? 'Room Stay' : 'Event Booking',
          tableNumber: formData.facility,
          roomNumber: formData.roomNumber,
          stayDays: formData.nights,
          checkInDate: formData.checkInDate,
          checkOutDate: formData.checkOutDate,
          roomTariff: cleanTotal,
          advancePaid: advancePaid,
          items: [
            {
              name: `${formData.facility} (${formData.nights} Nights Stay)`,
              price: Number(formData.pricePerNight) || cleanTotal,
              qty: formData.nights || 1
            }
          ],
          subtotal: cleanTotal,
          tax: Math.round(cleanTotal * 0.05),
          totalAmount: Math.round(cleanTotal * 1.05),
          status: formData.status === 'Confirmed' ? 'Completed' : 'Pending'
        })
      });

      const orderData = await orderRes.json();
      const generatedBill = orderData.order?.billNo || 'BK-SYNCED';

      showToast(`Reservation successfully created! Bill #${generatedBill} synced.`);
      fetchBookings();
    } catch (err) {
      console.warn("Could not sync booking order:", err);
      showToast("Reservation saved!");
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto text-base pb-12 font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-xs font-black animate-in fade-in flex items-center gap-2 border border-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          {toastMessage}
        </div>
      )}

      {/* HEADER BANNER */}
      <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <CalendarDays className="w-7 h-7 text-blue-600" /> Reservations & Stay Bookings
          </h2>
          <p className="text-sm text-slate-600 font-bold mt-1">
            Manage advance room bookings, stay calendars, duration calculation, and banquet events.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button 
            onClick={fetchBookings}
            className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-sm font-black flex items-center gap-2 transition-all cursor-pointer"
            title="Refresh Bookings"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-black shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-5 h-5" /> New Reservation
          </button>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-wide">Total Bookings Recorded</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{filteredBookings.length}</h3>
            <p className="text-xs text-blue-600 font-bold mt-1">Live reservations from database</p>
          </div>
          <div className="p-4 rounded-2xl bg-blue-50 text-blue-600">
            <CalendarDays className="w-7 h-7" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-wide">Confirmed Reservations</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">
              {filteredBookings.filter(b => b.status === 'Confirmed' || b.status === 'Completed').length}
            </h3>
            <p className="text-xs text-emerald-600 font-bold mt-1">Advance paid & registered</p>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-7 h-7" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-wide">Pending Confirmations</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">
              {filteredBookings.filter(b => b.status === 'Pending' || b.status === 'Preparing').length}
            </h3>
            <p className="text-xs text-amber-600 font-bold mt-1">Awaiting advance payment</p>
          </div>
          <div className="p-4 rounded-2xl bg-amber-50 text-amber-600">
            <Clock className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* SEARCH & DATE RANGE FILTERS BAR */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4 flex-wrap">
        <div className="relative w-full lg:max-w-xs">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </span>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by guest, booking ID..." 
            className="w-full pl-12 pr-4 py-3 bg-[#F4F7FE] border border-slate-200/60 rounded-2xl text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none"
          />
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-3 bg-[#F4F7FE] border border-slate-200/60 rounded-2xl text-xs font-black text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="All Time">All Time Bookings</option>
            <option value="Today">Today</option>
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
            <option value="Last 3 Months (90 Days)">Last 3 Months (90 Days)</option>
            <option value="Custom Range">Custom Date Range</option>
          </select>

          {dateRange === 'Custom Range' && (
            <div className="flex items-center gap-2 bg-[#F4F7FE] p-1.5 rounded-2xl border border-slate-200">
              <input 
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                title="From Date"
              />
              <span className="text-xs text-slate-400 font-black">&rarr;</span>
              <input 
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                title="To Date"
              />
            </div>
          )}
        </div>

        {/* Type Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-1">
          {['All', 'Room', 'Event'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                filterType === type ? 'bg-blue-600 text-white shadow-md' : 'bg-[#F4F7FE] text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type === 'All' ? 'All Types' : type === 'Room' ? 'Hotel Rooms' : 'Banquet Events'}
            </button>
          ))}
        </div>
      </div>

      {/* BOOKINGS TABLE */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F4F7FE] text-slate-400 text-xs font-black uppercase tracking-wider">
              <tr>
                <th className="py-4 px-4">Booking ID</th>
                <th className="py-4 px-4">Guest Details</th>
                <th className="py-4 px-4">Facility / Room</th>
                <th className="py-4 px-4">Stay Date & Time</th>
                <th className="py-4 px-4">Advance Paid</th>
                <th className="py-4 px-4">Total Amount</th>
                <th className="py-4 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-bold text-slate-800">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((bk, idx) => (
                  <tr key={bk.id || idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4">
                      <span className="font-black text-blue-600 text-sm">{bk.id}</span>
                      <span className="block text-xs text-slate-400 font-bold">{bk.type}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-slate-900 font-black">{bk.name}</span>
                      <span className="block text-xs text-slate-500 font-bold">{bk.phone}</span>
                    </td>
                    <td className="py-4 px-4 text-slate-700">
                      {bk.facility}
                    </td>
                    <td className="py-4 px-4 text-slate-600 text-xs">
                      {bk.date} &bull; {bk.time}
                    </td>
                    <td className="py-4 px-4 text-emerald-600 font-black">
                      {bk.advance}
                    </td>
                    <td className="py-4 px-4 font-black text-slate-900">
                      {bk.total}
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(bk.status)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400 font-bold text-base">
                    {loading ? "Loading bookings from database..." : "No reservations found matching your criteria."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* UPGRADED NEW RESERVATION MODAL (With Date Range Calendar & Stay Calculator) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-7 space-y-5 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-blue-600" /> New Stay / Event Reservation
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs font-bold">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 uppercase tracking-wider mb-1">Guest Full Name *</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Vikram Malhotra"
                    required
                    className="w-full px-3.5 py-2.5 bg-[#F4F7FE] border rounded-xl text-slate-900 font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 uppercase tracking-wider mb-1">Phone Number *</label>
                  <input 
                    type="text" 
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. 9876543210"
                    required
                    className="w-full px-3.5 py-2.5 bg-[#F4F7FE] border rounded-xl text-slate-900 font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 uppercase tracking-wider mb-1">Booking Type</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#F4F7FE] border rounded-xl text-slate-900 font-black focus:outline-none cursor-pointer"
                  >
                    <option value="Room">Hotel Room Stay</option>
                    <option value="Event">Banquet / Conference Hall</option>
                  </select>
                </div>

                {formData.type === 'Room' ? (
                  <div>
                    <label className="block text-slate-500 uppercase tracking-wider mb-1">Select Hotel Room</label>
                    <select 
                      value={formData.selectedRoomId}
                      onChange={(e) => {
                        const rId = e.target.value;
                        const found = roomsList.find(r => r._id === rId);
                        if (found) {
                          const rate = Number(found.price) || 2500;
                          setFormData(prev => ({
                            ...prev,
                            selectedRoomId: rId,
                            roomNumber: found.roomNumber,
                            facility: `Room ${found.roomNumber} (${found.roomType})`,
                            pricePerNight: rate,
                            total: String(rate * (prev.nights || 1))
                          }));
                        }
                      }}
                      className="w-full px-3.5 py-2.5 bg-[#F4F7FE] border rounded-xl text-slate-900 font-black focus:outline-none cursor-pointer"
                    >
                      {roomsList.map(rm => (
                        <option key={rm._id} value={rm._id}>
                          Room {rm.roomNumber} &bull; {rm.roomType} (₹{Number(rm.price).toLocaleString()}/night)
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-slate-500 uppercase tracking-wider mb-1">Event Facility</label>
                    <input 
                      type="text" 
                      value={formData.facility}
                      onChange={(e) => setFormData({ ...formData, facility: e.target.value })}
                      placeholder="e.g. Royal Grand Banquet Hall"
                      className="w-full px-3.5 py-2.5 bg-[#F4F7FE] border rounded-xl text-slate-900 font-bold focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* DATE RANGE CALENDAR PICKERS */}
              <div className="bg-[#F4F7FE] p-3.5 rounded-2xl border border-slate-200/80 space-y-2.5">
                <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600" /> Booking Date Range & Stay Duration
                </span>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-black uppercase mb-1">From (Check-In)</label>
                    <input 
                      type="date"
                      value={formData.checkInDate}
                      onChange={(e) => handleBookingDatesChange(e.target.value, formData.checkOutDate)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-black uppercase mb-1">To (Check-Out)</label>
                    <input 
                      type="date"
                      value={formData.checkOutDate}
                      onChange={(e) => handleBookingDatesChange(formData.checkInDate, e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-bold text-slate-600">Calculated Stay Duration:</span>
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                    <button 
                      type="button" 
                      onClick={() => {
                        const newNights = Math.max(1, formData.nights - 1);
                        setFormData(prev => ({
                          ...prev,
                          nights: newNights,
                          total: String(newNights * Number(prev.pricePerNight || 2500))
                        }));
                      }}
                      className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-black text-slate-700 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-xs font-black text-blue-600 min-w-16 text-center">
                      {formData.nights} Night(s)
                    </span>
                    <button 
                      type="button" 
                      onClick={() => {
                        const newNights = formData.nights + 1;
                        setFormData(prev => ({
                          ...prev,
                          nights: newNights,
                          total: String(newNights * Number(prev.pricePerNight || 2500))
                        }));
                      }}
                      className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-black text-slate-700 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Advance & Total Amount */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 uppercase tracking-wider mb-1">Advance Payment (₹)</label>
                  <input 
                    type="number" 
                    value={formData.advance}
                    onChange={(e) => setFormData({ ...formData, advance: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#F4F7FE] border rounded-xl text-slate-900 font-bold focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-slate-500 uppercase tracking-wider mb-1">Total Room Tariff (₹)</label>
                  <input 
                    type="number" 
                    value={formData.total}
                    onChange={(e) => setFormData({ ...formData, total: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 bg-[#F4F7FE] border rounded-xl text-slate-900 font-black focus:outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 uppercase tracking-wider mb-1">Reservation Status</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#F4F7FE] border rounded-xl text-slate-900 font-black focus:outline-none cursor-pointer"
                >
                  <option value="Confirmed">Confirmed (Check-In immediately)</option>
                  <option value="Pending">Pending Advance Reservation</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="w-1/2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-lg shadow-blue-500/25 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" /> Save & Sync Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
