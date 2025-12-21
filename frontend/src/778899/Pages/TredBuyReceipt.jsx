import React from 'react';
import './App.css';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import Button from '@mui/material/Button';
import NavBar from '../Components/NavBar';
import axios from 'axios';
import { useParams, useLocation } from 'react-router-dom';

function TredBuyReceipt() {
  const location = useLocation();
  const { client, stockName, idCode, quantity, buyPrice, tradeDate, mode, lotSize } = location.state || {};

  const handleDownloadPDF = async () => {
    const input = document.getElementById('receipt-pdf');
    try {
      const canvas = await html2canvas(input, {
        scale: 3,
        useCORS: true,
        scrollY: -window.scrollY,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const pxToMm = 0.264583;
      const imgWmm = canvas.width * pxToMm;
      const imgHmm = canvas.height * pxToMm;
      const marginLR = 20;
      const availableW = pageW - marginLR * 2;
      const scale = availableW / imgWmm;
      const finalW = imgWmm * scale;
      const finalH = imgHmm * scale;
      const x = marginLR;
      const y = (pageH - finalH) / 2;
      pdf.addImage(imgData, 'PNG', x, y, finalW, finalH);
      pdf.save('Buy Receipt.pdf');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <NavBar />
      <div className="py-5 px-2" style={{ background: '#f0f2f5', minHeight: '100vh' }}>
        <div id="receipt-pdf">
          <div className="card shadow-lg mx-auto" style={{ maxWidth: '600px', borderTop: '6px solid rgba(0, 123, 255, 0.76)', borderRadius: '16px' }}>
            <div className="card-body reciepit-card-body-tabel-padding p-4">
              <div className="text-center mb-4">
                <h1 className="h4">Trade Buy Receipt</h1>
                <small className="text-muted">
                  Invoice No: <strong>In##00{Math.floor(10000 + Math.random() * 90000)}</strong>  &nbsp; | &nbsp; Date: <strong>{tradeDate ? new Date(tradeDate).toLocaleDateString('en-GB') : ''}</strong>
                </small>
              </div>

              <table className="table table-borderless" style={{ marginBottom: 0, width: '100%' }}>
                <tbody>
                  <tr className="border-top border-primary" style={{ borderTopWidth: 2 }}>
                    <td style={labelStyle}>Client Name:</td>
                    <td style={valueStyle}>{client}</td>
                  </tr>
                  <tr>
                    <td style={labelStyle}>Customer ID:</td>
                    <td style={valueStyle}>{idCode}</td>
                  </tr>
                  <tr>
                    <td style={labelStyle}>Stock Name:</td>
                    <td style={valueStyle}>{stockName}</td>
                  </tr>
                  <tr>
                    <td style={labelStyle}>Quantity:</td>
                    <td style={valueStyle}>{quantity}
                      {lotSize && lotSize > 0 ? ` (${lotSize})` : ''}
                    </td>
                  </tr>
                  <tr>
                    <td style={labelStyle}> Mode:</td>
                    <td style={valueStyle}>{mode}</td>
                  </tr>
                  <tr>
                    <td style={labelStyle}>Buy Price:</td>
                    <td style={valueStyle}>₹{Number(buyPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                </tbody>
              </table>
              <div className="text-center mt-4 fw-semibold text-primary">
                Including 0.01% Brokerage Charge
              </div>
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

export default TredBuyReceipt;

