import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import dhanlaxmiBlueStamp from '../assets/dhanlaxmi_blue_stamp.png';
import ashokStambhImg from '../assets/ashok_stambh.png';

const IdCardPage = () => {
  const navigate = useNavigate();
  const idCardRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    email: '',
    idNumber: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      
      // Auto-generate ID Number based on Name initials if name changes
      if (name === 'name') {
        const initials = value
          .split(' ')
          .map(word => word[0])
          .join('')
          .toUpperCase()
          .slice(0, 3);
        updated.idNumber = `ID-${initials || 'AL'}${new Date().getFullYear() - 35}`;
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
      
      // Force exact compact dimensions for capturing (420px x 250px)
      const width = 420;
      const height = 250;

      const dataUrl = await toPng(el, {
        backgroundColor: '#7d1c99',
        width: width,
        height: height,
        pixelRatio: 2,
        cacheBust: false,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
        }
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
        
        {/* Form Container (No Live Preview Shown On-Screen) */}
        <div className="bg-slate-900/40 border border-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-violet-400">badge</span>
            Generate Client ID Card
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
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all placeholder:text-slate-700"
                placeholder="Anil Bharat Lokhande"
              />
            </div>

            {/* Phone Input */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all placeholder:text-slate-700"
                placeholder="e.g. 60*****82 or full number"
              />
            </div>

            {/* Address Input */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows="3"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all placeholder:text-slate-700 resize-none leading-relaxed"
                placeholder="2Bijwadi, Tal-indapur, Bijwadi Pune, Maharashtra-413106"
              />
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">E-mail / Website</label>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all placeholder:text-slate-700"
                placeholder="www.Abbotwealthsher.com"
              />
            </div>

            {/* Custom ID Input */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">ID Number</label>
              <input
                type="text"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all placeholder:text-slate-700"
                placeholder="ID-AL1991"
              />
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
                  {photoPreview ? 'Change Photo' : 'Select Client Image'}
                </label>
              </div>
            </div>
            
            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full mt-6 bg-gradient-to-tr from-violet-600 to-indigo-500 hover:from-violet-500 hover:to-indigo-400 text-white font-bold py-3.5 rounded-xl transition-all flex justify-center items-center gap-2 disabled:opacity-50 shadow-lg shadow-violet-600/20 active:scale-95 duration-100"
            >
              {isDownloading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-1"></span>
                  Downloading...
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

        {/* Hidden Preview Container (Compact dimensions: 420px x 250px) */}
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: '420px', height: '250px' }}>
          <div 
            ref={idCardRef}
            id="id-card-capture-target"
            className="rounded-xl relative overflow-hidden select-none"
            style={{
              width: '420px',
              height: '250px',
              minWidth: '420px',
              minHeight: '250px',
              maxWidth: '420px',
              maxHeight: '250px',
              background: 'linear-gradient(135deg, #7d1c99 0%, #4b0e5d 100%)',
              color: '#ffffff',
              fontFamily: "'Outfit', 'Inter', sans-serif",
              boxSizing: 'border-box',
              padding: '12px'
            }}
          >
            {/* Background watermark stock chart (subtle background element) */}
            <div 
              style={{ 
                position: 'absolute', 
                right: '12px', 
                bottom: '10px', 
                opacity: 0.08, 
                pointerEvents: 'none', 
                zIndex: 0 
              }}
            >
              <svg width="220" height="110" viewBox="0 0 220 110" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="10" y="70" width="16" height="30" rx="3" fill="#ffffff" />
                <rect x="30" y="60" width="16" height="40" rx="3" fill="#ffffff" />
                <rect x="50" y="30" width="16" height="70" rx="3" fill="#ffffff" />
                <rect x="70" y="45" width="16" height="55" rx="3" fill="#ffffff" />
                <rect x="90" y="20" width="16" height="80" rx="3" fill="#ffffff" />
                <rect x="110" y="10" width="16" height="90" rx="3" fill="#ffffff" />
                <rect x="130" y="35" width="16" height="65" rx="3" fill="#ffffff" />
                <rect x="150" y="5" width="16" height="95" rx="3" fill="#ffffff" />
                <path d="M 10,80 Q 90,45 180,15 L 165,10 M 180,15 L 175,30" stroke="#f472b6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Top Header Section */}
            <div 
              style={{
                width: '100%',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'between',
                borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                paddingBottom: '5px',
                position: 'relative',
                zIndex: 10
              }}
            >
              {/* Left Ashok Stambh Logo Image */}
              <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                <img 
                  src={ashokStambhImg} 
                  alt="Ashok Stambh" 
                  style={{ height: '32px', width: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1) drop-shadow(0px 1px 2px rgba(0,0,0,0.5))' }} 
                />
              </div>

              {/* Company Name */}
              <div style={{ flexGrow: 1, textAlign: 'center', margin: '0 5px' }}>
                <h1 
                  style={{ 
                    fontSize: '12.5px', 
                    fontWeight: 900, 
                    color: '#ffeb3b',
                    margin: 0,
                    padding: 0,
                    letterSpacing: '-0.2px',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.6)'
                  }}
                >
                  DHANLAXMI CAPITAL PVT. LTD.
                </h1>
              </div>

              {/* Right Ashok Stambh Logo Image */}
              <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                <img 
                  src={ashokStambhImg} 
                  alt="Ashok Stambh" 
                  style={{ height: '32px', width: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1) drop-shadow(0px 1px 2px rgba(0,0,0,0.5))' }} 
                />
              </div>
            </div>

            {/* Card Body Section - Photo on LEFT, Details on RIGHT */}
            <div 
              style={{
                width: '100%',
                height: '190px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                position: 'relative',
                zIndex: 10,
                marginTop: '10px'
              }}
            >
              
              {/* Left Column: Photo & ID Number - Width: 120px */}
              <div 
                style={{
                  width: '120px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  position: 'relative',
                  marginTop: '4px'
                }}
              >
                {/* Photo Container */}
                <div 
                  style={{
                    width: '85px',
                    height: '85px',
                    minWidth: '85px',
                    minHeight: '85px',
                    backgroundColor: '#0f172a',
                    border: '2px solid #00ffff',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.3)',
                    borderRadius: '4px'
                  }}
                >
                  {photoPreview ? (
                    <img src={photoPreview} alt="Client Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span className="material-symbols-outlined" style={{ fontSize: '38px', color: '#475569' }}>person</span>
                  )}
                </div>

                {/* ID Code below photo */}
                {formData.idNumber && (
                  <div style={{ marginTop: '8px' }}>
                    <span 
                      style={{
                        fontSize: '9.5px',
                        fontWeight: 800,
                        color: '#ffeb3b',
                        letterSpacing: '0.5px',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        padding: '1.5px 6px',
                        borderRadius: '3px',
                        fontFamily: "monospace"
                      }}
                    >
                      {formData.idNumber}
                    </span>
                  </div>
                )}

                {/* Dhanlaxmi Circular Blue Stamp Overlay */}
                <div 
                  style={{
                    position: 'absolute',
                    left: '2px',
                    top: '52px',
                    width: '56px',
                    height: '56px',
                    opacity: 0.95,
                    pointerEvents: 'none',
                    transform: 'rotate(-4deg)',
                    zIndex: 20
                  }}
                >
                  <img 
                    src={dhanlaxmiBlueStamp} 
                    alt="Dhanlaxmi Blue Stamp" 
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                  />
                </div>
              </div>

              {/* Right Column: Client Details - Width: 280px */}
              <div 
                style={{
                  width: '280px',
                  display: 'flex',
                  flexDirection: 'column',
                  paddingLeft: '10px',
                  boxSizing: 'border-box'
                }}
              >
                {/* Details Container - Level/Aligned with Photo (starting at top: 4px) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                  
                  {/* Name Row */}
                  {formData.name && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', fontSize: '11.5px' }}>
                      <span style={{ fontWeight: 'bold', width: '55px', flexShrink: 0, color: '#ffffff' }}>Name</span>
                      <span style={{ width: '10px', flexShrink: 0, color: '#ffffff' }}>:</span>
                      <span style={{ color: '#ffeb3b', fontWeight: 900, letterSpacing: '0.1px', lineHeight: 1.2 }}>
                        {formData.name}
                      </span>
                    </div>
                  )}

                  {/* Phone Row */}
                  {formData.phone && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', fontSize: '11.5px' }}>
                      <span style={{ fontWeight: 'bold', width: '55px', flexShrink: 0, color: '#ffffff' }}>Phone</span>
                      <span style={{ width: '10px', flexShrink: 0, color: '#ffffff' }}>:</span>
                      <span style={{ color: '#ffeb3b', fontWeight: 800, fontFamily: 'monospace' }}>
                        {formData.phone}
                      </span>
                    </div>
                  )}

                  {/* Address Row */}
                  {formData.address && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', fontSize: '11.5px' }}>
                      <span style={{ fontWeight: 'bold', width: '55px', flexShrink: 0, color: '#ffffff' }}>Address</span>
                      <span style={{ width: '10px', flexShrink: 0, color: '#ffffff' }}>:</span>
                      <span style={{ color: '#ffeb3b', fontWeight: 700, fontSize: '10.5px', lineHeight: '14px' }}>
                        {formData.address}
                      </span>
                    </div>
                  )}

                  {/* Email Row */}
                  {formData.email && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', fontSize: '11.5px' }}>
                      <span style={{ fontWeight: 'bold', width: '55px', flexShrink: 0, color: '#ffffff' }}>E-mail</span>
                      <span style={{ width: '10px', flexShrink: 0, color: '#ffffff' }}>:</span>
                      <span style={{ color: '#ffeb3b', fontWeight: 800, fontSize: '11px', wordBreak: 'break-all' }}>
                        {formData.email}
                      </span>
                    </div>
                  )}
                  
                </div>
              </div>

            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default IdCardPage;
