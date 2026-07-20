import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import TradeReceipt from './TradeReceipt';

const getAvatarColor = (symbol) => {
  const colors = [
    { bg: 'bg-blue-600', border: 'border-l-blue-500' },
    { bg: 'bg-purple-600', border: 'border-l-purple-500' },
    { bg: 'bg-orange-600', border: 'border-l-orange-500' },
    { bg: 'bg-emerald-600', border: 'border-l-emerald-500' },
    { bg: 'bg-rose-600', border: 'border-l-rose-500' },
    { bg: 'bg-amber-600', border: 'border-l-amber-500' },
    { bg: 'bg-cyan-600', border: 'border-l-cyan-500' }
  ];
  const charSum = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[charSum % colors.length];
};

const WeeklyRecords = ({ customer, onEditRequest }) => {
  const navigate = useNavigate();
  const [exits, setExits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  useEffect(() => {
    fetchExits();
  }, [customer._id]);

  const fetchExits = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get(`/trades/weekly/${customer._id}`);
      const sorted = (data || []).sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0));
      setExits(sorted);
    } catch (err) {
      console.error(err);
      setError('Failed to load past exits.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete this exit record?`)) return;
    try {
      await api.delete(`/trades/weekly/${id}`);
      fetchExits();
    } catch (err) {
      console.error(err);
      alert('Failed to delete exit record');
    }
  };

  const toggleSelection = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === exits.length && exits.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(exits.map(e => e._id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} records?`)) return;
    try {
      await api.post(`/trades/weekly/bulk-delete`, { ids: selectedIds });
      setSelectedIds([]);
      fetchExits();
    } catch (err) {
      console.error(err);
      alert('Failed to delete records');
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
  
  const totalRealisedPnl = exits.reduce((sum, item) => sum + (item.realizedPnl || 0), 0);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      {/* Sticky Top Section */}
      <div className="sticky top-[-16px] pt-4 bg-slate-950 z-20 pb-2 mb-2">
        {/* Total Realised P/L Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
          {/* Faint history icon in background */}
          <span className="material-symbols-outlined absolute right-[-10px] top-4 text-[80px] text-slate-800/30 rotate-[-10deg] pointer-events-none">history</span>
          
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Realised P/L (INR)</h3>
              <div className="text-3xl font-bold text-white mb-3 tracking-tight">{formatCurrency(totalRealisedPnl)}</div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${totalRealisedPnl >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  <span className="material-symbols-outlined text-[12px]">{totalRealisedPnl >= 0 ? 'trending_up' : 'trending_down'}</span>
                  {totalRealisedPnl >= 0 ? '+' : ''}{formatCurrency(totalRealisedPnl)}
                </span>
                <span className="text-xs text-slate-500 font-medium ml-2">{exits.length} Trades</span>
              </div>
            </div>

            <button 
              onClick={() => navigate(`/customer/${customer._id}/invoice`)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-lg shadow-blue-900/20"
            >
              <span className="material-symbols-outlined text-[16px]">receipt_long</span>
              INVOICE
            </button>
          </div>
        </div>

        {/* Past Exits Header */}
        <div className="flex items-center justify-between pt-4 pb-1">
          <div className="flex items-center gap-2 text-slate-200 font-bold text-[11px] tracking-widest uppercase">
            <span className="material-symbols-outlined text-[16px]">receipt_long</span>
            PAST TRADES ({exits.length})
          </div>
          <div className="flex items-center gap-4">
            {isSelectionMode ? (
              <>
                {exits.length > 0 && (
                  <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-bold text-slate-400 hover:text-slate-200">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.length === exits.length && exits.length > 0}
                      onChange={toggleSelectAll}
                      className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900"
                    />
                    ALL
                  </label>
                )}
                {selectedIds.length > 0 ? (
                  <button onClick={handleBulkDelete} className="flex items-center gap-1 text-rose-400 hover:text-rose-300 transition-colors text-[11px] font-bold uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                    DELETE ({selectedIds.length})
                  </button>
                ) : (
                  <button onClick={() => { setIsSelectionMode(false); setSelectedIds([]); }} className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors text-[11px] font-bold uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[16px]">close</span>
                    CANCEL
                  </button>
                )}
              </>
            ) : (
              <>
                <button onClick={() => setIsSelectionMode(true)} className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors text-[11px] font-bold uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[16px]">checklist</span>
                  SELECT
                </button>
             
              </>
            )}
          </div>
        </div>
        
        {/* Fading bottom edge for sticky header */}
        <div className="absolute bottom-[-16px] left-0 w-full h-4 bg-gradient-to-b from-slate-950 to-transparent pointer-events-none"></div>
      </div>

      {/* Exits List */}
      <div className="space-y-3 pb-4">
        {isLoading ? (
          // Skeleton Loader
          [1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 relative overflow-hidden">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="w-16 h-5 bg-slate-800 rounded animate-pulse"></div>
                    <div className="w-8 h-4 bg-slate-800 rounded animate-pulse"></div>
                  </div>
                  <div className="w-20 h-3 bg-slate-800 rounded mt-2 animate-pulse"></div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <div className="w-16 h-5 bg-slate-800 rounded animate-pulse mb-1"></div>
                  <div className="w-24 h-3 bg-slate-800 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="flex justify-between items-center gap-2 pt-3 border-t border-slate-800">
                <div className="flex-[1] min-w-0">
                   <div className="w-8 h-2 bg-slate-800 rounded animate-pulse mb-1"></div>
                   <div className="w-12 h-3 bg-slate-800 rounded animate-pulse"></div>
                </div>
                <div className="flex-[1.5] min-w-0 text-center">
                   <div className="w-12 h-2 bg-slate-800 rounded animate-pulse mb-1"></div>
                   <div className="w-16 h-3 bg-slate-800 rounded animate-pulse"></div>
                </div>
                <div className="flex-[2] min-w-0 flex flex-col items-end">
                   <div className="w-12 h-2 bg-slate-800 rounded animate-pulse mb-1"></div>
                   <div className="w-16 h-3 bg-slate-800 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))
        ) : !error && exits.length === 0 && (
          <div className="text-center py-10 text-slate-500 border border-dashed border-slate-800 rounded-xl">
            <span className="material-symbols-outlined text-4xl mb-2 text-slate-700">history</span>
            <p>No past trades found.</p>
            <p className="text-xs text-slate-600 mt-1">Submit an Exit Order to see history.</p>
          </div>
        )}

        {exits.map((item, idx) => {
          const color = getAvatarColor(item.symbol);
          const isBuy = (item.action || '').toLowerCase() === 'buy';
          return (
            <div 
              key={item._id} 
              onClick={() => setExpandedCard(expandedCard === item._id ? null : item._id)}
              className={`bg-slate-900/50 border-y border-r border-slate-800 ${color.border} border-l-4 rounded-xl p-4 relative overflow-hidden group cursor-pointer hover:bg-slate-900/80 transition-all select-none`}
            >
              {idx === 0 && <div className="absolute inset-0 border border-dashed border-blue-500/10 rounded-xl pointer-events-none"></div>}
              
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  {isSelectionMode && (
                    <div onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(item._id)}
                        onChange={() => toggleSelection(item._id)}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900"
                      />
                    </div>
                  )}
                  {/* Circle Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-lg ${color.bg} shrink-0`}>
                    {item.symbol.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100 text-base">{item.symbol}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                        isBuy ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {(item.action || 'Trade').toUpperCase()}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Qty {item.quantity.toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="text-right">
                    <div className="font-bold text-slate-100 text-base">{formatCurrency(item.price)}</div>
                    <div className="text-[10px] text-slate-400">LTP: <span className="text-slate-300">{formatCurrency(item.ltp)}</span></div>
                  </div>
                  {/* Chevron Right Button */}
                  <div className="ml-3 p-1.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-slate-400 group-hover:text-slate-200 transition-colors">
                    <span className={`material-symbols-outlined text-[16px] flex items-center justify-center transition-transform duration-300 ${expandedCard === item._id ? 'rotate-90' : ''}`}>
                      chevron_right
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid 2: Value Summary */}
              <div className="flex justify-between items-center gap-4 pt-3 border-t border-slate-800/60 mt-3">
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Total Value</div>
                  <div className="font-bold text-sm text-blue-400">{formatCurrency(item.estimatedTotal)}</div>
                </div>
                <div className="w-[1px] h-8 bg-slate-800/80"></div>
                <div className="flex-1 min-w-0 pl-4">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Total P/L</div>
                  <div className={`font-bold text-sm ${item.realizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                    {item.realizedPnl >= 0 ? '+' : ''}{formatCurrency(item.realizedPnl || 0)}
                  </div>
                </div>
              </div>

              {/* Smoothly Expandable Action Panel */}
              <div className={`grid-animate transition-all duration-300 ease-in-out ${expandedCard === item._id ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
                <div className="overflow-hidden">
                  <div className="flex gap-2 pt-3 border-t border-slate-800/80">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedReceipt(item); }}
                      className="flex-grow bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors text-xs font-bold whitespace-nowrap"
                    >
                      <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                      RECEIPT
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(item._id); }}
                      className="flex-grow bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors text-xs font-bold whitespace-nowrap"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                      DELETE
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Fullscreen Receipt Overlay */}
      {selectedReceipt && (
        <TradeReceipt 
          trade={selectedReceipt}
          customer={customer}
          type="exit"
          onClose={() => setSelectedReceipt(null)}
          onEdit={async (updatedData) => {
            try {
              // The backend route is /trades/edit/:id
              await api.put(`/trades/edit/${selectedReceipt._id}`, {
                ...selectedReceipt,
                ...updatedData
              });
              fetchExits();
              setSelectedReceipt(null);
            } catch (err) {
              console.error(err);
              alert(err.response?.data?.message || 'Failed to update record');
            }
          }}
        />
      )}
    </div>
  );
};

export default WeeklyRecords;
