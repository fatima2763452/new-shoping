import React, { useEffect, useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import NavBar from '../Components/NavBar';
import axios from "axios";
import signature from '../img/signature.jpg';
import logo from '../img/logo.jpg';

// Helper: convert an image URL to base64 dataURL
const loadImageAsBase64 = (src) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
};

function Pavti() {
  const invoiceRef = useRef();

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
          from.setHours(0, 0, 0, 0);
          let to = new Date(navToDate);
          to.setHours(23, 59, 59, 999);
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

  // ──────────────────────────────────────────────────────────────────────────
  // INDUSTRY-STANDARD PDF GENERATION using jsPDF + jspdf-autotable
  // ✅ Vector-based (not screenshot) — crisp at any zoom
  // ✅ autoTable handles page breaks automatically — NEVER cuts rows
  // ✅ Works perfectly with 10 rows or 1000+ rows
  // ──────────────────────────────────────────────────────────────────────────
  const handleDownload = async () => {
    try {
      const pdf = new jsPDF('p', 'pt', 'a4');
      const pageW = pdf.internal.pageSize.getWidth();   // 595.28
      const pageH = pdf.internal.pageSize.getHeight();  // 841.89
      const margin = 28; // tighter margins for more table room
      let cursorY = margin;

      // ── Colors ──
      const beige = [231, 224, 214];      // #e7e0d6
      const darkText = [33, 33, 33];
      const mutedText = [100, 100, 100];
      const greenColor = [0, 128, 0];
      const redColor = [220, 38, 38];
      const contentW = pageW - 2 * margin;

      // ── Load images as base64 ──
      const [logoBase64, signBase64] = await Promise.all([
        loadImageAsBase64(logo),
        loadImageAsBase64(signature),
      ]);

      // ── LOGO ──
      if (logoBase64) {
        const logoW = 100;
        const logoH = 60;
        pdf.addImage(logoBase64, 'PNG', (pageW - logoW) / 2, cursorY, logoW, logoH);
        cursorY += logoH + 8;
      }

      // ── Organization Name ──
      const orgName = pavtiData[0]?.orgnization || '';
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(...darkText);
      pdf.text(orgName, pageW / 2, cursorY, { align: 'center' });
      cursorY += 28;

      // ── Invoice Number (right aligned) ──
      const invoiceNo = 'In##00' + Math.floor(10000 + Math.random() * 90000);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text('Invoice no. : ' + invoiceNo, pageW - margin, cursorY, { align: 'right' });
      cursorY += 18;

      // ── Date Bar ──
      pdf.setFillColor(...beige);
      pdf.rect(margin, cursorY, contentW, 22, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(...darkText);
      pdf.text('Date : ' + new Date().toLocaleDateString('en-GB'), margin + 8, cursorY + 15);
      cursorY += 32;

      // ── Customer Info ──
      if (pavtiData[0]) {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(...darkText);

        const infoLines = [
          'ID CODE : ' + pavtiData[0].idCode,
          'NAME : ' + pavtiData[0].clientName,
          'PHONE : ' + maskMobile(pavtiData[0].mobileNumber),
          'ADDRESS : ' + (pavtiData[0].address || ''),
        ];
        infoLines.forEach(line => {
          pdf.text(line, margin, cursorY + 12);
          cursorY += 16;
        });
      }
      cursorY += 10;

      // ── TABLE via autoTable (handles page breaks perfectly) ──
      const tableColumns = [
        { header: 'ORDER', dataKey: 'order' },
        { header: 'DATE', dataKey: 'date' },
        { header: 'STOCK', dataKey: 'stock' },
        { header: 'BUY', dataKey: 'buy' },
        { header: 'SELL', dataKey: 'sell' },
        { header: 'QTY', dataKey: 'qty' },
        { header: 'BROKERAGE', dataKey: 'brokerage' },
        { header: 'P / L', dataKey: 'pl' },
      ];

      const tableRows = pavtiData.map((t, idx) => {
        const fb = t.formBrokerage;
        const brk = (fb === undefined || fb === null || Number(fb) === 0.00005)
          ? calculateBrokerage(t)
          : (Number(fb) < 1 ? calculateBrokerage({ ...t, formBrokerage: Number(fb) }) : Number(fb));
        const pl = ((t.sellPrice - t.buyPrice) * t.quantity) - brk;
        return {
          order: String(idx + 1),
          date: new Date(t.tradeDate).toLocaleDateString('en-GB'),
          stock: t.stockName + ' (' + t.mode + ')',
          buy: 'Rs.' + Number(t.buyPrice).toLocaleString('en-IN'),
          sell: 'Rs.' + Number(t.sellPrice).toLocaleString('en-IN'),
          qty: t.lotSize ? t.lotSize + ' Lot' : String(t.quantity),
          brokerage: 'Rs.' + Number(brk).toLocaleString('en-IN', { minimumFractionDigits: 2 }),
          pl: 'Rs.' + pl.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
          _plValue: pl,
        };
      });

      const tableResult = autoTable(pdf, {
        startY: cursorY,
        columns: tableColumns,
        body: tableRows,
        margin: { left: margin, right: margin },
        tableWidth: contentW,
        theme: 'grid',
        headStyles: {
          fillColor: beige,
          textColor: darkText,
          fontStyle: 'bold',
          fontSize: 8,
          halign: 'center',
          lineWidth: 0.5,
          lineColor: [180, 180, 180],
          cellPadding: 4,
        },
        bodyStyles: {
          fontSize: 7.5,
          textColor: mutedText,
          halign: 'center',
          lineWidth: 0.5,
          lineColor: [200, 200, 200],
          cellPadding: 4,
        },
        // Explicit column widths to prevent truncation
        columnStyles: {
          order: { cellWidth: 35, halign: 'center' },
          date: { cellWidth: 58, halign: 'center' },
          stock: { cellWidth: 'auto', halign: 'left' },   // takes remaining space
          buy: { cellWidth: 62, halign: 'center' },
          sell: { cellWidth: 62, halign: 'center' },
          qty: { cellWidth: 42, halign: 'center' },
          brokerage: { cellWidth: 58, halign: 'center' },
          pl: { cellWidth: 80, halign: 'right' },
        },
        // Color P/L cells green or red
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.dataKey === 'pl') {
            const plVal = tableRows[data.row.index]?._plValue;
            if (plVal !== undefined) {
              data.cell.styles.textColor = plVal >= 0 ? greenColor : redColor;
              data.cell.styles.fontStyle = 'bold';
            }
          }
        },
        // autoTable NEVER splits a row across pages
        rowPageBreak: 'avoid',
      });

      cursorY = (tableResult?.finalY ?? pdf.lastAutoTable?.finalY ?? cursorY) + 15;

      // ── Helper: Check if we need a new page for remaining footer content ──
      const ensureSpace = (neededHeight) => {
        if (cursorY + neededHeight > pageH - 30) {
          pdf.addPage();
          cursorY = margin;
        }
      };

      // ── Margin Bar ──
      ensureSpace(80);
      pdf.setFillColor(...beige);
      pdf.rect(margin, cursorY, contentW, 22, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(...darkText);
      pdf.text('Margin : Rs. ' + (userInfo?.margin || '0.00'), margin + 8, cursorY + 15);
      cursorY += 35;

      // ── Terms & Signature Section ──
      ensureSpace(100);
      const halfW = contentW / 2;

      // Left: Terms
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(...darkText);
      pdf.text('Term & Condition', margin, cursorY);
      cursorY += 14;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(...mutedText);
      const termsText = 'Note: Detailed bill that records all transactions done by broker on behalf of his client during a trading day.';
      const splitTerms = pdf.splitTextToSize(termsText, halfW - 10);
      pdf.text(splitTerms, margin, cursorY);

      // Right: Signature
      if (signBase64) {
        const sigW = 120;
        const sigH = 60;
        const sigX = margin + halfW + (halfW - sigW) / 2;
        pdf.addImage(signBase64, 'JPEG', sigX, cursorY - 20, sigW, sigH);
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(8);
        pdf.setTextColor(...mutedText);
        pdf.text('Authorized Signature', sigX + sigW / 2, cursorY + sigH - 12, { align: 'center' });
      }

      cursorY += 60;

      // ── TOTAL Bar ──
      ensureSpace(50);
      pdf.setFillColor(...beige);
      pdf.rect(margin, cursorY, contentW, 30, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(13);
      pdf.setTextColor(...darkText);
      pdf.text('TOTAL', margin + 12, cursorY + 20);

      const totalVal = totalProfit + (userInfo?.margin || 0);
      pdf.setTextColor(...(totalVal >= 0 ? greenColor : redColor));
      pdf.text(
        'Rs.' + totalVal.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
        pageW - margin - 12,
        cursorY + 20,
        { align: 'right' }
      );
      cursorY += 45;

      // ── NOTES ──
      ensureSpace(80);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(220, 38, 38);
      pdf.text('NOTE :-', margin, cursorY);
      cursorY += 14;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      const notes = [
        '( ACCORDING TO THE RULES AND REGULATION OF THE SEBI TRADING IS NOT SAFE BUT YOU HAVE TO DO TRADE WITH YOUR OWN RISK MANAGEMENT ).',
        '1. NO EXTRA LIMIT IS AVAILABLE TO TRADE FIRST CLEAR THIS DEBT.',
        '2. PAY LOSS AT EVERY SATURDAY AND SUNDAY .',
        '3. THIS PLATEFORM IS A LEGAL TO ABLE WITH GOVERMENT APPROVAL .',
      ];
      notes.forEach(note => {
        const lines = pdf.splitTextToSize(note, pageW - 2 * margin);
        pdf.text(lines, margin, cursorY);
        cursorY += lines.length * 11;
      });

      // ── Save ──
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

              <div>
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

