import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import { 
  BedDouble, 
  Search, 
  Plus, 
  Minus,
  CheckCircle2, 
  Clock, 
  Users, 
  X, 
  Trash2, 
  Edit3, 
  Image as ImageIcon,
  Wifi,
  Tv,
  Coffee,
  Sparkles,
  Phone,
  UserCheck,
  Building,
  RefreshCw,
  Calendar,
  CreditCard,
  Printer,
  Receipt,
  UtensilsCrossed,
  ShieldCheck,
  Check,
  ChevronRight,
  Flame,
  Wind,
  AlertCircle
} from 'lucide-react';

export default function RoomsPage() {
  const [roomsList, setRoomsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const location = useLocation();
  const navigate = useNavigate();

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState(null);
  
  // Check-In Modal State
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState(null);
  const [checkInForm, setCheckInForm] = useState({
    guestName: '',
    phone: '',
    idProof: 'Aadhaar Card',
    numberOfGuests: 2,
    checkInDate: new Date().toISOString().split('T')[0],
    checkOutDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    nights: 1,
    advancePayment: 0
  });

  // Consolidated Checkout Modal State
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedRoomForCheckout, setSelectedRoomForCheckout] = useState(null);
  const [checkoutDays, setCheckoutDays] = useState(1);
  const [checkoutFoodItems, setCheckoutFoodItems] = useState([]);
  const [checkoutFoodTotal, setCheckoutFoodTotal] = useState(0);
  const [loadingFoodItems, setLoadingFoodItems] = useState(false);
  const [checkoutPaymentMode, setCheckoutPaymentMode] = useState('UPI / QR Code');
  const [postCheckoutStatus, setPostCheckoutStatus] = useState('Cleaning');
  const [finalInvoiceData, setFinalInvoiceData] = useState(null);
  const [processingCheckout, setProcessingCheckout] = useState(false);

  // Add / Edit Room Form State
  const [formData, setFormData] = useState({
    roomNumber: '',
    roomType: 'Deluxe AC',
    acType: 'AC',
    price: '',
    status: 'Available',
    floor: '1st Floor',
    guest: '',
    phone: '',
    amenities: ['Free WiFi', 'Smart TV', 'Room Service'],
    img: ''
  });
  const [roomImageError, setRoomImageError] = useState('');
  const [roomImageSizeInfo, setRoomImageSizeInfo] = useState('');

  // Sync search query from URL parameter if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [location.search]);

  // Fetch rooms from backend
  const fetchRooms = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/rooms`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRoomsList(data);
        }
      })
      .catch(err => {
        console.error("Error fetching rooms:", err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // Compute live room counts
  const totalCount = roomsList.length;
  const availableCount = roomsList.filter(r => r.status === 'Available').length;
  const occupiedCount = roomsList.filter(r => r.status === 'Occupied').length;
  const cleaningCount = roomsList.filter(r => r.status === 'Cleaning').length;
  const reservedCount = roomsList.filter(r => r.status === 'Reserved').length;

  // 1. OPEN QUICK CHECK-IN MODAL
  const handleOpenQuickCheckIn = (room) => {
    setSelectedRoomForBooking(room);
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    setCheckInForm({
      guestName: '',
      phone: '',
      idProof: 'Aadhaar Card',
      numberOfGuests: 2,
      checkInDate: today,
      checkOutDate: tomorrow,
      nights: 1,
      advancePayment: 0
    });
    setCheckInModalOpen(true);
  };

  // Recalculate nights when dates change in Check-In modal
  const handleCheckInDateChange = (from, to) => {
    const dFrom = new Date(from);
    const dTo = new Date(to);
    const diffTime = dTo.getTime() - dFrom.getTime();
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    setCheckInForm(prev => ({
      ...prev,
      checkInDate: from,
      checkOutDate: to,
      nights: diffDays
    }));
  };

  // Check-In Submit
  const handleQuickCheckInSubmit = async (e) => {
    e.preventDefault();
    if (!checkInForm.guestName.trim()) {
      alert("Please enter guest name.");
      return;
    }
    const nights = Math.max(1, Number(checkInForm.nights) || 1);
    const pricePerNight = Number(selectedRoomForBooking.price) || 0;
    const roomTariff = pricePerNight * nights;
    const advancePaid = Number(checkInForm.advancePayment) || 0;

    try {
      // 1. Update room status to Occupied with stay duration and dates
      const updateRes = await fetch(`${API_BASE_URL}/api/rooms/${selectedRoomForBooking._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Occupied',
          guest: checkInForm.guestName.trim(),
          phone: checkInForm.phone.trim() || '-',
          checkInDate: checkInForm.checkInDate,
          checkOutDate: checkInForm.checkOutDate,
          days: nights,
          advancePayment: advancePaid,
          idProof: checkInForm.idProof,
          numberOfGuests: checkInForm.numberOfGuests
        })
      });

      if (!updateRes.ok) {
        throw new Error("Failed to update room stay details");
      }

      // 2. If advance payment was made, record it as a booking deposit order
      if (advancePaid > 0) {
        await fetch(`${API_BASE_URL}/api/orders/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: checkInForm.guestName.trim(),
            phone: checkInForm.phone.trim() || '-',
            orderType: 'Room Stay Deposit',
            tableNumber: 'Room ' + selectedRoomForBooking.roomNumber,
            roomNumber: selectedRoomForBooking.roomNumber,
            paymentMode: 'Cash / Advance',
            items: [{
              name: `Stay Advance Deposit - Room ${selectedRoomForBooking.roomNumber} (${nights} Nights)`,
              price: advancePaid,
              qty: 1
            }],
            subtotal: advancePaid,
            tax: 0,
            totalAmount: advancePaid,
            status: 'Completed'
          })
        });
      }

      alert(`Room ${selectedRoomForBooking.roomNumber} successfully checked-in for ${checkInForm.guestName} (${nights} nights)!`);
      setCheckInModalOpen(false);
      setSelectedRoomForBooking(null);
      fetchRooms();
    } catch (err) {
      console.error("Check-in error:", err);
      alert("Error during check-in: " + err.message);
    }
  };

  // 2. OPEN CONSOLIDATED CHECKOUT MODAL
  const handleOpenCheckoutModal = async (room) => {
    setSelectedRoomForCheckout(room);
    const initialDays = Math.max(1, Number(room.days) || 1);
    setCheckoutDays(initialDays);
    setCheckoutPaymentMode('UPI / QR Code');
    setPostCheckoutStatus('Cleaning');
    setCheckoutFoodItems([]);
    setCheckoutFoodTotal(0);
    setFinalInvoiceData(null);
    setCheckoutModalOpen(true);

    // Fetch live unpaid food orders charged to this room
    setLoadingFoodItems(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/room-unpaid/${room.roomNumber}`);
      const data = await res.json();
      if (data && Array.isArray(data.allFoodItems)) {
        setCheckoutFoodItems(data.allFoodItems);
        setCheckoutFoodTotal(Number(data.totalFoodCharges) || 0);
      }
    } catch (err) {
      console.error("Error fetching room food charges:", err);
    } finally {
      setLoadingFoodItems(false);
    }
  };

  // Perform Consolidated Checkout & Generate Master Invoice
  const handlePerformConsolidatedCheckout = async () => {
    if (!selectedRoomForCheckout) return;

    setProcessingCheckout(true);
    const pricePerNight = Number(selectedRoomForCheckout.price) || 0;
    const roomTariff = checkoutDays * pricePerNight;
    const advancePaid = Number(selectedRoomForCheckout.advancePayment) || 0;

    const payload = {
      roomNumber: selectedRoomForCheckout.roomNumber,
      guestName: selectedRoomForCheckout.guest || 'Guest',
      phone: selectedRoomForCheckout.phone || '-',
      roomType: selectedRoomForCheckout.roomType || 'Deluxe Room',
      pricePerNight: pricePerNight,
      stayDays: checkoutDays,
      checkInDate: selectedRoomForCheckout.checkInDate || '',
      checkOutDate: new Date().toISOString().split('T')[0],
      advancePaid: advancePaid,
      paymentMode: checkoutPaymentMode,
      newRoomStatus: postCheckoutStatus,
      allFoodItems: checkoutFoodItems
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/checkout-consolidated`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to complete consolidated checkout');
      }

      setFinalInvoiceData(data.bill);
      alert(`Checkout successful! Bill No: ${data.bill.billNo} generated.`);
      fetchRooms();
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Error during checkout: " + err.message);
    } finally {
      setProcessingCheckout(false);
    }
  };

  // 3. ONE-CLICK HOUSEKEEPING DONE (CLEANING -> AVAILABLE)
  const handleMarkCleaned = async (room) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/rooms/${room._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Available',
          guest: 'Unassigned',
          phone: '-'
        })
      });
      if (res.ok) {
        fetchRooms();
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      console.error("Cleaning status update error:", err);
    }
  };

  // Add / Edit Room Form Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'roomType' ? { acType: value.toLowerCase().includes('non-ac') ? 'Non-AC' : 'AC' } : {}),
      ...(name === 'status' && value !== 'Occupied' ? { guest: '', phone: '' } : {})
    }));
  };

  const handleOpenAddModal = () => {
    setEditingRoomId(null);
    setRoomImageError('');
    setRoomImageSizeInfo('');
    setFormData({ 
      roomNumber: '', 
      roomType: 'Deluxe AC', 
      acType: 'AC', 
      price: '', 
      status: 'Available', 
      floor: '1st Floor', 
      guest: '', 
      phone: '', 
      amenities: ['Free WiFi', 'Smart TV', 'Room Service'],
      img: '' 
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (room) => {
    setEditingRoomId(room._id);
    setRoomImageError('');
    setRoomImageSizeInfo('');
    setFormData({
      roomNumber: room.roomNumber || '',
      roomType: room.roomType || 'Deluxe AC',
      acType: room.acType || (room.roomType?.toLowerCase().includes('non-ac') ? 'Non-AC' : 'AC'),
      price: room.price || '',
      status: room.status || 'Available',
      floor: room.floor || '1st Floor',
      guest: room.guest === 'Unassigned' ? '' : (room.guest || ''),
      phone: room.phone === '-' ? '' : (room.phone || ''),
      amenities: room.amenities || ['Free WiFi', 'Smart TV', 'Room Service'],
      img: room.img || ''
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (roomImageError) {
      alert(`⚠️ Please fix room image error before saving:\n${roomImageError}`);
      return;
    }
    if (formData.img && formData.img.startsWith('data:image')) {
      const approxBytes = Math.round(formData.img.length * 0.75);
      if (approxBytes > 1024 * 1024) {
        const sizeMB = (approxBytes / (1024 * 1024)).toFixed(2);
        const sizeKB = Math.round(approxBytes / 1024);
        alert(`❌ Room photo is too large (${sizeKB} KB / ${sizeMB} MB)! Maximum limit is 1 MB (1,024 KB). Please choose a smaller photo.`);
        return;
      }
    }
    try {
      const roomPayload = {
        roomNumber: formData.roomNumber,
        roomType: formData.roomType,
        acType: formData.acType,
        price: Number(formData.price),
        status: formData.status,
        floor: formData.floor,
        guest: formData.status === 'Occupied' ? (formData.guest.trim() !== '' ? formData.guest : 'Unassigned') : 'Unassigned',
        phone: formData.status === 'Occupied' ? (formData.phone.trim() !== '' ? formData.phone : '-') : '-',
        amenities: formData.amenities,
        img: formData.img.trim() !== '' ? formData.img : 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=400&q=80'
      };

      const url = editingRoomId 
        ? `${API_BASE_URL}/api/rooms/${editingRoomId}` 
        : `${API_BASE_URL}/api/rooms/add`;
      
      const method = editingRoomId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomPayload)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert(editingRoomId ? "Room updated successfully!" : "Room added successfully!");
        setIsModalOpen(false); 
        setEditingRoomId(null);
        fetchRooms();
      } else {
        alert(result.message || "Failed to save room");
      }
    } catch (error) {
      console.error("Error saving room:", error);
      alert(`Network/Server Error: ${error.message}`);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (window.confirm("Are you sure you want to delete this room?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert("Room deleted successfully!");
          fetchRooms();
        } else {
          alert("Failed to delete room");
        }
      } catch (error) {
        console.error("Error deleting room:", error);
        alert("Server error while deleting room");
      }
    }
  };

  // Status Badge with exact requested color themes:
  // Occupied = RED, Available = GREEN, Cleaning = ORANGE
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Available':
        return (
          <span className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-emerald-600 text-white backdrop-blur-md shadow-md flex items-center gap-1.5 border border-emerald-400/40">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200"/> Available
          </span>
        );
      case 'Occupied':
        return (
          <span className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-rose-600 text-white backdrop-blur-md shadow-md flex items-center gap-1.5 border border-rose-400/40 animate-pulse">
            <Users className="w-3.5 h-3.5 text-rose-200"/> Occupied
          </span>
        );
      case 'Cleaning':
        return (
          <span className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-amber-500 text-white backdrop-blur-md shadow-md flex items-center gap-1.5 border border-amber-300/40">
            <Clock className="w-3.5 h-3.5 text-amber-100"/> Cleaning
          </span>
        );
      case 'Reserved':
        return (
          <span className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-purple-600 text-white backdrop-blur-md shadow-md flex items-center gap-1.5 border border-purple-400/40">
            <Calendar className="w-3.5 h-3.5 text-purple-200"/> Reserved
          </span>
        );
      default:
        return (
          <span className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-slate-700 text-white backdrop-blur-md shadow-md">
            {status || 'Available'}
          </span>
        );
    }
  };

  // Filter & Search Logic
  const filteredRooms = roomsList.filter(room => {
    const matchesFilter = filterStatus === 'All' || room.status === filterStatus;
    if (!searchQuery.trim()) return matchesFilter;

    const query = searchQuery.toLowerCase().trim();
    const queryClean = query.replace(/^room\s*|^rm\s*/i, '').trim();

    const roomNo = (room.roomNumber || '').toString().toLowerCase();
    const roomType = (room.roomType || '').toLowerCase();
    const guestName = (room.guest || '').toLowerCase();
    const phone = (room.phone || '').toLowerCase();
    const floor = (room.floor || '').toLowerCase();
    const status = (room.status || '').toLowerCase();
    const price = (room.price || '').toString();

    const matchesSearch = 
      roomNo === query ||
      roomNo === queryClean ||
      roomNo.includes(query) ||
      roomNo.includes(queryClean) ||
      guestName.includes(query) ||
      roomType.includes(query) ||
      phone.includes(query) ||
      floor.includes(query) ||
      status.includes(query) ||
      price.includes(query);

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto text-base relative pb-16 font-sans">
      
      {/* 1. TOP HEADER BANNER */}
      <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-700 border border-blue-200">
              Hotel Accommodations
            </span>
            <span className="text-xs text-slate-400 font-bold">&bull; Real-time Occupancy & Folio Billing</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <BedDouble className="w-8 h-8 text-blue-600" /> Rooms & Accommodation Management
          </h2>
          <p className="text-sm text-slate-600 font-bold mt-1">
            AC/Non-AC inventory, date-range stay booking, live room service charging & consolidated checkout bills.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button 
            onClick={fetchRooms}
            className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
            title="Refresh Rooms"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button 
            onClick={handleOpenAddModal}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-black shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-5 h-5" /> Add New Room
          </button>
        </div>
      </div>

      {/* 2. DISTINCT OCCUPANCY METRIC CARDS (Exact Color Highlights Requested by User) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Rooms */}
        <div 
          onClick={() => setFilterStatus('All')}
          className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between ${
            filterStatus === 'All' ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider opacity-80">Total Rooms</span>
            <Building className="w-5 h-5 opacity-70" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black">{totalCount}</span>
            <p className="text-[11px] opacity-70 font-bold mt-0.5">All Hotel Inventory</p>
          </div>
        </div>

        {/* Available Rooms (GREEN) */}
        <div 
          onClick={() => setFilterStatus('Available')}
          className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between ${
            filterStatus === 'Available' ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20' : 'bg-emerald-50/60 border-emerald-200 hover:bg-emerald-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-black uppercase tracking-wider ${filterStatus === 'Available' ? 'text-emerald-100' : 'text-emerald-800'}`}>
              Available (Vacant)
            </span>
            <CheckCircle2 className={`w-5 h-5 ${filterStatus === 'Available' ? 'text-white' : 'text-emerald-600'}`} />
          </div>
          <div className="mt-3">
            <span className={`text-3xl font-black ${filterStatus === 'Available' ? 'text-white' : 'text-emerald-700'}`}>{availableCount}</span>
            <p className={`text-[11px] font-bold mt-0.5 ${filterStatus === 'Available' ? 'text-emerald-100' : 'text-emerald-600'}`}>Ready for Check-In</p>
          </div>
        </div>

        {/* Occupied Rooms (RED) */}
        <div 
          onClick={() => setFilterStatus('Occupied')}
          className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between ${
            filterStatus === 'Occupied' ? 'bg-rose-600 text-white border-rose-600 shadow-lg shadow-rose-600/20' : 'bg-rose-50/60 border-rose-200 hover:bg-rose-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-black uppercase tracking-wider ${filterStatus === 'Occupied' ? 'text-rose-100' : 'text-rose-800'}`}>
              Occupied (Booked)
            </span>
            <Users className={`w-5 h-5 ${filterStatus === 'Occupied' ? 'text-white' : 'text-rose-600'}`} />
          </div>
          <div className="mt-3">
            <span className={`text-3xl font-black ${filterStatus === 'Occupied' ? 'text-white' : 'text-rose-700'}`}>{occupiedCount}</span>
            <p className={`text-[11px] font-bold mt-0.5 ${filterStatus === 'Occupied' ? 'text-rose-100' : 'text-rose-600'}`}>Active Guest Stay</p>
          </div>
        </div>

        {/* Cleaning Rooms (ORANGE) */}
        <div 
          onClick={() => setFilterStatus('Cleaning')}
          className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between ${
            filterStatus === 'Cleaning' ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20' : 'bg-amber-50/60 border-amber-200 hover:bg-amber-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-black uppercase tracking-wider ${filterStatus === 'Cleaning' ? 'text-amber-100' : 'text-amber-800'}`}>
              Cleaning (Housekeeping)
            </span>
            <Clock className={`w-5 h-5 ${filterStatus === 'Cleaning' ? 'text-white' : 'text-amber-600'}`} />
          </div>
          <div className="mt-3">
            <span className={`text-3xl font-black ${filterStatus === 'Cleaning' ? 'text-white' : 'text-amber-700'}`}>{cleaningCount}</span>
            <p className={`text-[11px] font-bold mt-0.5 ${filterStatus === 'Cleaning' ? 'text-amber-100' : 'text-amber-600'}`}>Sanitization in progress</p>
          </div>
        </div>
      </div>

      {/* 3. UNIVERSAL SEARCH & QUICK FILTERS BAR */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Bar */}
        <div className="relative w-full md:max-w-md">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </span>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              navigate(`/rooms?search=${encodeURIComponent(e.target.value)}`);
            }}
            placeholder="Search Room (101, 204), Guest Name, Phone, AC/Non-AC..." 
            className="w-full pl-12 pr-10 py-3 bg-[#F4F7FE] border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => {
                setSearchQuery('');
                navigate('/rooms');
              }}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1">
          {[
            { label: 'All', count: totalCount },
            { label: 'Available', count: availableCount, color: 'text-emerald-700' },
            { label: 'Occupied', count: occupiedCount, color: 'text-rose-700' },
            { label: 'Cleaning', count: cleaningCount, color: 'text-amber-700' },
            { label: 'Reserved', count: reservedCount, color: 'text-purple-700' }
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => setFilterStatus(item.label)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                filterStatus === item.label 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25' 
                  : 'bg-[#F4F7FE] text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>{item.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                filterStatus === item.label ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {item.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Results Count Header */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-black text-slate-500 uppercase tracking-wider">
          Showing {filteredRooms.length} of {roomsList.length} rooms
          {searchQuery && <span className="text-blue-600 ml-1.5">&bull; Matching "{searchQuery}"</span>}
        </p>
      </div>

      {/* 4. LUXURY ROOM CARDS GRID (Red for Occupied, Green for Available, Orange for Cleaning) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
        {filteredRooms.length > 0 ? (
          filteredRooms.map((room) => {
            const isAvailable = room.status === 'Available';
            const isOccupied = room.status === 'Occupied';
            const isCleaning = room.status === 'Cleaning';
            const isReserved = room.status === 'Reserved';

            // Distinct Border Accent for fast visual identification
            const cardBorderClass = isOccupied 
              ? 'border-rose-400/80 shadow-rose-500/5' 
              : isAvailable 
                ? 'border-emerald-300/80 shadow-emerald-500/5' 
                : isCleaning 
                  ? 'border-amber-400/80 shadow-amber-500/5' 
                  : 'border-slate-200/80';

            return (
              <div 
                key={room._id || room.roomNumber} 
                className={`rounded-3xl border-2 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group ${cardBorderClass}`}
              >
                {/* TOP HALF: IMAGE + BADGES + PRICE */}
                <div>
                  <div className="h-52 w-full relative bg-slate-100 overflow-hidden">
                    <img 
                      src={room.img || "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=400&q=80"} 
                      alt={`Room ${room.roomNumber}`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    
                    {/* Status Badge Top-Right */}
                    <div className="absolute top-3.5 right-3.5">
                      {getStatusBadge(room.status)}
                    </div>

                    {/* Room Number Pill Top-Left */}
                    <div className="absolute top-3.5 left-3.5 bg-slate-900/90 backdrop-blur-md text-white px-3.5 py-1.5 rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 border border-white/20">
                      <BedDouble className="w-3.5 h-3.5 text-amber-400" />
                      <span>Room {room.roomNumber}</span>
                    </div>

                    {/* Floor & AC Pill Bottom-Left */}
                    <div className="absolute bottom-3.5 left-3.5 flex items-center gap-1.5">
                      <span className="bg-black/65 backdrop-blur-md text-white px-2.5 py-1 rounded-xl text-[11px] font-black">
                        {room.floor || '1st Floor'}
                      </span>
                      <span className={`px-2.5 py-1 rounded-xl text-[11px] font-black backdrop-blur-md text-white ${
                        room.acType === 'Non-AC' || room.roomType?.toLowerCase().includes('non-ac')
                          ? 'bg-amber-600/80' 
                          : 'bg-blue-600/80'
                      }`}>
                        {room.acType || (room.roomType?.toLowerCase().includes('non-ac') ? 'Non-AC' : 'AC')}
                      </span>
                    </div>

                    {/* PRICE TAG (Bottom-Right on image) */}
                    <div className="absolute bottom-3.5 right-3.5 bg-white/95 backdrop-blur-md text-slate-900 px-3.5 py-1.5 rounded-xl shadow-lg border border-slate-100 flex items-baseline gap-1">
                      <span className="text-base font-black text-blue-600">
                        ₹ {Number(room.price || 0).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-wide">
                        / night
                      </span>
                    </div>
                  </div>

                  {/* ROOM DETAILS BODY */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-lg text-slate-900 tracking-tight">
                        {room.roomType}
                      </h4>
                      <span className="text-[11px] font-black px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700">
                        {room.floor || '1st Floor'}
                      </span>
                    </div>

                    {/* Amenities Pill Row */}
                    <div className="flex items-center gap-3 text-xs text-slate-400 font-extrabold pt-0.5 flex-wrap">
                      <span className="flex items-center gap-1"><Wifi className="w-3.5 h-3.5 text-slate-500" /> WiFi</span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1"><Tv className="w-3.5 h-3.5 text-slate-500" /> Smart TV</span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1"><Coffee className="w-3.5 h-3.5 text-slate-500" /> Room Service</span>
                    </div>

                    {/* OCCUPANCY / STATUS DETAILS BOX */}
                    <div className="min-h-20 flex flex-col justify-center">
                      {isOccupied ? (
                        <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="font-black text-slate-900 truncate flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                              Guest: <span className="text-rose-700 font-black">{room.guest || 'Active Guest'}</span>
                            </p>
                            <span className="text-[10px] font-black bg-rose-100 text-rose-800 px-2 py-0.5 rounded-md">
                              {room.days || 1} Night(s) Stay
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-600 font-bold pt-0.5">
                            <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {room.phone || '-'}</span>
                            {room.advancePayment > 0 && (
                              <span className="text-emerald-700 font-black">Advance: ₹{Number(room.advancePayment).toLocaleString()}</span>
                            )}
                          </div>
                          {room.checkInDate && (
                            <p className="text-[10px] text-slate-400 font-bold">
                              From: {room.checkInDate} &rarr; To: {room.checkOutDate || 'Open'}
                            </p>
                          )}
                        </div>
                      ) : isAvailable ? (
                        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs">
                          <p className="font-black text-emerald-800 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Ready for Guest Check-In
                          </p>
                          <p className="text-[11px] text-emerald-600 font-bold mt-0.5">
                            Sanitized & verified by housekeeping. Instant booking available.
                          </p>
                        </div>
                      ) : isCleaning ? (
                        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs flex items-center justify-between gap-2">
                          <div>
                            <p className="font-black text-amber-800 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-amber-600" /> Housekeeping & Cleaning
                            </p>
                            <p className="text-[11px] text-amber-700 font-bold mt-0.5">
                              Room linen change & cleaning in progress
                            </p>
                          </div>
                          <button
                            onClick={() => handleMarkCleaned(room)}
                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black shrink-0 transition-colors cursor-pointer shadow-xs"
                            title="Mark as Cleaned and Available"
                          >
                            Mark Ready
                          </button>
                        </div>
                      ) : (
                        <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 text-xs">
                          <p className="font-black text-purple-800 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-purple-600" /> Advance Reservation
                          </p>
                          <p className="text-[11px] text-purple-600 font-bold mt-0.5">
                            Held for upcoming scheduled arrival
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* BOTTOM HALF: ACTION BUTTONS */}
                <div className="p-5 pt-3 border-t border-slate-100 bg-slate-50/50 space-y-2.5">
                  
                  {/* Primary Action Button (Check-In or Checkout) */}
                  {isAvailable && (
                    <button 
                      type="button"
                      onClick={() => handleOpenQuickCheckIn(room)}
                      className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl text-xs font-black shadow-md shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-emerald-200" /> ⚡ Book Room / Guest Check-In
                    </button>
                  )}

                  {isOccupied && (
                    <button 
                      type="button"
                      onClick={() => handleOpenCheckoutModal(room)}
                      className="w-full py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white rounded-2xl text-xs font-black shadow-md shadow-rose-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Receipt className="w-4 h-4 text-rose-200" /> 🛎️ Guest Check-Out & Final Bill
                    </button>
                  )}

                  {isCleaning && (
                    <button 
                      type="button"
                      onClick={() => handleMarkCleaned(room)}
                      className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl text-xs font-black shadow-md shadow-amber-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-amber-200" /> ✨ Cleaning Done &rarr; Mark Available
                    </button>
                  )}

                  {isReserved && (
                    <button 
                      type="button"
                      onClick={() => handleOpenQuickCheckIn(room)}
                      className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-black shadow-md shadow-purple-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      ⚡ Check-In Reserved Guest
                    </button>
                  )}

                  {/* Secondary Controls (Edit & Delete) */}
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      type="button"
                      onClick={() => handleOpenEditModal(room)}
                      className="py-2.5 px-3 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-xl text-xs font-black border border-slate-200/80 transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                      title="Edit Room"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-blue-600" /> Edit
                    </button>
                    
                    <button 
                      type="button"
                      onClick={() => handleDeleteRoom(room._id)}
                      className="py-2.5 px-3 bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 rounded-xl text-xs font-black border border-slate-200/80 transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                      title="Delete Room"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" /> Delete
                    </button>
                  </div>

                </div>

              </div>
            );
          })
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <BedDouble className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="text-lg font-black text-slate-800">No rooms found</h4>
            <p className="text-sm font-bold text-slate-400 max-w-sm mx-auto">
              No rooms match your filter or search query "{searchQuery}".
            </p>
            <button 
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('All');
                navigate('/rooms');
              }}
              className="px-5 py-2.5 bg-blue-50 text-blue-700 rounded-2xl text-xs font-black cursor-pointer hover:bg-blue-100 transition-colors"
            >
              Reset Filters & Search
            </button>
          </div>
        )}
      </div>

      {/* 5. ADD / EDIT ROOM MODAL (Admin Room Entry with AC/Non-AC & All Room Types) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-7 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <BedDouble className="w-6 h-6 text-blue-600" /> {editingRoomId ? 'Edit Room Details' : 'Add New Hotel Room'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wide mb-1.5">Room Number *</label>
                  <input 
                    type="text" 
                    name="roomNumber" 
                    value={formData.roomNumber} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="e.g. 101, 204, 305" 
                    className="w-full px-4 py-3 bg-[#F4F7FE] border rounded-2xl text-sm font-bold text-slate-800 focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wide mb-1.5">AC / Non-AC Type *</label>
                  <select 
                    name="acType" 
                    value={formData.acType} 
                    onChange={handleInputChange} 
                    className="w-full px-4 py-3 bg-[#F4F7FE] border rounded-2xl text-sm font-bold text-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="AC">AC (Air Conditioned)</option>
                    <option value="Non-AC">Non-AC (Standard)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wide mb-1.5">Room Category *</label>
                  <select 
                    name="roomType" 
                    value={formData.roomType} 
                    onChange={handleInputChange} 
                    className="w-full px-4 py-3 bg-[#F4F7FE] border rounded-2xl text-sm font-bold text-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="Deluxe AC">Deluxe AC</option>
                    <option value="Super Deluxe AC">Super Deluxe AC</option>
                    <option value="Luxury Suite AC">Luxury Suite AC</option>
                    <option value="Executive Suite AC">Executive Suite AC</option>
                    <option value="Family Suite AC">Family Suite AC</option>
                    <option value="Standard Non-AC">Standard Non-AC</option>
                    <option value="Deluxe Non-AC">Deluxe Non-AC</option>
                    <option value="Single Non-AC">Single Non-AC</option>
                    <option value="Double Non-AC">Double Non-AC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wide mb-1.5">Price (₹ / night) *</label>
                  <input 
                    type="number" 
                    name="price" 
                    value={formData.price} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="e.g. 2500" 
                    className="w-full px-4 py-3 bg-[#F4F7FE] border rounded-2xl text-sm font-bold text-slate-800 focus:outline-none" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wide mb-1.5">Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#F4F7FE] border rounded-2xl text-sm font-bold text-slate-800 focus:outline-none cursor-pointer">
                    <option value="Available">Available (Green)</option>
                    <option value="Occupied">Occupied (Red)</option>
                    <option value="Cleaning">Cleaning (Orange)</option>
                    <option value="Reserved">Reserved (Purple)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wide mb-1.5">Floor</label>
                  <select name="floor" value={formData.floor} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#F4F7FE] border rounded-2xl text-sm font-bold text-slate-800 focus:outline-none cursor-pointer">
                    <option value="Ground Floor">Ground Floor</option>
                    <option value="1st Floor">1st Floor</option>
                    <option value="2nd Floor">2nd Floor</option>
                    <option value="3rd Floor">3rd Floor</option>
                    <option value="Executive Floor">Executive Floor</option>
                  </select>
                </div>
              </div>

              {/* Room Image Selection with 1 MB Size Validation & Red Error */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-blue-600" /> Room Photo (Max 1 MB)
                  </label>
                  <span className="text-[11px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    Rule: Max 1 MB (1,024 KB)
                  </span>
                </div>

                {/* PERMANENT VALIDATION NOTICE ON ROOM MODAL */}
                <div className="p-2.5 bg-blue-50/90 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-start gap-2 shadow-xs">
                  <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-black text-blue-900">📌 Room Photo Validation Rule:</p>
                    <p className="text-[11px] font-semibold text-blue-700 mt-0.5">
                      Kripya <strong>1 MB (1,024 KB)</strong> se kam size ki room photo upload karein. Agar photo 1 MB se badi hogi toh save nahi hogi.
                    </p>
                  </div>
                </div>

                <div className={`grid grid-cols-2 gap-3 items-center p-2 rounded-2xl border transition-all ${roomImageError ? 'border-red-500 bg-red-50/70 ring-2 ring-red-200' : 'border-slate-200 bg-[#F4F7FE]'}`}>
                  <label className={`w-full py-2.5 px-3 rounded-xl text-center font-black cursor-pointer border block truncate text-xs transition-colors shadow-xs ${roomImageError ? 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200' : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200'}`}>
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
                            // Immediately clear image and trigger alert
                            setFormData(prev => ({ ...prev, img: '' }));
                            setRoomImageError(`⚠️ Room photo size bohot badi hai (${fileSizeKB} KB / ${fileSizeMB} MB)! Maximum limit 1 MB (1,024 KB) hai. Kripya 1 MB se choti image select karein.`);
                            setRoomImageSizeInfo('');
                            e.target.value = '';
                            alert(`❌ Image Size Error!\n\nAapki chuni hui room photo ${fileSizeKB} KB (${fileSizeMB} MB) ki hai, jo ki 1 MB (1,024 KB) limit se badi hai.\n\nKripya 1 MB se kam size ki image upload karein!`);
                            return;
                          }

                          setRoomImageError('');
                          setRoomImageSizeInfo(`${fileSizeKB} KB (${fileSizeMB} MB)`);

                          const reader = new FileReader();
                          reader.onloadend = () => setFormData(prev => ({ ...prev, img: reader.result }));
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  
                  <input 
                    type="text" 
                    value={formData.img && !formData.img.startsWith('data:') ? formData.img : ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val && val.startsWith('data:image')) {
                        const approxBytes = Math.round(val.length * 0.75);
                        if (approxBytes > 1024 * 1024) {
                          const sizeMB = (approxBytes / (1024 * 1024)).toFixed(2);
                          const sizeKB = Math.round(approxBytes / 1024);
                          setRoomImageError(`⚠️ Room photo size is too large (${sizeKB} KB / ${sizeMB} MB)! Maximum limit is 1 MB (1,024 KB).`);
                          alert(`❌ Room photo size is too large (${sizeKB} KB / ${sizeMB} MB)! Maximum limit is 1 MB (1,024 KB).`);
                          return;
                        }
                      }
                      setRoomImageError('');
                      setRoomImageSizeInfo('');
                      setFormData(prev => ({ ...prev, img: val }));
                    }}
                    placeholder="Or paste Image URL"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none text-xs"
                  />
                </div>

                {/* RED ERROR BOX WHEN ROOM IMAGE EXCEEDS 1 MB */}
                {roomImageError && (
                  <div className="flex items-start gap-2.5 p-3 bg-red-50 border-2 border-red-500 rounded-xl text-red-600 text-xs font-bold shadow-xs">
                    <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5 animate-bounce" />
                    <div className="space-y-0.5">
                      <p className="font-black text-red-700 text-xs leading-snug">{roomImageError}</p>
                      <p className="text-[11px] text-red-500 font-semibold">
                        Kripya 1 MB (1,024 KB) se kam size ki image upload karein (Aap image compress kar sakte hain ya screenshot le sakte hain).
                      </p>
                    </div>
                  </div>
                )}

                {/* VALID ROOM IMAGE PREVIEW */}
                {formData.img && !roomImageError && (
                  <div className="flex items-center gap-3 p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl">
                    <div className="w-14 h-14 rounded-lg overflow-hidden border border-emerald-300 shrink-0 shadow-xs">
                      <img src={formData.img} alt="Room Preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                        ✓ Image Selected: {roomImageSizeInfo || 'Valid'} (Under 1 MB)
                      </span>
                      <p className="text-[11px] text-slate-500 truncate mt-1">Ready to save with room</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, img: '' }));
                        setRoomImageSizeInfo('');
                        setRoomImageError('');
                      }}
                      className="px-2.5 py-1 text-xs font-black text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {formData.status === 'Occupied' && (
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wide mb-1.5">Guest Name</label>
                    <input type="text" name="guest" value={formData.guest} onChange={handleInputChange} required placeholder="Guest Name" className="w-full px-4 py-3 bg-[#F4F7FE] border rounded-2xl text-sm font-bold text-slate-800 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wide mb-1.5">Phone Number</label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Phone Number" className="w-full px-4 py-3 bg-[#F4F7FE] border rounded-2xl text-sm font-bold text-slate-800 focus:outline-none" />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-3 rounded-2xl bg-slate-100 text-slate-700 text-sm font-black cursor-pointer">Cancel</button>
                <button 
                  type="submit" 
                  disabled={Boolean(roomImageError)}
                  className={`px-6 py-3 rounded-2xl text-white text-sm font-black shadow-lg transition-all ${
                    roomImageError 
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60 shadow-none' 
                      : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25 cursor-pointer'
                  }`}
                >
                  {editingRoomId ? 'Update Room' : 'Save Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. QUICK ROOM CHECK-IN MODAL (With Date Range Calendar & Stay Duration Calculator) */}
      {checkInModalOpen && selectedRoomForBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-7 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <BedDouble className="w-6 h-6 text-emerald-600" /> Book Room {selectedRoomForBooking.roomNumber}
                </h3>
                <p className="text-xs text-slate-500 font-bold mt-0.5">
                  {selectedRoomForBooking.roomType} &bull; ₹{Number(selectedRoomForBooking.price).toLocaleString()} / night
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setCheckInModalOpen(false)} 
                className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickCheckInSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wide mb-1.5">Guest Name *</label>
                  <input 
                    type="text" 
                    required 
                    value={checkInForm.guestName}
                    onChange={(e) => setCheckInForm({...checkInForm, guestName: e.target.value})}
                    placeholder="e.g. Ramesh Verma" 
                    className="w-full px-4 py-3 bg-[#F4F7FE] border rounded-2xl text-sm font-bold text-slate-800 focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wide mb-1.5">Phone Number *</label>
                  <input 
                    type="text" 
                    required
                    value={checkInForm.phone}
                    onChange={(e) => setCheckInForm({...checkInForm, phone: e.target.value})}
                    placeholder="e.g. 9876543210" 
                    className="w-full px-4 py-3 bg-[#F4F7FE] border rounded-2xl text-sm font-bold text-slate-800 focus:outline-none" 
                  />
                </div>
              </div>

              {/* DATE SELECTION (From Date &rarr; To Date Range Calendar) */}
              <div className="bg-[#F4F7FE] p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <p className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600" /> Stay Duration & Date Selection
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase mb-1">Check-in Date (From)</label>
                    <input 
                      type="date"
                      value={checkInForm.checkInDate}
                      onChange={(e) => handleCheckInDateChange(e.target.value, checkInForm.checkOutDate)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase mb-1">Check-out Date (To)</label>
                    <input 
                      type="date"
                      value={checkInForm.checkOutDate}
                      onChange={(e) => handleCheckInDateChange(checkInForm.checkInDate, e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                    />
                  </div>
                </div>

                {/* Day Increment / Decrement Controls */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-bold text-slate-600">Calculated Stay Duration:</span>
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                    <button 
                      type="button" 
                      onClick={() => setCheckInForm(prev => ({ ...prev, nights: Math.max(1, prev.nights - 1) }))}
                      className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-black text-slate-700 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-xs font-black text-blue-600 min-w-16 text-center">
                      {checkInForm.nights} Day(s)
                    </span>
                    <button 
                      type="button" 
                      onClick={() => setCheckInForm(prev => ({ ...prev, nights: prev.nights + 1 }))}
                      className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-black text-slate-700 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* ID Proof & Advance Payment */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wide mb-1.5">ID Proof</label>
                  <select 
                    value={checkInForm.idProof}
                    onChange={(e) => setCheckInForm({...checkInForm, idProof: e.target.value})}
                    className="w-full px-4 py-3 bg-[#F4F7FE] border rounded-2xl text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    <option value="Aadhaar Card">Aadhaar Card</option>
                    <option value="Driving License">Driving License</option>
                    <option value="Passport">Passport</option>
                    <option value="Voter ID">Voter ID</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wide mb-1.5">Advance Payment (₹)</label>
                  <input 
                    type="number" 
                    min="0"
                    value={checkInForm.advancePayment}
                    onChange={(e) => setCheckInForm({...checkInForm, advancePayment: Number(e.target.value) || 0})}
                    placeholder="e.g. 1000" 
                    className="w-full px-4 py-3 bg-[#F4F7FE] border rounded-2xl text-sm font-bold text-slate-800 focus:outline-none" 
                  />
                </div>
              </div>

              {/* Live Tariff Preview */}
              <div className="bg-[#F4F7FE] p-4 rounded-2xl space-y-1.5 text-xs font-bold text-slate-600">
                <div className="flex justify-between">
                  <span>Room Tariff ({checkInForm.nights} night(s) × ₹{Number(selectedRoomForBooking.price).toLocaleString()}):</span>
                  <span className="font-black text-slate-900">₹ {(Number(selectedRoomForBooking.price) * checkInForm.nights).toLocaleString()}</span>
                </div>
                {checkInForm.advancePayment > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Advance Payment Paid Now:</span>
                    <span className="font-black">- ₹ {Number(checkInForm.advancePayment).toLocaleString()}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200/80 flex justify-between text-sm font-black text-slate-900">
                  <span>Estimated Total (Excl. Tax):</span>
                  <span className="text-emerald-700">₹ {Math.max(0, (Number(selectedRoomForBooking.price) * checkInForm.nights) - checkInForm.advancePayment).toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-slate-400 font-bold mt-1">
                  * Final bill including restaurant / room service food charges will be consolidated upon checkout.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setCheckInModalOpen(false)} 
                  className="px-5 py-3 rounded-2xl bg-slate-100 text-slate-700 text-sm font-black cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black shadow-lg shadow-emerald-500/25 cursor-pointer transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" /> Confirm Check-In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. CONSOLIDATED CHECKOUT & MASTER BILL MODAL (The Grand Checkout Experience!) */}
      {checkoutModalOpen && selectedRoomForCheckout && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-7 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-rose-100 text-rose-800">
                    Master Checkout
                  </span>
                  <span className="text-xs text-slate-400 font-bold">Room + Food & Beverage</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
                  <Receipt className="w-6 h-6 text-rose-600" /> Checkout Room {selectedRoomForCheckout.roomNumber}
                </h3>
                <p className="text-xs text-slate-500 font-bold mt-0.5">
                  Guest: <strong className="text-slate-900">{selectedRoomForCheckout.guest}</strong> ({selectedRoomForCheckout.phone || '-'})
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setCheckoutModalOpen(false)} 
                className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* DYNAMIC STAY DURATION RECALCULATION (INCREMENT / DECREMENT) */}
            <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-200/80 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="text-xs font-black text-blue-900 uppercase tracking-wide flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-blue-600" /> Stay Duration (Auto-Recalculate Price)
                  </h4>
                  <p className="text-[11px] text-blue-700 font-bold mt-0.5">
                    Increment if stay extended, decrement if checked out early (e.g. 3 days &rarr; 2 days).
                  </p>
                </div>

                {/* Day adjustment buttons */}
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-blue-200 shadow-xs">
                  <button 
                    type="button"
                    onClick={() => setCheckoutDays(prev => Math.max(1, prev - 1))}
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-black text-slate-800 cursor-pointer transition-colors"
                    title="Early Checkout (Decrement Day)"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-black text-blue-700 min-w-20 text-center">
                    {checkoutDays} Day(s)
                  </span>
                  <button 
                    type="button"
                    onClick={() => setCheckoutDays(prev => prev + 1)}
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-black text-slate-800 cursor-pointer transition-colors"
                    title="Extended Stay (Increment Day)"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs font-bold text-blue-900 pt-1 border-t border-blue-200/60">
                <span>Room Tariff ({checkoutDays} night(s) @ ₹{Number(selectedRoomForCheckout.price).toLocaleString()}/night):</span>
                <span className="text-sm font-black text-blue-800">₹ {(checkoutDays * Number(selectedRoomForCheckout.price)).toLocaleString()}</span>
              </div>
            </div>

            {/* FOOD & BEVERAGES (RESTAUARANT / ROOM SERVICE CHARGES ATTACHED TO ROOM) */}
            <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                  <UtensilsCrossed className="w-4 h-4 text-amber-600" /> Restaurant & Room Service Charges
                </h4>
                <span className="text-xs font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                  {checkoutFoodItems.length} Food Item(s)
                </span>
              </div>

              {loadingFoodItems ? (
                <div className="text-center py-4 text-xs font-bold text-amber-700">Loading food orders...</div>
              ) : checkoutFoodItems.length === 0 ? (
                <p className="text-xs text-slate-400 font-bold py-2 text-center bg-white/70 rounded-xl">
                  No pending restaurant or room-service food orders for this room.
                </p>
              ) : (
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                  {checkoutFoodItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs p-2 bg-white rounded-xl border border-amber-200/50">
                      <div>
                        <span className="font-black text-slate-800">{item.name}</span>
                        <span className="text-slate-400 font-bold ml-2">x {item.qty}</span>
                      </div>
                      <span className="font-black text-slate-900">₹ {(Number(item.price) * Number(item.qty)).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center text-xs font-bold text-amber-900 pt-1 border-t border-amber-200/60">
                <span>Total Food & Beverage Charges:</span>
                <span className="text-sm font-black text-amber-800">₹ {checkoutFoodTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* FINANCIAL SUMMARY & NET PAYABLE */}
            {(() => {
              const roomTariff = checkoutDays * Number(selectedRoomForCheckout.price || 0);
              const subtotal = roomTariff + checkoutFoodTotal;
              const tax = Math.round(subtotal * 0.05); // 5% GST
              const advanceDeduction = Number(selectedRoomForCheckout.advancePayment) || 0;
              const grandNetTotal = Math.max(0, subtotal + tax - advanceDeduction);

              return (
                <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-2.5">
                  <div className="flex justify-between text-xs text-slate-300 font-bold">
                    <span>Room Accommodation Charges:</span>
                    <span>₹ {roomTariff.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-300 font-bold">
                    <span>Food & Beverage Orders:</span>
                    <span>₹ {checkoutFoodTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-300 font-bold">
                    <span>GST (5%):</span>
                    <span>₹ {tax.toLocaleString()}</span>
                  </div>
                  {advanceDeduction > 0 && (
                    <div className="flex justify-between text-xs text-emerald-400 font-bold">
                      <span>Less: Advance Payment Paid at Check-in:</span>
                      <span>- ₹ {advanceDeduction.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-700 flex justify-between items-baseline">
                    <span className="text-base font-black">Net Final Payable Amount:</span>
                    <span className="text-2xl font-black text-emerald-400">₹ {grandNetTotal.toLocaleString()}</span>
                  </div>
                </div>
              );
            })()}

            {/* PAYMENT MODE & ROOM STATUS SELECTION */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wide mb-1.5">Payment Method *</label>
                <select 
                  value={checkoutPaymentMode}
                  onChange={(e) => setCheckoutPaymentMode(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F4F7FE] border rounded-2xl text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="UPI / QR Code">UPI / QR Code</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Credit / Debit Card</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wide mb-1.5">Next Room Status *</label>
                <select 
                  value={postCheckoutStatus}
                  onChange={(e) => setPostCheckoutStatus(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F4F7FE] border rounded-2xl text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="Cleaning">Cleaning (Needs Housekeeping)</option>
                  <option value="Available">Available Immediately</option>
                </select>
              </div>
            </div>

            {/* ACTION BUTTONS & INVOICE PRINT */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 flex-wrap gap-3">
              <button 
                type="button" 
                onClick={() => setCheckoutModalOpen(false)} 
                className="px-5 py-3 rounded-2xl bg-slate-100 text-slate-700 text-sm font-black cursor-pointer"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {finalInvoiceData ? (
                  <button 
                    type="button"
                    onClick={() => window.print()}
                    className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-black shadow-lg flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Printer className="w-4 h-4" /> Print Final Tax Invoice
                  </button>
                ) : (
                  <button 
                    type="button" 
                    onClick={handlePerformConsolidatedCheckout}
                    disabled={processingCheckout}
                    className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-black shadow-lg shadow-rose-500/25 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    {processingCheckout ? (
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Pay & Complete Check-Out
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* PRINTABLE CONSOLIDATED TAX INVOICE */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #checkout-tax-invoice, #checkout-tax-invoice * { visibility: visible; }
          #checkout-tax-invoice {
            position: absolute; left: 0; top: 0; width: 100%; padding: 24px; background: white; color: black;
          }
        }
      `}</style>

      {finalInvoiceData && (
        <div id="checkout-tax-invoice" className="hidden print:block">
          <div className="max-w-2xl mx-auto p-6 border rounded-xl text-slate-900 space-y-4">
            <div className="text-center border-b pb-4">
              <h1 className="text-2xl font-black">THE GREEN VALLEY HOTEL & RESORTS</h1>
              <p className="text-xs text-slate-500">Luxury Accommodations & Multi-Cuisine Fine Dining</p>
              <p className="text-xs font-bold mt-1">GSTIN: 07AAAAA0000A1Z5 &bull; Phone: +91 98765 43210</p>
              <div className="mt-2 inline-block px-3 py-1 bg-slate-100 rounded-lg text-xs font-black">
                MASTER CONSOLIDATED TAX INVOICE
              </div>
            </div>

            <div className="grid grid-cols-2 text-xs border-b pb-3 gap-2">
              <div>
                <p><strong>Invoice No:</strong> {finalInvoiceData.billNo}</p>
                <p><strong>Date & Time:</strong> {finalInvoiceData.dateFormatted || new Date().toLocaleString()}</p>
                <p><strong>Room:</strong> Room {finalInvoiceData.roomNumber}</p>
              </div>
              <div className="text-right">
                <p><strong>Guest Name:</strong> {finalInvoiceData.customerName}</p>
                <p><strong>Phone:</strong> {finalInvoiceData.phone}</p>
                <p><strong>Payment Mode:</strong> {finalInvoiceData.paymentMode}</p>
              </div>
            </div>

            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="text-left py-2">Service / Item Description</th>
                  <th className="text-center py-2">Duration / Qty</th>
                  <th className="text-right py-2">Rate (₹)</th>
                  <th className="text-right py-2">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {finalInvoiceData.items && finalInvoiceData.items.map((it, idx) => (
                  <tr key={idx} className="border-b border-slate-100">
                    <td className="py-2">{it.name}</td>
                    <td className="text-center py-2">{it.qty}</td>
                    <td className="text-right py-2">₹{it.price}</td>
                    <td className="text-right py-2">₹{it.price * it.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="space-y-1.5 pt-3 border-t text-xs">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{finalInvoiceData.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (5%):</span>
                <span>₹{finalInvoiceData.tax}</span>
              </div>
              {finalInvoiceData.advancePaid > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Less: Advance Deposit:</span>
                  <span>- ₹{finalInvoiceData.advancePaid}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black pt-2 border-t">
                <span>Total Net Paid:</span>
                <span>₹{finalInvoiceData.totalAmount}</span>
              </div>
            </div>

            <div className="text-center pt-4 border-t text-[11px] text-slate-500">
              <p>Thank you for staying with us! We look forward to welcoming you again.</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
