import React, { useEffect } from 'react';
import token202020Css from '../index.css?inline';

export default function TokenWrapper({ children }) {
  useEffect(() => {
    const origMargin = document.body.style.margin;
    const origBg = document.body.style.backgroundColor;

    document.body.style.margin = '0px';
    document.body.style.backgroundColor = '#051424';

    let styleEl = document.getElementById('token-202020-styles');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'token-202020-styles';
      styleEl.innerHTML = token202020Css;
      document.head.appendChild(styleEl);
    }

    return () => {
      document.body.style.margin = origMargin;
      document.body.style.backgroundColor = origBg;
      const el = document.getElementById('token-202020-styles');
      if (el) {
        el.remove();
      }
    };
  }, []);

  return (
    <div id="token-202020-root" className="stock-bg min-h-screen text-[#d4e4fa] font-sans antialiased">
      {children}
    </div>
  );
}

