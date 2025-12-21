import React, { useState, useEffect } from 'react';
import './App.css';
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

    try {
      // render at high resolution
      const canvas = await html2canvas(input, {
        scale: 3,
        useCORS: true,
        scrollY: -window.scrollY,
      });
      const imgData = canvas.toDataURL('image/png');

      // create A4
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();

      // image size in mm
      const pxToMm = 0.264583;
      const imgWmm = canvas.width * pxToMm;
      const imgHmm = canvas.height * pxToMm;

      // force a 20 mm left/right margin
      const marginLR = 20;
      const availableW = pageW - marginLR * 2;

      // scale image to fit that available width
      const scale = availableW / imgWmm;
      const finalW = imgWmm * scale;
      const finalH = imgHmm * scale;

      // center vertically, and x at left margin
      const x = marginLR;
      const y = (pageH - finalH) / 2;

      pdf.addImage(imgData, 'PNG', x, y, finalW, finalH);
      pdf.save('Exit Receipt.pdf');
    } catch (err) {
      console.error(err);
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


  return (
    <>
      <NavBar />
      <div className="py-5 px-2" style={{ background: '#f0f2f5', minHeight: '100vh' }}>
        <div id="receipt-pdf">
          <div className="card shadow-lg mx-auto" style={{ maxWidth: '600px', borderTop: '6px solid rgba(0, 123, 255, 0.76)', borderRadius: '16px' }}>
            <div className="card-body reciepit-card-body-tabel-padding p-4">
              <div className="text-center mb-4">
                <h1 className="h4">Receipt</h1>
                <small className="text-muted">
                  Invoice No: <strong>Invoice no.</strong> In##00{Math.floor(10000 + Math.random() * 90000)} &nbsp; | &nbsp; Date: <strong>{new Date(receiptData.tradeDate).toLocaleDateString('en-GB')}</strong>
                </small>
              </div>

              <table className="table table-borderless" style={{ marginBottom: 0, width: '100%' }}>
                <tbody>
                  <tr className="border-top border-primary" style={{ borderTopWidth: 2 }}>
                    <td style={labelStyle}>Client Name:</td>
                    <td style={valueStyle}>{receiptData.clientName}</td>
                  </tr>
                  <tr>
                    <td style={labelStyle}>Customer ID:</td>
                    <td style={valueStyle}>{receiptData.idCode}</td>
                  </tr>
                  <tr>
                    <td style={labelStyle}>Stock Name:</td>
                    <td style={valueStyle}>{receiptData.stockName}</td>
                  </tr>
                  <tr>
                    <td style={labelStyle}>Quantity:</td>
                    <td style={valueStyle}>
                      {receiptData.quantity}
                      {receiptData.lotSize && receiptData.lotSize > 0
                        ? ` (${receiptData.lotSize})`
                        : ''}
                    </td>
                  </tr>
                  <tr>
                    <td style={labelStyle}> Mode:</td>
                    <td style={valueStyle}>{receiptData.mode}</td>
                  </tr>
                  <tr>
                    <td style={labelStyle}>Buy Price:</td>
                    <td style={valueStyle}>₹{Number(receiptData.buyPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td style={labelStyle}>Sell Price:</td>
                    <td style={valueStyle}>₹{Number(receiptData.sellPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  {/* <tr>
                    <td style={labelStyle}>Total Buying:</td>
                    <td style={valueStyle}>₹{(receiptData.buyPrice * receiptData.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td style={labelStyle}>Total Selling:</td>
                    <td style={valueStyle}>₹{(receiptData.sellPrice * receiptData.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr> */}
                  <tr>
                    <td style={labelStyle}>Brokerage (0.01%):</td>
                    <td style={valueStyle}>₹{brokerage.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr className="border-top border-primary" style={{ borderTopWidth: 2 }}>
                    <td style={{ ...labelStyle, fontWeight: 700, color: '#212529' }}>
                      Net Amount ({netAmount >= 0 ? 'Profit' : 'Loss'}):
                    </td>
                    <td style={{
                      ...valueStyle,
                      fontWeight: 700,
                      color: netAmount >= 0 ? '#198754' : '#dc3545'
                    }}>
                      ₹{Math.abs(netAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* <div className="text-center mt-4 fw-semibold text-primary">
                ✅ Thank you for trading with us!
              </div> */}
            </div>
          </div>
        </div>
        <div className="d-flex justify-content-center">
          <Button
            onClick={handleDownloadPDF}
            variant="contained"
            sx={{ width: { xs: '90%', sm: '90%', md: '600px' }, display: 'block', mx: { xs: 'auto', md: 0 }, minWidth: 100, boxShadow: 20 }}
            className="mt-4"
          >
            Download
          </Button>
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

