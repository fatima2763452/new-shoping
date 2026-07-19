import React from 'react';
import '../index.css';

export default function TokenWrapper({ children }) {
  return (
    <div id="token-101010-root" className="stock-bg min-h-screen text-[#d4e4fa] font-sans antialiased">
      {children}
    </div>
  );
}
