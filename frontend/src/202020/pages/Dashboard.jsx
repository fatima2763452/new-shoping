import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CustomerCard = ({ customer, onClick, onDelete, isMenuOpen, onMenuToggle }) => {
  const getLeftBarColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-emerald-500';
      case 'Suspended': return 'bg-rose-500';
      default: return 'bg-violet-500';
    }
  };

  const getInitials = (name) => {
    if (!name) return 'C';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarStyle = (status) => {
    switch (status) {
      case 'Active': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Suspended': return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      default: return 'bg-violet-500/10 text-violet-400 border border-violet-500/20';
    }
  };

  return (
    <div className="relative bg-slate-900/40 border border-slate-800/60 backdrop-blur-md rounded-2xl p-4 hover:border-violet-500/40 cursor-pointer transition-all duration-200 overflow-hidden flex items-center justify-between group">
      {/* Left colored bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${getLeftBarColor(customer.status)}`} />
      
      {/* Card Body (Clickable area to navigate) */}
      <div className="flex items-center flex-1 pr-4" onClick={() => onClick(customer)}>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${getAvatarStyle(customer.status)} shrink-0`}>
          {getInitials(customer.name)}
        </div>
        <div className="ml-4 overflow-hidden">
          <h3 className="font-semibold text-slate-100 group-hover:text-violet-400 transition-colors truncate">{customer.name}</h3>
          <span className="font-mono text-xs text-slate-400 mt-0.5 block truncate">{customer.customerId}</span>
          <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider mt-1.5 border ${
            customer.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
            customer.status === 'Suspended' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
            'bg-violet-500/10 text-violet-400 border-violet-500/20'
          }`}>
            {customer.status || 'Active'}
          </span>
        </div>
      </div>

      {/* 3-Dot Action Menu Button */}
      <div className="relative shrink-0">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onMenuToggle(customer._id);
          }}
          className="text-slate-400 hover:text-slate-200 p-2 rounded-full hover:bg-slate-800/60 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">more_vert</span>
        </button>
        
        {isMenuOpen && (
          <div className="absolute right-0 mt-1 w-32 bg-slate-950 border border-slate-800/80 rounded-xl shadow-xl z-30 py-1.5 animate-in fade-in slide-in-from-top-1 duration-100">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(customer);
              }}
              className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Add Customer Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ id: '', name: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Delete Confirmation Modal
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [isListLoading, setIsListLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const parsedUser = JSON.parse(userInfo);
      setUser(parsedUser);
      fetchCustomers(parsedUser._id);
    } else {
      const mockOwner = {
        _id: 'owner_id',
        username: '9574074927',
        role: 'owner',
        token: 'mock-owner-token-12345'
      };
      localStorage.setItem('userInfo', JSON.stringify(mockOwner));
      localStorage.setItem('token', mockOwner.token);
      setUser(mockOwner);
      fetchCustomers(mockOwner._id);
    }
  }, [navigate]);

  // Close menus on click outside
  useEffect(() => {
    const handleOutsideClick = () => setActiveMenuId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const fetchCustomers = async (ownerId) => {
    setIsListLoading(true);
    try {
      const { data } = await api.get(`/customers?ownerId=${ownerId}`);
      if (Array.isArray(data)) {
        setCustomers(data);
      } else {
        console.error('API did not return an array. Check VITE_URL!', data);
        setCustomers([]);
      }
    } catch (err) {
      console.error('Failed to fetch customers:', err);
      setCustomers([]);
    } finally {
      setIsListLoading(false);
    }
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.post('/customers', {
        customerId: newCustomer.id,
        name: newCustomer.name,
        ownerId: user._id
      });
      
      setNewCustomer({ id: '', name: '' });
      setIsModalOpen(false);
      fetchCustomers(user._id); // Refresh list
    } catch (err) {
      console.error('Failed to create customer API error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create customer');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    window.location.href = '/';
  };

  const handleCustomerClick = (customer) => {
    navigate(`/customer/${customer._id}`, { state: { customer: { ...customer, id: customer.customerId } } });
  };

  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/customers/${customerToDelete._id}`);
      setIsDeleteModalOpen(false);
      setCustomerToDelete(null);
      fetchCustomers(user._id);
    } catch (err) {
      console.error('Failed to delete customer', err);
      alert(err.response?.data?.message || 'Failed to delete customer');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter clients based on search query
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.customerId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-slate-950 text-slate-200 min-h-screen flex flex-col overflow-x-hidden font-sans antialiased relative">
      {/* Create Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-white">Add New Customer</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <form onSubmit={handleCreateCustomer} className="space-y-4">
              {error && <div className="text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg text-sm">{error}</div>}
              
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Customer ID</label>
                <input 
                  type="text" 
                  required
                  value={newCustomer.id}
                  onChange={e => setNewCustomer({...newCustomer, id: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all placeholder:text-slate-600"
                  placeholder="e.g. 123456"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Customer Name</label>
                <input 
                  type="text" 
                  required
                  value={newCustomer.name}
                  onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all placeholder:text-slate-600"
                  placeholder="e.g. DEEPTI TIWARI"
                />
              </div>
              
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full mt-2 bg-gradient-to-tr from-violet-600 to-indigo-500 hover:from-violet-500 hover:to-indigo-400 text-white font-medium py-3 rounded-xl transition-all flex justify-center items-center gap-2 disabled:opacity-50 shadow-lg shadow-violet-600/20"
              >
                {isLoading ? 'Creating...' : 'Create Customer'}
                <span className="material-symbols-outlined text-[18px]">person_add</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Customer Confirmation Modal */}
      {isDeleteModalOpen && customerToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-rose-900/50 w-full max-w-sm rounded-2xl p-6 shadow-2xl shadow-rose-900/20 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
              <span className="material-symbols-outlined text-rose-500 text-3xl">warning</span>
            </div>
            
            <h3 className="text-xl font-bold text-white text-center mb-2">Move to Recycle Bin?</h3>
            <p className="text-slate-400 text-sm text-center mb-6 leading-relaxed">
              You are about to delete <span className="text-rose-400 font-semibold">{customerToDelete.name}</span>. This customer will be moved to the Recycle Bin. Their trades and data will be safely preserved.
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setIsDeleteModalOpen(false)} 
                disabled={isDeleting}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteCustomer}
                disabled={isDeleting}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-semibold py-3 rounded-xl transition-colors flex justify-center items-center gap-2 shadow-lg shadow-rose-600/30 disabled:opacity-50"
              >
                {isDeleting ? 'Moving...' : 'Move to Bin'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Header */}
      <header className="p-4 flex items-center justify-between border-b border-slate-900/60 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        {/* Left Side: Logo & Description */}
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/25 flex items-center justify-center text-violet-400 shadow-[0_0_15px_rgba(124,58,237,0.15)]">
            <span className="material-symbols-outlined text-[22px]">shield_person</span>
          </div>
          <div className="flex flex-col ml-3">
            <h1 className="text-sm font-bold text-slate-100 tracking-tight leading-tight">Master Client Registry</h1>
            <span className="text-[10px] text-slate-400 font-medium">All your clients in one place</span>
          </div>
        </div>

        {/* Right Side: Bell Notifications */}
        {/* <div className="flex gap-1.5 items-center">
          <button 
            className="text-slate-400 hover:text-indigo-400 p-2 rounded-xl hover:bg-slate-900/60 transition-colors relative"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full border border-slate-950"></span>
          </button>
        </div> */}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-4 pt-4 pb-28 relative z-0">
        
        {/* Search Bar */}
        <div className="flex gap-2.5 items-center mb-5">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">search</span>
            <input 
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/40 border border-slate-800/80 text-slate-200 text-sm rounded-xl pl-10 pr-4 py-3 focus:border-violet-500 focus:ring-0 transition-all placeholder:text-slate-500 shadow-inner" 
              placeholder="Search client by name, id or email..." 
            />
          </div>
          {/* <button className="w-11 h-11 bg-violet-600 hover:bg-violet-500 text-white rounded-xl flex items-center justify-center transition-colors shadow-lg shadow-violet-600/20 active:scale-95 duration-100">
            <span className="material-symbols-outlined text-[18px]">tune</span>
          </button> */}
        </div>

        {/* Total Clients Stat Card */}
        <div className="bg-slate-900/40 border border-slate-800/60 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between mb-5">
          <div className="flex items-center">
            <div className="w-11 h-11 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <span className="material-symbols-outlined text-[20px]">group</span>
            </div>
            <div className="ml-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Clients</span>
              <span className="text-lg font-extrabold text-slate-100 mt-0.5 block">{filteredCustomers.length}</span>
            </div>
          </div>
        </div>

        {/* Customer List Container */}
        <div className="space-y-3.5">
          {isListLoading ? (
            // Skeleton Loader
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <div className="w-12 h-12 rounded-full bg-slate-800 animate-pulse shrink-0"></div>
                  <div className="ml-4 flex-1">
                    <div className="w-1/3 h-4 bg-slate-800 rounded animate-pulse"></div>
                    <div className="w-1/4 h-3 bg-slate-800/50 rounded mt-2 animate-pulse"></div>
                  </div>
                </div>
                <div className="w-6 h-6 bg-slate-800 rounded-full animate-pulse shrink-0"></div>
              </div>
            ))
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-16 text-slate-500 bg-slate-900/10 border border-slate-900/30 rounded-2xl">
              <span className="material-symbols-outlined text-5xl mb-3 text-slate-600">person_off</span>
              <p className="text-sm font-semibold">No customers found</p>
              <p className="text-xs text-slate-600 mt-1">Try searching for a different name or ID</p>
            </div>
          ) : (
            filteredCustomers.map(customer => (
              <CustomerCard 
                key={customer._id}
                customer={customer}
                onClick={handleCustomerClick}
                onDelete={(c) => {
                  setCustomerToDelete(c);
                  setIsDeleteModalOpen(true);
                }}
                isMenuOpen={activeMenuId === customer._id}
                onMenuToggle={(id) => setActiveMenuId(activeMenuId === id ? null : id)}
              />
            ))
          )}
        </div>

      </main>

      {/* Premium Curved Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 h-[76px] pointer-events-none">
        {/* SVG Curved Backdrop */}
        <div className="absolute inset-0 w-full h-full pointer-events-auto">
          <svg 
            className="absolute inset-0 w-full h-full filter drop-shadow-[0_-12px_24px_rgba(0,0,0,0.6)]" 
            viewBox="0 0 400 76" 
            preserveAspectRatio="none"
          >
            {/* Filled curved area */}
            <path 
              d="M 0,16 L 160,16 C 175,16 180,2 200,2 C 220,2 225,16 240,16 L 400,16 L 400,76 L 0,76 Z" 
              fill="#0f172a"
            />
            
            {/* Stroked top border of nav */}
            <path 
              d="M 0,16 L 160,16 C 175,16 180,2 200,2 C 220,2 225,16 240,16 L 400,16" 
              fill="none" 
              stroke="#1e293b" 
              strokeWidth="1.5"
            />
          </svg>
          
          {/* Navigation Items overlay */}
          <div className="absolute inset-0 flex justify-around items-center pt-3 pb-4 px-3">
            {/* Tab 1: Clients */}
            <button 
              onClick={() => {}}
              className="flex flex-col items-center justify-center w-14 py-1 relative text-violet-400 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[22px]">group</span>
              <span className="text-[9px] font-bold mt-1">Clients</span>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-violet-400 rounded-full" />
            </button>

            {/* Tab 2: Recycle Bin (Replaces Dashboard) */}
            <button 
              onClick={() => navigate('/recycle-bin')}
              className="flex flex-col items-center justify-center w-14 py-1 relative text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[22px]">delete</span>
              <span className="text-[9px] font-bold mt-1">Recycle Bin</span>
            </button>

            {/* Floating Create User Button */}
            <div className="relative -mt-9 flex flex-col items-center select-none">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-12 h-12 bg-gradient-to-tr from-violet-600 to-indigo-500 hover:from-violet-500 hover:to-indigo-400 text-white rounded-full flex items-center justify-center shadow-[0_6px_20px_rgba(124,58,237,0.45)] active:scale-90 transition-all duration-150 border border-violet-400/20 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[26px]">add</span>
              </button>
              <span className="text-[9px] font-bold mt-1 text-slate-400">Create User</span>
            </div>

            {/* Tab 3: Account Opening Form (Replaces Reports) */}
            <button 
              onClick={() => navigate('/account-opening')}
              className="flex flex-col items-center justify-center w-14 py-1 relative text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[22px]">description</span>
              <span className="text-[9px] font-bold mt-1">Form</span>
            </button>

            {/* Tab 4: Logout */}
            <button 
              onClick={handleLogout}
              className="flex flex-col items-center justify-center w-14 py-1 text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[22px]">logout</span>
              <span className="text-[9px] font-bold mt-1">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
