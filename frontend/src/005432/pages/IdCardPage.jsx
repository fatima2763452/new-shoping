import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import logo from '../assets/logo.jpeg';
import dhanlaxmiBlueStamp from '../assets/dhanlaxmi_blue_stamp.png';

const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const day = date.getDate().toString().padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} - ${month} - ${year}`;
};

const IdCardPage = () => {
  const navigate = useNavigate();
  const idCardRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    idNumber: '',
    designation: '',
    phone: '',
    email: '',
    address: '',
    issuedDate: '',
    expiresDate: '',
    isStockBroker: false
  });

  useEffect(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const nextYear = new Date();
    nextYear.setFullYear(today.getFullYear() + 1);
    const nextYearStr = nextYear.toISOString().split('T')[0];
    
    setFormData(prev => ({
      ...prev,
      issuedDate: prev.issuedDate || todayStr,
      expiresDate: prev.expiresDate || nextYearStr
    }));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      
      // Auto-generate ID Number based on Name initials if name changes
      if (name === 'name') {
        const initials = value
          .split(' ')
          .filter(word => word.length > 0)
          .map(word => word[0])
          .join('')
          .toUpperCase()
          .slice(0, 3);
        const hash = value.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const num = (hash * 123) % 90000 + 10000;
        updated.idNumber = initials ? `${initials}${num}` : '';
      }
      
      return updated;
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = async () => {
    if (!idCardRef.current) return;
    setIsDownloading(true);
    
    try {
      const el = idCardRef.current;
      const width = 420;
      const height = 250;

      const dataUrl = await toPng(el, {
        backgroundColor: '#ffffff',
        width: width,
        height: height,
        pixelRatio: 3, // High DPI capture
        cacheBust: true
      });

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [width, height]
      });

      pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);
      pdf.save(`ID_Card_${formData.name.replace(/\s+/g, '_') || 'Client'}.pdf`);
    } catch (err) {
      console.error('PDF download error:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const cardJSX = (
    <>
      {/* Outer Line Border Accent */}
      <div 
        style={{
          position: 'absolute',
          inset: '6px',
          border: '1.5px solid #2563eb',
          borderRadius: '8px',
          pointerEvents: 'none',
          zIndex: 5
        }} 
      />

      {/* Top Right Geometric Banner Accent */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '190px',
          height: '42px',
          background: '#002c5c',
          clipPath: 'polygon(20px 0, 100% 0, 100% 100%, 0 100%)',
          zIndex: 2
        }} 
      />
      <div 
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '210px',
          height: '32px',
          background: '#2563eb',
          clipPath: 'polygon(20px 0, 100% 0, 100% 100%, 0 100%)',
          zIndex: 1
        }} 
      />

      {/* Bottom Left Geometric Banner Accent */}
      <div 
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '140px',
          height: '24px',
          background: '#002c5c',
          clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0 100%)',
          zIndex: 2
        }} 
      />
      <div 
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '160px',
          height: '16px',
          background: '#2563eb',
          clipPath: 'polygon(0 0, 100% 0, 88% 100%, 0 100%)',
          zIndex: 1
        }} 
      />

      {/* Top Header Section */}
      <div 
        style={{
          width: '100%',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '4px 12px 0 12px',
          position: 'relative',
          zIndex: 10,
          boxSizing: 'border-box'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
          <img 
            src={logo} 
            alt="Dhanlaxmi Logo" 
            style={{ height: '46px', width: 'auto', objectFit: 'contain', borderRadius: '2px' }} 
          />
        </div>
      </div>

      {/* Card Body Section - Photo on LEFT, Details on RIGHT */}
      <div 
        style={{
          width: '100%',
          height: '185px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          position: 'relative',
          zIndex: 10,
          padding: '0 16px',
          boxSizing: 'border-box',
          marginTop: '-4px' // Pulled up to reduce vertical gap
        }}
      >
        {/* Left Column: Photo Container */}
        <div style={{ position: 'relative', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div 
            style={{
              width: '92px',
              height: '108px',
              backgroundColor: '#e2e8f0',
              border: '2px solid #002c5c',
              borderRadius: '6px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
          >
            {photoPreview ? (
              <img src={photoPreview} alt="Client Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span className="material-symbols-outlined" style={{ fontSize: '36px', color: '#94a3b8' }}>person</span>
            )}
          </div>

          {/* Dhanlaxmi Circular Blue Stamp Overlay */}
          <div 
            style={{
              position: 'absolute',
              left: '-14px',
              bottom: formData.isStockBroker ? '6px' : '-12px',
              width: '56px',
              height: '56px',
              opacity: 0.9,
              pointerEvents: 'none',
              transform: 'rotate(-6deg)',
              zIndex: 20
            }}
          >
            <img 
              src={dhanlaxmiBlueStamp} 
              alt="Dhanlaxmi Blue Stamp" 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
            />
          </div>

          {/* Stock Broker Tag below photo */}
          {formData.isStockBroker && (
            <div 
              style={{
                marginTop: '5px',
             
                backgroundColor: '#ffffff',
                color: '#002c5c',
                fontSize: '8.5px',
                fontWeight: '900',
                padding: '1px 4px',
                borderRadius: '3px',
                textAlign: 'center',
                width: '92px',
                boxSizing: 'border-box',
                letterSpacing: '0.2px',
                zIndex: 25,
                position: 'relative'
              }}
            >
              STOCK BROKER
            </div>
          )}
        </div>

        {/* Right Column: Client Details List */}
        <div 
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            marginLeft: '18px',
            width: '280px',
            flexGrow: 1,
            justifyContent: 'center'
          }}
        >
          {/* Name Row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', fontSize: '10px', color: '#334155', lineHeight: '1.2' }}>
            <span style={{ fontWeight: '700', width: '52px', display: 'inline-block', flexShrink: 0 }}>Name</span>
            <span style={{ margin: '0 4px', fontWeight: '700', flexShrink: 0 }}>:</span>
            <span style={{ fontWeight: '850', color: '#0f172a', fontSize: '11px', textTransform: 'capitalize', display: 'inline-block', wordBreak: 'break-word', lineHeight: '1.2' }}>
              {formData.name || 'Johnathan Doe'}
            </span>
          </div>

          {/* ID Number Row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', fontSize: '9px', color: '#334155', lineHeight: '1.2' }}>
            <span style={{ fontWeight: '700', width: '52px', display: 'inline-block', flexShrink: 0 }}>ID No</span>
            <span style={{ margin: '0 4px', fontWeight: '700', flexShrink: 0 }}>:</span>
            <span style={{ color: '#0f172a', fontWeight: '700', fontFamily: 'monospace', fontSize: '10px', display: 'inline-block', wordBreak: 'break-word', lineHeight: '1.2' }}>
              {formData.idNumber || '123456789'}
            </span>
          </div>

          {/* Designation Row */}
          {/* <div style={{ display: 'flex', alignItems: 'center', fontSize: '9px', color: '#334155' }}>
            <span style={{ fontWeight: '700', width: '52px', display: 'inline-block' }}>Desig</span>
            <span style={{ margin: '0 4px', fontWeight: '700' }}>:</span>
            <span style={{ color: '#475569', fontWeight: '600' }}>
              {formData.designation || 'Production Manager'}
            </span>
          </div> */}

          {/* Phone Row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', fontSize: '9px', color: '#334155', lineHeight: '1.2' }}>
            <span style={{ fontWeight: '700', width: '52px', display: 'inline-block', flexShrink: 0 }}>Phone</span>
            <span style={{ margin: '0 4px', fontWeight: '700', flexShrink: 0 }}>:</span>
            <span style={{ color: '#475569', fontWeight: '600', fontFamily: 'monospace', display: 'inline-block', wordBreak: 'break-word', lineHeight: '1.2' }}>
              {formData.phone || '9876543210'}
            </span>
          </div>

          {/* Email Row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', fontSize: '9px', color: '#334155', lineHeight: '1.2' }}>
            <span style={{ fontWeight: '700', width: '52px', display: 'inline-block', flexShrink: 0 }}>E-mail</span>
            <span style={{ margin: '0 4px', fontWeight: '700', flexShrink: 0 }}>:</span>
            <span style={{ color: '#475569', fontWeight: '600', fontSize: '8.5px', wordBreak: 'break-all', display: 'inline-block', lineHeight: '1.2' }}>
              {formData.email || 'info@dhanlaxmi.com'}
            </span>
          </div>

          {/* Address Row */}
          {formData.address && formData.address.trim() && (
            <div style={{ display: 'flex', alignItems: 'flex-start', fontSize: '9px', color: '#334155', lineHeight: '1.2' }}>
              <span style={{ fontWeight: '700', width: '52px', display: 'inline-block', flexShrink: 0 }}>Address</span>
              <span style={{ margin: '0 4px', fontWeight: '700', flexShrink: 0 }}>:</span>
              <span style={{ color: '#475569', fontWeight: '600', fontSize: '8px', lineHeight: '10px', display: 'inline-block', wordBreak: 'break-word' }}>
                {formData.address}
              </span>
            </div>
          )}

          {/* Issued Date Row */}
          {/* <div style={{ display: 'flex', alignItems: 'center', fontSize: '9px', color: '#334155' }}>
            <span style={{ fontWeight: '700', width: '52px', display: 'inline-block' }}>Issued</span>
            <span style={{ margin: '0 4px', fontWeight: '700' }}>:</span>
            <span style={{ color: '#475569', fontWeight: '600' }}>
              {formatDateDisplay(formData.issuedDate) || '26 - Jul - 2026'}
            </span>
          </div> */}

          {/* Expires Date Row */}
          {/* <div style={{ display: 'flex', alignItems: 'center', fontSize: '9px', color: '#334155' }}>
            <span style={{ fontWeight: '700', width: '52px', display: 'inline-block' }}>Expires</span>
            <span style={{ margin: '0 4px', fontWeight: '700' }}>:</span>
            <span style={{ color: '#475569', fontWeight: '600' }}>
              {formatDateDisplay(formData.expiresDate) || '26 - Jul - 2027'}
            </span>
          </div> */}
        </div>
      </div>
    </>
  );

  return (
    <div className="bg-slate-950 text-slate-200 min-h-screen flex flex-col font-sans antialiased relative">
      {/* Header */}
      <header className="p-4 flex items-center justify-between border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <button onClick={() => navigate('/form')} className="text-slate-400 hover:text-white flex items-center gap-1.5 font-semibold text-sm">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span> Back to Dashboard
        </button>
        <div className="flex items-center gap-2 text-violet-400 font-bold text-sm tracking-wider uppercase">
          <span className="material-symbols-outlined">badge</span>
          ID Card Generator
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 max-w-xl mx-auto w-full pb-24">
        
        {/* On-Screen Live Preview */}
        <div className="mb-8 flex flex-col items-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Live Preview</span>
          <div 
            className="rounded-xl relative overflow-hidden select-none shadow-2xl border border-slate-800"
            style={{
              width: '420px',
              height: '250px',
              minWidth: '420px',
              minHeight: '250px',
              maxWidth: '420px',
              maxHeight: '250px',
              background: '#f8fafc',
              color: '#0f172a',
              fontFamily: "'Outfit', 'Inter', sans-serif",
              boxSizing: 'border-box',
              padding: '12px'
            }}
          >
            {cardJSX}
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-slate-900/40 border border-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-xl">
          <h2 className="text-sm font-bold text-slate-100 mb-6 flex items-center gap-2 uppercase tracking-wide">
            <span className="material-symbols-outlined text-violet-400 text-[18px]">badge</span>
            ID Card Information
          </h2>
          
          <div className="space-y-4">
            {/* Name Input */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all placeholder:text-slate-700 font-semibold"
                placeholder="e.g. Johnathan Doe"
              />
            </div>

            {/* Custom ID Input */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Employee ID / ID Number</label>
              <input
                type="text"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all placeholder:text-slate-700 font-mono"
                placeholder="e.g. JD10243"
              />
            </div>

            {/* Designation Input */}
            {/* <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Designation</label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all placeholder:text-slate-700"
                placeholder="e.g. Production Manager"
              />
            </div> */}

            {/* Phone Input */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all placeholder:text-slate-700"
                placeholder="e.g. 9876543210"
              />
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">E-mail</label>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all placeholder:text-slate-700"
                placeholder="e.g. info@dhanlaxmi.com"
              />
            </div>

            {/* Address Input */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows="2"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all placeholder:text-slate-700 resize-none leading-relaxed"
                placeholder="e.g. Mumbai, Maharashtra"
              />
            </div>

            {/* Dates grid */}
            {/* <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Issued Date</label>
                <input
                  type="date"
                  name="issuedDate"
                  value={formData.issuedDate}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all text-slate-300"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Expires Date</label>
                <input
                  type="date"
                  name="expiresDate"
                  value={formData.expiresDate}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all text-slate-300"
                />
              </div>
            </div> */}

            {/* Stock Broker Checkbox */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                name="isStockBroker"
                id="isStockBroker"
                checked={formData.isStockBroker}
                onChange={(e) => setFormData(prev => ({ ...prev, isStockBroker: e.target.checked }))}
                className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-violet-600 focus:ring-violet-500 focus:ring-offset-slate-900 cursor-pointer"
              />
              <label htmlFor="isStockBroker" className="text-xs font-bold text-slate-400 uppercase tracking-wider cursor-pointer select-none">
                Mark as Stock Broker
              </label>
            </div>

            {/* Photo Input */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Upload Photo</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  id="photo-upload-input"
                />
                <label
                  htmlFor="photo-upload-input"
                  className="w-full bg-slate-950 border border-slate-800 border-dashed rounded-xl px-3.5 py-4 text-xs font-semibold text-center block cursor-pointer hover:border-violet-500 hover:bg-slate-900/20 transition-all text-slate-400"
                >
                  <span className="material-symbols-outlined text-[20px] align-middle mr-1.5 text-violet-400">upload_file</span>
                  {photoPreview ? 'Change Photo' : 'Select Profile Image'}
                </label>
              </div>
            </div>
            
            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full mt-6 bg-gradient-to-tr from-violet-600 to-indigo-500 hover:from-violet-500 hover:to-indigo-400 text-white font-bold py-3.5 rounded-xl transition-all flex justify-center items-center gap-2 disabled:opacity-50 shadow-lg shadow-violet-600/20 active:scale-95 duration-100 text-sm"
            >
              {isDownloading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-1"></span>
                  Generating PDF...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">download</span>
                  Download ID Card PDF
                </>
              )}
            </button>
          </div>
        </div>

        {/* Hidden Preview Container (Used strictly for high-fidelity export) */}
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: '420px', height: '250px' }}>
          <div 
            ref={idCardRef}
            id="id-card-capture-target"
            className="relative overflow-hidden select-none"
            style={{
              width: '420px',
              height: '250px',
              minWidth: '420px',
              minHeight: '250px',
              maxWidth: '420px',
              maxHeight: '250px',
              background: '#f8fafc',
              color: '#0f172a',
              fontFamily: "'Outfit', 'Inter', sans-serif",
              boxSizing: 'border-box',
              padding: '12px'
            }}
          >
            {cardJSX}
          </div>
        </div>

      </main>
    </div>
  );
};

export default IdCardPage;
