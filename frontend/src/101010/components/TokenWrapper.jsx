import React, { useEffect } from 'react';
import token101010Css from '../index.css?inline';

export default function TokenWrapper({ children }) {
  useEffect(() => {
    let styleEl = document.getElementById('token-101010-styles');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'token-101010-styles';
      styleEl.innerHTML = token101010Css;
      document.head.appendChild(styleEl);
    }

    return () => {
      const el = document.getElementById('token-101010-styles');
      if (el) {
        el.remove();
      }
    };
  }, []);

  return (
    <div id="token-101010-root" className="stock-bg min-h-screen text-[#d4e4fa] font-sans antialiased">
      {children}
    </div>
  );
}

