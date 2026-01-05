import React from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import Button from '@mui/material/Button';
import NavBar from '../Components/NavBar';
import { useLocation } from 'react-router-dom';

function TredBuyReceipt() {
  const location = useLocation();
  const { client, stockName, idCode, quantity, lotSize, buyPrice, tradeDate, mode } = location.state || {};

  const handleDownloadPDF = async () => {
  const input = document.getElementById('receipt-pdf');
  if (!input) return;

  // Clone the node
  const clone = input.cloneNode(true);

  // Remove buttons or elements that shouldn't appear in PDF
  clone.querySelectorAll('button, .no-print').forEach(el => el.remove());

  // Set clone styles to match actual colors
  clone.style.position = 'absolute';
  clone.style.left = '-9999px';
  clone.style.background = '#0f172a'; // same as your main card
  clone.style.color = 'black';
  clone.style.width = '400px';
  clone.style.borderRadius = '0px';
  clone.style.overflow = 'hidden';
  clone.style.margin = '0 auto';

  document.body.appendChild(clone);

  try {
    const canvas = await html2canvas(clone, {
      scale: 3,
      useCORS: true,
      scrollY: -window.scrollY,
      backgroundColor: null, // preserve transparency/colors
    });

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
    // Remove clone only if it is still in the body
    if (document.body.contains(clone)) {
      document.body.removeChild(clone);
    }
  }
};


  const totalAmount = buyPrice * quantity;

  return (
    <>
      <NavBar />
      <div style={{ minHeight: '100vh', padding: '32px 0' }}>
        <div
          id="receipt-pdf"
          className="receipt"
          style={{
              background: '#0f172a',
            width: 400,
            borderRadius: '0px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            margin: '0 auto',
          }}
        >
          {/* Header */}
          <div
            className="receipt-header"
            style={{
             background: '#0f172a',
              color: '#fff',
              padding: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #5e626aff',
            }}
          >
            <h2>
              <span style={{ color:'white' , fontSize : '20px'}}>KRISHNA ENT. PVT. LTD</span>
              <br />
              <span style={{ fontSize: '12px', fontWeight: 400, color: 'white' }}>
                Trade Buy Receipt
              </span>
            </h2>
            <div className="user-info" style={{ color: 'white' }}>
              User: {client}
            </div>
          </div>

          {/* Stock Info */}
          <div style={{ padding: 20 ,  borderBottom: '1px solid #5e626aff',}}>
            <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 4, color: "white" }}>{stockName}</div>
            <span style={{ fontSize: 14, color: '#94a3b8', fontWeight: 600 }}>Entry ({mode ? mode.toUpperCase() : ''})</span>
          </div>

          {/* Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 12,
              padding: 20,
              borderBottom: '1px solid #5e626aff',

            }}
          >
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
            <p style={menuitemValue}><strong style={menuitemName}>Mode:</strong> {mode ? mode.toUpperCase() : ''}</p>
            <p style={menuitemValue}><strong style={menuitemName}>Quantity:</strong> {quantity}{lotSize ? <span>({lotSize} Lot)</span> : null}</p>
            <p style={menuitemValue}><strong style={menuitemName}>Total Buying:</strong> ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            <p style={menuitemValue}><strong style={menuitemName}>Tax:</strong> ₹0.00</p>
          </div>

          <p
            style={{
              color: '#2563eb',
              // borderRadius: 12,
              // padding: '10px 15px',
              textAlign: 'center',
              // margin: '16px 20px',
              // color: '#fff',
              fontWeight: 600,
            }}
          >
            Including 0.01% Brokerage Charge
          </p>

          {/* Footer */}
          <div
            style={{
               background: '#0f172a',
              padding: 12,
              fontSize: 12,
              textAlign: 'center',
              color: '#94a3b8',
               borderTop: '1px solid #5e626aff',

            }}
          >
            <span style={{ color:'white'}}>© KRISHNA ENT. PVT. LTD</span>
          </div>
        </div>

        {/* Download Button */}
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Button
            onClick={handleDownloadPDF}
            variant="contained"
            sx={{
              backgroundColor: '#2563eb',
              color: 'white',
              '&:hover': { backgroundColor: '#1d4ed8' },
            }}
          >
            Download Receipt
          </Button>
        </div>
      </div>
    </>
  );
}

const gridItemStyle = {
    background: '#202a43ff',
  borderRadius: '12px',
  padding: '10px',
  textAlign: 'center',
};

const gridLabelStyle = {
  margin: '4px 0',
  fontSize: 13,
  color: 'white',
};

const gridValueStyle = {
  margin: 0,
  fontSize: 15,
  fontWeight: 700,
  color: 'white',
};

const menuitemName = {
 
  color: 'white',
};

const menuitemValue = {

  color: 'white',
};
export default TredBuyReceipt;
