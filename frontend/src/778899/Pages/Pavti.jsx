import React, { useEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { data, useNavigate, useParams } from 'react-router-dom';
import NavBar from '../Components/NavBar';
import axios from "axios"
import { imgAndSign } from "./data.js";


function Pavti() {
  const invoiceRef = useRef();
  const { idCode } = useParams();
  const token = localStorage.getItem('authToken');
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
        console.log(res.data);
        setPavtiData(res.data);

        if (res.data.length) {
          const { clientName, address, margin, mobileNumber, orgnization } = res.data[0];
          setUserInfo({ clientName, address, margin, mobileNumber, orgnization });

          let grossProfit = 0;
          let grossLoss = 0;
          let totalBrokerage = 0;

          res.data.forEach(t => {
            const brk = calculateBrokerage(t);
            totalBrokerage += brk;

            // profit/loss depends on mode
            let pl = 0;
            if (t.mode === 'buy') {
              pl = (t.sellPrice - t.buyPrice) * t.quantity - brk;
            } else if (t.mode === 'sell') {
              pl = (t.buyPrice - t.sellPrice) * t.quantity - brk;
            }

            if (pl >= 0) grossProfit += pl;
            else grossLoss += Math.abs(pl);
          });

          // netProfit = grossProfit - grossLoss (loss as positive) - totalBrokerage
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
  }, [idCode]);


  const maskMobile = (number) => {
    const numStr = String(number); // convert number to string
    if (numStr.length < 5) return numStr;
    return numStr.substring(0, 1) + '***' + numStr.substring(numStr.length - 4);
  };

  const calculateBrokerage = ({ buyPrice, sellPrice, quantity }) => {
    // 0.01% of turnover
    const turnover = (buyPrice + sellPrice) * quantity;
    return Number((turnover * 0.0001).toFixed(2));
  };


  const handleDownload = async () => {
    const input = invoiceRef.current;
    if (!input) return;

    // Clone the original node for layout safety
    const clone = input.cloneNode(true);
    clone.style.width = '794px'; // A4 width in px at 96 DPI
    clone.style.padding = '20px';
    clone.style.backgroundColor = 'white';
    clone.style.position = 'absolute';
    clone.style.top = '-9999px';
    clone.style.left = '0';
    clone.style.zIndex = '-1';

    const totalBlock = clone.querySelector('div.p-3');
    if (totalBlock) {
      totalBlock.classList.remove('flex-column', 'flex-sm-row');
      totalBlock.style.display = 'flex';
      totalBlock.style.flexDirection = 'row';
      totalBlock.style.justifyContent = 'space-between';
      totalBlock.style.alignItems = 'center';
      totalBlock.style.height = 'auto'; // <-- Fix: height auto
      totalBlock.style.padding = '0 20px';
      totalBlock.style.gap = '0';

      const allChildren = totalBlock.children;
      for (let i = 0; i < allChildren.length; i++) {
        allChildren[i].style.margin = '0';
        allChildren[i].style.whiteSpace = 'nowrap';
        allChildren[i].style.textAlign = i === 0 ? 'left' : 'right';
        allChildren[i].style.flex = 'unset';
        allChildren[i].style.width = 'auto';
      }
    }

    document.body.appendChild(clone);

    await new Promise(resolve => setTimeout(resolve, 200));

    const canvas = await html2canvas(clone, { scale: 2, useCORS: true });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'pt', 'a4');
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth();

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save('invoice.pdf');
    document.body.removeChild(clone);
  };



  return (
    <>
      <NavBar />
      <div className="container-fluid ">
        <>
          {loading ? (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <>
              <div ref={invoiceRef} style={{ backgroundColor: 'white', color: 'black', position: 'relative' }}>
                {/* DEVAKI logo for token 220088 */}
                {token === "220088" && (
                  <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginTop: 20, marginBottom: 10 }}>
                    <img
                      src={`${process.env.PUBLIC_URL}/media/devaki-logo.png`}
                      alt="DEVAKI"
                      style={{
                        width: '120px',
                        height: 'auto',
                        background: 'transparent',
                        marginLeft: 10,
                      }}
                    />
                  </div>
                )}
                {/* Header */}
                <div className="row g-0">
                  <div className="col-12 d-flex flex-column align-items-center mb-2">
                    <img
                      src={`${process.env.PUBLIC_URL}/${imgAndSign[token].img}`}
                      alt="logo"
                      className="img-fluid mb-2"
                      style={{ maxWidth: '90px', objectFit: 'contain', display: 'block', margin: '0 auto' }}
                    />
                    <div
                      style={{
                        fontSize: '1.2em',
                        textAlign: 'center',
                        letterSpacing: 2,
                        fontWeight: 500,
                      }}
                    >
                      <b>{pavtiData[0]?.orgnization}</b>
                    </div>
                  </div>
                </div>
                {/*user info */}
                <p className="text-end mb-2" >
                  <strong>Invoice no. :</strong> In##00{Math.floor(10000 + Math.random() * 90000)}
                </p>
                <div className="p-1" style={{ backgroundColor: '#e7e0d6', height: "2em" }} >
                  <p>
                    <strong>Date :</strong> {new Date().toLocaleDateString('en-GB')}
                  </p>
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

                {/* Table */}
                <div className="table-responsive mb-3 mt-3">
                  <table className="table table-bordered text-sm mb-0">
                    <thead className="table-light">
                      <tr>
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
                        const brk = calculateBrokerage(t);
                        const pl = t.mode === 'buy' ? ((t.sellPrice - t.buyPrice) * t.quantity) - brk : ((t.buyPrice - t.sellPrice) * t.quantity) - brk;
                        const plColor = pl >= 0 ? 'green' : 'red';
                        return (
                          <tr key={idx} className="align-middle text-muted">
                            <td className="text-center">{idx + 1}</td>
                            <td className="text-center">{new Date(t.tradeDate).toLocaleDateString('en-GB')}</td>
                            <td>{t.stockName} ({t.mode})</td>
                            <td className="text-center">&#8377;{t.buyPrice}</td>
                            <td className="text-center">&#8377;{t.sellPrice}</td>
                            <td className="text-center">{t.quantity}{t.lotSize && t.lotSize > 0 ? `(${t.lotSize})` : ''}</td>
                            <td className="text-center">&#8377;{brk}</td>
                            <td className="text-end" style={{ color: plColor }}>
                              &#8377;{pl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        );
                      })}

                    </tbody>

                  </table>
                </div>

                <div className="p-1" style={{ backgroundColor: '#e7e0d6', height: "2em" }} >
                  <p>
                    <strong>Margin :</strong> &#8377; {userInfo?.margin || '0.00'}
                  </p>
                </div>

                <div className="mb-3 row">
                  <p className="fw-bold col-6"><b>Term & Condition</b> <br></br> Note Detailed bill that records all transactions Done by broker on behalf of His client during a trading day</p>
                  <img
                    src={`${process.env.PUBLIC_URL}/${imgAndSign[token].signature}`}
                    alt="signature"
                    className="img-fluid mb-2 col-6"
                    style={{ maxWidth: '15em', objectFit: 'contain', display: 'block', margin: '0 auto' }}
                  />
                </div>

                <div className="p-3 d-flex flex-column flex-sm-row justify-content-between align-items-center" style={{ backgroundColor: '#e7e0d6' }}>
                  <h6 className="fw-bold" style={{ fontSize: "20px" }}>TOTAL</h6>
                  <div className="text-end">
                    {/* <p className="mb-1 text-success" style={{ fontWeight: 600 }}>Seven thousand six hundred eighty-five</p> */}
                    <p
                      className="mb-0"
                      style={{ color: totalProfit >= 0 ? 'green' : 'red', fontWeight: 'bold' }}
                    >
                      ₹
                      {
                        (totalProfit >= 0
                          ? totalProfit + userInfo.margin
                          : totalProfit + userInfo.margin
                        ).toLocaleString('en-IN', { minimumFractionDigits: 2 })
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center mt-4">
                <button className="btn btn-primary" onClick={handleDownload}>
                  Download PDF
                </button>
              </div>
            </>
          )}
        </>
      </div>
    </>
  );
}

export default Pavti;