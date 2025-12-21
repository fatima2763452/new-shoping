import React, { useState, useEffect } from 'react';
import './App.css';
import '../Styles/receipt.css';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import NavBar from '../Components/NavBar';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function Receipt() {
  const { uniquckId } = useParams();
  const [receiptData, setReceiptData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/forms/getForm/${token}/${uniquckId}`)
      .then((res) => setReceiptData(res.data))
      .catch((err) => console.error(err));
  }, [uniquckId]);

  // Intraday brokerage at 0.005% of turnover (buy+sell)*quantity
  const calculateBrokerage = ({ buyPrice, sellPrice, quantity }) => {
    const bp = Number(buyPrice || 0);
    const sp = Number(sellPrice || 0);
    const q = Number(quantity || 0);
    const turnover = (bp + sp) * q;
    return Number((turnover * 0.00005).toFixed(2));
  };
 
const handleDownloadPDF = async () => {
  const input = document.getElementById('receipt-pdf');
  if (!input) return;

  // Clone the receipt to remove buttons and avoid layout issues
  const clone = input.cloneNode(true);
  clone.querySelectorAll('.no-print').forEach((el) => el.remove());
  clone.querySelectorAll('button').forEach((btn) => btn.remove());

  
  clone.style.background = '#0f172a'; // main receipt background (dark theme)
  clone.style.color = 'white';      // default text color
  clone.style.width = '400px';
  clone.style.borderRadius = '0px';
  clone.style.overflow = 'hidden';
  clone.style.margin = '0 auto';
  clone.style.position = 'absolute';
  clone.style.left = '-9999px';
  document.body.appendChild(clone);

  // Force header and other key colors to match the receipt
  const header = clone.querySelector('.header');
  if (header) {
    header.style.background = '#0f172a'; // header dark color
    header.style.color = 'rgba(120, 183, 250, 0.76)';
    header.style.padding = '20px';
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
  }

  const gridItems = clone.querySelectorAll('.grid-item');
  gridItems.forEach((item) => {
    item.style.background = '#202a43ff'; // grid item background (dark)
    item.style.borderRadius = '12px';
    item.style.padding = '10px';
    item.style.textAlign = 'center';
  });

  try {
    const canvas = await html2canvas(clone, {
      scale: 3,
      useCORS: true,
      scrollY: -window.scrollY,
      backgroundColor: null, // preserve the background as rendered
    });

    const imgData = canvas.toDataURL('image/png');
    const pxToMm = 0.264583;
    const imgWmm = canvas.width * pxToMm;
    const imgHmm = canvas.height * pxToMm;

    const pdf = new jsPDF('p', 'mm', [imgWmm, imgHmm]);
    pdf.addImage(imgData, 'PNG', 0, 0, imgWmm, imgHmm);
    pdf.save('Exit Receipt.pdf');
  } catch (err) {
    console.error(err);
  } finally {
    document.body.removeChild(clone);
  }
};


  if (!receiptData) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: '80vh' }}
      >
        <div className="text-muted">Loading receipt...</div>
      </div>
    );
  }
  const brokerage = (
 
    Number(receiptData.formBrokerage) === 0.00005
  )
    ? calculateBrokerage(receiptData)
    : Number(receiptData.formBrokerage);
  
  const { buyPrice, sellPrice, quantity, mode } = receiptData;

  let netAmount = 0;
  if (mode === 'buy') {
    netAmount = sellPrice * quantity - buyPrice * quantity - brokerage;
  } else if (mode === 'sell') {
    netAmount = buyPrice * quantity - sellPrice * quantity - brokerage;
  }


  

  const realisedBoxClass =
    netAmount >= 0 ? 'realised-box realised-profit' : 'realised-box realised-loss';

  return (
    <>
      <NavBar />
      <div style={{ background: '#f0f2f5', minHeight: '100vh', padding: '32px 0' }}>
        <div
          id="receipt-pdf"
          className="receipt"
          style={{
            background: '#0f172a',
            width: '400px',
            borderRadius: '0px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            margin: '0 auto',
            color: 'white'
          }}
        >
          {/* Header */}
          <div
            className="header"
            style={{
              borderRadius: 0,
              background: '#0f172a',
              color: '#fff',
              padding: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid rgba(255,255,255,0.06)'
            }}
          >
            <h2>
             <span style={{ color:'white'}}>SHIV PVT. LTD</span> 
              <br />
              <span style={{ fontSize: '12px', fontWeight: 400 , color:'white'}}>Trade Exit Receipt</span>
            </h2>
            <div className="user-info" style={{ color:'white'}}>
              User: {receiptData.clientName}
            </div>
          </div>

          {/* Stock Info */}
          <div className="stock-card">
            <h3 style={gridValueStyle}>{receiptData.stockName}</h3>
            <span
              style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 600 }}
            >
              Exit ({receiptData.mode ? receiptData.mode.toUpperCase() : ''})
            </span>
          </div>

          {/* Grid */}
          <div className="grid">
            <div className="grid-item" style={gridItemStyle}>
              <p style={{color:'white'}}>Exit Date</p>
              <h4 style={{color:'white'}}>
                {new Date(receiptData.tradeDate).toLocaleDateString('en-GB')}
              </h4>
            </div>
            <div className="grid-item" style={gridItemStyle}>
              <p style={{color:'white'}}>Customer ID</p>
              <h4 style={{color:'white'}}>{receiptData.idCode || '—'}</h4>
            </div>
            <div className="grid-item" style={gridItemStyle}>
              <p style={{color:'white'}}>Executed Price</p>
              <h4 style={{color:'white'}}>
                ₹
                {Number(receiptData.sellPrice).toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                })}
              </h4>
            </div>
          </div>

          {/* Details */}
          <div className="details">
            <p style={gridLabelStyle}>
              <strong style={gridValueStyle}>Product Type:</strong>{' '}
              {receiptData.mode ? receiptData.mode.toUpperCase() : ''}
            </p>
            <p style={gridLabelStyle}>
              <strong style={gridValueStyle}>Quantity:</strong> {receiptData.quantity}{' '}
              {receiptData.lotSize && <span>({receiptData.lotSize} Lot)</span>}
            </p>
            <p style={gridLabelStyle}>
              <strong style={gridValueStyle}>Buy Price:</strong> ₹
              {Number(receiptData.buyPrice).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
              })}
            </p>
            <p style={gridLabelStyle}>
              <strong style={gridValueStyle}>Total Buying:</strong> ₹
              {(receiptData.buyPrice * receiptData.quantity).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
              })}
            </p>
            <p style={gridLabelStyle}>
              <strong style={gridValueStyle}>Sell Price:</strong> ₹
              {Number(receiptData.sellPrice).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
              })}
            </p>
            <p style={gridLabelStyle}>
              <strong style={gridValueStyle}>Total Selling:</strong> ₹
              {(receiptData.sellPrice * receiptData.quantity).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
              })}
            </p>
            <p style={gridLabelStyle}>
              <strong style={gridValueStyle}>Brokerage:</strong> ₹
              {brokerage.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className={realisedBoxClass}>
              <strong style={gridValueStyle}>Realised P&amp;L:</strong>{' '}
              {netAmount >= 0 ? '+' : '-'} ₹
              {Math.abs(netAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Actions */}
          <div className="actions no-print">
            <button className="btn btn-download" onClick={handleDownloadPDF}>
              Print Receipt
            </button>
          </div>

          {/* Footer */}
          <div
            style={{
              background: '#0f172a',
              padding: '12px',
              fontSize: '12px',
              textAlign: 'center',
              color: '#94a3b8',
              borderTop: '1px solid rgba(255,255,255,0.06)'
            }}
          >
             <span style={{ color:'white'}}>© SHIV PVT. LTD</span>

          </div>
        </div>
      </div>
    </>
  );
}

const gridLabelStyle = {
  margin: '4px 0',
  fontSize: '13px',
  color: 'white',
};

const gridValueStyle = {
  margin: 0,
  fontSize: '15px',
  fontWeight: 700,
  color: 'white',
};

const gridItemStyle = {
   background: '#202a43ff',

  borderRadius: '12px',
  padding: '10px',
  textAlign: 'center',
};

export default Receipt;



// make my handle downlaod fucntion color as actual receipt