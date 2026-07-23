import React, { useEffect, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { UserCircle2, ShieldCheck, TrendingUp, FileText } from 'lucide-react';
import TradeReceiptR2 from './TradeReceiptR2';

const TradeReceipt = ({ trade, customer, type, onClose, onEdit }) => {
  const receiptRef = useRef(null);
  const [theme, setTheme] = useState('dark'); // 'dark' or 'light'
  const [receiptVersion, setReceiptVersion] = useState('R1'); // 'R1' or 'R2'
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (trade && !isEditing) {
      setEditData({
        quantity: trade.quantity || '',
        lot: trade.lot || '',
        price: type === 'exit' ? trade.price : (trade.entryPrice || trade.price || ''),
        ltp: type === 'exit' ? trade.ltp : (trade.ltp || ''),
        marginRs: trade.marginRs !== undefined ? trade.marginRs : '',
        brokerageFee: trade.brokerageFee !== undefined ? trade.brokerageFee : '',
        brokeragePct: trade.brokeragePct !== undefined ? trade.brokeragePct : '',
        date: trade.date ? new Date(trade.date).toISOString().split('T')[0] : '',
        time: trade.time || '',
        holdingDate: trade.holdingDate ? new Date(trade.holdingDate).toISOString().split('T')[0] : '',
        holdingTime: trade.holdingTime || '',
        exchange: trade.exchange || 'NSE',
        tradeType: trade.tradeType || 'INTRADAY'
      });
    }
  }, [trade, isEditing, type]);

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
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
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
        pixelRatio: 2,
        cacheBust: false,
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

  const isExit = type === 'exit';
  
  const productType = (trade.action || 'Unknown').toUpperCase();
  const isBuy = productType === 'BUY';

  let buyPrice = null;
  let sellPrice = null;

  if (isExit) {
    if (isBuy) { // Exiting a short
      buyPrice = trade.ltp;
      sellPrice = trade.price;
    } else { // Exiting a long
      sellPrice = trade.ltp;
      buyPrice = trade.price;
    }
  } else {
    if (isBuy) {
      buyPrice = trade.price;
    } else {
      sellPrice = trade.price;
    }
  }

  const totalBuyValue = buyPrice !== null ? buyPrice * trade.quantity : null;
  const totalSellValue = sellPrice !== null ? sellPrice * trade.quantity : null;
  const isShortExit = trade.action.toLowerCase() === 'buy'; // Exiting a short position by buying

  let calculatedPnl = 0;
  if (isExit) {
    calculatedPnl = trade.realizedPnl !== undefined ? trade.realizedPnl : 0;
  } else {
    if (trade.customUpnl !== undefined) {
      calculatedPnl = trade.customUpnl;
    } else if (trade.ltp > 0 && trade.ltp !== (trade.price || trade.entryPrice)) {
      calculatedPnl = isBuy 
        ? ((trade.ltp - (trade.price || trade.entryPrice || 0)) * trade.quantity - (trade.brokerageFee || 0))
        : (((trade.price || trade.entryPrice || 0) - trade.ltp) * trade.quantity - (trade.brokerageFee || 0));
    } else {
      calculatedPnl = 0;
    }
  }

  const displayTotalPnl = calculatedPnl;
  const costBasis = (trade.price || trade.entryPrice || 0) * (trade.quantity || 1);
  const pnlPercent = costBasis > 0 ? (displayTotalPnl / costBasis) * 100 : 0;

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

  const inputClassName = `w-24 px-2 py-1 text-sm text-right rounded border transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 ${
    theme === 'dark' 
      ? 'bg-slate-800 text-white border-slate-700 focus:border-blue-500' 
      : 'bg-slate-100 text-slate-900 border-slate-300 focus:border-blue-500'
  }`;

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
                  {type.toLowerCase() === 'exit' ? 'TRADE EXIT' : 'TRADE ENTRY'}
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
                      {formatDate(trade.date)} {trade.time ? `| ${formatTime12Hr(trade.time)}` : ''}
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
                    {trade.symbol}
                  </h2>
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                    theme === 'dark' ? 'bg-slate-800 text-slate-300 border border-slate-700/60' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {(trade.exchange || 'NSE').toUpperCase()}
                  </span>
                </div>
                <div className="text-right">
                  <span className={`text-[9px] font-bold uppercase tracking-wider block ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                    LTP
                  </span>
                  <span className={`text-sm font-black ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    {formatCurrency(trade.ltp || trade.price || 0)}
                  </span>
                </div>
              </div>

              {/* Horizontal Net Position Card (Ref Image 1: Left, Center, Right Alignment) */}
              <div className={`p-3 rounded-xl border mb-2.5 ${
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
                    {productType}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-1">
                  {/* Left Aligned QTY */}
                  <div className="text-left">
                    <span className={`text-[9px] font-bold uppercase tracking-wider block mb-0.5 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                      QTY.
                    </span>
                    <span className={`text-xs sm:text-sm font-black `}>
                      {trade.quantity} {trade.lot ? `(${trade.lot})` : ''}
                    </span>
                  </div>

                  {/* Center Aligned UNREALISED P&L */}
                  <div className="text-center">
                    <span className={`text-[9px] font-bold uppercase tracking-wider block mb-0.5 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                      UNREALISED P&L
                    </span>
                    <span className={`text-xs sm:text-sm font-black block ${calculatedPnl >= 0 ? (theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600') : 'text-rose-500'}`}>
                      {calculatedPnl >= 0 ? '+' : ''}{formatCurrency(calculatedPnl)}
                    </span>
                    <span className={`text-[9px] font-bold block ${calculatedPnl >= 0 ? 'text-emerald-500/90' : 'text-rose-500/90'}`}>
                      ({pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%)
                    </span>
                  </div>

                  {/* Right Aligned AVG. PRICE */}
                  <div className="text-right">
                    <span className={`text-[9px] font-bold uppercase tracking-wider block mb-0.5 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                      AVG. PRICE
                    </span>
                    <span className={`text-xs sm:text-sm font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                      {formatCurrency(trade.price || trade.entryPrice || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Main Trade Details Card (Ref Image 2: Label on top, Value below, NO LINES!) */}
              <div className={`p-3 rounded-xl border mb-2.5 ${
                theme === 'dark' ? 'bg-[#05070f] border-slate-800/80' : 'bg-white border-[#e2e8f0] shadow-sm'
              }`}>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {/* Product */}
                  {(!isEditing && trade.tradeType) && (
                    <div>
                      <span className={`text-[10px] font-medium block mb-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Product</span>
                      <span className={`text-xs font-bold block ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{trade.tradeType.toUpperCase()}</span>
                    </div>
                  )}

                  {/* Trade Type */}
                  {productType && (
                    <div>
                      <span className={`text-[10px] font-medium block mb-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Trade Type</span>
                      <span className={`text-xs font-bold inline-block px-1.5 py-0.5 rounded ${
                        isBuy 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {productType}
                      </span>
                    </div>
                  )}

                  {/* Buy Qty. */}
                  {(isEditing || trade.quantity > 0) && (
                    <div>
                      <span className={`text-[10px] font-medium block mb-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Buy Qty.</span>
                      {isEditing ? (
                        <div className="flex gap-2">
                          <input type="number" className={inputClassName} value={editData.quantity} onChange={e => setEditData({...editData, quantity: e.target.value})} placeholder="Qty" />
                          <input type="number" className={inputClassName} value={editData.lot} onChange={e => setEditData({...editData, lot: e.target.value})} placeholder="Lot" />
                        </div>
                      ) : (
                        <span className={`text-xs font-semibold block ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>
                          {trade.quantity} {trade.lot ? `(${trade.lot})` : ''}
                        </span>
                      )}
                    </div>
                  )}

                  {/* LTP */}
                  {(isEditing || trade.ltp > 0) && (
                    <div>
                      <span className={`text-[10px] font-medium block mb-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>LTP</span>
                      {isEditing ? (
                        <input type="number" className={inputClassName} value={editData.ltp} onChange={e => setEditData({...editData, ltp: e.target.value})} />
                      ) : (
                        <span className={`text-xs font-semibold block ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>
                          {formatCurrency(trade.ltp || 0)}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Avg. Buy Price */}
                  {(isEditing || (trade.price || trade.entryPrice) > 0) && (
                    <div>
                      <span className={`text-[10px] font-medium block mb-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Avg. Buy Price</span>
                      {isEditing ? (
                        <input type="number" className={inputClassName} value={editData.price} onChange={e => setEditData({...editData, price: e.target.value})} />
                      ) : (
                        <span className={`text-xs font-semibold block ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>
                          {formatCurrency(trade.price || trade.entryPrice || 0)}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Brokerage */}
                  {(!isEditing && trade.brokerageFee > 0) && (
                    <div>
                      <span className={`text-[10px] font-medium block mb-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Brokerage</span>
                      <span className={`text-xs font-semibold block ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>
                        {formatCurrency(trade.brokerageFee)}
                      </span>
                    </div>
                  )}

                  {/* Buy Value */}
                  {(!isEditing && ((trade.price || trade.entryPrice || 0) * trade.quantity) > 0) && (
                    <div>
                      <span className={`text-[10px] font-medium block mb-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Buy Value</span>
                      <span className={`text-xs font-semibold block ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>
                        {formatCurrency((trade.price || trade.entryPrice || 0) * trade.quantity)}
                      </span>
                    </div>
                  )}

                  {/* Exchange */}
                  {trade.exchange && (
                    <div>
                      <span className={`text-[10px] font-medium block mb-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Exchange</span>
                      <span className={`text-xs font-bold block ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{trade.exchange.toUpperCase()}</span>
                    </div>
                  )}

                  {/* Money Margin */}
                  {(isEditing || trade.marginRs > 0 || trade.marginPct > 0) && (
                    <div>
                      <span className={`text-[10px] font-medium block mb-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Money Margin</span>
                      {isEditing ? (
                        <input type="number" className={inputClassName} value={editData.marginRs !== undefined ? editData.marginRs : editData.marginPct} onChange={e => setEditData({...editData, marginRs: e.target.value})} />
                      ) : (
                        <span className={`text-xs font-semibold flex items-center gap-1.5 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>
                          {(() => {
                            const marginRsVal = parseFloat(trade.marginRs) || 0;
                            const totalVal = (trade.quantity || 0) * (trade.price || trade.entryPrice || 0);
                            let marginPctVal = parseFloat(trade.marginPct) || 0;
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
                          {formatCurrency(trade.marginRs || 0)}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Trade Time */}
                  {trade.time && (
                    <div>
                      <span className={`text-[10px] font-medium block mb-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Trade Time</span>
                      <span className={`text-xs font-semibold block ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>{formatTime12Hr(trade.time)}</span>
                    </div>
                  )}

                  {/* Order Date */}
                  {trade.date && (
                    <div>
                      <span className={`text-[10px] font-medium block mb-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Order Date</span>
                      <span className={`text-xs font-semibold block ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>{formatDate(trade.date)}</span>
                    </div>
                  )}

                  {/* Conditional Holding Date & Holding Time (Only show if provided/input) */}
                  {trade.holdingDate && (
                    <div>
                      <span className={`text-[10px] font-medium block mb-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Holding Date</span>
                      <span className={`text-xs font-semibold block ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>{formatDate(trade.holdingDate)}</span>
                    </div>
                  )}

                  {trade.holdingTime && (
                    <div>
                      <span className={`text-[10px] font-medium block mb-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Holding Time</span>
                      <span className={`text-xs font-semibold block ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>{formatTime12Hr(trade.holdingTime)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Net P&L Footer Box */}
              {!isEditing && (
                <div className={`p-3 rounded-xl border flex flex-col justify-center items-start transition-all mb-2.5 ${
                  calculatedPnl >= 0 
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
                      {calculatedPnl >= 0 ? '+' : ''}{formatCurrency(calculatedPnl)}
                    </span>
                    <span className={`text-[11px] font-bold ${calculatedPnl >= 0 ? 'text-emerald-400/90' : 'text-rose-400/90'}`}>
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
            <TradeReceiptR2
              trade={trade}
              customer={customer}
              type={type}
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
              <span className="material-symbols-outlined text-[18px]">edit</span>
              EDIT
            </button>
          )}
          {isEditing && (
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-white bg-green-600 hover:bg-green-500 transition-colors shadow-lg shadow-green-600/10"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              {isSaving ? 'SAVING...' : 'SAVE'}
            </button>
          )}
          <button 
            onClick={handleDownload}
            className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/10"
          >
            <FileText size={18} />
            SAVE PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default TradeReceipt;
