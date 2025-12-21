// import React, { useState, useEffect } from 'react';
// import './App.css';
// import { jsPDF } from 'jspdf';
// import html2canvas from 'html2canvas';
// import Button from '@mui/material/Button';
// import NavBar from '../Components/NavBar';
// import axios from 'axios';
// import { useParams } from 'react-router-dom';

// function Receipt() {
//   const { uniquckId } = useParams();
//   const [receiptData, setReceiptData] = useState(null);

//   useEffect(() => {
//     const token = localStorage.getItem('authToken');
//     axios.get(`${process.env.REACT_APP_API_URL}/api/forms/getForm/${token}/${uniquckId}`)
//       .then(res => setReceiptData(res.data))
//       .catch(err => console.error(err));
//   }, [uniquckId]);

//   // Intraday brokerage at 0.01% of turnover (buy+sell)*quantity
//   const calculateBrokerage = ({ buyPrice, sellPrice, quantity }) => {
//     const turnover = (buyPrice + sellPrice) * quantity;
//     return Number((turnover * 0.0001).toFixed(2));
//   };


//   const handleDownloadPDF = async () => {
//     const input = document.getElementById('receipt-pdf');

//     try {
//       // render at high resolution
//       const canvas = await html2canvas(input, {
//         scale: 3,
//         useCORS: true,
//         scrollY: -window.scrollY,
//       });
//       const imgData = canvas.toDataURL('image/png');

//       // create A4
//       const pdf = new jsPDF('p', 'mm', 'a4');
//       const pageW = pdf.internal.pageSize.getWidth();
//       const pageH = pdf.internal.pageSize.getHeight();

//       // image size in mm
//       const pxToMm = 0.264583;
//       const imgWmm = canvas.width * pxToMm;
//       const imgHmm = canvas.height * pxToMm;

//       // force a 20 mm left/right margin
//       const marginLR = 20;
//       const availableW = pageW - marginLR * 2;

//       // scale image to fit that available width
//       const scale = availableW / imgWmm;
//       const finalW = imgWmm * scale;
//       const finalH = imgHmm * scale;

//       // center vertically, and x at left margin
//       const x = marginLR;
//       const y = (pageH - finalH) / 2;

