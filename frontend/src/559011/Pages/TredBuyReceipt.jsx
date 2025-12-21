import React from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import NavBar from '../Components/NavBar';
import { useLocation } from 'react-router-dom';

function TredBuyReceipt() {
  const location = useLocation();
  const { client, stockName, idCode, quantity, lotSize, buyPrice, tradeDate, mode, orgnizationName } =
    location.state || {};

  const calculateBrokerage = (buyPrice, quantity) => {
    const turnover = buyPrice * quantity;
    return Number((turnover * 0.00005).toFixed(2));
  };

  const brokerage = calculateBrokerage(buyPrice, quantity);
  const totalBuying = buyPrice * quantity;
  const totalAmount = totalBuying + brokerage;

  const handleDownloadPDF = async () => {
    const input = document.getElementById('receipt-pdf');
    if (!input) return;

    const clone = input.cloneNode(true);
    clone.querySelectorAll('.no-print, button').forEach((el) => el.remove());
    clone.style.background = '#0f172a';
    clone.style.width = '380px';
    clone.style.overflow = 'hidden';
    clone.style.margin = '0 auto';
    document.body.appendChild(clone);

    try {
      const canvas = await html2canvas(clone, { scale: 3, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pxToMm = 0.264583;
      const imgWmm = canvas.width * pxToMm;
      const imgHmm = canvas.height * pxToMm;
      const pdf = new jsPDF('p', 'mm', [imgWmm, imgHmm]);
      pdf.addImage(imgData, 'PNG', 0, 0, imgWmm, imgHmm);
      pdf.save('Buy_Receipt.pdf');
    } catch (err) {
      console.error(err);
    } finally {
      document.body.removeChild(clone);
    }
  };

  return (
    <>
      <NavBar />
      <div style={{ background: 'white', minHeight: '100vh', padding: '40px 0' }}>
        <div
          id="receipt-pdf"
          style={{
            background: '#0f172a',
            width: 380,
            boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
            color: '#fff',
            margin: '0 auto',
            paddingBottom: 20,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {/* Header */}
          <div style={{ padding: '18px 20px', borderBottom: '1px solid #1e293b' }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
              {orgnizationName}
            </h3>
            <p style={{ fontSize: 12, color: '#94a3b8' }}>Trade Buy Receipt</p>
          </div>

          {/* Stock Info */}
          <div style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 22, margin: 0, fontWeight: 700 }}>{stockName}</h2>
              <p style={{ fontSize: 14 }}>User: {client}</p>
            </div>
            <span style={{ color: '#94a3b8', fontSize: 13 }}>
              {tradeDate ? new Date(tradeDate).toLocaleDateString('en-GB') : ''}
            </span>
          </div>

          {/* Order Details */}
          <div
            style={{
              background: '#1e293b',
              borderRadius: 12,
              margin: '0 16px',
              padding: '16px 18px',
            }}
          >
            <div style={rowStyle}>
              <span style={labelStyle}>Customer ID:</span>
              <span style={valueStyle}>{idCode || '—'}</span>
            </div>

            <div style={rowStyle}>
              <span style={labelStyle}>Product Type:</span>
              <span style={valueStyle}>{mode ? mode.toUpperCase() : '—'}</span>
            </div>

            <div style={rowStyle}>
              <span style={labelStyle}>Quantity:</span>
              <span style={valueStyle}>
                {quantity} {lotSize ? <span>({lotSize} Lot)</span> : null}
              </span>
            </div>

            <div style={rowStyle}>
              <span style={labelStyle}>Buy Price:</span>
              <span style={valueStyle}>
                ₹{buyPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div style={rowStyle}>
              <span style={labelStyle}>Total Buying:</span>
              <span style={valueStyle}>
                ₹{totalBuying.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div style={rowStyle}>
              <span style={labelStyle}>Brokerage:</span>
              <span style={valueStyle}>
                ₹{brokerage.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Summary Section */}
           <div className="text-center mt-4 fw-semibold text-primary">
                Including 0.01% Brokerage Charge
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 10 }}>
            <button style={btnStyle} className="no-print" onClick={() => window.history.back()}>
              View Order
            </button>
            <button style={btnStyle} className="no-print" onClick={handleDownloadPDF}>
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

const rowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: 8,
};

const labelStyle = {
  fontSize: 14,
  color: '#cbd5e1',
};

const valueStyle = {
  fontSize: 14,
  fontWeight: 600,
  color: '#fff',
};

const btnStyle = {
  background: '#1e293b',
  border: 'none',
  color: '#fff',
  padding: '10px 18px',
  borderRadius: 10,
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 600,
};

export default TredBuyReceipt;
