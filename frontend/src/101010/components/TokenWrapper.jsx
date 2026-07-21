import React, { useEffect } from 'react';
import token101010Css from '../index.css?inline';

export default function TokenWrapper({ children }) {
  useEffect(() => {
    const origMargin = document.body.style.margin;
    const origBg = document.body.style.backgroundColor;

    document.body.style.margin = '0px';
    document.body.style.backgroundColor = '#051424';

    let styleEl = document.getElementById('token-101010-styles');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'token-101010-styles';
      styleEl.innerHTML = token101010Css;
      document.head.appendChild(styleEl);
    }

    return () => {
      document.body.style.margin = origMargin;
      document.body.style.backgroundColor = origBg;
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

