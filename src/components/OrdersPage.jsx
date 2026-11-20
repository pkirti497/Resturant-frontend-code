import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import { 
  ClipboardList, 
  Search, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Receipt, 
  Smartphone, 
  Store, 
  Bed, 
  Filter,
  Eye,
  Plus,
  Trash2,
  Printer,
  CreditCard,
  Banknote,
  SmartphoneNfc,
  Split,
  Settings,
  Utensils,
  Check,
  X,
  AlertCircle,
  FileText,
  DollarSign,
  User,
  Phone,
  Layers,
  CheckSquare
} from 'lucide-react';

export default function OrderPage() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'menu', 'settings'

  // Notification / Message Modal State
  const [notification, setNotification] = useState(null);

  const showNotify = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Menu Items Database State
  const [menuItems, setMenuItems] = useState([
    { id: 'M-101', name: 'Paneer Tikka', category: 'Starters', price: 280, gst: 5, type: 'Veg', available: true },
    { id: 'M-102', name: 'Butter Naan', category: 'Main Course', price: 45, gst: 5, type: 'Veg', available: true },
    { id: 'M-103', name: 'Veg Biryani', category: 'Main Course', price: 240, gst: 5, type: 'Veg', available: true },
    { id: 'M-104', name: 'Coke (250ml)', category: 'Beverages', price: 60, gst: 12, type: 'Veg', available: true },
    { id: 'M-105', name: 'Dal Makhani', category: 'Main Course', price: 320, gst: 5, type: 'Veg', available: true },
    { id: 'M-106', name: 'Tandoori Roti', category: 'Main Course', price: 30, gst: 5, type: 'Veg', available: true },
    { id: 'M-107', name: 'Butter Chicken', category: 'Main Course', price: 420, gst: 5, type: 'Non-Veg', available: true },
    { id: 'M-108', name: 'Garlic Naan', category: 'Main Course', price: 65, gst: 5, type: 'Veg', available: true },
    { id: 'M-109', name: 'Cold Drink', category: 'Beverages', price: 80, gst: 12, type: 'Veg', available: true },
    { id: 'M-110', name: 'Mineral Water', category: 'Beverages', price: 30, gst: 5, type: 'Veg', available: false }, // Out of stock example
  ]);

  // Orders Database State with Multi-KOT support (100% Real Live Database Data)
  const [orders, setOrders] = useState([]);

  // Filters & Search State for Orders
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterLocation, setFilterLocation] = useState('All'); // 'All', 'Tables', 'Rooms'
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Fetch live orders from database
  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const res = await fetch(`${API_BASE_URL}/api/orders`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const mapped = data.map((dbOrder) => {
          const isRoom = (dbOrder.tableNumber || '').toLowerCase().includes('room') || (dbOrder.orderType || '').toLowerCase().includes('room');
          return {
            _id: dbOrder._id,
            id: dbOrder.billNo || ('ORD-' + dbOrder._id.slice(-4)),
            billNo: dbOrder.billNo || ('RST-2026-' + dbOrder._id.slice(-5)),
            location: dbOrder.tableNumber || (isRoom ? 'Room Service' : 'Table 1'),
            name: dbOrder.customerName || 'Guest',
            phone: dbOrder.phone || '-',
            type: dbOrder.orderType || (isRoom ? 'Room Stay' : 'Dine-In'),
            kots: [
              {
                kotNo: 'KOT-' + (dbOrder.billNo ? dbOrder.billNo.replace(/[^0-9]/g, '').slice(-3) || '101' : '101'),
                time: new Date(dbOrder.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                items: dbOrder.items && dbOrder.items.length > 0 ? dbOrder.items : [{ name: dbOrder.orderType || 'Order', price: dbOrder.totalAmount || 0, qty: 1 }]
              }
            ],
            total: dbOrder.totalAmount || 0,
            tax: dbOrder.tax || Math.round((dbOrder.totalAmount || 0) * 0.05),
            status: dbOrder.status || 'Completed',
            time: new Date(dbOrder.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            createdAt: dbOrder.createdAt,
            discount: 0,
            paymentSplit: null
          };
        });
        setOrders(mapped);
      }
    } catch (err) {
      console.error("Error fetching live orders:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleDeleteOrder = async (order) => {
    if (!window.confirm(`Are you sure you want to delete order ${order.id || order.billNo}?`)) return;
    try {
      if (order._id) {
        await fetch(`${API_BASE_URL}/api/orders/${order._id}`, {
          method: 'DELETE'
        });
      }
      setOrders(prev => prev.filter(o => o.id !== order.id));
      showNotify(`Order ${order.id || order.billNo} deleted successfully.`);
      if (selectedOrder && selectedOrder.id === order.id) setSelectedOrder(null);
      if (billingOrder && billingOrder.id === order.id) setBillingOrder(null);
    } catch (e) {
      console.error("Error deleting order:", e);
      showNotify("Error deleting order from server.");
    }
  };

  React.useEffect(() => {
    fetchOrders();
  }, []);

  // Modals State
  const [selectedOrder, setSelectedOrder] = useState(null); // For Details Modal
  const [billingOrder, setBillingOrder] = useState(null); // For Billing Modal
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false); // For Creating New Order

  // New Order Form State
  const [newOrderForm, setNewOrderForm] = useState({
    name: '',
    phone: '',
    location: 'Table 1',
    type: 'Dine-In',
    selectedItems: [] // [{ item, qty }]
  });

  // Additional Item state when editing an order (e.g. Table T4 / Table 4 adding Cold Drink x2)
  const [additionalItems, setAdditionalItems] = useState([]); // [{ item, qty }]

  // Menu Management State
  const [newItemForm, setNewItemForm] = useState({ name: '', category: 'Starters', price: '', gst: 5, type: 'Veg', available: true });
  
  // Date Range Filter State
  const [dateRange, setDateRange] = useState('All Time');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Filtered Orders List
  const filteredOrders = orders.filter(ord => {
    const matchesStatus = filterStatus === 'All' || ord.status === filterStatus;
    const isRoomOrder = (ord.location || '').toLowerCase().includes('room') || (ord.type || '').toLowerCase().includes('room');
    const matchesLocation = 
      filterLocation === 'All' ||
      (filterLocation === 'Tables' && !isRoomOrder) ||
      (filterLocation === 'Rooms' && isRoomOrder);

    const matchesSearch = 
      (ord.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ord.billNo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ord.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ord.phone || '').includes(searchQuery) ||
      (ord.location || '').toLowerCase().includes(searchQuery.toLowerCase());

    // Date Range filtering
    const orderDate = new Date(ord.createdAt || Date.now());
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

    return matchesStatus && matchesLocation && matchesSearch && matchesDate;
  });

  const handleStatusChange = async (id, newStatus) => {
    setOrders(orders.map(ord => ord.id === id ? { ...ord, status: newStatus } : ord));
    showNotify(`Order ${id} status updated to ${newStatus}`);

    const ordObj = orders.find(o => o.id === id);
    if (ordObj && ordObj._id) {
      try {
        await fetch(`${API_BASE_URL}/api/orders/${ordObj._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });
      } catch (e) {
        console.warn("Could not sync status change with backend:", e);
      }
    }
  };

  // Helper to calculate total items and price from all KOTs
  const calculateOrderGrandTotal = (kots, discount = 0) => {
    let subtotal = 0;
    let taxTotal = 0;
    kots.forEach(kot => {
      kot.items.forEach(i => {
        const itemObj = menuItems.find(m => m.name === i.name) || { price: i.price, gst: 5 };
        const itemTotal = i.qty * i.price;
        subtotal += itemTotal;
        taxTotal += (itemTotal * (itemObj.gst || 5)) / 100;
      });
    });
    const grand = subtotal + taxTotal - discount;
    return { subtotal, taxTotal, grand: Math.max(0, Math.round(grand)) };
  };

  // Send New KOT to existing order (e.g. Table T4 / Table 4 adding Cold Drink x2)
  const handleSendNewKOT = (orderId) => {
    if (additionalItems.length === 0) {
      showNotify("Please select at least one item for the new KOT.");
      return;
    }

    setOrders(orders.map(ord => {
      if (ord.id === orderId) {
        const newKotNumber = `KOT-${Math.floor(100 + Math.random() * 900)}`;
        const newKot = {
          kotNo: newKotNumber,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          items: additionalItems.map(ai => ({ name: ai.item.name, qty: ai.qty, price: ai.item.price }))
        };
        const updatedKots = [...ord.kots, newKot];
        const { grand, taxTotal } = calculateOrderGrandTotal(updatedKots, ord.discount);
        return {
          ...ord,
          kots: updatedKots,
          total: grand,
          tax: taxTotal,
          status: 'Preparing'
        };
      }
      return ord;
    }));

    setAdditionalItems([]);
    showNotify("New KOT successfully sent to kitchen! Previous KOTs preserved.");
  };

  // Create brand new order
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!newOrderForm.name || newOrderForm.selectedItems.length === 0) {
      showNotify("Please enter guest name and select at least one menu item.");
      return;
    }

    const kotItems = newOrderForm.selectedItems.map(si => ({ 
      name: si.item.name, 
      qty: si.qty, 
      price: si.item.price 
    }));
    
    const subtotal = kotItems.reduce((acc, it) => acc + (it.price * it.qty), 0);
    const tax = Math.round(subtotal * 0.05);
    const grand = subtotal + tax;

    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: newOrderForm.name.trim(),
          phone: newOrderForm.phone || '-',
          orderType: newOrderForm.type,
          tableNumber: newOrderForm.location,
          items: kotItems,
          subtotal,
          tax,
          totalAmount: grand,
          status: 'New'
        })
      });

      const data = await res.json();
      const savedBillNo = data.order?.billNo || 'BILL-SYNCED';

      setIsNewOrderModalOpen(false);
      setNewOrderForm({ name: '', phone: '', location: 'Table 1', type: 'Dine-In', selectedItems: [] });
      showNotify(`New order saved to database! Bill #${savedBillNo}`);
      fetchOrders();
    } catch (err) {
      console.error("Error saving new order:", err);
      showNotify("Error saving order: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FE] text-slate-900 font-sans antialiased flex flex-col">
      
      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-6 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 animate-bounce">
          <AlertCircle className="w-5 h-5 text-blue-400" />
          <span className="text-sm font-black">{notification}</span>
        </div>
      )}

      {/* Top Header Navigation */}
      <header className="bg-white border-b border-slate-100 px-6 py-4 sticky top-0 z-30 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">The Green Valley POS</h1>
            <p className="text-xs text-slate-500 font-bold">Hotel & Restaurant Multi-KOT & Billing Engine</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center bg-[#F4F7FE] p-1.5 rounded-2xl border border-slate-200/60">
          <button 
            onClick={() => setActiveTab('orders')} 
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'orders' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <ClipboardList className="w-4 h-4" /> POS & Orders
          </button>
          <button 
            onClick={() => setActiveTab('menu')} 
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'menu' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <Layers className="w-4 h-4" /> Menu & Stock Management
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsNewOrderModalOpen(true)}
            className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-black shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" /> New Table Order
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-6">

        {activeTab === 'orders' && (
          <>
            {/* Header Banner & Quick Stats */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <ClipboardList className="w-8 h-8 text-blue-600" /> Live Orders & KOT Control
                </h2>
                <p className="text-sm text-slate-500 font-bold mt-1">Manage active tables, multi-KOT additions, bills and room folio transfers</p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="px-5 py-2.5 bg-blue-50 text-blue-700 rounded-2xl text-sm font-black border border-blue-100 shadow-sm">
                  Active Tables: {orders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled').length}
                </span>
                <span className="px-5 py-2.5 bg-emerald-50 text-emerald-700 rounded-2xl text-sm font-black border border-emerald-100 shadow-sm">
                  Completed Today: {orders.filter(o => o.status === 'Completed').length}
                </span>
              </div>
            </div>

            {/* Source Location Filter (Tables vs Rooms) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setFilterLocation('All')}
                  className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                    filterLocation === 'All' ? 'bg-slate-900 text-white shadow-md' : 'bg-[#F4F7FE] text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  All Orders ({orders.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterLocation('Tables')}
                  className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    filterLocation === 'Tables' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25' : 'bg-[#F4F7FE] text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Store className="w-4 h-4" /> Restaurant Tables ({orders.filter(o => !(o.location || '').toLowerCase().includes('room') && !(o.type || '').toLowerCase().includes('room')).length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterLocation('Rooms')}
                  className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    filterLocation === 'Rooms' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25' : 'bg-[#F4F7FE] text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Bed className="w-4 h-4" /> Rooms & Bookings ({orders.filter(o => (o.location || '').toLowerCase().includes('room') || (o.type || '').toLowerCase().includes('room')).length})
                </button>
              </div>

              <button
                type="button"
                onClick={fetchOrders}
                className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer self-end sm:self-auto"
              >
                ↻ Refresh Live Orders
              </button>
            </div>

            {/* Search & Status & Date Range Filter Bar */}
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4 flex-wrap">
              <div className="relative flex-1 max-w-md">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-5 h-5" />
                </span>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Bill No, Order ID, Guest Name, Table / Room..." 
                  className="w-full pl-12 pr-4 py-3 bg-[#F4F7FE] border border-slate-200/60 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-black"
                />
              </div>

              {/* Date Range Selector */}
              <div className="flex items-center gap-2 flex-wrap">
                <select 
                  value={dateRange} 
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-4 py-3 bg-[#F4F7FE] border border-slate-200/60 rounded-2xl text-xs font-black text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="All Time">All Time Orders</option>
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

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 w-full lg:w-auto">
                {['All', 'New', 'Preparing', 'Ready', 'Served', 'Pending at Checkout', 'Completed', 'Cancelled'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3.5 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${filterStatus === status ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'bg-[#F4F7FE] text-slate-700 hover:bg-slate-200'}`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((ord) => (
                  <div key={ord.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    
                    {/* Card Top Header */}
                    <div>
                      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                        <div>
                          <span className="text-xl font-black text-slate-900">{ord.id}</span>
                          <span className="block text-xs text-blue-600 font-extrabold">{ord.billNo} • {ord.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3.5 py-1.5 rounded-2xl text-xs font-black border ${
                            ord.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            ord.status === 'Preparing' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            ord.status === 'Ready' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            ord.status === 'Bill Pending' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {ord.status}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteOrder(ord)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* 1. ROOM / TABLE LOCATION PROMINENT BANNER */}
                      {(() => {
                        const isStay = ord.type === 'Room Stay' || (ord.type || '').toLowerCase().includes('booking');
                        const isRoomDelivery = !isStay && ((ord.location || '').toLowerCase().includes('room') || (ord.type || '').toLowerCase().includes('room'));
                        const isTakeaway = ord.type === 'Takeaway' || (ord.location || '').toLowerCase().includes('takeaway');

                        if (isStay) {
                          return (
                            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 mb-3 flex items-center justify-between shadow-xs">
                              <div className="flex items-center gap-2.5">
                                <span className="p-2 rounded-xl bg-emerald-600 text-white shadow-sm">
                                  <Bed className="w-4 h-4" />
                                </span>
                                <div>
                                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">🏨 Hotel Room Booking</span>
                                  <span className="text-sm font-black text-emerald-950">{ord.location}</span>
                                </div>
                              </div>
                              <span className="px-2.5 py-1 rounded-xl text-[11px] font-black bg-emerald-200/70 text-emerald-900 border border-emerald-300">
                                Room Stay
                              </span>
                            </div>
                          );
                        } else if (isRoomDelivery) {
                          return (
                            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 mb-3 flex items-center justify-between shadow-xs">
                              <div className="flex items-center gap-2.5">
                                <span className="p-2 rounded-xl bg-purple-600 text-white shadow-sm">
                                  <Bed className="w-4 h-4" />
                                </span>
                                <div>
                                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-800 block">🛎️ Room Food Delivery</span>
                                  <span className="text-sm font-black text-purple-950">{ord.location}</span>
                                </div>
                              </div>
                              <span className="px-2.5 py-1 rounded-xl text-[11px] font-black bg-purple-200/70 text-purple-900 border border-purple-300">
                                Room Service
                              </span>
                            </div>
                          );
                        } else if (isTakeaway) {
                          return (
                            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 mb-3 flex items-center justify-between shadow-xs">
                              <div className="flex items-center gap-2.5">
                                <span className="p-2 rounded-xl bg-amber-600 text-white shadow-sm">
                                  <Store className="w-4 h-4" />
                                </span>
                                <div>
                                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">🛍️ Takeaway Counter</span>
                                  <span className="text-sm font-black text-amber-950">Self Pickup</span>
                                </div>
                              </div>
                              <span className="px-2.5 py-1 rounded-xl text-[11px] font-black bg-amber-200/70 text-amber-900 border border-amber-300">
                                Takeaway
                              </span>
                            </div>
                          );
                        } else {
                          return (
                            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 mb-3 flex items-center justify-between shadow-xs">
                              <div className="flex items-center gap-2.5">
                                <span className="p-2 rounded-xl bg-blue-600 text-white shadow-sm">
                                  <Store className="w-4 h-4" />
                                </span>
                                <div>
                                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-800 block">🍽️ Dining Table Order</span>
                                  <span className="text-sm font-black text-blue-950">{ord.location}</span>
                                </div>
                              </div>
                              <span className="px-2.5 py-1 rounded-xl text-[11px] font-black bg-blue-200/70 text-blue-900 border border-blue-300">
                                Dine-In
                              </span>
                            </div>
                          );
                        }
                      })()}

                      {/* 2. GUEST & CONTACT DETAILS */}
                      <div className="flex items-center justify-between text-xs bg-slate-50 px-3.5 py-2.5 rounded-2xl border border-slate-100 mb-3">
                        <div>
                          <span className="text-slate-400 font-bold block text-[10px] uppercase">Guest Name</span>
                          <span className="text-slate-900 font-black text-xs">{ord.name}</span>
                        </div>
                        {ord.phone && ord.phone !== '-' && (
                          <div className="text-right">
                            <span className="text-slate-400 font-bold block text-[10px] uppercase">Phone</span>
                            <span className="text-slate-700 font-bold text-xs">{ord.phone}</span>
                          </div>
                        )}
                      </div>

                      {/* 3. ORDERED DISHES / STAY ITEMS LIST */}
                      <div className="bg-[#F4F7FE] p-4 rounded-2xl mb-4 space-y-2">
                        <div className="flex items-center justify-between text-xs font-black text-slate-600 uppercase tracking-wide">
                          <span className="flex items-center gap-1.5">
                            <Utensils className="w-3.5 h-3.5 text-blue-600" />
                            {ord.type === 'Room Stay' ? 'Booked Room Details' : 'Ordered Dishes & Items'}
                          </span>
                          <span className="bg-white px-2 py-0.5 rounded-lg text-slate-800 text-[11px] font-black shadow-xs">
                            {ord.kots.flatMap(k => k.items).length} Dish/Item(s)
                          </span>
                        </div>

                        {/* Individual Item Cards */}
                        <div className="space-y-1.5 pt-1">
                          {ord.kots.flatMap(k => k.items).map((item, idx) => (
                            <div key={idx} className="bg-white px-3 py-2 rounded-xl border border-slate-200/60 shadow-xs flex items-center justify-between">
                              <div className="flex items-center gap-2 min-w-0 pr-2">
                                <span className="w-5 h-5 rounded-md bg-blue-50 text-blue-700 font-black text-xs flex items-center justify-center flex-shrink-0">
                                  {item.qty}×
                                </span>
                                <span className="font-extrabold text-xs text-slate-900 truncate">
                                  {item.name}
                                </span>
                              </div>
                              {item.price > 0 && (
                                <span className="font-black text-xs text-blue-600 flex-shrink-0">
                                  ₹{item.price * item.qty}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Card Footer (Total & Actions) */}
                    <div className="pt-4 border-t border-slate-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500 font-bold">Grand Total:</span>
                        <span className="text-xl font-black text-blue-600">₹ {ord.total}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <select 
                          value={ord.status}
                          onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                          className="px-3 py-2.5 bg-[#F4F7FE] border rounded-2xl text-xs font-black text-slate-800 focus:outline-none"
                        >
                          <option value="New">New</option>
                          <option value="Preparing">Preparing</option>
                          <option value="Ready">Ready</option>
                          <option value="Served">Served</option>
                          <option value="Bill Pending">Bill Pending</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>

                        <button 
                          onClick={() => setSelectedOrder(ord)}
                          className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black shadow-md flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Eye className="w-4 h-4" /> Full Details / KOT
                        </button>
                      </div>

                      <button 
                        onClick={() => setBillingOrder(ord)}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black shadow-md flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Receipt className="w-4 h-4" /> Generate Bill & Pay
                      </button>
                    </div>

                  </div>
                ))
              ) : (
                <div className="col-span-full bg-white p-12 rounded-3xl border border-slate-100 shadow-sm text-center space-y-3">
                  <h3 className="text-xl font-black text-slate-800">No Orders Found</h3>
                  <p className="text-sm text-slate-500 font-bold">Try changing your search query or status filter tab.</p>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'menu' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <Layers className="w-8 h-8 text-blue-600" /> Menu & Stock Management
                </h2>
                <p className="text-sm text-slate-500 font-bold mt-1">Manage categories, prices, GST rates and toggle item availability (Out of Stock items disable automatically)</p>
              </div>
            </div>

            {/* Add New Menu Item Form */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" /> Add New Menu Item
              </h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!newItemForm.name || !newItemForm.price) {
                  showNotify("Please provide item name and price.");
                  return;
                }
                const newId = `M-${100 + menuItems.length + 1}`;
                setMenuItems([...menuItems, { ...newItemForm, id: newId, price: Number(newItemForm.price), gst: Number(newItemForm.gst) }]);
                setNewItemForm({ name: '', category: 'Starters', price: '', gst: 5, type: 'Veg', available: true });
                showNotify("New menu item added successfully!");
              }} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 mb-1">Item Name</label>
                  <input 
                    type="text" 
                    value={newItemForm.name}
                    onChange={(e) => setNewItemForm({...newItemForm, name: e.target.value})}
                    placeholder="e.g. Veg Spring Roll" 
                    className="w-full px-4 py-3 bg-[#F4F7FE] border rounded-2xl text-sm font-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Category</label>
                  <select 
                    value={newItemForm.category}
                    onChange={(e) => setNewItemForm({...newItemForm, category: e.target.value})}
                    className="w-full px-4 py-3 bg-[#F4F7FE] border rounded-2xl text-sm font-black focus:outline-none"
                  >
                    <option value="Starters">Starters</option>
                    <option value="Main Course">Main Course</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Desserts">Desserts</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Price (₹)</label>
                  <input 
                    type="number" 
                    value={newItemForm.price}
                    onChange={(e) => setNewItemForm({...newItemForm, price: e.target.value})}
                    placeholder="250" 
                    className="w-full px-4 py-3 bg-[#F4F7FE] border rounded-2xl text-sm font-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Type</label>
                  <select 
                    value={newItemForm.type}
                    onChange={(e) => setNewItemForm({...newItemForm, type: e.target.value})}
                    className="w-full px-4 py-3 bg-[#F4F7FE] border rounded-2xl text-sm font-black focus:outline-none"
                  >
                    <option value="Veg">Veg</option>
                    <option value="Non-Veg">Non-Veg</option>
                  </select>
                </div>
                <div>
                  <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black shadow-md transition-colors">
                    Add Item
                  </button>
                </div>
              </form>
            </div>

            {/* Menu Items Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900">Current Menu Inventory</h3>
                <span className="text-xs font-bold text-slate-500">Total Items: {menuItems.length}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F4F7FE] text-slate-500 text-xs font-black uppercase">
                      <th className="p-4 pl-6">ID</th>
                      <th className="p-4">Item Name</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">GST</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 pr-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm font-bold text-slate-800">
                    {menuItems.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="p-4 pl-6 font-black text-blue-600">{item.id}</td>
                        <td className="p-4 font-black">{item.name}</td>
                        <td className="p-4">{item.category}</td>
                        <td className="p-4">₹ {item.price}</td>
                        <td className="p-4">{item.gst}%</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-xl text-xs font-black ${item.type === 'Veg' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="p-4">
                          <button 
                            onClick={() => {
                              setMenuItems(menuItems.map(m => m.id === item.id ? { ...m, available: !m.available } : m));
                              showNotify(`${item.name} marked as ${!item.available ? 'Available' : 'Out of Stock'}`);
                            }}
                            className={`px-3 py-1 rounded-xl text-xs font-black border ${item.available ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}
                          >
                            {item.available ? 'Available' : 'Out of Stock'}
                          </button>
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <button 
                            onClick={() => {
                              setMenuItems(menuItems.filter(m => m.id !== item.id));
                              showNotify(`${item.name} deleted from menu.`);
                            }}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* MODAL 1: Full Order Details & Multi-KOT Addition */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-2xl font-black text-slate-900">{selectedOrder.id} ({selectedOrder.location})</span>
                <p className="text-xs text-blue-600 font-extrabold">Bill #{selectedOrder.billNo} • Guest: {selectedOrder.name} ({selectedOrder.phone})</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* KOT History Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-blue-600" /> Kitchen Order Tickets (KOT) History
              </h3>
              
              <div className="space-y-3">
                {selectedOrder.kots.map((kot, index) => (
                  <div key={index} className="bg-[#F4F7FE] p-4 rounded-2xl border border-slate-200/60 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-blue-600">{kot.kotNo}</span>
                        <span className="text-xs text-slate-500 font-bold">({kot.time})</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {kot.items.map((i, idx) => (
                          <span key={idx} className="bg-white px-3 py-1 rounded-xl text-xs font-black text-slate-800 shadow-sm border border-slate-200/40">
                            {i.name} ×{i.qty}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-black border border-emerald-200">
                      Sent to Kitchen
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Additional Items (Multi-KOT Workflow e.g. Cold Drink x2) */}
            <div className="bg-blue-50/60 p-5 rounded-3xl border border-blue-100 space-y-4">
              <h3 className="text-md font-black text-blue-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" /> Add Additional Items & Send New KOT
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <select 
                    id="select-add-item"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-800 focus:outline-none"
                  >
                    {menuItems.filter(m => m.available).map(m => (
                      <option key={m.id} value={m.id}>{m.name} (₹{m.price}) [{m.category}]</option>
                    ))}
                  </select>
                </div>
                <div>
                  <button 
                    onClick={() => {
                      const selectEl = document.getElementById('select-add-item');
                      const itemId = selectEl.value;
                      const itemObj = menuItems.find(m => m.id === itemId);
                      if (!itemObj) return;

                      // Check if already in additionalItems
                      const existing = additionalItems.find(ai => ai.item.id === itemObj.id);
                      if (existing) {
                        setAdditionalItems(additionalItems.map(ai => ai.item.id === itemObj.id ? { ...ai, qty: ai.qty + 1 } : ai));
                      } else {
                        setAdditionalItems([...additionalItems, { item: itemObj, qty: 1 }]);
                      }
                      showNotify(`Added ${itemObj.name} to new KOT draft`);
                    }}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black shadow-md transition-colors"
                  >
                    Add to KOT Draft
                  </button>
                </div>
              </div>

              {/* Draft additional items list */}
              {additionalItems.length > 0 && (
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-black text-slate-600 uppercase">Items for New KOT:</span>
                  <div className="space-y-2">
                    {additionalItems.map((ai, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white px-4 py-2 rounded-xl text-xs font-black shadow-sm">
                        <span>{ai.item.name} (₹{ai.item.price} each)</span>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => {
                              if (ai.qty > 1) {
                                setAdditionalItems(additionalItems.map((x, i) => i === idx ? { ...x, qty: x.qty - 1 } : x));
                              } else {
                                setAdditionalItems(additionalItems.filter((_, i) => i !== idx));
                              }
                            }} className="w-6 h-6 bg-slate-100 rounded-lg text-slate-800 font-black">-</button>
                            <span>{ai.qty}</span>
                            <button onClick={() => {
                              setAdditionalItems(additionalItems.map((x, i) => i === idx ? { ...x, qty: x.qty + 1 } : x));
                            }} className="w-6 h-6 bg-slate-100 rounded-lg text-slate-800 font-black">+</button>
                          </div>
                          <span className="text-blue-600 font-black">₹ {ai.item.price * ai.qty}</span>
                          <button onClick={() => setAdditionalItems(additionalItems.filter((_, i) => i !== idx))} className="text-rose-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => {
                      handleSendNewKOT(selectedOrder.id);
                      // Update selectedOrder state to reflect immediately
                      const updated = orders.find(o => o.id === selectedOrder.id);
                      if (updated) setSelectedOrder({...updated});
                    }}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl text-xs font-black shadow-lg shadow-emerald-500/25 transition-all"
                  >
                    Send New KOT to Kitchen
                  </button>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-sm text-slate-500 font-bold">Combined Grand Total:</span>
              <span className="text-2xl font-black text-blue-600">₹ {selectedOrder.total}</span>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: Billing & Payment Modal */}
      {billingOrder && (
        <BillingModal 
          order={billingOrder} 
          menuItems={menuItems} 
          onClose={() => setBillingOrder(null)} 
          onPaymentComplete={(updatedOrder, paymentSplitData) => {
            setOrders(orders.map(o => o.id === updatedOrder.id ? updatedOrder : o));
            setBillingOrder(null);
            showNotify(`Payment successful for Bill #${updatedOrder.billNo}! Order marked as Completed.`);
          }}
          showNotify={showNotify}
        />
      )}

      {/* MODAL 3: Create New Order Modal */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-2xl font-black text-slate-900">Create New Table / Room Order</h3>
              <button onClick={() => setIsNewOrderModalOpen(false)} className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Guest Name *</label>
                  <input 
                    type="text" 
                    required
                    value={newOrderForm.name}
                    onChange={(e) => setNewOrderForm({...newOrderForm, name: e.target.value})}
                    placeholder="e.g. Rohit Sharma" 
                    className="w-full px-4 py-3 bg-[#F4F7FE] border rounded-2xl text-sm font-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    value={newOrderForm.phone}
                    onChange={(e) => setNewOrderForm({...newOrderForm, phone: e.target.value})}
                    placeholder="9876543210" 
                    className="w-full px-4 py-3 bg-[#F4F7FE] border rounded-2xl text-sm font-black focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Table / Room Location</label>
                  <input 
                    type="text" 
                    value={newOrderForm.location}
                    onChange={(e) => setNewOrderForm({...newOrderForm, location: e.target.value})}
                    placeholder="e.g. Table 4 or Room 102" 
                    className="w-full px-4 py-3 bg-[#F4F7FE] border rounded-2xl text-sm font-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Order Type</label>
                  <select 
                    value={newOrderForm.type}
                    onChange={(e) => setNewOrderForm({...newOrderForm, type: e.target.value})}
                    className="w-full px-4 py-3 bg-[#F4F7FE] border rounded-2xl text-sm font-black focus:outline-none"
                  >
                    <option value="Dine-In">Dine-In</option>
                    <option value="Room Service">Room Service</option>
                    <option value="Online">Online</option>
                  </select>
                </div>
              </div>

              {/* Menu Item Picker */}
              <div className="space-y-3">
                <label className="block text-xs font-black text-slate-700 uppercase">Select Menu Items for Order:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-[#F4F7FE] rounded-2xl">
                  {menuItems.filter(m => m.available).map(item => (
                    <div key={item.id} className="bg-white p-3 rounded-xl flex items-center justify-between shadow-sm">
                      <div>
                        <span className="text-xs font-black block">{item.name}</span>
                        <span className="text-[10px] text-blue-600 font-bold">₹{item.price} • {item.category}</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          const existing = newOrderForm.selectedItems.find(si => si.item.id === item.id);
                          if (existing) {
                            setNewOrderForm({
                              ...newOrderForm,
                              selectedItems: newOrderForm.selectedItems.map(si => si.item.id === item.id ? { ...si, qty: si.qty + 1 } : si)
                            });
                          } else {
                            setNewOrderForm({
                              ...newOrderForm,
                              selectedItems: [...newOrderForm.selectedItems, { item, qty: 1 }]
                            });
                          }
                        }}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-black shadow-sm"
                      >
                        + Add
                      </button>
                    </div>
                  ))}
                </div>

                {newOrderForm.selectedItems.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-bold text-slate-500">Selected Items:</span>
                    <div className="space-y-1.5">
                      {newOrderForm.selectedItems.map((si, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-slate-50 px-4 py-2 rounded-xl text-xs font-black">
                          <span>{si.item.name} (×{si.qty})</span>
                          <span className="text-blue-600">₹ {si.item.price * si.qty}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-black shadow-lg shadow-blue-500/25 transition-all"
              >
                Create Order & Generate KOT
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

// Separate Billing Component for handling calculation, room charges & split payments
function BillingModal({ order, menuItems, onClose, onPaymentComplete, showNotify }) {
  const [discount, setDiscount] = useState(order.discount || 0);
  const [paymentMode, setPaymentMode] = useState('Cash'); // Cash, UPI, Card, Split
  const [cashAmount, setCashAmount] = useState('');
  const [upiAmount, setUpiAmount] = useState('');

  // Calculate totals
  let subtotal = 0;
  let taxTotal = 0;
  order.kots.forEach(kot => {
    kot.items.forEach(i => {
      const itemObj = menuItems.find(m => m.name === i.name) || { price: i.price, gst: 5 };
      const itemTotal = i.qty * i.price;
      subtotal += itemTotal;
      taxTotal += (itemTotal * (itemObj.gst || 5)) / 100;
    });
  });

  const grandTotal = Math.max(0, Math.round(subtotal + taxTotal - Number(discount)));

  const handleCompletePayment = (mode) => {
    let paymentSplit = { cash: 0, upi: 0, card: 0 };
    if (mode === 'Cash') paymentSplit.cash = grandTotal;
    else if (mode === 'UPI') paymentSplit.upi = grandTotal;
    else if (mode === 'Card') paymentSplit.card = grandTotal;
    else if (mode === 'Split') {
      const c = Number(cashAmount) || 0;
      const u = Number(upiAmount) || 0;
      if (c + u !== grandTotal) {
        showNotify(`Split payment sum (₹${c + u}) must equal Grand Total (₹${grandTotal})`);
        return;
      }
      paymentSplit.cash = c;
      paymentSplit.upi = u;
    }

    const updated = {
      ...order,
      total: grandTotal,
      discount: Number(discount),
      tax: taxTotal,
      status: 'Completed',
      paymentSplit
    };

    onPaymentComplete(updated);
  };

  const handleChargeToRoom = () => {
    if (!order.location.toLowerCase().includes('room')) {
      showNotify("Error: This order is not associated with a hotel room. Select Room Service or change location to a Room.");
      return;
    }

    const updated = {
      ...order,
      total: grandTotal,
      discount: Number(discount),
      tax: taxTotal,
      status: 'Completed',
      paymentSplit: { roomFolio: order.location }
    };

    showNotify(`Amount ₹${grandTotal} successfully transferred to ${order.location} guest folio!`);
    onPaymentComplete(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-6">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-2xl font-black text-slate-900">Invoice & Billing ({order.billNo})</span>
            <p className="text-xs text-blue-600 font-extrabold">{order.id} • {order.location} • Guest: {order.name}</p>
          </div>
          <button onClick={onClose} className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bill Summary Breakdown */}
        {/* Ordered Dishes / Items in this Bill */}
        <div className="bg-[#F4F7FE] p-4 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-xs font-black text-slate-500 uppercase tracking-wider">
            <span>Ordered Dishes & Items List</span>
            <span className="text-blue-600 font-black">{order.location} ({order.type})</span>
          </div>
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {order.kots.flatMap(k => k.items).map((item, idx) => (
              <div key={idx} className="bg-white px-3.5 py-2 rounded-xl border border-slate-200/60 flex items-center justify-between text-xs font-black">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px] font-black">{item.qty}×</span>
                  <span className="text-slate-900">{item.name}</span>
                </div>
                <span className="text-blue-600 font-black">₹{item.price * item.qty}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#F4F7FE] p-6 rounded-3xl space-y-3">
          <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">Bill Calculation Breakdown</h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between font-bold text-slate-700">
              <span>Food & Beverage Total:</span>
              <span>₹ {subtotal}</span>
            </div>
            <div className="flex justify-between items-center text-slate-700 font-bold">
              <span>Discount (₹):</span>
              <input 
                type="number" 
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-28 px-3 py-1.5 bg-white border rounded-xl text-right text-sm font-black focus:outline-none"
              />
            </div>
            <div className="flex justify-between font-bold text-slate-700">
              <span>Taxes & GST:</span>
              <span>₹ {Math.round(taxTotal)}</span>
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-between text-xl font-black text-slate-900">
              <span>Grand Total:</span>
              <span className="text-blue-600">₹ {grandTotal}</span>
            </div>
          </div>
        </div>

        {/* Payment Modes Selector */}
        <div className="space-y-4">
          <label className="block text-xs font-black text-slate-700 uppercase">Select Payment Mode:</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'Cash', icon: Banknote },
              { id: 'UPI', icon: SmartphoneNfc },
              { id: 'Card', icon: CreditCard },
              { id: 'Split', icon: Split }
            ].map((m) => {
              const IconComp = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => setPaymentMode(m.id)}
                  className={`p-3.5 rounded-2xl text-xs font-black flex flex-col items-center gap-2 border transition-all ${paymentMode === m.id ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25' : 'bg-[#F4F7FE] text-slate-700 border-slate-200 hover:bg-slate-200'}`}
                >
                  <IconComp className="w-5 h-5" />
                  {m.id}
                </button>
              );
            })}
          </div>

          {paymentMode === 'Split' && (
            <div className="bg-slate-50 p-4 rounded-2xl border space-y-3">
              <span className="text-xs font-black text-slate-700">Split Payment Breakdown (Total must equal ₹{grandTotal}):</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Cash Amount (₹)</label>
                  <input 
                    type="number" 
                    value={cashAmount}
                    onChange={(e) => setCashAmount(e.target.value)}
                    placeholder="600"
                    className="w-full px-3 py-2.5 bg-white border rounded-xl text-xs font-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">UPI Amount (₹)</label>
                  <input 
                    type="number" 
                    value={upiAmount}
                    onChange={(e) => setUpiAmount(e.target.value)}
                    placeholder="555"
                    className="w-full px-3 py-2.5 bg-white border rounded-xl text-xs font-black focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button 
            onClick={() => showNotify(`Printing official invoice ${order.billNo}...`)}
            className="py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4" /> Print Bill
          </button>

          <button 
            onClick={handleChargeToRoom}
            className="py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-md transition-colors"
          >
            <Bed className="w-4 h-4" /> Charge to Room ({order.location})
          </button>

          <button 
            onClick={() => handleCompletePayment(paymentMode)}
            className="py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-colors"
          >
            <CheckCircle className="w-4 h-4" /> Pay Now & Close
          </button>
        </div>

      </div>
    </div>
  );
}