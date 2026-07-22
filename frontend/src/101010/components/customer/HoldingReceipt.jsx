import React, { useEffect, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { UserCircle2, ShieldCheck, TrendingUp, FileText } from 'lucide-react';
import HoldingReceiptR2 from './HoldingReceiptR2';

const HoldingReceipt = ({ customer, holding, onClose, onEdit }) => {
  const receiptRef = useRef(null);
  const [theme, setTheme] = useState('dark'); // 'dark' or 'light'
  const [receiptVersion, setReceiptVersion] = useState('R1'); // 'R1' or 'R2'

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (holding && !isEditing) {
      setEditData({
        quantity: holding.netQty || 0,
        lot: holding.lot || '',
        price: holding.avgCost || 0,
        ltp: holding.lastPrice || 0,
        marginRs: holding.totalMargin || 0,
        brokerageFee: holding.totalBrokerage || 0,
        date: holding.date ? new Date(holding.date).toISOString().split('T')[0] : '',
        time: holding.time || '',
        holdingDate: holding.holdingDate ? new Date(holding.holdingDate).toISOString().split('T')[0] : '',
        holdingTime: holding.holdingTime || '',
        exchange: holding.exchange || 'NSE',
        tradeType: holding.tradeType || 'INTRADAY'
      });
    }
  }, [holding, isEditing]);

  const displayQty = isEditing ? (parseFloat(editData.quantity) || 0) : (holding.netQty || 0);
  const displayPrice = isEditing ? (parseFloat(editData.price) || 0) : (holding.avgCost || 0);
  const displayLtp = isEditing ? (parseFloat(editData.ltp) || 0) : (holding.lastPrice || 0);
  const displayMargin = isEditing ? (parseFloat(editData.marginRs) || 0) : (holding.totalMargin || 0);
  const displayBrokerage = isEditing ? (parseFloat(editData.brokerageFee) || 0) : (holding.totalBrokerage || 0);

  const displayInvested = holding.customInvested !== undefined ? holding.customInvested : holding.totalInvestment;
  const displayUnrealisedPnl = holding.customUpnl !== undefined ? holding.customUpnl : holding.upnl + (holding.totalBrokerage || 0);
  const displayTotalPnl = holding.customTotalPnl !== undefined ? holding.customTotalPnl : holding.totalPnl || holding.upnl;
  const isBuy = holding.type.toLowerCase() === 'buy';
  const pnlPercent = displayInvested > 0 ? (displayTotalPnl / displayInvested) * 100 : 0;

  const handleSave = async () => {
    if (onEdit) {
      setIsSaving(true);
      await onEdit(editData);
      setIsSaving(false);
      setIsEditing(false);
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
  const formatDateTime = () => {
    const d = new Date();
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const handleDownload = async () => {
    const el = receiptRef.current;
    if (!el) return;
    try {
      const filter = (node) => {
        // Exclude external stylesheets to prevent CORS SecurityError
        if (node.tagName === 'LINK' && node.rel === 'stylesheet') {
          return false;
        }
        return true;
      };

      // Save original styles
      const originalWidth = el.style.width;
      const originalMaxWidth = el.style.maxWidth;

      // Force a fixed wide width for print capture so layout spreads out
      const printWidth = receiptVersion === 'R1' ? '420px' : '720px';
      el.style.width = printWidth;
      el.style.maxWidth = printWidth;

      // Get the exact width and height of the receipt card with forced dimensions
      const width = el.offsetWidth;
      const height = el.offsetHeight;

      const dataUrl = await toPng(el, {
        backgroundColor: theme === 'dark' ? '#03060d' : '#ffffff',
        width: width,
        height: height,
        pixelRatio: 4,
        filter: filter,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
        }
      });

      // Restore original styles
      el.style.width = originalWidth;
      el.style.maxWidth = originalMaxWidth;

      const pdf = new jsPDF({
        orientation: width > height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [width, height]
      });

      pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);
      const today = new Date();
      const formattedDate = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear().toString().slice(-2)}`;
      const safeCustomerName = (customer.name || 'Customer').replace(/[^a-zA-Z0-9]/g, '_');
      pdf.save(`${safeCustomerName}_${formattedDate}.pdf`);
    } catch (error) {
      console.error('Failed to generate receipt PDF:', error);
      alert('Error generating PDF: ' + error.message);
    }
  };

  const inputClassName = `w-24 px-2 py-1 text-sm text-right rounded border transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 ${
    theme === 'dark' 
      ? 'bg-slate-800 text-white border-slate-700 focus:border-blue-500' 
      : 'bg-slate-100 text-slate-900 border-slate-300 focus:border-blue-500'
  }`;

  const formatTime12Hr = (timeStr) => {
    if (!timeStr) return '';
    if (timeStr.includes('AM') || timeStr.includes('PM') || timeStr.includes('am') || timeStr.includes('pm')) return timeStr;
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    if (isNaN(hours)) return timeStr;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const hoursFormatted = hours < 10 ? `0${hours}` : hours;
    return `${hoursFormatted}:${minutes} ${ampm}`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-slate-950/90 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
      {/* Background clickable area to close */}
      <div className="fixed inset-0 min-h-screen print-hide" onClick={onClose}></div>

      <div className="relative z-10 w-full max-w-[1400px] my-3 flex flex-col items-center receipt-print-area">
        {/* Toggles Bar */}
        <div className="flex gap-4 mb-4 print-hide justify-center items-center">
          {/* Version Toggle (R1 / R2) */}
          <div className="flex gap-1.5 bg-slate-900/90 rounded-full border border-slate-800 p-1 shadow-xl">
            <button
              onClick={() => setReceiptVersion('R1')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                receiptVersion === 'R1'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              R1
            </button>
            <button
              onClick={() => setReceiptVersion('R2')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                receiptVersion === 'R2'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              R2
            </button>
          </div>

          {/* Theme Toggle */}
          <div className="flex gap-1.5 bg-slate-900/90 rounded-full border border-slate-800 p-1 shadow-xl">
            <button
              onClick={() => setTheme('light')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                theme === 'light' 
                  ? 'bg-white text-slate-900 shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              LIGHT
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                theme === 'dark' 
                  ? 'bg-slate-800 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              DARK
            </button>
          </div>
        </div>

        {/* Receipt Scroll Wrapper */}
        <div className="w-full overflow-x-auto pb-4 flex justify-start md:justify-center px-4">
          {/* Receipt Container */}
          <div
            ref={receiptRef}
            className={`overflow-hidden transition-colors duration-300 ${
              theme === 'dark' 
                ? 'bg-[#03060d] text-slate-200 border border-slate-800 theme-dark' 
                : 'bg-[#ffffff] text-slate-800 border border-[#e2e8f0] theme-light'
            } rounded-2xl shadow-2xl shrink-0`}
            style={{ 
              fontFamily: "'Inter', sans-serif",
              width: receiptVersion === 'R1' ? '420px' : '720px',
              minWidth: receiptVersion === 'R1' ? '420px' : '720px',
              backgroundColor: theme === 'dark' ? '#03060d' : '#ffffff'
            }}
          >
          {receiptVersion === 'R1' ? (
            <div className="p-3 sm:p-3.5">
              {/* Top Header with Company Name & Customer ID */}
              <div className="flex justify-between items-start pb-1.5">
                <div>
                  <h1 className={`text-2xl font-black tracking-wider ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
                    DHANLAXMI
                  </h1>
                  <div className={`text-[9px] font-bold tracking-[0.2em] uppercase mt-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    CAPITAL PVT. LTD.
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[9px] font-bold uppercase tracking-wider block mt-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} whitespace-nowrap`}>Customer ID</span>
                  <span className={`text-xs font-bold block mt-0.5 ${theme === 'dark' ? 'text-white' : 'text-slate-900'} whitespace-nowrap`}>
                    {customer?.id || customer?.customerId || customer?._id || 'CUST-101'}
                  </span>
                </div>
              </div>

              {/* Subheader Line */}
              <div className="flex items-center my-2">
                <div className={`flex-grow border-t ${theme === 'dark' ? 'border-slate-800/80' : 'border-slate-200'}`}></div>
                <span className={`mx-2.5 text-[9px] font-bold tracking-[0.2em] uppercase ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} whitespace-nowrap`}>
                  ENTRY RECEIPT
                </span>
                <div className={`flex-grow border-t ${theme === 'dark' ? 'border-slate-800/80' : 'border-slate-200'}`}></div>
              </div>

              {/* Customer Details Block */}
              <div className={`p-2.5 rounded-xl border mb-2.5 ${
                theme === 'dark' ? 'bg-[#05070f] border-slate-800/80' : 'bg-[#f8fafc] border-[#e2e8f0]'
              }`}>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className={`text-[9px] font-bold uppercase tracking-wider block ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Customer Name</span>
                    <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{customer?.name || 'N/A'}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-[9px] font-bold uppercase tracking-wider block ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Entry Date & Time</span>
                    <span className={`font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                      {new Date(holding.date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })} {holding.time ? `| ${formatTime12Hr(holding.time)}` : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stock Header Bar (Symbol + Exchange, LTP) */}
              <div className={`p-2.5 rounded-xl border mb-2.5 flex justify-between items-center ${
                theme === 'dark' ? 'bg-[#05070f] border-slate-800/80' : 'bg-[#ffffff] border-[#e2e8f0]'
              }`}>
                <div className="flex items-center gap-2">
                  <h2 className={`text-xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'} uppercase`}>
                    {holding.symbol}
                  </h2>
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                    theme === 'dark' ? 'bg-slate-800 text-slate-300 border border-slate-700/60' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {(holding.exchange || 'NSE').toUpperCase()}
                  </span>
                </div>
                <div className="text-right">
                  <span className={`text-[9px] font-bold uppercase tracking-wider block ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                    LTP
                  </span>
                  <span className={`text-sm font-black ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    {formatCurrency(displayLtp)}
                  </span>
                </div>
              </div>

              {/* Horizontal Net Position Card */}
              <div className={`p-1 rounded-xl border mb-2.5 ${
                theme === 'dark' ? 'bg-[#05070f] border-slate-800/80' : 'bg-[#f8fafc] border-[#e2e8f0]'
              }`}>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-[10px] font-extrabold uppercase tracking-widest ${
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    NET POSITION
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    isBuy 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {holding.type.toUpperCase()}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-1">
                  {/* Left Aligned QTY */}
                  <div className="text-left">
                    <span className={`text-[9px] font-bold uppercase tracking-wider block  ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                      QTY.
                    </span>
                    <span className={`text-xs sm:text-sm font-black ${isBuy ? (theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600') : (theme === 'dark' ? 'text-rose-400' : 'text-rose-600')}`}>
                      +{displayQty} {holding.lot ? `(${holding.lot})` : ''}
                    </span>
                  </div>

                  {/* Center Aligned UNREALISED P&L */}
                  <div className="text-center">
                    <span className={`text-[9px] font-bold uppercase tracking-wider block  ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                      UNREALISED P&L
                    </span>
                    <span className={`text-xs sm:text-sm font-black block ${displayTotalPnl >= 0 ? (theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600') : 'text-rose-500'}`}>
                      {displayTotalPnl >= 0 ? '+' : ''}{formatCurrency(displayTotalPnl)}
                    </span>
                    <span className={`text-[9px] font-bold block ${displayTotalPnl >= 0 ? 'text-emerald-500/90' : 'text-rose-500/90'}`}>
                      ({pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%)
                    </span>
                  </div>

                  {/* Right Aligned AVG. PRICE */}
                  <div className="text-right">
                    <span className={`text-[9px] font-bold uppercase tracking-wider block ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                      AVG. PRICE
                    </span>
                    <span className={`text-xs sm:text-sm font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                      {formatCurrency(displayPrice)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Main Holding Details Card */}
              <div className={`p-3 rounded-xl border mb-2.5 ${
                theme === 'dark' ? 'bg-[#05070f] border-slate-800/80' : 'bg-white border-[#e2e8f0] shadow-sm'
              }`}>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {/* Product */}
                  {(!isEditing && holding.tradeType) && (
                    <div>
                      <span className={`text-[10px] font-medium block mb-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Product</span>
                      <span className={`text-xs font-bold block ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{holding.tradeType.toUpperCase()}</span>
                    </div>
                  )}

                  {/* Mode */}
                  {holding.type && (
                    <div>
                      <span className={`text-[10px] font-medium block mb-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Mode</span>
                      <span className={`text-xs font-bold inline-block px-1.5 py-0.5 rounded ${
                        isBuy 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {holding.type.toUpperCase()}
                      </span>
                    </div>
                  )}

                  {/* Qty */}
                  {(isEditing || displayQty > 0 || holding.quantity > 0) && (
                    <div>
                      <span className={`text-[10px] font-medium block mb-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Qty. (Lot)</span>
                      {isEditing ? (
                        <div className="flex gap-2">
                          <input type="number" className={inputClassName} value={editData.quantity} onChange={e => setEditData({ ...editData, quantity: e.target.value })} placeholder="Qty" />
                          <input type="number" className={inputClassName} value={editData.lot} onChange={e => setEditData({ ...editData, lot: e.target.value })} placeholder="Lot" />
                        </div>
                      ) : (
                        <span className={`text-xs font-semibold block ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>
                          {displayQty} {holding.lot ? `(${holding.lot})` : ''}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Invested */}
                  {(!isEditing && displayInvested > 0) && (
                    <div>
                      <span className={`text-[10px] font-medium block mb-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Invested</span>
                      <span className={`text-xs font-semibold block ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>
                        {formatCurrency(displayInvested)}
                      </span>
                    </div>
                  )}

                  {/* Avg. Price */}
                  {(isEditing || displayPrice > 0) && (
                    <div>
                      <span className={`text-[10px] font-medium block mb-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Avg. Price</span>
                      {isEditing ? (
                        <input type="number" className={inputClassName} value={editData.price} onChange={e => setEditData({ ...editData, price: e.target.value })} />
                      ) : (
                        <span className={`text-xs font-semibold block ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>
                          {formatCurrency(displayPrice)}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Brokerage */}
                  {(!isEditing && displayBrokerage > 0) && (
                    <div>
                      <span className={`text-[10px] font-medium block mb-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Brokerage</span>
                      <span className={`text-xs font-semibold block ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>
                        {formatCurrency(displayBrokerage)}
                      </span>
                    </div>
                  )}

                  {/* LTP */}
                  {(isEditing || displayLtp > 0) && (
                    <div>
                      <span className={`text-[10px] font-medium block mb-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>LTP</span>
                      {isEditing ? (
                        <input type="number" className={inputClassName} value={editData.ltp} onChange={e => setEditData({ ...editData, ltp: e.target.value })} />
                      ) : (
                        <span className={`text-xs font-semibold block ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>
                          {formatCurrency(displayLtp)}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Exchange */}
                  {holding.exchange && (
                    <div>
                      <span className={`text-[10px] font-medium block mb-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Exchange</span>
                      <span className={`text-xs font-bold block ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{holding.exchange.toUpperCase()}</span>
                    </div>
                  )}

                  {/* Money Margin */}
                  {(isEditing || displayMargin > 0) && (
                    <div>
                      <span className={`text-[10px] font-medium block mb-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Money Margin</span>
                      {isEditing ? (
                        <input type="number" className={inputClassName} value={editData.marginRs} onChange={e => setEditData({ ...editData, marginRs: e.target.value })} />
                      ) : (
                        <span className={`text-xs font-semibold flex items-center gap-1.5 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>
                          {(() => {
                            const marginRsVal = parseFloat(displayMargin) || 0;
                            const totalVal = displayInvested || (displayQty * displayPrice);
                            let marginPctVal = parseFloat(holding.marginPct) || 0;
                            if (marginRsVal <= 0) {
                              marginPctVal = 0;
                            } else if (marginPctVal <= 0 && totalVal > 0) {
                              marginPctVal = (marginRsVal / totalVal) * 100;
                            }
                            return marginPctVal > 0 ? (
                              <span className="text-[9px] bg-slate-800 text-slate-400 px-1 py-0.5 rounded">
                                {marginPctVal.toFixed(2)}%
                              </span>
                            ) : null;
                          })()}
                          {formatCurrency(displayMargin)}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Entry Time */}
                  {holding.time && (
                    <div>
                      <span className={`text-[10px] font-medium block mb-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Entry Time</span>
                      <span className={`text-xs font-semibold block ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>{formatTime12Hr(holding.time)}</span>
                    </div>
                  )}

                  {/* Entry Date */}
                  {holding.date && (
                    <div>
                      <span className={`text-[10px] font-medium block mb-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Entry Date</span>
                      <span className={`text-xs font-semibold block ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>{new Date(holding.date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                    </div>
                  )}

                  {/* Holding Date */}
                  {holding.holdingDate && (
                    <div>
                      <span className={`text-[10px] font-medium block mb-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Holding Date</span>
                      <span className={`text-xs font-semibold block ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>{new Date(holding.holdingDate).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                    </div>
                  )}

                  {/* Holding Time */}
                  {holding.holdingTime && (
                    <div>
                      <span className={`text-[10px] font-medium block mb-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Holding Time</span>
                      <span className={`text-xs font-semibold block ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>{formatTime12Hr(holding.holdingTime)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Net P&L Footer Box */}
              {!isEditing && (
                <div className={`p-3 rounded-xl border flex flex-col justify-center items-start transition-all mb-2.5 ${
                  displayTotalPnl >= 0 
                    ? (theme === 'dark' 
                        ? 'bg-gradient-to-r from-emerald-950/40 to-emerald-900/10 border-emerald-500/20 text-emerald-400' 
                        : 'bg-gradient-to-r from-emerald-50 to-emerald-100/50 border-emerald-200 text-emerald-700')
                    : (theme === 'dark' 
                        ? 'bg-gradient-to-r from-rose-950/40 to-rose-900/10 border-rose-500/20 text-rose-400' 
                        : 'bg-gradient-to-r from-rose-50 to-rose-100/50 border-rose-200 text-rose-700')
                }`}>
                  <span className="text-[9px] font-bold uppercase tracking-[0.15em] mb-0.5">
                    NET P/L
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black tracking-tight whitespace-nowrap">
                      {displayTotalPnl >= 0 ? '+' : ''}{formatCurrency(displayTotalPnl)}
                    </span>
                    <span className={`text-[11px] font-bold ${displayTotalPnl >= 0 ? 'text-emerald-400/90' : 'text-rose-400/90'}`}>
                      ({pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              )}

              {/* Footer Line */}
              <div className="flex items-center my-3">
                <div className={`flex-grow border-t ${theme === 'dark' ? 'border-slate-800/80' : 'border-slate-200'}`}></div>
                <span className={`mx-2.5 text-[9px] font-bold tracking-[0.2em] uppercase ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} whitespace-nowrap`}>
                  © DHANLAXMI CAPITAL PVT. LTD.
                </span>
                <div className={`flex-grow border-t ${theme === 'dark' ? 'border-slate-800/80' : 'border-slate-200'}`}></div>
              </div>
            </div>
          ) : (
            <HoldingReceiptR2
              customer={customer}
              holding={holding}
              theme={theme}
              isEditing={isEditing}
              editData={editData}
              setEditData={setEditData}
              inputClassName={inputClassName}
            />
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex w-full mt-6 gap-4 print-hide" style={{ maxWidth: receiptVersion === 'R1' ? '420px' : '720px' }}>
          <button
            onClick={onClose}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-colors ${
              theme === 'dark' 
                ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300/50'
            }`}
          >
            CLOSE
          </button>
          {onEdit && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 transition-colors shadow-lg shadow-emerald-500/10"
            >
              EDIT
            </button>
          )}
          {isEditing && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-white bg-green-600 hover:bg-green-500 transition-colors shadow-lg shadow-green-600/10"
            >
              {isSaving ? 'SAVING...' : 'SAVE'}
            </button>
          )}
          <button
            onClick={handleDownload}
            className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/10"
          >
            SAVE PDF
          </button>
        </div>

      </div>
    </div>
  );
};

export default HoldingReceipt;
