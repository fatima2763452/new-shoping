import React from 'react';

const HoldingReceiptR2 = ({
  customer,
  holding,
  theme,
  isEditing,
  editData,
  setEditData,
  inputClassName
}) => {
  const displayQty = isEditing ? (parseFloat(editData.quantity) || 0) : (holding.netQty || 0);
  const displayPrice = isEditing ? (parseFloat(editData.price) || 0) : (holding.avgCost || 0);
  const displayLtp = isEditing ? (parseFloat(editData.ltp) || 0) : (holding.lastPrice || 0);
  const displayMargin = isEditing 
    ? (parseFloat(editData.marginRs) || 0) 
    : (holding.totalMargin !== undefined && holding.totalMargin !== null && !isNaN(parseFloat(holding.totalMargin)) ? parseFloat(holding.totalMargin) : 0);
  const displayBrokerage = isEditing ? (parseFloat(editData.brokerageFee) || 0) : (holding.totalBrokerage || 0);

  const totalVal = holding.totalInvestment || (displayQty * displayPrice);
  let marginPctVal = isEditing 
    ? (parseFloat(editData.marginPct) || 0) 
    : (holding.marginPct !== undefined && holding.marginPct !== null && !isNaN(parseFloat(holding.marginPct)) ? parseFloat(holding.marginPct) : 0);

  if (displayMargin <= 0) {
    marginPctVal = 0;
  } else if (marginPctVal <= 0 && totalVal > 0) {
    marginPctVal = (displayMargin / totalVal) * 100;
  }

  const displayInvested = holding.customInvested !== undefined ? holding.customInvested : (holding.totalInvestment || (displayQty * displayPrice));
  const displayUnrealisedPnl = holding.customUpnl !== undefined ? holding.customUpnl : (holding.upnl !== undefined ? holding.upnl : 0);
  const displayTotalPnl = holding.customTotalPnl !== undefined ? holding.customTotalPnl : displayUnrealisedPnl;
  const isBuy = (holding.type || 'buy').toLowerCase() === 'buy';
  const pnlPercent = displayInvested > 0 ? (displayTotalPnl / displayInvested) * 100 : 0;

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
  const formatDateTime = () => {
    const d = new Date();
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };
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

  const isDark = theme === 'dark';

  return (
    <div className={`p-6 sm:p-8 transition-colors duration-300 ${isDark ? 'bg-[#0b1329] text-slate-200' : 'bg-white text-slate-800'}`}>
      {/* Header section */}
      <div className={`pb-5 border-b border-dashed ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
        <div>
          <h1 className={`text-2xl font-black tracking-wide ${isDark ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
            RADHE BROCKRAGE PVT. LTD.
          </h1>
          <p className={`text-xs font-bold tracking-wider uppercase mt-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
            TRADE ENTRY 
          </p>
        </div>
        <div className="flex justify-between gap-12 mt-6 text-xs">
          <div>
            <span className={`block font-semibold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Customer Name</span>
            <span className={`block font-bold mt-1 text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{customer.name || 'Customer'}</span>
          </div>
          <div className={` pl-10 ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
            <span className={`block font-semibold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Customer ID</span>
            <span className={`block font-bold mt-1 text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{customer.id}</span>
          </div>
        </div>
      </div>

      {/* Symbol name and Net P&L row */}
      <div className="flex justify-between items-center my-6">
        <div className="flex items-center gap-3">
          <h2 className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {holding.symbol}
          </h2>
          {isEditing ? (
            <select 
              className={inputClassName} 
              value={editData.exchange || 'NSE'} 
              onChange={e => setEditData({ ...editData, exchange: e.target.value })}
            >
              <option value="NSE">NSE</option>
              <option value="BSE">BSE</option>
            </select>
          ) : (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
              isDark ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}>
              {holding.exchange || 'NSE'}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <span className={`text-xs font-bold uppercase ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            NET P&L
          </span>
          <span className={`text-2xl font-black ${displayTotalPnl >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
            {displayTotalPnl >= 0 ? '+' : ''}{formatCurrency(displayTotalPnl)}
          </span>
          <span className={`px-2 py-0.5 rounded text-xs font-bold border ${
            displayTotalPnl >= 0 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}>
            ({pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%)
          </span>
        </div>
      </div>

      {/* Grid 1: Details Table */}
      <div className={`flex justify-between items-center p-3 rounded-xl border mb-5 ${
        isDark ? 'bg-[#0f172a]/50 border-slate-800/80' : 'bg-slate-50 border-slate-200'
      }`}>
        
        <div className={`flex-1 min-w-0 pl-3 ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
          <span className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Qty</span>
          {isEditing ? (
            <div className="flex flex-col gap-1">
              <input type="number" className={inputClassName} value={editData.quantity} onChange={e => setEditData({ ...editData, quantity: e.target.value })} />
              <input type="text" className={inputClassName} value={editData.lot} onChange={e => setEditData({ ...editData, lot: e.target.value })} placeholder="Lot" />
            </div>
          ) : (
            <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{displayQty} {holding.lot ? `(${holding.lot})` : ''}</span>
          )}
        </div>
        <div className={`flex-1 min-w-0 pl-3 border-l ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
          <span className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Avg. Price</span>
          {isEditing ? (
            <input type="number" className={inputClassName} value={editData.price} onChange={e => setEditData({ ...editData, price: e.target.value })} />
          ) : (
            <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatCurrency(displayPrice)}</span>
          )}
        </div>
        <div className={`flex-1 min-w-0 pl-3 border-l ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
          <span className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>LTP</span>
          {isEditing ? (
            <input type="number" className={inputClassName} value={editData.ltp} onChange={e => setEditData({ ...editData, ltp: e.target.value })} />
          ) : (
            <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatCurrency(displayLtp)}</span>
          )}
        </div>
        <div className={`flex-1 min-w-0 pl-3 border-l ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
          <span className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Money Margin</span>
          {isEditing ? (
            <input type="number" className={inputClassName} value={editData.marginRs} onChange={e => setEditData({ ...editData, marginRs: e.target.value })} />
          ) : (
            <div className="flex items-center gap-1">
              <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatCurrency(displayMargin)}</span>
              {marginPctVal > 0 && (
                <span className={`text-[10px] font-mono font-bold px-1 py-0.5 rounded ${isDark ? 'bg-slate-800 text-blue-400' : 'bg-slate-200 text-blue-700'}`}>
                  ({marginPctVal.toFixed(2)}%)
                </span>
              )}
            </div>
          )}
        </div>
        <div className={`flex-1 min-w-0 pl-6 border-l ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
          <span className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Brokerage</span>
          {isEditing ? (
            <input type="number" className={inputClassName} value={editData.brokerageFee} onChange={e => setEditData({ ...editData, brokerageFee: e.target.value })} />
          ) : (
            <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatCurrency(displayBrokerage)}</span>
          )}
        </div>
      </div>

      {/* Grid 2: Buy & Sell details */}
      <div className={`flex justify-between items-stretch p-5 rounded-xl border mb-5 ${
        isDark ? 'bg-[#0f172a]/50 border-slate-800/80' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex-1 pr-6">
          <span className="block text-xs font-black uppercase text-emerald-400 mb-2">BUY</span>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Date:</span>
              {isEditing ? (
                <input type="date" className={inputClassName} value={editData.date ? new Date(editData.date).toISOString().split('T')[0] : ''} onChange={e => setEditData({ ...editData, date: e.target.value })} />
              ) : (
                <span className={`font-bold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>{holding.date ? new Date(holding.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : formatDateTime()}</span>
              )}
            </div>
            {isEditing ? (
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Time:</span>
                <input type="time" className={inputClassName} value={editData.time || ''} onChange={e => setEditData({ ...editData, time: e.target.value })} />
              </div>
            ) : (holding.time || editData.time) ? (
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Time:</span>
                <span className={`font-bold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>{formatTime12Hr(holding.time || editData.time)}</span>
              </div>
            ) : null}
          </div>
        </div>
        <div className={`flex-1 pl-6 border-l ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
          <span className="block text-xs font-black uppercase text-blue-400 mb-2">HOLDING STATE</span>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Current Date:</span>
              <span className={`font-bold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>{formatDateTime()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid 3: Value Summary */}
      <div className={`flex justify-between items-center p-5 rounded-xl border mb-6 ${
        isDark ? 'bg-[#0f172a]/50 border-slate-800/80' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex-1 min-w-0">
          <span className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>TOTAL BUY VALUE</span>
          <span className={`text-base font-black whitespace-nowrap ${isDark ? 'text-white' : 'text-slate-950'}`}>{formatCurrency(displayInvested)}</span>
        </div>
        <div className={`flex-1 min-w-0 pl-6 border-l ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
          <span className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>TOTAL SELL VALUE</span>
          <span className={`text-base font-black whitespace-nowrap ${isDark ? 'text-white' : 'text-slate-950'}`}>{formatCurrency(displayQty * displayLtp)}</span>
        </div>
        <div className={`flex-1 min-w-0 pl-6 border-l ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
          <span className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>TOTAL BROKERAGE</span>
          <span className={`text-base font-black whitespace-nowrap ${isDark ? 'text-white' : 'text-slate-950'}`}>{formatCurrency(displayBrokerage)}</span>
        </div>
        <div className={`flex-1 min-w-0 pl-6 border-l ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
          <span className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>UNREALISEDP&L</span>
          <span className={`text-base font-black whitespace-nowrap ${displayTotalPnl >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
            {displayTotalPnl >= 0 ? '+' : ''}{formatCurrency(displayTotalPnl)}
          </span>
        </div>
      </div>

      {/* Badges footer */}
      <div className="flex gap-3 items-center text-[10px] font-black uppercase tracking-wider">
        <span className={`px-2.5 py-1 rounded border whitespace-nowrap ${
          isDark ? 'text-emerald-400 border-emerald-500/25 bg-emerald-500/5' : 'text-emerald-700 border-emerald-300 bg-emerald-50'
        }`}>
          TRADE ACTIVE
        </span>
        {isEditing ? (
          <select 
            className={inputClassName} 
            value={editData.tradeType || 'INTRADAY'} 
            onChange={e => setEditData({ ...editData, tradeType: e.target.value })}
          >
            <option value="INTRADAY">INTRADAY</option>
            <option value="DELIVERY">DELIVERY</option>
          </select>
        ) : (
          <span className={`px-2.5 py-1 rounded border whitespace-nowrap ${
            isDark ? 'text-blue-400 border-blue-500/25 bg-blue-500/5' : 'text-blue-700 border-blue-300 bg-blue-50'
          }`}>
            {(holding.tradeType || 'INTRADAY').toUpperCase()}
          </span>
        )}
        {isEditing ? (
          <select 
            className={inputClassName} 
            value={editData.exchange || 'NSE'} 
            onChange={e => setEditData({ ...editData, exchange: e.target.value })}
          >
            <option value="NSE">NSE</option>
            <option value="BSE">BSE</option>
          </select>
        ) : (
          <span className={`px-2.5 py-1 rounded border whitespace-nowrap ${
            isDark ? 'text-slate-400 border-slate-700 bg-slate-800' : 'text-slate-655 border-slate-200 bg-slate-100'
          }`}>
            {(holding.exchange || 'NSE').toUpperCase()}
          </span>
        )}
      </div>
    </div>
  );
};

export default HoldingReceiptR2;
