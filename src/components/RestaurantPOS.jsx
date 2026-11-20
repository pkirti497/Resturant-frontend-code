import React, { useState, useEffect } from 'react';
import { 
  UtensilsCrossed, 
  Search, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Printer, 
  Grid, 
  ArrowLeft,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Users,
  Check,
  AlertCircle,
  Clock,
  Layers,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

export default function RestaurantPOS() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('tables'); // 'tables' or 'pos'
  
  // Table Management State from Database
  const [tables, setTables] = useState([]);
  const [loadingTables, setLoadingTables] = useState(true);

  // Table Modals
  const [isAddTableOpen, setIsAddTableOpen] = useState(false);
  const [isEditTableOpen, setIsEditTableOpen] = useState(false);
  const [tableFormData, setTableFormData] = useState({
    name: '',
    capacity: 4,
    floor: 'Main Hall',
    status: 'Available',
    customerName: ''
  });
  const [selectedTableForEdit, setSelectedTableForEdit] = useState(null);

  // POS State
  const [activeTable, setActiveTable] = useState('Table 1');
  const [activeTableId, setActiveTableId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState('Dine-In');
  const [roomDeliveryNumber, setRoomDeliveryNumber] = useState('Room 101');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastOrder, setLastOrder] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [savingOrder, setSavingOrder] = useState(false);

  // 🏨 Hotel Guest "Charge to Room" State
  const [occupiedRooms, setOccupiedRooms] = useState([]);
  const [paymentOption, setPaymentOption] = useState('Pay Now'); // 'Pay Now' or 'Charge to Room (Pay at Checkout)'
  const [selectedOccupiedRoomNo, setSelectedOccupiedRoomNo] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch Occupied Rooms for Hotel Room Charging
  const fetchOccupiedRooms = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/rooms`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const occ = data.filter(r => r.status === 'Occupied');
        setOccupiedRooms(occ);
        if (occ.length > 0 && !selectedOccupiedRoomNo) {
          setSelectedOccupiedRoomNo(occ[0].roomNumber);
        }
      }
    } catch (err) {
      console.error("Error fetching occupied rooms:", err);
    }
  };

  useEffect(() => {
    fetchOccupiedRooms();
  }, []);

  // Fetch Tables from Database
  const fetchTables = async () => {
    try {
      setLoadingTables(true);
      const res = await fetch(`${API_BASE_URL}/api/tables`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setTables(data);
      }
    } catch (err) {
      console.error("Error fetching tables:", err);
    } finally {
      setLoadingTables(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  // Dynamic Menu Items from Database
  const [menuItems, setMenuItems] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [isAddDishModalOpen, setIsAddDishModalOpen] = useState(false);
  const [editingDishId, setEditingDishId] = useState(null);
  const [dishFormData, setDishFormData] = useState({
    name: '',
    category: 'Main Course',
    customCategory: '',
    price: '',
    type: 'Veg',
    img: '',
    description: '',
    available: true
  });
  const [dishImageError, setDishImageError] = useState('');
  const [dishImageSizeInfo, setDishImageSizeInfo] = useState('');

  // Fetch Menu from Database
  const fetchMenu = async () => {
    try {
      setLoadingMenu(true);
      const res = await fetch(`${API_BASE_URL}/api/menu`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setMenuItems(data);
      }
    } catch (err) {
      console.error("Error fetching menu items:", err);
    } finally {
      setLoadingMenu(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // Compute dynamic categories from actual dishes
  const defaultCategories = ['Starters', 'Main Course', 'Chinese', 'Breads', 'Rice', 'Drinks', 'Desserts'];
  const extractedCategories = Array.from(new Set(menuItems.map(m => m.category).filter(Boolean)));
  const allUniqueCategories = Array.from(new Set([...defaultCategories, ...extractedCategories]));
  const categories = ['All', ...allUniqueCategories];

  const handleOpenAddDish = () => {
    setEditingDishId(null);
    setDishImageError('');
    setDishImageSizeInfo('');
    setDishFormData({
      name: '',
      category: 'Main Course',
      customCategory: '',
      price: '',
      type: 'Veg',
      img: '',
      description: '',
      available: true
    });
    setIsAddDishModalOpen(true);
  };

  const handleOpenEditDish = (e, item) => {
    e.stopPropagation();
    setEditingDishId(item._id || item.id);
    setDishImageError('');
    setDishImageSizeInfo('');
    setDishFormData({
      name: item.name || '',
      category: item.category || 'Main Course',
      customCategory: '',
      price: item.price || '',
      type: item.type || 'Veg',
      img: item.img || '',
      description: item.description || '',
      available: item.available !== undefined ? item.available : true
    });
    setIsAddDishModalOpen(true);
  };

  const handleDeleteDish = async (e, item) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${item.name}" from the menu?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/menu/${item._id || item.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast(`"${item.name}" deleted from menu!`);
        fetchMenu();
      } else {
        alert("Failed to delete dish.");
      }
    } catch (err) {
      alert("Error deleting dish: " + err.message);
    }
  };

  const handleDishSubmit = async (e) => {
    e.preventDefault();
    if (dishImageError) {
      alert(`⚠️ Please fix the image error:\n${dishImageError}`);
      return;
    }
    if (dishFormData.img && dishFormData.img.startsWith('data:image')) {
      const approxBytes = Math.round(dishFormData.img.length * 0.75);
      if (approxBytes > 1024 * 1024) {
        const sizeMB = (approxBytes / (1024 * 1024)).toFixed(2);
        const sizeKB = Math.round(approxBytes / 1024);
        alert(`❌ Image size is too large (${sizeKB} KB / ${sizeMB} MB)! Maximum allowed limit is 1 MB (1,024 KB). Please choose a smaller image.`);
        return;
      }
    }
    if (!dishFormData.name.trim()) {
      alert("Please enter dish name");
      return;
    }
    if (!dishFormData.price || isNaN(Number(dishFormData.price))) {
      alert("Please enter a valid price");
      return;
    }

    const finalCategory = dishFormData.customCategory && dishFormData.customCategory.trim() !== ''
      ? dishFormData.customCategory.trim()
      : dishFormData.category;

    const payload = {
      name: dishFormData.name.trim(),
      category: finalCategory,
      price: Number(dishFormData.price),
      type: dishFormData.type,
      img: dishFormData.img && dishFormData.img.trim() !== '' ? dishFormData.img.trim() : 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=300&q=80',
      description: dishFormData.description || '',
      available: dishFormData.available !== undefined ? Boolean(dishFormData.available) : true
    };

    try {
      const url = editingDishId 
        ? `${API_BASE_URL}/api/menu/${editingDishId}` 
        : `${API_BASE_URL}/api/menu/add`;
      const method = editingDishId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        showToast(editingDishId ? `"${payload.name}" updated successfully!` : `"${payload.name}" added to menu!`);
        setIsAddDishModalOpen(false);
        setEditingDishId(null);
        fetchMenu();
      } else {
        alert(data.message || "Failed to save dish.");
      }
    } catch (err) {
      alert("Server error saving dish: " + err.message);
    }
  };

  // Table selection for POS
  const handleSelectTable = (table) => {
    setActiveTable(table.name);
    setActiveTableId(table._id);
    setCart(table.order || []);
    setCustomerName(table.customerName || '');
    setCurrentView('pos');
  };

  // Add Table Submit
  const handleAddTableSubmit = async (e) => {
    e.preventDefault();
    if (!tableFormData.name.trim()) {
      alert("Please enter a table name");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/tables/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tableFormData)
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Table "${tableFormData.name}" added successfully!`);
        setIsAddTableOpen(false);
        setTableFormData({ name: '', capacity: 4, floor: 'Main Hall', status: 'Available', customerName: '' });
        fetchTables();
      } else {
        alert(data.message || "Failed to add table");
      }
    } catch (err) {
      alert("Server error adding table: " + err.message);
    }
  };

  // Open Edit Modal
  const handleOpenEditTable = (e, table) => {
    e.stopPropagation();
    setSelectedTableForEdit(table);
    setTableFormData({
      name: table.name,
      capacity: table.capacity || 4,
      floor: table.floor || 'Main Hall',
      status: table.status || 'Available',
      customerName: table.customerName || ''
    });
    setIsEditTableOpen(true);
  };

  // Edit Table Submit
  const handleEditTableSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTableForEdit) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/tables/${selectedTableForEdit._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tableFormData)
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Table "${tableFormData.name}" updated successfully!`);
        setIsEditTableOpen(false);
        setSelectedTableForEdit(null);
        fetchTables();
      } else {
        alert(data.message || "Failed to update table");
      }
    } catch (err) {
      alert("Server error updating table: " + err.message);
    }
  };

  // Delete Table
  const handleDeleteTable = async (e, table) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete ${table.name}?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/tables/${table._id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast(`${table.name} deleted successfully!`);
        fetchTables();
      } else {
        alert("Failed to delete table");
      }
    } catch (err) {
      alert("Server error deleting table: " + err.message);
    }
  };

  // Clear Table
  const handleClearTable = async (e, table) => {
    e.stopPropagation();
    try {
      const res = await fetch(`${API_BASE_URL}/api/tables/${table._id}/clear`, {
        method: 'POST'
      });
      if (res.ok) {
        showToast(`${table.name} cleared to Available!`);
        fetchTables();
      }
    } catch (err) {
      alert("Error clearing table: " + err.message);
    }
  };

  // Cart operations (supports dynamic _id)
  const addToCart = (item) => {
    const itemId = item._id || item.id;
    const existing = cart.find(c => (c._id || c.id) === itemId);
    if (existing) {
      setCart(cart.map(c => ((c._id || c.id) === itemId) ? { ...c, qty: c.qty + 1 } : c));
    } else {
      setCart([...cart, { ...item, id: itemId, _id: itemId, qty: 1 }]);
    }
  };

  const updateQty = (id, delta) => {
    setCart(cart.map(c => {
      const cId = c._id || c.id;
      if (cId === id) {
        const newQty = c.qty + delta;
        return newQty > 0 ? { ...c, qty: newQty } : null;
      }
      return c;
    }).filter(Boolean));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const tax = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + tax;

  const filteredMenu = menuItems.filter(item => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // COMPLETE ORDER & SAVE TO ORDERS DATABASE
  const handleCompleteOrder = async () => {
    if (cart.length === 0) {
      alert("Cart is empty! Please add items first.");
      return;
    }

    const isChargedToRoom = paymentOption === 'Charge to Room (Pay at Checkout)';
    const cleanRoomNum = isChargedToRoom 
      ? (selectedOccupiedRoomNo ? String(selectedOccupiedRoomNo).replace(/[^0-9]/g, '') : roomDeliveryNumber.replace(/[^0-9]/g, ''))
      : (orderType === 'Room Service' ? roomDeliveryNumber.replace(/[^0-9]/g, '') : '');

    const selectedRoomObj = occupiedRooms.find(r => String(r.roomNumber) === String(cleanRoomNum));

    const finalCustomer = isChargedToRoom
      ? (selectedRoomObj?.guest && selectedRoomObj.guest !== 'Unassigned' ? selectedRoomObj.guest : (customerName.trim() || `Room ${cleanRoomNum} Guest`))
      : (customerName.trim() !== '' ? customerName.trim() : 'Walk-in Guest');

    const finalPhone = isChargedToRoom
      ? (selectedRoomObj?.phone && selectedRoomObj.phone !== '-' ? selectedRoomObj.phone : (customerPhone.trim() || '-'))
      : (customerPhone.trim() !== '' ? customerPhone.trim() : '-');

    const targetTableOrRoom = isChargedToRoom
      ? `Room ${cleanRoomNum}`
      : (orderType === 'Room Service' ? (roomDeliveryNumber.toLowerCase().includes('room') ? roomDeliveryNumber : `Room ${roomDeliveryNumber}`) : (orderType === 'Takeaway' ? 'Takeaway Counter' : activeTable));

    const orderPayload = {
      customerName: finalCustomer,
      phone: finalPhone,
      orderType: isChargedToRoom ? (orderType === 'Room Service' ? 'Room Service' : `Dine-In (Charged to Room ${cleanRoomNum})`) : orderType,
      tableNumber: targetTableOrRoom,
      roomNumber: cleanRoomNum,
      paymentMode: isChargedToRoom ? 'Charge to Room (Pay at Checkout)' : 'Cash / Paid at POS',
      isPaid: !isChargedToRoom,
      status: isChargedToRoom ? 'Pending at Checkout' : 'Completed',
      items: cart,
      subtotal,
      tax,
      totalAmount: grandTotal,
      date: new Date().toLocaleString()
    };

    setSavingOrder(true);

    try {
      // 1. Save to Orders API
      const orderRes = await fetch(`${API_BASE_URL}/api/orders/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        throw new Error(orderData.message || 'Failed to save order in database');
      }

      // 2. Update Table status in database if table is active and not charging to room
      if (activeTableId && !isChargedToRoom) {
        await fetch(`${API_BASE_URL}/api/tables/${activeTableId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'Bill Pending',
            customerName: finalCustomer,
            guests: cart.reduce((acc, item) => acc + item.qty, 0),
            order: cart
          })
        });
      }

      const assignedBillNo = orderData.order?.billNo || 'ORD-SYNCED';
      setLastOrder({ ...orderPayload, billNo: assignedBillNo });

      if (isChargedToRoom) {
        showToast(`🏨 Order of ₹${grandTotal} charged to Room ${cleanRoomNum}! (Will settle at Checkout)`);
        alert(`Success! Food order (Bill ${assignedBillNo}) of ₹${grandTotal} has been attached to Room ${cleanRoomNum}'s checkout folio.`);
        setCart([]);
      } else {
        showToast(`Order for ${activeTable} saved to Orders Database! (Bill: ${assignedBillNo})`);
        fetchTables();
        setTimeout(() => {
          window.print();
        }, 150);
      }

    } catch (err) {
      console.error("Order completion error:", err);
      alert("Error saving order: " + err.message);
    } finally {
      setSavingOrder(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full text-base p-2 sm:p-4 font-sans bg-slate-50 min-h-screen">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-xs font-black animate-in fade-in flex items-center gap-2 border border-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          {toastMessage}
        </div>
      )}

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-receipt, #printable-receipt * { visibility: visible; }
          #printable-receipt {
            position: absolute; left: 0; top: 0; width: 100%; padding: 20px; background: white; color: black;
          }
        }
      `}</style>

      {/* Printable Receipt Section */}
      <div id="printable-receipt" className="hidden print:block">
        {lastOrder && (
          <div className="max-w-md mx-auto text-slate-900 space-y-4 p-4 border rounded-xl">
            <div className="text-center space-y-1 pb-3 border-b border-dashed">
              <h1 className="text-2xl font-black">THE GREEN VALLEY HOTEL</h1>
              <p className="text-sm font-medium">Restaurant POS & Dining Receipt</p>
              <p className="text-xs text-slate-500">{lastOrder.date} &bull; Bill: {lastOrder.billNo}</p>
            </div>
            <div className="text-sm space-y-1 pb-3 border-b border-dashed">
              <p><strong>Customer:</strong> {lastOrder.customerName}</p>
              <p><strong>Phone:</strong> {lastOrder.phone}</p>
              <p><strong>Order Type:</strong> {lastOrder.orderType}</p>
              <p><strong>Table / Room:</strong> {lastOrder.tableNumber}</p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-1">Item</th>
                  <th className="text-center py-1">Qty</th>
                  <th className="text-right py-1">Price</th>
                  <th className="text-right py-1">Total</th>
                </tr>
              </thead>
              <tbody>
                {lastOrder.items.map((item, index) => (
                  <tr key={index} className="border-b border-slate-100">
                    <td className="py-2">{item.name}</td>
                    <td className="text-center py-2">{item.qty}</td>
                    <td className="text-right py-2">₹{item.price}</td>
                    <td className="text-right py-2">₹{item.price * item.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="space-y-1.5 pt-2 text-sm border-t border-dashed">
              <div className="flex justify-between"><span>Subtotal:</span><span>₹{lastOrder.subtotal}</span></div>
              <div className="flex justify-between"><span>GST (5%):</span><span>₹{lastOrder.tax}</span></div>
              <div className="flex justify-between text-base font-bold pt-1 border-t">
                <span>Grand Total:</span><span>₹{lastOrder.totalAmount}</span>
              </div>
            </div>
            <div className="text-center pt-4 text-xs text-slate-500 border-t border-dashed">
              <p>Order registered in system &bull; Thank you for dining with us!</p>
            </div>
          </div>
        )}
      </div>

      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <UtensilsCrossed className="w-8 h-8 text-blue-600" /> Restaurant POS Dashboard
            </h2>
          </div>
          <p className="text-sm text-slate-600 font-bold mt-1">
            The Green Valley Hotel & Resorts &bull; Manage tables, take dining orders & save live orders to database
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {currentView === 'tables' ? (
            <div className="flex items-center gap-2.5 flex-wrap">
              <button 
                onClick={() => setIsAddTableOpen(true)}
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl flex items-center gap-2 shadow-md shadow-emerald-500/20 cursor-pointer transition-all"
              >
                <Plus className="w-5 h-5" /> Add New Table
              </button>
              <button 
                onClick={() => setCurrentView('pos')}
                className="px-5 py-3 bg-blue-600 text-white font-black text-sm rounded-2xl flex items-center gap-2 shadow-md hover:bg-blue-700 cursor-pointer transition-all"
              >
                <ShoppingBag className="w-5 h-5" /> Open Quick POS
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setCurrentView('tables')}
              className="px-5 py-3 bg-slate-900 text-white font-black text-sm rounded-2xl flex items-center gap-2 shadow-md hover:bg-slate-800 cursor-pointer transition-all"
            >
              <Grid className="w-5 h-5" /> Back to Tables ({tables.length})
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: TABLE STATUS & MANAGEMENT LAYOUT */}
      {currentView === 'tables' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                Dining Table Status ({tables.length} Tables)
              </h3>
              <p className="text-xs text-slate-500 font-bold">Click on any table to take an order, or use Edit/Delete buttons to manage</p>
            </div>

            <div className="flex items-center gap-3 text-xs font-bold flex-wrap">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> Available</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span> Occupied</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block"></span> Reserved</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-orange-500 inline-block"></span> Bill Pending</span>
            </div>
          </div>

          {loadingTables ? (
            <div className="text-center py-16 font-bold text-slate-400">Loading dining tables from database...</div>
          ) : tables.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8 space-y-3">
              <UtensilsCrossed className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="font-black text-slate-800 text-lg">No Tables Configured</h4>
              <p className="text-xs text-slate-400 font-bold">Click "Add New Table" to create your first restaurant dining table.</p>
              <button 
                onClick={() => setIsAddTableOpen(true)}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black shadow-md inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Table Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {tables.map((table) => {
                let statusBg = 'bg-emerald-50/80 border-emerald-200 text-emerald-900';
                let badgeBg = 'bg-emerald-500 text-white';
                if (table.status === 'Occupied') {
                  statusBg = 'bg-rose-50/80 border-rose-200 text-rose-900';
                  badgeBg = 'bg-rose-500 text-white';
                } else if (table.status === 'Reserved') {
                  statusBg = 'bg-amber-50/80 border-amber-200 text-amber-900';
                  badgeBg = 'bg-amber-500 text-white';
                } else if (table.status === 'Bill Pending') {
                  statusBg = 'bg-orange-50/80 border-orange-200 text-orange-900';
                  badgeBg = 'bg-orange-500 text-white';
                }

                return (
                  <div 
                    key={table._id}
                    onClick={() => handleSelectTable(table)}
                    className={`p-6 rounded-3xl border-2 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group relative ${statusBg}`}
                  >
                    <div>
                      {/* Top Header: Table Name & Actions */}
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="text-2xl font-black">{table.name}</h4>
                          <span className="text-[11px] font-black text-slate-500 flex items-center gap-1 mt-0.5">
                            <Layers className="w-3 h-3" /> {table.floor || 'Main Hall'} &bull; {table.capacity || 4} Seats
                          </span>
                        </div>

                        {/* Action buttons (Edit & Delete) */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            title="Edit Table"
                            onClick={(e) => handleOpenEditTable(e, table)}
                            className="p-2 rounded-xl bg-white/80 hover:bg-white text-slate-700 hover:text-blue-600 shadow-xs transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            title="Delete Table"
                            onClick={(e) => handleDeleteTable(e, table)}
                            className="p-2 rounded-xl bg-white/80 hover:bg-rose-50 text-slate-700 hover:text-rose-600 shadow-xs transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide inline-block ${badgeBg}`}>
                          {table.status}
                        </span>
                      </div>

                      {/* Guest Name & Items Ordered */}
                      <div className="space-y-1.5 my-3 bg-white/70 p-3.5 rounded-2xl border border-black/5">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-wide">Guest Information</p>
                        <p className="text-base font-black text-slate-900">
                          {table.customerName ? table.customerName : 'No Guest Assigned'}
                        </p>
                        <p className="text-xs font-bold text-slate-600">
                          {table.status !== 'Available' 
                            ? `${(table.order || []).reduce((acc, i) => acc + i.qty, 0)} Items in Kitchen/Cart` 
                            : 'Table Clean & Ready'}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-3 border-t border-black/10 flex items-center justify-between text-xs">
                      <span className="font-black text-blue-600 group-hover:underline flex items-center gap-1">
                        <ShoppingBag className="w-3.5 h-3.5" /> Tap to Open POS
                      </span>
                      {table.status !== 'Available' && (
                        <button 
                          onClick={(e) => handleClearTable(e, table)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black cursor-pointer shadow-sm transition-all"
                        >
                          Clear Table
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: POS ORDER & BILLING SCREEN */}
      {currentView === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setCurrentView('tables')}
                    className="text-sm font-black text-blue-600 flex items-center gap-1.5 hover:underline cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Dining Tables
                  </button>

                  <button 
                    onClick={handleOpenAddDish}
                    className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl text-xs font-black shadow-md shadow-orange-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add New Dish
                  </button>
                </div>

                <span className="text-xs font-black bg-blue-100 text-blue-800 px-3 py-1.5 rounded-xl border border-blue-200">
                  Active Table: {activeTable}
                </span>
              </div>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-5 h-5" />
                </span>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search dishes by name or category..." 
                  className="w-full pl-11 pr-4 py-3 bg-[#F4F7FE] border border-slate-200 rounded-2xl text-sm text-slate-900 font-bold focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25' 
                        : 'bg-[#F4F7FE] text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {loadingMenu ? (
              <div className="text-center py-12 text-sm font-bold text-slate-400">Loading restaurant menu from database...</div>
            ) : filteredMenu.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 p-8 space-y-3">
                <UtensilsCrossed className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-black text-slate-800 text-base">No dishes found</h4>
                <p className="text-xs text-slate-400 font-bold">Click "+ Add Dish" to add dishes to your restaurant menu.</p>
                <button onClick={handleOpenAddDish} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black cursor-pointer">
                  + Add First Dish
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredMenu.map((item) => (
                  <div 
                    key={item._id || item.id} 
                    onClick={() => addToCart(item)}
                    className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer group flex flex-col justify-between relative overflow-hidden"
                  >
                    <div>
                      <div className="w-full h-36 rounded-2xl overflow-hidden mb-3 relative bg-slate-100">
                        <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        
                        <span className="absolute top-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[10px] font-black px-2.5 py-1 rounded-xl">
                          {item.category}
                        </span>

                        <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-lg text-[10px] font-black shadow-xs ${
                          item.type === 'Non-Veg' ? 'bg-rose-100 text-rose-700 border border-rose-300' :
                          item.type === 'Beverage' ? 'bg-blue-100 text-blue-700 border border-blue-300' :
                          item.type === 'Dessert' ? 'bg-purple-100 text-purple-700 border border-purple-300' :
                          'bg-emerald-100 text-emerald-700 border border-emerald-300'
                        }`}>
                          {item.type === 'Non-Veg' ? '🔴 Non-Veg' : item.type === 'Beverage' ? '🧃 Drink' : item.type === 'Dessert' ? '🍰 Sweet' : '🟢 Veg'}
                        </span>

                        {/* Quick Edit & Delete icons */}
                        <div className="absolute bottom-2 right-2 flex items-center gap-1.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button 
                            type="button" 
                            onClick={(e) => handleOpenEditDish(e, item)}
                            className="p-1.5 bg-white/95 hover:bg-blue-600 hover:text-white text-slate-700 rounded-lg shadow-sm transition-colors cursor-pointer"
                            title="Edit Dish"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            type="button" 
                            onClick={(e) => handleDeleteDish(e, item)}
                            className="p-1.5 bg-white/95 hover:bg-rose-600 hover:text-white text-rose-600 rounded-lg shadow-sm transition-colors cursor-pointer"
                            title="Delete Dish"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h4 className="font-black text-base text-slate-900 group-hover:text-blue-600 leading-tight transition-colors">
                        {item.name}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                      <span className="font-black text-lg text-slate-900">₹{Number(item.price).toLocaleString()}</span>
                      <button 
                        type="button"
                        className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-all shadow-xs"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* BILLING / CART SIDEBAR */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-blue-600" /> Current Bill ({activeTable})
                </h3>
                <span className="text-xs bg-emerald-50 text-emerald-800 font-black px-3 py-1 rounded-xl">
                  {cart.length} Items
                </span>
              </div>

              <div className="space-y-4 mb-4">
                {/* Order Type Toggle */}
                <div className="grid grid-cols-3 gap-2">
                  {['Dine-In', 'Takeaway', 'Room Service'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setOrderType(type)}
                      className={`py-2 rounded-xl text-xs font-black border transition-colors cursor-pointer ${
                        orderType === type ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-[#F4F7FE] text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {/* Payment & Hotel Folio Selector */}
                <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPaymentOption('Pay Now')}
                    className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      paymentOption === 'Pay Now' 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    💵 Pay Now (POS)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentOption('Charge to Room (Pay at Checkout)');
                      fetchOccupiedRooms();
                    }}
                    className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      paymentOption === 'Charge to Room (Pay at Checkout)' 
                        ? 'bg-amber-600 text-white shadow-sm' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🏨 Charge to Room (Checkout)
                  </button>
                </div>

                {/* CHARGE TO ROOM DROPDOWN (Hotel Guest Integration) */}
                {paymentOption === 'Charge to Room (Pay at Checkout)' && (
                  <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200/90 space-y-2.5 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] text-amber-900 font-black uppercase tracking-wide">
                        🏨 Link Food Order to Occupied Room
                      </label>
                      <button 
                        type="button"
                        onClick={fetchOccupiedRooms}
                        className="text-[10px] text-amber-700 hover:text-amber-900 font-black underline cursor-pointer"
                      >
                        Refresh Rooms
                      </button>
                    </div>

                    {occupiedRooms.length > 0 ? (
                      <select 
                        value={selectedOccupiedRoomNo}
                        onChange={(e) => {
                          const rmNo = e.target.value;
                          setSelectedOccupiedRoomNo(rmNo);
                          const found = occupiedRooms.find(r => String(r.roomNumber) === String(rmNo));
                          if (found) {
                            setCustomerName(found.guest && found.guest !== 'Unassigned' ? found.guest : '');
                            setCustomerPhone(found.phone && found.phone !== '-' ? found.phone : '');
                          }
                        }}
                        className="w-full px-3 py-2.5 bg-white border border-amber-300 rounded-xl text-xs font-black text-slate-900 focus:outline-none cursor-pointer"
                      >
                        {occupiedRooms.map(rm => (
                          <option key={rm._id || rm.roomNumber} value={rm.roomNumber}>
                            Room {rm.roomNumber} &bull; Guest: {rm.guest || 'Active Guest'} ({rm.roomType})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="space-y-1.5">
                        <p className="text-[11px] text-amber-800 font-bold">
                          No rooms currently marked Occupied in system. Enter room number manually:
                        </p>
                        <input 
                          type="text" 
                          value={selectedOccupiedRoomNo} 
                          onChange={(e) => setSelectedOccupiedRoomNo(e.target.value)} 
                          placeholder="e.g. 101 or 204"
                          className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none" 
                        />
                      </div>
                    )}

                    <p className="text-[10px] text-amber-700 font-bold">
                      * This bill will NOT require payment now. It automatically links to Room {selectedOccupiedRoomNo || 'guest'} and appears on their final checkout tax invoice!
                    </p>
                  </div>
                )}

                {orderType === 'Room Service' && paymentOption !== 'Charge to Room (Pay at Checkout)' && (
                  <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200">
                    <label className="block text-[11px] text-emerald-800 font-black uppercase mb-1">
                      🏨 Delivering to Room Number *
                    </label>
                    <input 
                      type="text" 
                      value={roomDeliveryNumber} 
                      onChange={(e) => setRoomDeliveryNumber(e.target.value)} 
                      placeholder="e.g. Room 101, Room 203"
                      className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none" 
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-500 font-black uppercase mb-1">Customer / Guest Name</label>
                    <input 
                      type="text" 
                      value={customerName} 
                      onChange={(e) => setCustomerName(e.target.value)} 
                      placeholder="e.g. Guest Name"
                      className="w-full px-3 py-2 bg-[#F4F7FE] border rounded-xl text-xs font-bold text-slate-900 focus:outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 font-black uppercase mb-1">Phone Number</label>
                    <input 
                      type="text" 
                      value={customerPhone} 
                      onChange={(e) => setCustomerPhone(e.target.value)} 
                      placeholder="e.g. 9876543210"
                      className="w-full px-3 py-2 bg-[#F4F7FE] border rounded-xl text-xs font-bold text-slate-900 focus:outline-none" 
                    />
                  </div>
                </div>
              </div>

              {/* Items in Cart */}
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <p className="text-center text-slate-400 py-10 font-bold text-xs">No items added to cart yet.</p>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2.5 bg-[#F4F7FE] rounded-2xl gap-2">
                      <div className="flex-1 min-w-0 pr-1">
                        <h4 className="font-black text-xs text-slate-900 truncate">{item.name}</h4>
                        <p className="text-[10px] text-slate-500 font-bold">₹{item.price} each</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 bg-white rounded-lg shadow-xs flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"><Minus className="w-3 h-3" /></button>
                        <span className="text-xs font-black w-4 text-center">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 bg-white rounded-lg shadow-xs flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"><Plus className="w-3 h-3" /></button>
                      </div>
                      <span className="w-14 text-right font-black text-xs text-slate-900">₹{item.price * item.qty}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
              <div className="space-y-1.5 text-xs font-bold text-slate-700">
                <div className="flex justify-between"><span>Subtotal</span><span className="text-slate-900 font-black">₹{subtotal}</span></div>
                <div className="flex justify-between"><span>GST (5%)</span><span className="text-slate-900 font-black">₹{tax}</span></div>
                <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t">
                  <span>Grand Total</span><span className="text-blue-600 text-lg font-black">₹{grandTotal}</span>
                </div>
              </div>

              <button 
                onClick={handleCompleteOrder}
                disabled={savingOrder || cart.length === 0}
                className={`w-full py-3.5 text-white font-black text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 ${
                  paymentOption === 'Charge to Room (Pay at Checkout)'
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-amber-500/25'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/25'
                }`}
              >
                {savingOrder ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : paymentOption === 'Charge to Room (Pay at Checkout)' ? (
                  <>
                    <UtensilsCrossed className="w-4 h-4" />
                    <span>🏨 Charge to Room {selectedOccupiedRoomNo || ''} (Pay at Checkout)</span>
                  </>
                ) : (
                  <>
                    <Printer className="w-4 h-4" />
                    <span>Print Bill & Save to Orders</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD TABLE */}
      {isAddTableOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" /> Add New Table
              </h3>
              <button onClick={() => setIsAddTableOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTableSubmit} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-500 uppercase tracking-wider mb-1">Table Name / Number *</label>
                <input 
                  type="text" 
                  value={tableFormData.name}
                  onChange={(e) => setTableFormData({ ...tableFormData, name: e.target.value })}
                  placeholder="e.g. Table 7 or VIP 1"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#F4F7FE] border rounded-xl text-slate-900 font-bold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 uppercase tracking-wider mb-1">Capacity (Seats)</label>
                  <input 
                    type="number" 
                    value={tableFormData.capacity}
                    onChange={(e) => setTableFormData({ ...tableFormData, capacity: e.target.value })}
                    min="1"
                    max="30"
                    className="w-full px-3.5 py-2.5 bg-[#F4F7FE] border rounded-xl text-slate-900 font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 uppercase tracking-wider mb-1">Area / Floor</label>
                  <select 
                    value={tableFormData.floor}
                    onChange={(e) => setTableFormData({ ...tableFormData, floor: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#F4F7FE] border rounded-xl text-slate-900 font-black focus:outline-none cursor-pointer"
                  >
                    <option value="Main Hall">Main Hall</option>
                    <option value="Garden Area">Garden Area</option>
                    <option value="Rooftop">Rooftop</option>
                    <option value="Family Corner">Family Corner</option>
                    <option value="VIP Lounge">VIP Lounge</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 uppercase tracking-wider mb-1">Initial Status</label>
                <select 
                  value={tableFormData.status}
                  onChange={(e) => setTableFormData({ ...tableFormData, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#F4F7FE] border rounded-xl text-slate-900 font-black focus:outline-none cursor-pointer"
                >
                  <option value="Available">Available</option>
                  <option value="Occupied">Occupied</option>
                  <option value="Reserved">Reserved</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button 
                  type="button" 
                  onClick={() => setIsAddTableOpen(false)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-black cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black shadow-md cursor-pointer"
                >
                  Create Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT TABLE */}
      {isEditTableOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-600" /> Edit Table Details
              </h3>
              <button onClick={() => setIsEditTableOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditTableSubmit} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-500 uppercase tracking-wider mb-1">Table Name / Number *</label>
                <input 
                  type="text" 
                  value={tableFormData.name}
                  onChange={(e) => setTableFormData({ ...tableFormData, name: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-[#F4F7FE] border rounded-xl text-slate-900 font-bold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 uppercase tracking-wider mb-1">Capacity (Seats)</label>
                  <input 
                    type="number" 
                    value={tableFormData.capacity}
                    onChange={(e) => setTableFormData({ ...tableFormData, capacity: e.target.value })}
                    min="1"
                    className="w-full px-3.5 py-2.5 bg-[#F4F7FE] border rounded-xl text-slate-900 font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 uppercase tracking-wider mb-1">Area / Floor</label>
                  <select 
                    value={tableFormData.floor}
                    onChange={(e) => setTableFormData({ ...tableFormData, floor: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#F4F7FE] border rounded-xl text-slate-900 font-black focus:outline-none cursor-pointer"
                  >
                    <option value="Main Hall">Main Hall</option>
                    <option value="Garden Area">Garden Area</option>
                    <option value="Rooftop">Rooftop</option>
                    <option value="Family Corner">Family Corner</option>
                    <option value="VIP Lounge">VIP Lounge</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 uppercase tracking-wider mb-1">Status</label>
                <select 
                  value={tableFormData.status}
                  onChange={(e) => setTableFormData({ ...tableFormData, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#F4F7FE] border rounded-xl text-slate-900 font-black focus:outline-none cursor-pointer"
                >
                  <option value="Available">Available</option>
                  <option value="Occupied">Occupied</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Bill Pending">Bill Pending</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 uppercase tracking-wider mb-1">Assigned Guest Name</label>
                <input 
                  type="text" 
                  value={tableFormData.customerName}
                  onChange={(e) => setTableFormData({ ...tableFormData, customerName: e.target.value })}
                  placeholder="Guest name (optional)"
                  className="w-full px-3.5 py-2.5 bg-[#F4F7FE] border rounded-xl text-slate-900 font-bold focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button 
                  type="button" 
                  onClick={() => setIsEditTableOpen(false)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-black cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="w-1/2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD / EDIT MENU DISH */}
      {isAddDishModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-amber-500" />
                {editingDishId ? 'Edit Dish Details' : 'Add New Dish to Restaurant Menu'}
              </h3>
              <button onClick={() => setIsAddDishModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDishSubmit} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-500 uppercase tracking-wider mb-1">Dish Name *</label>
                <input 
                  type="text" 
                  value={dishFormData.name}
                  onChange={(e) => setDishFormData({ ...dishFormData, name: e.target.value })}
                  placeholder="e.g. Paneer Butter Masala, Chicken Tikka"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#F4F7FE] border rounded-xl text-slate-900 font-bold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 uppercase tracking-wider mb-1">Category *</label>
                  <select 
                    value={dishFormData.category}
                    onChange={(e) => setDishFormData({ ...dishFormData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#F4F7FE] border rounded-xl text-slate-900 font-black focus:outline-none cursor-pointer"
                  >
                    {defaultCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="Custom">+ Custom Category</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 uppercase tracking-wider mb-1">Dish Type</label>
                  <select 
                    value={dishFormData.type}
                    onChange={(e) => setDishFormData({ ...dishFormData, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#F4F7FE] border rounded-xl text-slate-900 font-black focus:outline-none cursor-pointer"
                  >
                    <option value="Veg">🟢 Pure Veg</option>
                    <option value="Non-Veg">🔴 Non-Veg</option>
                    <option value="Beverage">🧃 Beverage / Drink</option>
                    <option value="Dessert">🍰 Dessert / Sweet</option>
                  </select>
                </div>
              </div>

              {dishFormData.category === 'Custom' && (
                <div>
                  <label className="block text-slate-500 uppercase tracking-wider mb-1">Enter Custom Category Name</label>
                  <input 
                    type="text" 
                    value={dishFormData.customCategory}
                    onChange={(e) => setDishFormData({ ...dishFormData, customCategory: e.target.value })}
                    placeholder="e.g. Tandoori, Mocktails, Italian"
                    className="w-full px-3.5 py-2.5 bg-[#F4F7FE] border rounded-xl text-slate-900 font-bold focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-500 uppercase tracking-wider mb-1">Price in INR (₹) *</label>
                <input 
                  type="number" 
                  value={dishFormData.price}
                  onChange={(e) => setDishFormData({ ...dishFormData, price: e.target.value })}
                  placeholder="e.g. 280"
                  required
                  min="0"
                  className="w-full px-3.5 py-2.5 bg-[#F4F7FE] border rounded-xl text-slate-900 font-bold focus:outline-none"
                />
              </div>

              {/* Photo Upload or URL with Max 1 MB Limit & Red Error Display */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-700 uppercase tracking-wider text-xs font-black">
                    Dish Photo (Max 1 MB)
                  </label>
                  <span className="text-[11px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    Rule: Max 1 MB (1,024 KB)
                  </span>
                </div>

                {/* PERMANENT VALIDATION NOTICE ON MODAL */}
                <div className="p-2.5 bg-blue-50/90 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-start gap-2 shadow-xs">
                  <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-black text-blue-900">📌 Image Validation Rule:</p>
                    <p className="text-[11px] font-semibold text-blue-700 mt-0.5">
                      Kripya <strong>1 MB (1,024 KB)</strong> se kam size ki photo upload karein. Agar photo 1 MB se badi hogi toh save nahi hogi.
                    </p>
                  </div>
                </div>

                <div className={`grid grid-cols-2 gap-3 items-center p-2 rounded-2xl border transition-all ${dishImageError ? 'border-red-500 bg-red-50/70 ring-2 ring-red-200' : 'border-slate-200 bg-[#F4F7FE]'}`}>
                  <label className={`w-full py-2.5 px-3 rounded-xl text-center font-black cursor-pointer border block truncate text-xs transition-colors shadow-xs ${dishImageError ? 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200' : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200'}`}>
                    📁 Choose Photo
                    <input 
                      type="file" 
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const maxBytes = 1 * 1024 * 1024; // 1 MB (1024 KB)
                          const fileSizeKB = Math.round(file.size / 1024);
                          const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
                          
                          if (file.size > maxBytes) {
                            // Clear image and trigger immediate error alert
                            setDishFormData(prev => ({ ...prev, img: '' }));
                            setDishImageError(`⚠️ Photo size bohot badi hai (${fileSizeKB} KB / ${fileSizeMB} MB)! Maximum limit 1 MB (1,024 KB) hai. Kripya 1 MB se choti image select karein.`);
                            setDishImageSizeInfo('');
                            e.target.value = '';
                            alert(`❌ Image Size Error!\n\nAapki chuni hui photo ${fileSizeKB} KB (${fileSizeMB} MB) ki hai, jo ki 1 MB (1,024 KB) limit se badi hai.\n\nKripya 1 MB se kam size ki image upload karein!`);
                            return;
                          }
                          
                          setDishImageError('');
                          setDishImageSizeInfo(`${fileSizeKB} KB (${fileSizeMB} MB)`);
                          
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setDishFormData(prev => ({ ...prev, img: reader.result }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  
                  <input 
                    type="text" 
                    value={dishFormData.img && !dishFormData.img.startsWith('data:') ? dishFormData.img : ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val && val.startsWith('data:image')) {
                        const approxBytes = Math.round(val.length * 0.75);
                        if (approxBytes > 1024 * 1024) {
                          const sizeMB = (approxBytes / (1024 * 1024)).toFixed(2);
                          const sizeKB = Math.round(approxBytes / 1024);
                          setDishImageError(`⚠️ Image size is too large (${sizeKB} KB / ${sizeMB} MB)! Maximum limit is 1 MB (1,024 KB).`);
                          alert(`❌ Image size is too large (${sizeKB} KB / ${sizeMB} MB)! Maximum limit is 1 MB (1,024 KB).`);
                          return;
                        }
                      }
                      setDishImageError('');
                      setDishImageSizeInfo('');
                      setDishFormData({ ...dishFormData, img: val });
                    }}
                    placeholder="Or paste Image URL"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none text-xs"
                  />
                </div>

                {/* RED ERROR BOX WHEN IMAGE EXCEEDS 1 MB */}
                {dishImageError && (
                  <div className="flex items-start gap-2.5 p-3 bg-red-50 border-2 border-red-500 rounded-xl text-red-600 text-xs font-bold shadow-xs">
                    <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5 animate-bounce" />
                    <div className="space-y-0.5">
                      <p className="font-black text-red-700 text-xs leading-snug">{dishImageError}</p>
                      <p className="text-[11px] text-red-500 font-semibold">
                        Kripya 1 MB (1,024 KB) se kam size ki image upload karein (Aap image compress kar sakte hain ya screenshot le sakte hain).
                      </p>
                    </div>
                  </div>
                )}

                {/* VALID IMAGE PREVIEW & BADGE */}
                {dishFormData.img && !dishImageError && (
                  <div className="flex items-center gap-3 p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl">
                    <div className="w-14 h-14 rounded-lg overflow-hidden border border-emerald-300 shrink-0 shadow-xs">
                      <img src={dishFormData.img} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                        ✓ Image Selected: {dishImageSizeInfo || 'Valid'} (Under 1 MB)
                      </span>
                      <p className="text-[11px] text-slate-500 truncate mt-1">Ready to save with dish</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setDishFormData(prev => ({ ...prev, img: '' }));
                        setDishImageSizeInfo('');
                        setDishImageError('');
                      }}
                      className="px-2.5 py-1 text-xs font-black text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox"
                  id="dishAvailableCheck"
                  checked={dishFormData.available}
                  onChange={(e) => setDishFormData({ ...dishFormData, available: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="dishAvailableCheck" className="text-slate-700 font-bold cursor-pointer">
                  In Stock & Available to Order in POS
                </label>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsAddDishModalOpen(false)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-black cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={Boolean(dishImageError)}
                  className={`w-1/2 py-2.5 rounded-xl font-black shadow-md transition-all ${
                    dishImageError 
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60' 
                      : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white cursor-pointer'
                  }`}
                >
                  {editingDishId ? 'Save Changes' : 'Add to Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
