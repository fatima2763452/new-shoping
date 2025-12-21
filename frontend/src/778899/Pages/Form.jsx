import React, { useState } from 'react';
import NavBar from "../Components/NavBar";
import axios from "axios";
import Button from '@mui/material/Button';

import { useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
function Form() {
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState(false);
  const [formData, setFormData] = useState({
    clientName: "",
    stockName: "", 
    idCode: "",
    quantity: "", 
    buyPrice: "",
    sellPrice:"", 
    tradeDate:"",
    lotSize: "",
  });

  const handleChanges = (event) => {
    const { name, value } = event.target;
    setFormData(data => ({
      ...data,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { clientName, stockName, idCode, quantity, buyPrice, sellPrice, tradeDate, brokerage, mode, lotSize } = formData;
    // Get token from localStorage
    const token = localStorage.getItem('authToken');

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/forms/createForm`, {
        clientName,
        stockName,
        idCode,
        quantity: Number(quantity),
        lotSize: Number(lotSize),
        buyPrice: Number(buyPrice),
        sellPrice: Number(sellPrice),
        tradeDate,
        brokerage: Number(brokerage),
        mode,
        token // Add token to payload
      });

      if (res.data.success) {
        const { uniquckId } = res.data;
        navigate(`/receipt/${uniquckId}`);
      }

    } catch (err) {
      if (err.response && err.response.data) {
        alert("Backend error: " + JSON.stringify(err.response.data));
        console.error("Backend error:", err.response.data);
      } else {
        alert("Some error occurred during submission.");
        console.error(err);
      }
    }
  };

  return (
    <>
   <NavBar></NavBar>
    
    <div className="container py-4">

      <form className='row' onSubmit={handleSubmit}>
        <div className="col-md-6 mb-3">
          <label htmlFor="clientName" className="form-label text-muted">Client Name</label>
          <input
            type="text"
            id="clientName"
            name="clientName"
            value={formData.clientName}
            onChange={handleChanges}
            className="form-control text-muted"
            placeholder="Enter your client name"
          />
        </div>

        <div className="col-md-6 mb-3">
          <label htmlFor="stockName" className="form-label text-muted">Stock Name</label>
          <input
            type="text"
            id="stockName"
            name="stockName"
            value={formData.stockName}
            onChange={handleChanges}
            className="form-control text-muted"
            placeholder="Enter your stock name"
          />
        </div>

        <div className="col-md-12 mb-3">
          <label htmlFor="idCode" className="form-label text-muted">ID Code</label>
          <input
            type="text"
            id="idCode"
            name="idCode"
            value={formData.idCode}
            onChange={handleChanges}
            className="form-control text-muted"
            placeholder="Enter user ID code"
          />
        </div>

        <div className="col-md-12 mb-3">
          <label htmlFor="quantity" className="form-label text-muted">Quantity</label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleChanges}
            className="form-control text-muted"
            placeholder="Enter your stock quantity"
          />
        </div>

         <div className="col-md-12 mb-3">
          <label htmlFor="lotSize" className="form-label text-muted">Lot Size</label>
          <input
            type="number"
            id="lotSize"
            name="lotSize"
            value={formData.lotSize}
            onChange={handleChanges}
            className="form-control text-muted"
            placeholder="Enter your Lot Size"
          />
        </div>

        <div className="col-md-6 mb-3">
          <label htmlFor="buyPrice" className="form-label text-muted">Buy Price</label>
          <input
            type="number"
            id="buyPrice"
            name="buyPrice"
            value={formData.buyPrice}
            onChange={handleChanges}
            className="form-control text-muted"
            placeholder="Enter buying price"
          />
        </div>

        <div className="col-md-6 mb-3">
          <label htmlFor="sellPrice" className="form-label text-muted">Sell Price</label>
          <input
            type="number"
            id="sellPrice"
            name="sellPrice"
            value={formData.sellPrice}
            onChange={handleChanges}
            className="form-control text-muted"
            placeholder="Enter selling price"
          />
        </div>

        <div className="col-md-6 mb-3">
          <label htmlFor="tradeDate" className="form-label text-muted">Trade Date</label>
          <input
            type="date"
            id="tradeDate"
            name="tradeDate"
            value={formData.tradeDate}
            onChange={handleChanges}
            className="form-control text-muted"
          />
        </div>

        <div className="col-md-6 mb-3">
          <label htmlFor="mode" className="form-label text-muted">Mode</label>
          <input
            type="text"
            id="mode"
            name="mode"
            value={formData.mode}
            onChange={handleChanges}
            className="form-control text-muted"
            placeholder="Enter your mode eg. 'buy', 'sell' "

          />
        </div>

        <div className="w-100 text-center mt-4">
          <Button 
            variant="contained" 
            type='submit'
            sx={{ 
              width: { xs: '90%', sm: '90%', md: '20%' }, 
              mx: 'auto',
            }}
          >
            Submit & Create
          </Button>
        </div>
      </form>
    </div>
    </>
  );
}

export default Form;
