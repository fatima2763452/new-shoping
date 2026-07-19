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
        brokerageFee: holding.totalBrokerage || 0
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
        backgroundColor: theme === 'dark' ? '#0b1329' : '#ffffff',
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
                ? 'bg-[#0b1329] text-slate-200 border border-[#1e293b]' 
                : 'bg-[#ffffff] text-slate-800 border border-[#e2e8f0]'
            } rounded-2xl shadow-2xl shrink-0`}
            style={{ 
              fontFamily: "'Inter', sans-serif",
              width: receiptVersion === 'R1' ? '420px' : '720px',
              minWidth: receiptVersion === 'R1' ? '420px' : '720px'
            }}
          >
          {receiptVersion === 'R1' ? (
            <div className="p-1.5 sm:px-3 sm:py-3">
              {/* Header */}
              <div className="flex justify-between items-start pb-2">
                <div>
                  <h1 className={`text-3xl font-black tracking-wider ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
                    RADHE
                  </h1>
                  <div className={`text-[10px] font-bold tracking-[0.2em] uppercase mt-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    BROCKRAGE PVT. LTD.
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-bold uppercase tracking-wider block mt-2.5 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} whitespace-nowrap`}>Customer ID</span>
                  <span className={`text-sm font-semibold block mt-0.5 ${theme === 'dark' ? 'text-white' : 'text-slate-950'} whitespace-nowrap`}>
                    {customer.id}
                  </span>
                </div>
              </div>

              {/* Subheader Line */}
              <div className="flex items-center mb-2">
                <div className={`flex-grow border-t ${theme === 'dark' ? 'border-slate-800/80' : 'border-slate-200'}`}></div>
                <span className={`mx-4 text-[10px] font-bold tracking-[0.25em] uppercase ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} whitespace-nowrap`}>
                  TRADE ENTRY RECEIPT
                </span>
                <div className={`flex-grow border-t ${theme === 'dark' ? 'border-slate-800/80' : 'border-slate-200'}`}></div>
              </div>

              {/* Asset Banner Card */}
              <div className={`p-2 rounded-xl border mb-2 flex justify-between items-center transition-colors ${
                theme === 'dark' ? 'bg-[#0f172a]/80 border-[#1e293b]' : 'bg-[#f8fafc] border-[#e2e8f0]'
              }`}>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`text-xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'} whitespace-nowrap`}>
                      {holding.symbol}
                    </h3>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                      theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'
                    }`}>
                      NSE
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider ${
                      isBuy 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    } whitespace-nowrap`}>
                      {holding.type.toUpperCase()}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                      theme === 'dark' 
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                        : 'bg-blue-50 text-blue-600 border border-blue-200'
                    } whitespace-nowrap`}>
                      ENTRY
                    </span>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end">
                  <span className={`text-[8px] font-semibold uppercase tracking-wider block ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} whitespace-nowrap`}>
                    NET P&L
                  </span>
                  <span className={`text-lg font-black block mt-0.5 whitespace-nowrap ${displayTotalPnl >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                    {displayTotalPnl >= 0 ? '+' : ''}{formatCurrency(displayTotalPnl)}
                  </span>
                  <span className={`text-[11px] font-bold block mt-0.5 whitespace-nowrap ${displayTotalPnl >= 0 ? 'text-emerald-400/90' : 'text-rose-500/90'}`}>
                    ({pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%)
                  </span>
                </div>
              </div>

              {/* Metric Cards Grid */}
              <div className="grid grid-cols-3 gap-3 mb-2">
                <div className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center text-center transition-colors ${
                  theme === 'dark' ? 'bg-[#0f172a]/50 border-[#1e293b]' : 'bg-[#f8fafc] border-[#e2e8f0]'
                }`}>
                  <div className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} whitespace-nowrap`}>
                    ENTRY DATE
                  </div>
                  <div className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-950'} whitespace-nowrap`}>
                    {formatDateTime()}
                  </div>
                </div>
                
                <div className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center text-center transition-colors ${
                  theme === 'dark' ? 'bg-[#0f172a]/50 border-[#1e293b]' : 'bg-[#f8fafc] border-[#e2e8f0]'
                }`}>
                  <div className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} whitespace-nowrap`}>
                    NAME
                  </div>
                  <div className={`text-sm font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-950'} whitespace-nowrap`}>
                    {customer.name?.split(' ')[0] || 'User'}
                  </div>
                </div>

                <div className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center text-center transition-colors ${
                  theme === 'dark' ? 'bg-[#0f172a]/50 border-[#1e293b]' : 'bg-[#f8fafc] border-[#e2e8f0]'
                }`}>
                  <div className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} whitespace-nowrap`}>
                    AVG PRICE
                  </div>
                  <div className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-950'} whitespace-nowrap`}>
                    {formatCurrency(holding.avgCost)}
                  </div>
                </div>
              </div>

              {/* Holding Details Table */}
              <div className={`rounded-xl border overflow-hidden mb-2 transition-colors ${
                theme === 'dark' ? 'bg-[#0f172a]/30 border-[#1e293b]' : 'bg-white border-[#e2e8f0] shadow-sm'
              }`}>
                <div className={`px-3 py-2 divide-y ${theme === 'dark' ? 'divide-slate-800/60' : 'divide-slate-200'}`}>
                  {!isEditing && (
                    <div className="flex justify-between items-center py-2.5">
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} whitespace-nowrap`}>Mode</span>
                      <span className={`text-sm font-bold ${isBuy ? 'text-emerald-500' : 'text-rose-500'} whitespace-nowrap`}>{holding.type.toUpperCase()}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2.5">
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} whitespace-nowrap`}>Qty (Lot)</span>
                    {isEditing ? (
                      <div className="flex gap-2">
                        <input type="number" className={inputClassName} value={editData.quantity} onChange={e => setEditData({ ...editData, quantity: e.target.value })} placeholder="Qty" />
                        <input type="number" className={inputClassName} value={editData.lot} onChange={e => setEditData({ ...editData, lot: e.target.value })} placeholder="Lot" />
                      </div>
                    ) : (
                      <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'} whitespace-nowrap`}>{displayQty} {holding.lot ? `(${holding.lot})` : ''}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center py-2.5">
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} whitespace-nowrap`}>Avg</span>
                    {isEditing ? (
                      <input type="number" className={inputClassName} value={editData.price} onChange={e => setEditData({ ...editData, price: e.target.value })} />
                    ) : (
                      <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'} whitespace-nowrap`}>{formatCurrency(holding.avgCost)}</span>
                    )}
                  </div>
                  {!isEditing && (
                    <div className="flex justify-between items-center py-2.5">
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} whitespace-nowrap`}>Invested</span>
                      <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'} whitespace-nowrap`}>{formatCurrency(displayInvested)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2.5">
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} whitespace-nowrap`}>LTP</span>
                    {isEditing ? (
                      <input type="number" className={inputClassName} value={editData.ltp} onChange={e => setEditData({ ...editData, ltp: e.target.value })} />
                    ) : (
                      <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'} whitespace-nowrap`}>{formatCurrency(holding.lastPrice)}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center py-2.5">
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} whitespace-nowrap`}>Money Margin</span>
                    {isEditing ? (
                      <input type="number" className={inputClassName} value={editData.marginRs} onChange={e => setEditData({ ...editData, marginRs: e.target.value })} />
                    ) : (
                      <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'} whitespace-nowrap`}>{formatCurrency(holding.totalMargin || 0)}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center py-2.5">
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} whitespace-nowrap`}>Brockerage</span>
                    {isEditing ? (
                      <input type="number" className={inputClassName} value={editData.brokerageFee} onChange={e => setEditData({ ...editData, brokerageFee: e.target.value })} />
                    ) : (
                      <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'} whitespace-nowrap`}>{formatCurrency(holding.totalBrokerage || 0)}</span>
                    )}
                  </div>
                  {!isEditing && (
                    <div className="flex justify-between items-center py-2.5">
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} whitespace-nowrap`}>Unrealised P&L</span>
                      <span className={`text-sm font-bold whitespace-nowrap ${displayUnrealisedPnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {(displayUnrealisedPnl >= 0 ? '+' : '')}{formatCurrency(displayUnrealisedPnl)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Total P&L Footer */}
              {!isEditing && (
                <div className={`p-4 rounded-xl border flex flex-col justify-center items-start transition-all ${
                  displayTotalPnl >= 0 
                    ? (theme === 'dark' 
                        ? 'bg-gradient-to-r from-emerald-950/40 to-emerald-900/10 border-emerald-900/50 text-emerald-400' 
                        : 'bg-gradient-to-r from-emerald-50 to-emerald-100/50 border-emerald-200 text-emerald-700')
                    : (theme === 'dark' 
                        ? 'bg-gradient-to-r from-rose-950/40 to-rose-900/10 border-rose-900/50 text-rose-400' 
                        : 'bg-gradient-to-r from-rose-50 to-rose-100/50 border-rose-200 text-rose-700')
                }`}>
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1">
                    TOTAL P/L
                  </span>
                  <span className="text-2xl font-black tracking-tight whitespace-nowrap">
                    {displayTotalPnl >= 0 ? '+' : ''}{formatCurrency(displayTotalPnl)}
                  </span>
                </div>
              )}

              {/* Footer Line */}
              <div className="flex items-center my-2">
                <div className={`flex-grow border-t ${theme === 'dark' ? 'border-slate-800/80' : 'border-slate-200'}`}></div>
                <span className={`mx-4 text-[10px] font-bold tracking-[0.2em] uppercase ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} whitespace-nowrap`}>
                  © RADHE BROCKRAGE PVT. LTD.
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
