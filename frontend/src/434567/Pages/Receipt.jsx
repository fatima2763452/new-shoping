import React, { useState, useEffect } from 'react';
import './App.css';
import '../Styles/receipt.css';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import Button from '@mui/material/Button';
import NavBar from '../Components/NavBar';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function Receipt() {
  const { uniquckId } = useParams();
  const [receiptData, setReceiptData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    axios.get(`${process.env.REACT_APP_API_URL}/api/forms/getForm/${token}/${uniquckId}`)
      .then(res => setReceiptData(res.data))
      .catch(err => console.error(err));
  }, [uniquckId]);

  // Intraday brokerage at 0.01% of turnover (buy+sell)*quantity
  const calculateBrokerage = ({ buyPrice, sellPrice, quantity }) => {
    const turnover = (buyPrice + sellPrice) * quantity;
    return Number((turnover * 0.0001).toFixed(2));
  };


  const handleDownloadPDF = async () => {
    const input = document.getElementById('receipt-pdf');
    if (!input) return;

    // Clone node to remove buttons from PDF
    const clone = input.cloneNode(true);
    clone.querySelectorAll('.no-print').forEach(el => el.remove());

    // Force card styles on clone
    clone.style.background = '#fff';
    clone.style.width = '400px';
    clone.style.borderRadius = '20px';
    clone.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
    clone.style.overflow = 'hidden';
    clone.style.margin = '40px auto'; // thoda upar niche bhi margin

    // Force header styles
    const header = clone.querySelector('.header');
    if (header) {
      header.style.background = 'linear-gradient(90deg,#2563eb,#1d4ed8)';
      header.style.color = '#fff';
      header.style.padding = '20px';
      header.style.display = 'flex';
      header.style.justifyContent = 'space-between';
      header.style.alignItems = 'center';
    }

    // Temporary add to DOM for html2canvas
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    document.body.appendChild(clone);

    try {
      const canvas = await html2canvas(clone, {
        scale: 3,
        useCORS: true,
        scrollY: -window.scrollY,
        backgroundColor: null,
      });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();

      const pxToMm = 0.264583;
      const imgWmm = canvas.width * pxToMm;
      const imgHmm = canvas.height * pxToMm;

      // Fit card to page (width and height)
      const marginLR = 20;
      const marginTop = 20;
      const availableW = pageW - marginLR * 2;
      const availableH = pageH - marginTop * 2;
      const scaleW = availableW / imgWmm;
      const scaleH = availableH / imgHmm;
      const scale = Math.min(scaleW, scaleH, 1); // never upscale

      const finalW = imgWmm * scale;
      const finalH = imgHmm * scale;

      const x = (pageW - finalW) / 2;
      const y = (pageH - finalH) / 2;

      // Draw light grey background before adding image
      pdf.setFillColor(240, 242, 245); // #f0f2f5
      pdf.rect(0, 0, pageW, pageH, 'F');

      pdf.addImage(imgData, 'PNG', x, y, finalW, finalH);
      pdf.save('Exit Receipt.pdf');
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
  // const netAmount = (receiptData.sellPrice * receiptData.quantity) - (receiptData.buyPrice * receiptData.quantity) - brokerage;
  //Calculate netAmount based on mode
  let netAmount = 0;
  const { buyPrice, sellPrice, quantity, mode } = receiptData;
  if (mode === 'buy') {
    netAmount = ((sellPrice * quantity) - (buyPrice * quantity)) - brokerage;
  } else if (mode === 'sell') {
    netAmount = (buyPrice * quantity) - (sellPrice * quantity) - brokerage;
  }

  // Net amount color class
  const netBoxClass = netAmount >= 0 ? 'net-box net-profit' : 'net-box net-loss';

  return (
    <>
      <NavBar />
      <div style={{ background: '#f0f2f5', minHeight: '100vh', padding: '32px 0' }}>
        <div
          id="receipt-pdf"
          className="receipt"
          style={{
            background: '#fff',
            width: 400,
            borderRadius: 20,
            boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            margin: '0 auto'
          }}
        >
          {/* Header */}
          <div
            className="header"
            style={{
              background: 'linear-gradient(90deg,#2563eb,#1d4ed8)',
              color: '#fff',
              padding: 20,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <h2>
             Shivalika Brokerage Pvt.
              <br />
              <span style={{ fontSize: 12, fontWeight: 400 }}>Trade Exit Receipt</span>
            </h2>
            <div className="user-info">
              User: {receiptData.clientName}<br />
              {/* ID: {receiptData.idCode} */}
            </div>
          </div>

          {/* Stock Info */}
          <div className="stock-card">
            <h3>{receiptData.stockName}</h3>
            <span>
              Exit ({receiptData.mode ? receiptData.mode.toUpperCase() : ''})
            </span>
          </div>

          {/* Grid */}
          <div className="grid">
            <div className="grid-item">
              <p>Exit Date</p>
              <h4>{new Date(receiptData.tradeDate).toLocaleDateString('en-GB')}</h4>
            </div>
            <div className="grid-item">
              <p>Customer ID</p>
              <h4>{receiptData.idCode || '—'}</h4>
            </div>
            <div className="grid-item">
              <p>Executed Price</p>
              <h4>₹{Number(receiptData.sellPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h4>
            </div>
          </div>

          {/* Details */}
          <div className="details">
            <p><strong>Product Type:</strong> {receiptData.mode ? receiptData.mode.toUpperCase() : ''}</p>
            <p><strong>Quantity:</strong> {receiptData.quantity}</p>
            <p><strong>Avg. Buy Price:</strong> ₹{Number(receiptData.buyPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            <p><strong>Exit Price:</strong> ₹{Number(receiptData.sellPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            {/* <p><strong>Current Value:</strong> ₹{(receiptData.sellPrice * receiptData.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p> */}
            <p><strong>Brokerage:</strong> ₹{brokerage.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            <p><strong>Realised P&amp;L:</strong> {netAmount >= 0 ? '+' : '-'} ₹{Math.abs(netAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          </div>

          {/* Net Amount */}
          <div className={netBoxClass}>
            Net Amount Received: ₹{(netAmount + (netAmount < 0 ? 0 : 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>

          {/* Actions */}
          <div className="actions no-print">
            <button className="btn btn-download" onClick={handleDownloadPDF}>Print Receipt</button>
          </div>

          {/* Footer */}
          <div className="footer">
            © Shivalika Brokerage Pvt.
          </div>
        </div>
      </div>
    </>
  );
}

const labelStyle = {
  fontWeight: 600,
  color: '#6c757d',
  padding: '4px 8px',
};

const valueStyle = {
  textAlign: 'right',
  padding: '4px 8px',
};

export default Receipt;

