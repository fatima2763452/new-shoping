import React, { useEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import NavBar from '../Components/NavBar';
import axios from "axios";
import signature from '../img/signature.jpg';
import logo from '../img/logo.jpg';

function Pavti() {
  const invoiceRef = useRef();
  const footerRef = useRef();
  
  const { idCode } = useParams();
  const location = useLocation();
  const navState = location?.state || {};
  const { toDate: navToDate, fromDate: navFromDate } = navState;
  const [pavtiData, setPavtiData] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [totalProfit, setTotalProfit] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/forms/getStocks/${token}/${idCode}`);
        const original = Array.isArray(res.data) ? res.data : [];

        let fetched = original;
        if (navFromDate && navToDate) {
          let from = new Date(navFromDate);
          from.setHours(0,0,0,0);
          let to = new Date(navToDate);
          to.setHours(23,59,59,999);
          if (from > to) {
            const tmp = from; from = to; to = tmp;
          }
          fetched = original.filter(t => {
            const td = new Date(t.tradeDate);
            return td >= from && td <= to;
          });
        }

        setPavtiData(fetched);

        if (original.length) {
          const { clientName, address, margin, mobileNumber, orgnization } = original[0];
          setUserInfo({ clientName, address, margin, mobileNumber, orgnization });

          let grossProfit = 0;
          let grossLoss = 0;
          let totalBrokerage = 0;

          fetched.forEach(t => {
            let brk = 0;
            const fb = t.formBrokerage;
            if (fb === undefined || fb === null || Number(fb) === 0.00005) {
              brk = calculateBrokerage(t);
            } else {
              const nb = Number(fb);
              brk = nb < 1 ? calculateBrokerage({ ...t, formBrokerage: nb }) : nb;
            }
            totalBrokerage += brk;

            let pl = 0;
            if (t.mode === 'buy') {
              pl = (t.sellPrice - t.buyPrice) * t.quantity - brk;
            } else if (t.mode === 'sell') {
              pl = (t.buyPrice - t.sellPrice) * t.quantity - brk;
            }

            if (pl >= 0) grossProfit += pl;
            else grossLoss += Math.abs(pl);
          });

          const netProfit = grossProfit - grossLoss;
          setTotalProfit(netProfit);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [idCode, navFromDate, navToDate]);

  const maskMobile = (number) => {
    const numStr = String(number);
    if (numStr.length < 5) return numStr;
    return numStr.substring(0, 1) + '***' + numStr.substring(numStr.length - 4);
  };

  const calculateBrokerage = ({ buyPrice, sellPrice, quantity, formBrokerage }) => {
    const bp = Number(buyPrice || 0);
    const sp = Number(sellPrice || 0);
    const q = Number(quantity || 0);
    const turnover = (bp + sp) * q;
    const defaultRate = 0.00005;
    const fb = typeof formBrokerage !== 'undefined' && formBrokerage !== null ? Number(formBrokerage) : undefined;
    const rate = fb !== undefined && fb < 1 ? fb : defaultRate;
    return Number((turnover * rate).toFixed(2));
  };

  const handleDownload = async () => {
    try {
      const element = invoiceRef.current;
      
      // Temporarily force desktop width to prevent squished layouts on mobile devices
      const originalWidth = element.style.width;
      const originalMaxWidth = element.style.maxWidth;
      element.style.width = '1000px';
      element.style.maxWidth = '1000px';

      // Wait a moment for layout recalculation
      await new Promise(resolve => setTimeout(resolve, 100));

      const pxPageHeight = 1000 * (841.89 / 595.28); // A4 ratio
      const elementRectTop = element.getBoundingClientRect().top;
      const getRelativePos = (elm) => elm.getBoundingClientRect().top - elementRectTop;

      const dummyElements = [];

      // 1. Prevent table rows from cutting
      const rows = element.querySelectorAll('tbody tr');
      rows.forEach(row => {
        const top = getRelativePos(row);
        const height = row.offsetHeight;
        const sPage = Math.floor(top / pxPageHeight);
        const ePage = Math.floor((top + height) / pxPageHeight);
        
        if (sPage !== ePage) {
          const pushAmount = ((sPage + 1) * pxPageHeight) - top + 15;
          const dummyRow = document.createElement('tr');
          dummyRow.style.height = `${pushAmount}px`;
          dummyRow.style.border = 'none';
          dummyRow.style.backgroundColor = 'transparent';
          const dummyCell = document.createElement('td');
          dummyCell.colSpan = 8;
          dummyCell.style.border = 'none';
          dummyRow.appendChild(dummyCell);
          row.parentNode.insertBefore(dummyRow, row);
          dummyElements.push(dummyRow);
        }
      });

      // 2. Prevent the footer/signature section from cutting
      const footer = footerRef.current;
      if (footer) {
        const footerTop = getRelativePos(footer);
        const footerHeight = footer.offsetHeight;
        const fStartPage = Math.floor(footerTop / pxPageHeight);
        const fEndPage = Math.floor((footerTop + footerHeight) / pxPageHeight);
        
        if (fStartPage !== fEndPage) {
          const pushAmount = ((fStartPage + 1) * pxPageHeight) - footerTop + 20;
          const originalMarginTop = footer.style.marginTop;
          footer.style.marginTop = `${parseFloat(originalMarginTop || 0) + pushAmount}px`;
          dummyElements.push({ el: footer, prop: 'marginTop', orig: originalMarginTop });
        }
      }

      // Wait for dummy elements to affect layout
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 1000
      });

      // Restore original styles and remove dummy elements immediately
      element.style.width = originalWidth;
      element.style.maxWidth = originalMaxWidth;
      dummyElements.forEach(item => {
        if (item.nodeType) {
          item.remove();
        } else if (item.el) {
          item.el.style[item.prop] = item.orig;
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'pt', 'a4');
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      // First page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Subsequent pages if content overflows
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('invoice.pdf');
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("PDF generation failed. Please check console for errors.");
    }
  };

  return (
    <>
      <NavBar />
      <div className="container-fluid ">
        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <>
            <div ref={invoiceRef} style={{ backgroundColor: 'white', color: 'black', position: 'relative', padding: '20px' }}>
                <div className="d-flex flex-column align-items-center mb-2" style={{ marginTop: 20, marginBottom: 10 }}>
                  <img
                    src={logo}
                    alt="DEVAKI"
                    style={{
                      width: '150px',
                      height: 'auto',
                      background: 'transparent',
                      marginBottom: 8,
                      minWidth: 80,
                      maxWidth: '40vw',
                    }}
                  />
                  <div style={{ textAlign: 'center', fontSize: '1.2em', letterSpacing: 2, fontWeight: 500, wordBreak: 'break-word', maxWidth: 220 }}>
                    <b>{pavtiData[0]?.orgnization}</b>
                  </div>
                </div>

                <p className="text-end mb-2">
                  <strong>Invoice no. :</strong> In##00{Math.floor(10000 + Math.random() * 90000)}
                </p>
                <div className="p-1" style={{ backgroundColor: '#e7e0d6', height: "2em" }}>
                  <p><strong>Date :</strong> {new Date().toLocaleDateString('en-GB')}</p>
                </div>

                <div className="mb-3 mt-3">
                  {pavtiData[0] && (
                    <>
                      <p className="mb-1"><strong>ID CODE :</strong> {pavtiData[0].idCode}</p>
                      <p className="mb-0"><strong>NAME :</strong> {pavtiData[0].clientName}</p>
                      <p className="mb-0"><strong>PHONE :</strong> {maskMobile(pavtiData[0].mobileNumber)}</p>
                      <p className="mb-0"><strong>ADDRESS :</strong> {pavtiData[0].address}</p>
                    </>
                  )}
                </div>

              <div className="table-responsive mb-3 mt-3">
                <table className="table table-bordered text-sm mb-0">
                  <thead className="table-light">
                    <tr style={{ backgroundColor: '#e7e0d6' }}>
                      <th className="text-center">ORDER</th>
                      <th className="text-center">DATE</th>
                      <th className="text-center">STOCK</th>
                      <th className="text-center">BUY</th>
                      <th className="text-center">SELL</th>
                      <th className="text-center">QTY</th>
                      <th className="text-center">BROKERAGE</th>
                      <th className="text-center">P / L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pavtiData.map((t, idx) => {
                      const fb = t.formBrokerage;
                      const brk = (fb === undefined || fb === null || Number(fb) === 0.00005)
                        ? calculateBrokerage(t)
                        : (Number(fb) < 1 ? calculateBrokerage({ ...t, formBrokerage: Number(fb) }) : Number(fb));
                      const pl = t.mode === 'buy' ? ((t.sellPrice - t.buyPrice) * t.quantity) - brk : ((t.buyPrice - t.sellPrice) * t.quantity) - brk;
                      return (
                        <tr key={idx} className="align-middle text-muted">
                          <td className="text-center">{idx + 1}</td>
                          <td className="text-center">{new Date(t.tradeDate).toLocaleDateString('en-GB')}</td>
                          <td>{t.stockName} ({t.mode})</td>
                          <td className="text-center">&#8377;{t.buyPrice}</td>
                          <td className="text-center">&#8377;{t.sellPrice}</td>
                          <td className="text-center">{t.lotSize ? <>{t.lotSize} Lot</> : t.quantity}</td>
                          <td className="text-center">&#8377;{brk}</td>
                          <td className="text-end" style={{ color: pl >= 0 ? 'green' : 'red' }}>
                            &#8377;{pl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div ref={footerRef}>
                <div className="p-1 mb-3" style={{ backgroundColor: '#e7e0d6', height: "2em" }}>
                  <p><strong>Margin :</strong> &#8377; {userInfo?.margin || '0.00'}</p>
                </div>

                <div className="mb-3 row">
                  <div className="col-6">
                    <p className="fw-bold mb-1"><b>Term & Condition</b></p>
                    <p className="small text-muted mb-0">Note: Detailed bill that records all transactions done by broker on behalf of his client during a trading day.</p>
                  </div>
                  <div className="col-6 text-center">
                    <img
                      src={signature}
                      alt="signature"
                      style={{ maxWidth: '15em', objectFit: 'contain', display: 'block', margin: '0 auto' }}
                    />
                    <p className="small mt-1 mb-0 italic">Authorized Signature</p>
                  </div>
                </div>

                <div className="p-3 d-flex justify-content-between align-items-center mb-4" style={{ backgroundColor: '#e7e0d6' }}>
                  <h5 className="fw-bold mb-0">TOTAL</h5>
                  <div className="text-end">
                    <h5 className="mb-0 fw-bold" style={{ color: totalProfit >= 0 ? 'green' : 'red' }}>
                      ₹{(totalProfit + (userInfo?.margin || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </h5>
                  </div>
                </div>

                <div style={{ color: 'red', fontSize: '11px', marginTop: '20px' }}>
                  <p className="fw-bold mb-1" style={{ fontSize: '13px' }}>NOTE :-</p>
                  <p className="mb-1">( ACCORDING TO THE RULES AND REGULATION OF THE SEBI TRADING IS NOT SAFE BUT YOU HAVE TO DO TRADE WITH YOUR OWN RISK MANAGEMENT ).</p>
                  <p className="mb-0">1. NO EXTRA LIMIT IS AVAILABLE TO TRADE FIRST CLEAR THIS DEBT.</p>
                  <p className="mb-0">2. PAY LOSS AT EVERY SATURDAY AND SUNDAY .</p>
                  <p className="mb-0">3. THIS PLATEFORM IS A LEGAL TO ABLE WITH GOVERMENT APPROVAL .</p>
                </div>
              </div>
            </div>

            <div className="text-center mt-4 pb-5">
              <button className="btn btn-primary no-print" onClick={handleDownload}>
                Download PDF
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default Pavti;
