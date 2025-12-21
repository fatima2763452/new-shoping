import React, { useState } from 'react';
import NavBar from "../Components/NavBar";
import axios from "axios";
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
function FormTwo() {
  const navigate = useNavigate();
  const [formTwoData, setFormTwoData] = useState({
    client: "",
    stockName: "", 
    idCode: "",
    quantity: "", 
    buyPrice: "",
    mode:"",
    tradeDate : "",
  });

  const handleChanges = (event) => {
    const { name, value } = event.target;

    setFormTwoData(data => ({
      ...data,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { client, stockName, idCode, quantity, buyPrice, tradeDate, mode } = formTwoData;
    console.log(formTwoData)
      if (formTwoData != null) {
        navigate(`/TredBuyReceipt`, {
          state: {
            client,
            stockName,
            idCode,
            quantity: Number(quantity),
            buyPrice: Number(buyPrice),
            tradeDate,
            mode
          }
        });
      }
  };

  return (
    <>
   <NavBar></NavBar>
    
    <div className="container py-4">

      <form className='row' onSubmit={handleSubmit}>
        <div className="col-md-6 mb-3">
          <label htmlFor="client" className="form-label text-muted">Client Name</label>
          <input
            type="text"
            id="client"
            name="client"
            value={formTwoData.client}
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
            value={formTwoData.stockName}
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
            value={formTwoData.idCode}
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
            value={formTwoData.quantity}
            onChange={handleChanges}
            className="form-control text-muted"
            placeholder="Enter your stock quantity"
          />
        </div>

        <div className="col-md-6 mb-3">
          <label htmlFor="buyPrice" className="form-label text-muted">Buy Price</label>
          <input
            type="number"
            id="buyPrice"
            name="buyPrice"
            value={formTwoData.buyPrice}
            onChange={handleChanges}
            className="form-control text-muted"
            placeholder="Enter buying price"
          />
        </div>

        <div className="col-md-6 mb-3">
          <label htmlFor="tradeDate" className="form-label text-muted">Trade Date</label>
          <input
            type="date"
            id="tradeDate"
            name="tradeDate"
            value={formTwoData.tradeDate}
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
            value={formTwoData.mode}
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

export default FormTwo;
