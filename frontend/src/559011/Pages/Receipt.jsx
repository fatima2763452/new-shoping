import React, { useState, useEffect } from 'react';
import './App.css';
import '../Styles/receipt.css';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import NavBar from '../Components/NavBar';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useLocation } from "react-router-dom";

function Receipt() {
  const { uniquckId } = useParams();
  const [receiptData, setReceiptData] = useState(null);
  const location = useLocation();
  const { orgnizationName } = location.state || {};

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/forms/getForm/${token}/${uniquckId}`)
      .then((res) => setReceiptData(res.data))
      .catch((err) => console.error(err));
  }, [uniquckId]);

  const calculateBrokerage = ({ buyPrice, sellPrice, quantity }) => {
    const turnover = (buyPrice + sellPrice) * quantity;
    return Number((turnover * 0.0001).toFixed(2));
  };

  const handleDownloadPDF = async () => {
    const input = document.getElementById('receipt-pdf');
    if (!input) return;

    const clone = input.cloneNode(true);
    clone.querySelectorAll('.no-print, button').forEach((el) => el.remove());
    clone.style.background = '#0f172a';
    clone.style.width = '380px';
    // clone.style.borderRadius = '20px';
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
      pdf.save('Trade_Receipt.pdf');
    } catch (err) {
      console.error(err);
    } finally {
      document.body.removeChild(clone);
    }
  };

  if (!receiptData) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="text-muted">Loading receipt...</div>
      </div>
    );
  }

  const brokerage = calculateBrokerage(receiptData);
  const {  lotSize } = receiptData;
  // let netAmount = 0;

  // if (mode === 'buy') {
  //   netAmount = (sellPrice - buyPrice) * quantity - brokerage;
  // } else if (mode === 'sell') {
  //   netAmount = (buyPrice - buyPrice) * quantity - brokerage;
  // }


    let netAmount = 0;
  const { buyPrice, sellPrice, quantity, mode } = receiptData;
  if (mode === 'buy') {
    netAmount = ((sellPrice * quantity) - (buyPrice * quantity)) - brokerage;
  } else if (mode === 'sell') {
    netAmount = (buyPrice * quantity) - (sellPrice * quantity) - brokerage;
  }


  const totalBuying = buyPrice * quantity;
  const totalSelling = sellPrice * quantity;
  const isProfit = netAmount >= 0;


  return (
    <>
      <NavBar />
      <div style={{ background: 'white', minHeight: '100vh', padding: '40px 0' }}>
        <div
          id="receipt-pdf"
          style={{
            background: '#0f172a',
            width: 380,
            // borderRadius: 20,
            boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
            color: '#fff',
            margin: '0 auto',
            paddingBottom: 20,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {/* Header */}
          <div style={{ padding: '18px 20px', borderBottom: '1px solid #1e293b' }}>
            <h3 style={{ margin: 0, fontSize: 21, fontWeight: 700 }}>{orgnizationName}</h3>
    
          </div>

          {/* Stock Info */}
          <div style={{ padding: '16px 20px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
            }}>
              <h2 style={{ fontSize: 22, margin: 0, fontWeight: 700 }}>{receiptData.stockName}</h2>
              <p style={{ fontSize: 14 }}>User: {receiptData.clientName}</p>
            </div>
            <span style={{ color: '#94a3b8', fontSize: 13 }}>
              {new Date(receiptData.tradeDate).toLocaleDateString('en-GB')}
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
              <span style={labelStyle}>Custemer Id:</span>
              <span style={valueStyle}>{receiptData.idCode || '—'}</span>
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
              <span style={valueStyle}>₹{buyPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            <div style={rowStyle}>
              <span style={labelStyle}>Total Buying:</span>
              <span style={valueStyle}>₹{totalBuying.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            <div style={rowStyle}>
              <span style={labelStyle}>Sell Price:</span>
              <span style={valueStyle}>₹{sellPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            <div style={rowStyle}>
              <span style={labelStyle}>Total Selling:</span>
              <span style={valueStyle}>₹{totalSelling.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            <div style={rowStyle}>
              <span style={labelStyle}>Brokerage:</span>
              <span style={valueStyle}>₹{brokerage.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            <div style={rowStyle}>
              <span style={labelStyle}>Realised P&L:</span>
              <span style={{ ...valueStyle, color: netAmount >= 0 ? '#22c55e' : '#ef4444' }}>
                {isProfit ? '+' : '-'} ₹{Math.abs(netAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Profit Section */}
          <div
            style={{
              margin: '20px 16px 10px',
              background: isProfit ? '#4ae8b3ff' : '#e84d4dff',
              borderRadius: 12,
              textAlign: 'center',
              padding: '10px 0',
              color: 'white',
              fontWeight: 700,
              fontSize: 22,
            }}
          >

            <div style={{ fontSize: 21, marginTop: 6 }}>
              Net Amount ₹{Math.abs(netAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
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

export default Receipt;
