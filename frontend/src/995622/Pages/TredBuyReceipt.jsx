import React from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import Button from '@mui/material/Button';
import NavBar from '../Components/NavBar';
import { useLocation } from 'react-router-dom';

function TredBuyReceipt() {
  const location = useLocation();
  const { client, stockName, idCode, quantity, buyPrice, tradeDate, mode } = location.state || {};

  const handleDownloadPDF = async () => {
    const input = document.getElementById('receipt-pdf');
    if (!input) return;

    // Clone node to remove buttons from PDF
    const clone = input.cloneNode(true);

    // Force card styles on clone
    clone.style.background = '#fff';
    clone.style.width = '400px';
    clone.style.borderRadius = '20px';
    clone.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
    clone.style.overflow = 'hidden';
    clone.style.margin = '40px auto';

    // Force header styles
    const header = clone.querySelector('.receipt-header');
    if (header) {
      header.style.background = 'linear-gradient(90deg,#2563eb,#1d4ed8)';
      header.style.color = '#fff';
      header.style.padding = '20px';
      header.style.display = 'flex';
      header.style.justifyContent = 'space-between';
      header.style.alignItems = 'center';
      header.style.borderTopLeftRadius = '20px';
      header.style.borderTopRightRadius = '20px';
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

      // Draw light grey background before adding image
      pdf.setFillColor(240, 242, 245); // #f0f2f5
      pdf.rect(0, 0, pageW, pageH, 'F');

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

      pdf.addImage(imgData, 'PNG', x, y, finalW, finalH);
      pdf.save('Buy Receipt.pdf');
    } catch (err) {
      console.error(err);
    } finally {
      document.body.removeChild(clone);
    }
  };

  return (
    <>
      <NavBar />
      <div style={{ background: '#f0f2f5', minHeight: '100vh', padding: '32px 0' }}>
        <div id="receipt-pdf"
          style={{
            background: '#fff',
            width: 400,
            borderRadius: 20,
            boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
            overflow: 'hidden',
            margin: '40px auto'
          }}
        >
          {/* Header */}
          <div className="receipt-header"
            style={{
              background: 'linear-gradient(90deg,#2563eb,#1d4ed8)',
              color: '#fff',
              padding: 20,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>RADHE BROKERAGE HOUSE</div>
              <div style={{ fontSize: 12, fontWeight: 400 }}>Trade Buy Receipt</div>
            </div>
            <div style={{ fontSize: 12, textAlign: 'right', lineHeight: 1.4 }}>
              User: {client}<br />
              ID: {idCode}
            </div>
          </div>

          {/* Stock Info */}
          <div style={{ padding: 20, borderBottom: '1px solid #eee' }}>
            <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 2 }}>{stockName}</div>
            <span style={{ fontSize: 14, color: '#555', fontWeight: 600 }}>Entry (BUY)</span>
          </div>

          {/* Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
            padding: 20,
            borderBottom: '1px solid #eee'
          }}>
            <div style={gridItemStyle}>
              <p style={gridLabelStyle}>Entry Date</p>
              <h4 style={gridValueStyle}>{tradeDate ? new Date(tradeDate).toLocaleDateString('en-GB') : ''}</h4>
            </div>
            <div style={gridItemStyle}>
              <p style={gridLabelStyle}>Customer ID</p>
              <h4 style={gridValueStyle}>{idCode}</h4>
            </div>
            <div style={gridItemStyle}>
              <p style={gridLabelStyle}>Buy Price</p>
              <h4 style={gridValueStyle}>₹{Number(buyPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h4>
            </div>
          </div>

          {/* Details */}
          <div style={{ padding: 20, fontSize: 14, lineHeight: 1.8 }}>
            <p><strong>Mode:</strong> {mode ? mode.toUpperCase() : ''}</p>
            <p><strong>Quantity:</strong> {quantity}</p>
            <p><strong>Buy Price:</strong> ₹{Number(buyPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            {/* <p><strong>Current Value:</strong> ₹{Number(buyPrice * quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p> */}
            {/* <p><strong>Brokerage:</strong> ₹{((buyPrice * quantity) * 0.0001).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p> */}
          </div>

         <div className="text-center mt-4 fw-semibold text-primary">
                Including 0.01% Brokerage Charge
          </div>

          {/* Footer */}
          <div style={{
            background: '#f9fafb',
            padding: 12,
            fontSize: 12,
            textAlign: 'center',
            color: '#555'
          }}>
            © Radhe Brokerage
          </div>
        </div>
        <div className="d-flex justify-content-center">
          <Button
            onClick={handleDownloadPDF}
            variant="contained"
            sx={{ width: { xs: '90%', sm: '90%', md: '400px' }, display: 'block', mx: { xs: 'auto', md: 0 }, minWidth: 100, boxShadow: 20 }}
            className="mt-4"
          >
            Download
          </Button>
        </div>
      </div>
    </>
  );
}

const gridItemStyle = {
  background: '#f9fafb',
  borderRadius: 12,
  padding: 10,
  textAlign: 'center',
};

const gridLabelStyle = {
  margin: '4px 0',
  fontSize: 13,
  color: '#555',
};

const gridValueStyle = {
  margin: 0,
  fontSize: 15,
  fontWeight: 700,
  color: '#111',
};

export default TredBuyReceipt;

