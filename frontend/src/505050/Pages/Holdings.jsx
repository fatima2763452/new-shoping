import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NavBar from '../Components/NavBar';
import Button from '@mui/material/Button';

function Holdings() {
  const navigate = useNavigate();

  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [totals, setTotals] = useState({
    investment: 0,
    currentValue: 0,
    profitLoss: 0,
    profitLossPercent: 0,
  });

  useEffect(() => {
    const fetchHoldings = async () => {
      try {
        setLoading(true);
        // Get token from localStorage
        const token = localStorage.getItem('authToken');
        console.log(token)
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/forms/getFormbyToken/${token}`);
        setStocks(res.data);
      } catch (err) {
        console.error('Error fetching holdings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHoldings();
  }, []);


  useEffect(() => {
    let totalInvestment = 0;
    let totalCurrent = 0;
    let totalProfit = 0;

    stocks.forEach(stock => {
      const buyTotal = stock.buyPrice * stock.quantity;
      const sellTotal = stock.sellPrice * stock.quantity;
      const brokerage = 0;

      let pl = 0;
      if (stock.mode === 'buy') {
        pl = (sellTotal - buyTotal) - brokerage;
        totalInvestment += buyTotal + brokerage;
        totalCurrent += sellTotal;
      } else {
        pl = (buyTotal - sellTotal) - brokerage;
        totalInvestment += sellTotal + brokerage;
        totalCurrent += buyTotal;
      }

      totalProfit += pl;
    });

    const profitLossPercent = totalInvestment > 0
      ? (totalProfit / totalInvestment) * 100
      : 0;

    setTotals({
      investment: totalInvestment,
      currentValue: totalCurrent,
      profitLoss: totalProfit,
      profitLossPercent
    });
  }, [stocks]);

  const calculateProfitLoss = (buy, sell, qty, mode) => {
    let profit = 0;
    const buyTotal = buy * qty;
    const sellTotal = sell * qty;
    if (mode === 'buy') {
      profit = (sellTotal - buyTotal);
    } else if (mode === 'sell') {
      profit = (buyTotal - sellTotal);
    }
    return profit.toFixed(2);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  };

  const handleDelete = async (uniquckId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/forms/deleteForm/${uniquckId}`);
      setStocks(prev => prev.filter(s => s.uniquckId !== uniquckId));
    } catch (error) {
      console.error("Error deleting stock:", error.response?.data || error.message);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm("Are you sure you want to delete all entries?")) return;
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/forms/deleteAll/${token}`);
      setStocks([]);
    } catch (err) {
      console.error("Error deleting all:", err.response?.data || err.message);
    }
  };

  return (
    <>
      <NavBar />
      <div className='container-fluid holdings-container'>
        <div className='d-flex justify-content-between align-items-center mb-3'>
          <h3 className="title">History</h3>
          {stocks.length > 0 && (
            <Button variant="contained" size="small" onClick={handleDeleteAll}>
              Delete History
            </Button>
          )}
        </div>

        {loading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading holdings...</p>
          </div>
        ) : stocks.length === 0 ? (
          <div className="text-center my-5">
            <h4 className="text-muted">No holdings found</h4>
            <p className="text-muted">Add some trades to see them here</p>
            <Button
              variant="contained"
              onClick={() => navigate('/form')}
              sx={{ mt: 2 }}
            >
              Add New Trade
            </Button>
          </div>
        ) : (
          <>
            <div className="table-responsive holdings-scroll">
              <table className="holdings-table">
                <thead>
                  <tr>
                    {["Date", "Client Name", "ID Code", "Stock Name", "Quantity", "Buy", "Sell", "Total Buy", "Total Sell", "P/L", "Delete", "Receipt"].map((heading, idx) => (
                      <th key={idx}>{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stocks.map((stock, index) => {
                    const buyTotal = stock.buyPrice * stock.quantity;
                    const sellTotal = stock.sellPrice * stock.quantity;
                    const pl = parseFloat(calculateProfitLoss(
                      stock.buyPrice,
                      stock.sellPrice,
                      stock.quantity,
                      stock.mode
                    ));
                    const isProfit = pl >= 0;

                    return (
                      <tr key={index}>
                        <td>{formatDate(stock.tradeDate)}</td>
                        <td>{stock.clientName}</td>
                        <td>{stock.idCode}</td>
                        <td>{stock.stockName}({stock.mode})</td>
                        <td className="text-center">
                          {stock.quantity}
                          {stock.lotSize ? <span> ({stock.lotSize})</span> : null}
                        </td>
                        <td className="text-center">{stock.buyPrice.toFixed(2)}</td>
                        <td className="text-center">{stock.sellPrice.toFixed(2)}</td>
                        <td className="text-end">{buyTotal.toFixed(2)}</td>
                        <td className="text-end">{sellTotal.toFixed(2)}</td>
                        <td style={{ color: isProfit ? 'green' : 'red' }}>
                          {Math.abs(pl).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td>
                          <button className="deletebtn" onClick={() => handleDelete(stock.uniquckId)}>
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </td>
                        <td>
                          <button
                            className="receipt-btn"
                            onClick={() => navigate(`/receipt/${stock.uniquckId}`)}
                          >
                            <i className="fa-solid fa-file-invoice"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Totals Summary */}
            <div className="row holding-invest-info mt-4">
              <div className="col text-start">
                <h5 style={{ color: totals.profitLoss >= 0 ? 'green' : 'red' }}>₹{totals.investment.toFixed(2)}</h5>
                <p>Total Investment</p>
              </div>
              <div className="col text-center">
                <h5 style={{ color: totals.profitLoss >= 0 ? 'green' : 'red' }}>₹{totals.currentValue.toFixed(2)}</h5>
                <p>Current Value</p>
              </div>
              <div className="col text-center">
                <h5 style={{ color: totals.profitLoss >= 0 ? 'green' : 'red' }}>
                  ₹{Math.abs(totals.profitLoss).toLocaleString('en-IN', { minimumFractionDigits: 2 })} <br /> ({totals.profitLossPercent.toFixed(2)}%)
                </h5>
                <p>P&L</p>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default Holdings;
