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

        fetched.sort((a, b) => new Date(a.tradeDate) - new Date(b.tradeDate));
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
            pl = (t.sellPrice - t.buyPrice) * t.quantity - brk;

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
      
      // Force desktop width for consistent rendering
      const originalWidth = element.style.width;
      const originalMaxWidth = element.style.maxWidth;
      element.style.width = '1000px';
      element.style.maxWidth = '1000px';
      await new Promise(resolve => setTimeout(resolve, 150));

      // Measure every row + footer position relative to element top
      const elTop = element.getBoundingClientRect().top;
      const rows = Array.from(element.querySelectorAll('tbody tr'));
      
      // Collect ALL blocks that must not be cut: table rows + footer children
      const blockTops = rows.map(r => r.getBoundingClientRect().top - elTop);
      const blockBottoms = rows.map(r => r.getBoundingClientRect().bottom - elTop);

      // Also add each footer child as a protected block
      const footer = footerRef.current;
      if (footer) {
        Array.from(footer.children).forEach(child => {
          blockTops.push(child.getBoundingClientRect().top - elTop);
          blockBottoms.push(child.getBoundingClientRect().bottom - elTop);
        });
      }

      // Render full element to canvas (NO DOM modifications at all)
      const canvasScale = 2;
      const canvas = await html2canvas(element, {
        scale: canvasScale,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 1000
      });

      // Restore original styles
      element.style.width = originalWidth;
      element.style.maxWidth = originalMaxWidth;

      // PDF setup
      const pdf = new jsPDF('p', 'pt', 'a4');
      const pdfPageW = pdf.internal.pageSize.getWidth();   // 595.28
      const pdfPageH = pdf.internal.pageSize.getHeight();  // 841.89

      // CSS pixel height that maps to one A4 page
      const cssWidth = canvas.width / canvasScale;
      const cssPageH = cssWidth * (pdfPageH / pdfPageW);
      const totalCssH = canvas.height / canvasScale;
      const totalDomH = element.scrollHeight;

      // CRITICAL FIX: html2canvas renders rows slightly more compactly than the live DOM.
      // Over 100+ rows, this sub-pixel difference accumulates into a massive offset.
      // We calculate the exact ratio and scale our DOM measurements to perfectly match the canvas.
      const renderRatio = totalCssH / totalDomH;
      const scaledBlockTops = blockTops.map(t => t * renderRatio);
      const scaledBlockBottoms = blockBottoms.map(b => b * renderRatio);

      // Build safe slice points: walk through the image in A4-sized chunks,
      // pulling the cut point up if it would split any block (row or footer child).
      const slices = [];
      let y = 0;
      const safeMargin = 30; // buffer to absorb any non-linear rendering variances

      while (y < totalCssH - 1) {
        let cutAt = Math.min(y + cssPageH, totalCssH);

        if (cutAt < totalCssH) {
          // Find the last block whose bottom is safely above the cut point
          let bestCut = cutAt;
          for (let i = 0; i < scaledBlockTops.length; i++) {
            if (scaledBlockBottoms[i] <= y) continue; // skip blocks on previous pages
            
            if (scaledBlockBottoms[i] + safeMargin > cutAt) {
              bestCut = scaledBlockTops[i] - 10;
              break;
            }
          }
          cutAt = bestCut;
        }

        if (cutAt <= y) cutAt = y + cssPageH;

        slices.push({ start: y, end: Math.min(cutAt, totalCssH) });
        y = cutAt;
      }

      // Render each slice as a PDF page
      for (let s = 0; s < slices.length; s++) {
        if (s > 0) pdf.addPage();

        const { start, end } = slices[s];
        const cropH = end - start;

        // Use ceil/floor to avoid including extra pixels from adjacent rows
        const sy = Math.ceil(start * canvasScale);
        const sh = Math.floor(cropH * canvasScale);

        // Crop from the big canvas
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = sh;
        const ctx = tempCanvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, sh);
        ctx.drawImage(canvas, 0, sy, canvas.width, sh, 0, 0, canvas.width, sh);

        const imgData = tempCanvas.toDataURL('image/png');

        // Place image at top of A4 page, scaled to page width
        const imgW = pdfPageW;
        const imgH = (sh / canvas.width) * pdfPageW;
        pdf.addImage(imgData, 'PNG', 0, 0, imgW, Math.min(imgH, pdfPageH));
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
                      const pl = ((t.sellPrice - t.buyPrice) * t.quantity) - brk;
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
