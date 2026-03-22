import React, { useState } from 'react';
import './PaymentNoticePopup.css';

function PaymentNoticePopup() {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="payment-notice-overlay">
      <div className="payment-notice-popup">
        <div className="payment-notice-header">
          <span className="warning-icon">⚠️</span>
          <span>Important Notice</span>
        </div>
        <div className="payment-notice-body">
          <p>
            If you do not make the payment within{' '}
            <span className="highlight-text">5 days</span>, your token will be{' '}
            <span className="highlight-text">suspended</span>.
          </p>
          <p>
            Please complete your payment immediately to avoid any service
            disruption. Contact support if you have any questions regarding your
            payment.
          </p>
        </div>
        <div className="payment-notice-footer">
          <button
            className="payment-notice-btn"
            onClick={() => setIsOpen(false)}
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentNoticePopup;
