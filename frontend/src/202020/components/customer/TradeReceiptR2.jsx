import React from 'react';

const TradeReceiptR2 = ({
  trade,
  customer,
  type,
  theme,
  isEditing,
  editData,
  setEditData,
  inputClassName
}) => {
  const isDark = theme === 'dark';
  const isExit = type === 'exit';
  
  const productType = (trade.action || 'Unknown').toUpperCase();
  const isBuy = productType === 'BUY';

  // Dynamic values
  const displayQty = isEditing ? (parseFloat(editData.quantity) || 0) : (trade.quantity || 0);
  const displayPrice = isEditing ? (parseFloat(editData.price) || 0) : (trade.price || trade.entryPrice || 0);
  const displayLtp = isEditing ? (parseFloat(editData.ltp) || 0) : (trade.ltp || 0);
  const displayMargin = isEditing 
    ? (parseFloat(editData.marginRs) || 0) 
    : (trade.marginRs !== undefined && trade.marginRs !== null && !isNaN(parseFloat(trade.marginRs)) ? parseFloat(trade.marginRs) : 0);
  const displayBrokerage = isEditing ? (parseFloat(editData.brokerageFee) || 0) : (trade.brokerageFee || 0);
  
  let displayTotalPnl = 0;
  if (isExit) {
    displayTotalPnl = (!isEditing && trade.realizedPnl !== undefined) ? trade.realizedPnl : (
      isBuy 
        ? ((displayPrice - displayLtp) * displayQty - displayBrokerage)
        : ((displayLtp - displayPrice) * displayQty - displayBrokerage)
    );
  } else {
    if (!isEditing && trade.customUpnl !== undefined) {
      displayTotalPnl = trade.customUpnl;
    } else if (displayLtp > 0 && displayLtp !== displayPrice) {
      displayTotalPnl = isBuy 
        ? ((displayLtp - displayPrice) * displayQty - displayBrokerage)
        : ((displayPrice - displayLtp) * displayQty - displayBrokerage);
    } else {
      displayTotalPnl = 0;
    }
  }

  const totalVal = displayQty * displayPrice;
  let marginPctVal = isEditing 
    ? (parseFloat(editData.marginPct) || 0) 
    : (trade.marginPct !== undefined && trade.marginPct !== null && !isNaN(parseFloat(trade.marginPct)) ? parseFloat(trade.marginPct) : 0);

  if (displayMargin <= 0) {
    marginPctVal = 0;
  } else if (marginPctVal <= 0 && totalVal > 0) {
    marginPctVal = (displayMargin / totalVal) * 100;
  }

  let buyPrice = null;
  let sellPrice = null;

  if (isExit) {
    if (isBuy) { // Exiting a short
      buyPrice = displayLtp;
      sellPrice = displayPrice;
    } else { // Exiting a long
      sellPrice = displayLtp;
      buyPrice = displayPrice;
    }
  } else {
    if (isBuy) {
      buyPrice = displayPrice;
    } else {
      sellPrice = displayPrice;
    }
  }

  const totalBuyValue = buyPrice !== null ? buyPrice * displayQty : 0;
  const totalSellValue = sellPrice !== null ? sellPrice * displayQty : 0;
  
  const costBasis = buyPrice * displayQty;
  const pnlPercent = costBasis > 0 ? (displayTotalPnl / costBasis) * 100 : 0;

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
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

  return (
    <div className={`p-6 sm:p-8 transition-colors duration-300 ${isDark ? 'bg-[#03060d]' : 'bg-white'} ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
      {/* Header section */}
      <div className={`pb-5 border-b border-dashed ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
        <div>
          <h1 className={`text-2xl font-black tracking-wide ${isDark ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
            SHRILAXMI TRADERS PVT. LTD.
          </h1>
          <p className={`text-xs font-bold tracking-wider uppercase mt-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
            TRADE {type.toUpperCase()} 
          </p>
        </div>
        <div className="flex justify-evenly gap-12 mt-6 text-xs">
          <div>
            <span className={`block font-semibold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Customer Name</span>
            <span className={`block font-bold mt-1 text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{customer.name || 'Customer'}</span>
          </div>
          <div className={`border-l pl-10 ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
            <span className={`block font-semibold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Customer ID</span>
            <span className={`block font-bold mt-1 text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{customer.id}</span>
          </div>
        </div>
      </div>

      {/* Symbol name and Net P&L row */}
      <div className="flex justify-between items-center my-6">
        <div className="flex items-center gap-3">
          <h2 className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {trade.symbol}
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
              isDark ? 'bg-slate-800 text-slate-300 border border-slate-700/60' : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}>
              {trade.exchange || 'NSE'}
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
      <div className={`flex justify-between items-center p-5 rounded-xl border mb-5 ${
        isDark ? 'bg-[#05070f] border-slate-800/80' : 'bg-slate-50 border-slate-200'
      }`}>
        
        <div className={`flex-1 min-w-0 pl-6 ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
          <span className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Qty</span>
          {isEditing ? (
            <div className="flex flex-col gap-1">
              <input type="number" className={inputClassName} value={editData.quantity} onChange={e => setEditData({ ...editData, quantity: e.target.value })} />
              <input type="text" className={inputClassName} value={editData.lot} onChange={e => setEditData({ ...editData, lot: e.target.value })} placeholder="Lot" />
            </div>
          ) : (
            <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{displayQty} {trade.lot ? `(${trade.lot})` : ''}</span>
          )}
        </div>
        <div className={`flex-1 min-w-0 pl-6 border-l ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
          <span className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Avg. Price</span>
          {isEditing ? (
            <input type="number" className={inputClassName} value={editData.price} onChange={e => setEditData({ ...editData, price: e.target.value })} />
          ) : (
            <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatCurrency(displayPrice)}</span>
          )}
        </div>
        <div className={`flex-1 min-w-0 pl-6 border-l ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
          <span className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{isExit ? 'Exit Price' : 'LTP'}</span>
          {isEditing ? (
            <input type="number" className={inputClassName} value={editData.ltp} onChange={e => setEditData({ ...editData, ltp: e.target.value })} />
          ) : (
            <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatCurrency(displayLtp)}</span>
          )}
        </div>
        <div className={`flex-1 min-w-0 pl-6 border-l ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
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
        isDark ? 'bg-[#05070f] border-slate-800/80' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex-1 pr-6">
          <span className="block text-xs font-black uppercase text-emerald-400 mb-2">BUY</span>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Date:</span>
              {isEditing ? (
                <input type="date" className={inputClassName} value={editData.date ? new Date(editData.date).toISOString().split('T')[0] : ''} onChange={e => setEditData({ ...editData, date: e.target.value })} />
              ) : (
                <span className={`font-bold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>{formatDate(trade.entryDate || trade.date)}</span>
              )}
            </div>
            {isEditing ? (
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Time:</span>
                <input type="time" className={inputClassName} value={editData.time || ''} onChange={e => setEditData({ ...editData, time: e.target.value })} />
              </div>
            ) : (trade.time || editData.time) ? (
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Time:</span>
                <span className={`font-bold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>{formatTime12Hr(trade.time || editData.time)}</span>
              </div>
            ) : null}
          </div>
        </div>
        {isExit ? (
          <div className={`flex-1 pl-6 border-l ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
            <span className="block text-xs font-black uppercase text-rose-500 mb-2">EXIT</span>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Date:</span>
                {isEditing ? (
                  <input type="date" className={inputClassName} value={editData.date ? new Date(editData.date).toISOString().split('T')[0] : ''} onChange={e => setEditData({ ...editData, date: e.target.value })} />
                ) : (
                  <span className={`font-bold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>{formatDate(trade.date)}</span>
                )}
              </div>
              {isEditing ? (
                <div className="flex justify-between items-center">
                  <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Time:</span>
                  <input type="time" className={inputClassName} value={editData.time || ''} onChange={e => setEditData({ ...editData, time: e.target.value })} />
                </div>
              ) : (trade.time || editData.time) ? (
                <div className="flex justify-between items-center">
                  <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Time:</span>
                  <span className={`font-bold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>{formatTime12Hr(trade.time || editData.time)}</span>
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className={`flex-1 pl-6 border-l ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
            <span className="block text-xs font-black uppercase text-blue-400 mb-2">HOLDING DATE</span>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Date:</span>
                {isEditing ? (
                  <input 
                    type="date" 
                    className={inputClassName} 
                    value={editData.holdingDate ? new Date(editData.holdingDate).toISOString().split('T')[0] : (editData.date ? new Date(editData.date).toISOString().split('T')[0] : '')} 
                    onChange={e => setEditData({ ...editData, holdingDate: e.target.value })} 
                  />
                ) : (
                  <span className={`font-bold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                    {formatDate(trade.holdingDate || editData.holdingDate || trade.date)}
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Time:</span>
                {isEditing ? (
                  <input 
                    type="time" 
                    className={inputClassName} 
                    value={editData.holdingTime !== undefined ? editData.holdingTime : (editData.time || '')} 
                    onChange={e => setEditData({ ...editData, holdingTime: e.target.value })} 
                  />
                ) : (
                  <span className={`font-bold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                    {formatTime12Hr(trade.holdingTime || editData.holdingTime || trade.time)}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Grid 3: Value Summary */}
      <div className={`flex justify-between items-center p-5 rounded-xl border mb-6 ${
        isDark ? 'bg-[#05070f] border-slate-800/80' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex-1 min-w-0">
          <span className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>TOTAL BUY VALUE</span>
          <span className={`text-base font-black whitespace-nowrap ${isDark ? 'text-white' : 'text-slate-950'}`}>{formatCurrency(totalBuyValue)}</span>
        </div>
        <div className={`flex-1 min-w-0 pl-6 border-l ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
          <span className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>TOTAL SELL VALUE</span>
          <span className={`text-base font-black whitespace-nowrap ${isDark ? 'text-white' : 'text-slate-950'}`}>{formatCurrency(totalSellValue)}</span>
        </div>
        <div className={`flex-1 min-w-0 pl-6 border-l ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
          <span className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>TOTAL BROKERAGE</span>
          <span className={`text-base font-black whitespace-nowrap ${isDark ? 'text-white' : 'text-slate-955'}`}>{formatCurrency(displayBrokerage)}</span>
        </div>
        <div className={`flex-1 min-w-0 pl-6 border-l ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
          <span className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{isExit ? 'UNREALISED P&L' : 'UNREALISEDP&L'}</span>
          <span className={`text-base font-black whitespace-nowrap ${displayTotalPnl >= 0 ? 'text-emerald-400' : 'text-rose-505'}`}>
            {displayTotalPnl >= 0 ? '+' : ''}{formatCurrency(displayTotalPnl)}
          </span>
        </div>
      </div>

      {/* Badges footer */}
      <div className="flex gap-3 items-center text-[10px] font-black uppercase tracking-wider">
        <span className={`px-2.5 py-1 rounded border whitespace-nowrap ${
          isExit
            ? (isDark ? 'text-emerald-400 border-emerald-500/25 bg-emerald-500/5' : 'text-emerald-700 border-emerald-300 bg-emerald-50')
            : (isDark ? 'text-amber-400 border-amber-500/25 bg-amber-500/5' : 'text-amber-700 border-amber-300 bg-amber-50')
        }`}>
          {isExit ? 'TRADE CLOSED' : 'TRADE ACTIVE'}
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
            {(trade.tradeType || 'INTRADAY').toUpperCase()}
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
            {(trade.exchange || 'NSE').toUpperCase()}
          </span>
        )}
      </div>
    </div>
  );
};

export default TradeReceiptR2;