//       pdf.addImage(imgData, 'PNG', x, y, finalW, finalH);
//       pdf.save('Exit Receipt.pdf');
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   if (!receiptData) {
//     return (
//       <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
//         <div className="text-muted">Loading receipt...</div>
//       </div>
//     );
//   }

//   const brokerage = calculateBrokerage(receiptData);
//   // const netAmount = (receiptData.sellPrice * receiptData.quantity) - (receiptData.buyPrice * receiptData.quantity) - brokerage;
//   //Calculate netAmount based on mode
//   let netAmount = 0;
//   const { buyPrice, sellPrice, quantity, mode } = receiptData;
//   if (mode === 'buy') {
//     netAmount = ((sellPrice * quantity) - (buyPrice * quantity)) - brokerage;
//   } else if (mode === 'sell') {
//     netAmount = (buyPrice * quantity) - (sellPrice * quantity) - brokerage;
//   }


//   return (
//     <>
//       <NavBar />
//       <div className="py-5 px-2" style={{ background: '#f0f2f5', minHeight: '100vh' }}>
//         <div id="receipt-pdf">
//           <div className="card shadow-lg mx-auto" style={{ maxWidth: '600px', borderTop: '6px solid rgba(0, 123, 255, 0.76)', borderRadius: '16px' }}>
//             <div className="card-body reciepit-card-body-tabel-padding p-4">
//               <div className="text-center mb-4">
//                 <h1 className="h4">Receipt</h1>
//                 <small className="text-muted">
//                   Invoice No: <strong>Invoice no.</strong> In##00{Math.floor(10000 + Math.random() * 90000)} &nbsp; | &nbsp; Date: <strong>{new Date(receiptData.tradeDate).toLocaleDateString('en-GB')}</strong>
//                 </small>
//               </div>

//               <table className="table table-borderless" style={{ marginBottom: 0, width: '100%' }}>
//                 <tbody>
//                   <tr className="border-top border-primary" style={{ borderTopWidth: 2 }}>
//                     <td style={labelStyle}>Client Name:</td>
//                     <td style={valueStyle}>{receiptData.clientName}</td>
//                   </tr>
//                   <tr>
//                     <td style={labelStyle}>Customer ID:</td>
//                     <td style={valueStyle}>{receiptData.idCode}</td>
//                   </tr>
//                   <tr>
//                     <td style={labelStyle}>Stock Name:</td>
//                     <td style={valueStyle}>{receiptData.stockName}</td>
//                   </tr>
//                   <tr>
//                     <td style={labelStyle}>Quantity:</td>
//                     <td style={valueStyle}>
//                       {receiptData.quantity}
//                       {receiptData.lotSize && receiptData.lotSize > 0
//                         ? ` (${receiptData.lotSize})`
//                         : ''}
//                     </td>
//                   </tr>
//                   <tr>
//                     <td style={labelStyle}> Mode:</td>
//                     <td style={valueStyle}>{receiptData.mode}</td>
//                   </tr>
//                   <tr>
//                     <td style={labelStyle}>Buy Price:</td>
//                     <td style={valueStyle}>₹{Number(receiptData.buyPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
//                   </tr>
//                   <tr>
//                     <td style={labelStyle}>Sell Price:</td>
//                     <td style={valueStyle}>₹{Number(receiptData.sellPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
//                   </tr>
//                   {/* <tr>
//                     <td style={labelStyle}>Total Buying:</td>
//                     <td style={valueStyle}>₹{(receiptData.buyPrice * receiptData.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
//                   </tr>
//                   <tr>
//                     <td style={labelStyle}>Total Selling:</td>
//                     <td style={valueStyle}>₹{(receiptData.sellPrice * receiptData.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
//                   </tr> */}
//                   <tr>
//                     <td style={labelStyle}>Brokerage (0.01%):</td>
//                     <td style={valueStyle}>₹{brokerage.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
//                   </tr>
//                   <tr className="border-top border-primary" style={{ borderTopWidth: 2 }}>
//                     <td style={{ ...labelStyle, fontWeight: 700, color: '#212529' }}>
//                       Net Amount ({netAmount >= 0 ? 'Profit' : 'Loss'}):
//                     </td>
//                     <td style={{
//                       ...valueStyle,
//                       fontWeight: 700,
//                       color: netAmount >= 0 ? '#198754' : '#dc3545'
//                     }}>
//                       ₹{Math.abs(netAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
//                     </td>
//                   </tr>
//                 </tbody>
//               </table>

//               {/* <div className="text-center mt-4 fw-semibold text-primary">
//                 ✅ Thank you for trading with us!
//               </div> */}
//             </div>
//           </div>
//         </div>
//         <div className="d-flex justify-content-center">
//           <Button
//             onClick={handleDownloadPDF}
//             variant="contained"
//             sx={{ width: { xs: '90%', sm: '90%', md: '600px' }, display: 'block', mx: { xs: 'auto', md: 0 }, minWidth: 100, boxShadow: 20 }}
//             className="mt-4"
//           >
//             Download
//           </Button>
//         </div>
//       </div>
//     </>
//   );
// }

// const labelStyle = {
//   fontWeight: 600,
//   color: '#6c757d',
//   padding: '4px 8px',
// };

// const valueStyle = {
//   textAlign: 'right',
//   padding: '4px 8px',
// };

// export default Receipt;




import React, { useState, useEffect } from 'react';
import './App.css';
// import '../Styles/receipt.css';
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

  // Intraday brokerage at 0.01% of turnover (buy+sell)*quantity
  const calculateBrokerage = ({ buyPrice, sellPrice, quantity }) => {
    const turnover = (buyPrice + sellPrice) * quantity;
    return Number((turnover * 0.00005).toFixed(2));
  };

const handleDownloadPDF = async () => {
  const input = document.getElementById('receipt-pdf');
  if (!input) return;

  // Clone the receipt to remove buttons and avoid layout issues
  const clone = input.cloneNode(true);
  clone.querySelectorAll('.no-print').forEach((el) => el.remove());
  clone.querySelectorAll('button').forEach((btn) => btn.remove());

  
  clone.style.background = 'white'; // main receipt background
  clone.style.color = 'black';      // default text color
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
    header.style.background = '#f6f7f7ff'; // header dark color
    header.style.color = 'rgba(120, 183, 250, 0.76)';
    header.style.padding = '20px';
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
  }

  const gridItems = clone.querySelectorAll('.grid-item');
  gridItems.forEach((item) => {
    item.style.background = '#f9fafb'; // grid item background
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

  const brokerage = calculateBrokerage(receiptData);
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
            background: 'white',
            width: '400px',
            borderRadius: '0px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            margin: '0 auto',
          }}
        >
          {/* Header */}
          <div
            className="header"
            style={{
              borderRadius: 0,
              background: '#f6f7f7ff',
              color: '#fff',
              padding: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h2>
             <span style={{ color:'rgba(76, 163, 255, 0.76)'}}>123 CAPITALS</span> 
              <br />
              <span style={{ fontSize: '12px', fontWeight: 400 , color:'black'}}>Trade Exit Receipt</span>
            </h2>
            <div className="user-info" style={{ color:'black'}}>
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
              <p style={gridLabelStyle}>Exit Date</p>
              <h4 style={gridValueStyle}>
                {new Date(receiptData.tradeDate).toLocaleDateString('en-GB')}
              </h4>
            </div>
            <div className="grid-item" style={gridItemStyle}>
              <p style={gridLabelStyle}>Customer ID</p>
              <h4 style={gridValueStyle}>{receiptData.idCode || '—'}</h4>
            </div>
            <div className="grid-item" style={gridItemStyle}>
              <p style={gridLabelStyle}>Executed Price</p>
              <h4 style={gridValueStyle}>
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
              // background: '#1e293b',
                //  background: '#576270ff',
                  background: '#f6f7f7ff',
              padding: '12px',
              fontSize: '12px',
              textAlign: 'center',
              color: '#94a3b8',
            }}
          >
             {/* KRISHNA ENT. PVT. LTD */}
             <span style={{ color:'rgba(120, 183, 250, 0.76)'}}>© 123 CAPITALS</span> 

          </div>
        </div>
      </div>
    </>
  );
}

const gridLabelStyle = {
  margin: '4px 0',
  fontSize: '13px',
  color: 'black',
};

const gridValueStyle = {
  margin: 0,
  fontSize: '15px',
  fontWeight: 700,
  color: 'black',
};

const gridItemStyle = {
  background: '#f9fafb',
  borderRadius: '12px',
  padding: '10px',
  textAlign: 'center',
};

export default Receipt;



