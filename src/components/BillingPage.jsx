import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Receipt, 
  Search, 
  Printer, 
  Download, 
  Plus, 
  CheckCircle2, 
  DollarSign, 
  FileText, 
  RefreshCw, 
  X, 
  CreditCard, 
  UtensilsCrossed, 
  BedDouble, 
  Building2 
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';

export default function BillingPage() {
  const [invoicesList, setInvoicesList] = useState([]);
  const [filterPayment, setFilterPayment] = useState('All');
  const [dateRange, setDateRange] = useState('All Time');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Fetch real orders from database as invoices
  const fetchInvoices = () => {
    setLoading(true);
    let url = `${API_BASE_URL}/api/orders`;
    if (dateRange === 'Custom Range' && customStartDate && customEndDate) {
      url += `?startDate=${customStartDate}&endDate=${customEndDate}`;
    }
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const formatted = data.map(order => {
            const rawSubtotal = Number(order.subtotal) || Math.round(Number(order.totalAmount || 0) / 1.05);
            const rawTax = Number(order.tax) || (Number(order.totalAmount || 0) - rawSubtotal);
            const rawTotal = Number(order.totalAmount || 0);

            let serviceDesc = order.orderType || 'Dine-In';
            if (order.tableNumber) serviceDesc += ` (${order.tableNumber})`;
            if (order.items && order.items.length > 0) {
              serviceDesc += ` • ${order.items.map(it => `${it.name} (x${it.qty || 1})`).join(', ')}`;
            }

            const formattedDate = order.dateFormatted || (order.createdAt 
              ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                  weekday: 'short',
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })
              : 'Today');

            return {
              id: order._id,
              inv: order.billNo || ('INV-' + (order._id ? order._id.slice(-4).toUpperCase() : Math.floor(1000 + Math.random() * 9000))),
              name: order.customerName || 'Walk-in Guest',
              phone: order.phone || '-',
              service: serviceDesc,
              rawSubtotal,
              rawTax,
              rawTotal,
              subtotal: `₹ ${rawSubtotal.toLocaleString()}`,
              gst: `₹ ${rawTax.toLocaleString()}`,
              total: `₹ ${rawTotal.toLocaleString()}`,
              mode: order.paymentMode || (rawTotal > 2000 ? 'UPI' : 'Cash'),
              date: formattedDate,
              createdAt: order.createdAt,
              status: order.status || (order.isPaid ? 'Paid' : 'Pending at Checkout'),
              isPaid: order.isPaid,
              orderType: order.orderType || 'Dine-In',
              tableNumber: order.tableNumber || '',
              roomNumber: order.roomNumber || '',
              items: order.items || []
            };
          });
          setInvoicesList(formatted);
        }
      })
      .catch(err => console.error("Error fetching invoices:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInvoices();
  }, [dateRange, customStartDate, customEndDate]);

  // Dynamic Metrics computed after applying date range filter
  const filteredInvoices = invoicesList.filter(item => {
    const matchesFilter = filterPayment === 'All' || item.mode === filterPayment;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.inv.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.phone.includes(searchQuery);

    // Date Range filtering
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

  const totalBilling = filteredInvoices.reduce((sum, item) => sum + item.rawTotal, 0);
  const totalGst = filteredInvoices.reduce((sum, item) => sum + item.rawTax, 0);
  const totalInvoicesCount = filteredInvoices.length;

  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto text-base">
      
      {/* HEADER BANNER */}
      <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Receipt className="w-7 h-7 text-blue-600" /> Billing & Tax Invoices
          </h2>
          <p className="text-sm text-slate-600 font-bold mt-1">Review finalized guest bills, GST calculations, and download/print payment receipts.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchInvoices}
            className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-sm font-black flex items-center gap-2 transition-all cursor-pointer"
            title="Refresh Invoices"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <Link 
            to="/RestaurantPOS"
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-black shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all"
          >
            <Plus className="w-5 h-5" /> Generate New Bill
          </Link>
        </div>
      </div>

      {/* 100% DYNAMIC METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-wide">Total Invoiced Amount</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">₹ {totalBilling.toLocaleString()}</h3>
            <p className="text-xs text-blue-600 font-bold mt-1">All live customer orders combined</p>
          </div>
          <div className="p-4 rounded-2xl bg-blue-50 text-blue-600">
            <DollarSign className="w-7 h-7" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-wide">GST Collected (5%)</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">₹ {totalGst.toLocaleString()}</h3>
            <p className="text-xs text-emerald-600 font-bold mt-1">Tax compliant records</p>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-600">
            <Receipt className="w-7 h-7" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-wide">Total Invoices Generated</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{totalInvoicesCount} Bills</h3>
            <p className="text-xs text-purple-600 font-bold mt-1">All channels combined</p>
          </div>
          <div className="p-4 rounded-2xl bg-purple-50 text-purple-600">
            <FileText className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* SEARCH & FILTERS BAR (With Date Range Selector) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4 flex-wrap">
        <div className="relative w-full lg:max-w-xs">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </span>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search invoice, guest, phone..." 
            className="w-full pl-12 pr-4 py-3 bg-[#F4F7FE] border border-slate-200/60 rounded-2xl text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none"
          />
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-3 bg-[#F4F7FE] border border-slate-200/60 rounded-2xl text-xs font-black text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="All Time">All Time Bills</option>
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

        {/* Payment Modes */}
        <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-1">
          {['All', 'UPI', 'Cash', 'Card'].map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterPayment(mode)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                filterPayment === mode ? 'bg-blue-600 text-white shadow-md' : 'bg-[#F4F7FE] text-slate-600 hover:bg-slate-200'
              }`}
            >
              {mode === 'All' ? 'All Modes' : mode}
            </button>
          ))}
        </div>
      </div>

      {/* INVOICES TABLE LIST */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-black uppercase tracking-wider text-xs">
                <th className="py-4 px-4">Invoice No</th>
                <th className="py-4 px-4">Guest Details</th>
                <th className="py-4 px-4">Service Description</th>
                <th className="py-4 px-4">Subtotal + GST</th>
                <th className="py-4 px-4">Grand Total</th>
                <th className="py-4 px-4">Payment Mode</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-bold text-slate-800">
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((inv, idx) => (
                  <tr key={inv.id || idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4">
                      <span className="font-black text-blue-600 text-base">{inv.inv}</span>
                      <span className="block text-xs text-slate-400 font-extrabold">{inv.date}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-slate-900 font-black">{inv.name}</span>
                      <span className="block text-xs text-slate-500 font-bold">{inv.phone}</span>
                    </td>
                    <td className="py-4 px-4 text-slate-700 text-xs font-extrabold max-w-xs">
                      {inv.service}
                    </td>
                    <td className="py-4 px-4 text-slate-600 text-xs">
                      {inv.subtotal} <span className="text-[10px] text-slate-400">(+GST {inv.gst})</span>
                    </td>
                    <td className="py-4 px-4 font-black text-slate-900 text-base">
                      {inv.total}
                    </td>
                    <td className="py-4 px-4">
                      {inv.status === 'Pending at Checkout' ? (
                        <span className="px-3 py-1 rounded-xl text-xs font-black bg-amber-50 text-amber-800 border border-amber-200 block text-center">
                          Pending at Checkout
                        </span>
                      ) : inv.orderType === 'Consolidated Checkout' ? (
                        <div className="space-y-1">
                          <span className="px-2.5 py-0.5 rounded-xl text-[10px] font-black bg-purple-100 text-purple-800 block text-center">
                            Master Checkout Bill
                          </span>
                          <span className="px-2.5 py-0.5 rounded-xl text-[10px] font-black bg-emerald-50 text-emerald-700 block text-center">
                            {inv.mode}
                          </span>
                        </div>
                      ) : (
                        <span className="px-3 py-1 rounded-xl text-xs font-black bg-blue-50 text-blue-700 border border-blue-200 block text-center">
                          {inv.mode}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <button 
                        onClick={() => setSelectedInvoice(inv)}
                        className="px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-black transition-colors inline-flex items-center gap-1 shadow-sm cursor-pointer"
                        title="View / Print Tax Invoice"
                      >
                        <Printer className="w-3.5 h-3.5" /> Print / View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400 font-bold text-base">
                    {loading ? "Loading invoices from database..." : "No invoices found matching your search or filter."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRINTABLE TAX INVOICE RECEIPT MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black">
                  GV
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Green Valley Hotel & Resorts</h3>
                  <p className="text-xs text-slate-400 font-bold">GSTIN: 07AAAAA0000A1Z5 &bull; Official Tax Invoice</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedInvoice(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Invoice Meta */}
            <div className="grid grid-cols-2 gap-4 bg-[#F4F7FE] p-4 rounded-2xl text-xs">
              <div>
                <span className="text-slate-400 font-bold block">INVOICE NO:</span>
                <span className="font-black text-blue-600 text-sm">{selectedInvoice.inv}</span>
                <span className="text-slate-400 font-bold block mt-2">DATE & TIME:</span>
                <span className="font-black text-slate-800">{selectedInvoice.date}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block">BILLED TO:</span>
                <span className="font-black text-slate-900 text-sm">{selectedInvoice.name}</span>
                <span className="text-slate-500 font-bold block">{selectedInvoice.phone}</span>
                <span className="text-slate-400 font-bold block mt-1">SERVICE TYPE:</span>
                <span className="font-black text-slate-800">{selectedInvoice.orderType} ({selectedInvoice.tableNumber})</span>
              </div>
            </div>

            {/* Items Breakdown */}
            <div className="space-y-2 border-b border-slate-100 pb-4">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Itemized Breakdown</span>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                  selectedInvoice.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs font-bold text-slate-800">
                      <span>{item.name} &times; {item.qty || 1}</span>
                      <span className="font-black">₹ {((item.price || 0) * (item.qty || 1)).toLocaleString()}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-between text-xs font-bold text-slate-800">
                    <span>{selectedInvoice.service}</span>
                    <span className="font-black">{selectedInvoice.total}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="space-y-2 text-xs font-bold text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal (Net Amount):</span>
                <span className="font-black text-slate-800">{selectedInvoice.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>CGST (2.5%) + SGST (2.5%):</span>
                <span className="font-black text-slate-800">{selectedInvoice.gst}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 border-t border-slate-100 pt-3">
                <span>Grand Total:</span>
                <span className="text-blue-600">{selectedInvoice.total}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-500 pt-1">
                <span>Payment Mode:</span>
                <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 font-black border border-emerald-200">
                  {selectedInvoice.mode} - Paid
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button 
                onClick={() => window.print()}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print Tax Receipt
              </button>
              <button 
                onClick={() => setSelectedInvoice(null)}
                className="py-3 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-black transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
