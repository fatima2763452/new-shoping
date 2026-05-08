import React from 'react';
import NavBar from "../Components/NavBar"
import axios from "axios"
import Button from '@mui/material/Button';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function PavtiForm() {
    const navigate = useNavigate();
    
    const [PavtiFormData, setPavtiFormData] = useState({
        idCode : "",
        address : "",
        margin : "",
        mobileNumber : "",
        orgnization: "",
        toDate : "",
        fromDate: ""

    });
    const handleChanges = (event) =>{
        const {name, value} = event.target;
        setPavtiFormData(data =>({
          ...data,
          [name] : value,
        }));
    };

    const handleSubmit = async(e) =>{
      e.preventDefault();
      const {idCode,address, margin, mobileNumber, orgnization, toDate, fromDate} = PavtiFormData;
      const token = localStorage.getItem('authToken');
      try{
        const res = await axios.put(`${process.env.REACT_APP_API_URL}/api/forms/updateForm/${token}/${idCode}`, {
          address,
          margin: Number(margin),
          mobileNumber : Number(mobileNumber),
          orgnization,
        })

        if(res.data.success){
          // pass toDate and fromDate in navigation state so Pavti can filter results
          navigate(`/Pavti/${idCode}`, { state: { toDate, fromDate } });
        }

      }catch(err){
        if (err.response && err.response.data) { 
          console.error("Backend error:", err.response.data);
        } else {
          console.error(err);
        }
      }
    }

    return ( 
      <>
      <NavBar/>
      <div className="container py-4">
          <form className='row' onSubmit={handleSubmit}>

          <div className="col-md-12 mb-3">
            <label htmlFor="idCode" className="form-label text-Black text-muted">ID Code</label>
            <input
              type="text"
              id="idCode"
              name="idCode"
              value={PavtiFormData.idCode}
              onChange={handleChanges}
              className="form-control text-muted"
              placeholder="Enter user ID code"
            />
          </div>

            <div className="col-md-6 mb-3">
            <label htmlFor="margin" className="form-label text-Black text-muted">Mobile no.</label>
            <input
              type="number"
              id="mobileNumber"
              name="mobileNumber"
              value={PavtiFormData.mobileNumber}
              onChange={handleChanges}
              className="form-control text-muted"
              placeholder="Enter your Mobile Number"
            />
          </div>
          
          <div className="col-md-6 mb-3">
            <label htmlFor="margin" className="form-label text-Black text-muted">Margin</label>
            <input
              type="number"
              id="margin"
              name="margin"
              value={PavtiFormData.margin}
              onChange={handleChanges}
              className="form-control text-muted"
              placeholder="Enter your margin"
            />
          </div>

          <div className="col-md-6 mb-3">
            <label htmlFor="fromDate" className="form-label text-muted">From Date</label>
            <input
              type="date"
              id="fromDate"
              name="fromDate"
              value={PavtiFormData.fromDate}
              onChange={handleChanges}
              className="form-control text-muted"
            />
          </div>

          <div className="col-md-6 mb-3">
            <label htmlFor="toDate" className="form-label text-muted">To Date</label>
            <input
              type="date"
              id="toDate"
              name="toDate"
              value={PavtiFormData.toDate}
              onChange={handleChanges}
              className="form-control text-muted"
            />
          </div>

           

           <div className="col-md-12 mb-3">
            <label htmlFor="orgnization" className="form-label text-Black text-muted">orgnization</label>
            <input
              type="text"
              id="orgnization"
              name="orgnization"
              value={PavtiFormData.orgnization}
              onChange={handleChanges}
              className="form-control text-muted"
              placeholder="Enter your orgnization"
            />
          </div>

          
         

          <div className="col-md-12 mb-3">
            <label htmlFor="address" className="form-label text-Black text-muted">Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={PavtiFormData.address}
              onChange={handleChanges}
              className="form-control text-muted"
              placeholder="Enter your Address"
            />
          </div>



          <br></br>
          <br></br>
          <Button 
            variant="contained" 
            type='submit' 
            sx={{ 
              width: { xs: '90%', sm: '90%', md: '10%' }, 
              display: 'block', 
              mx: { xs: 'auto', md: 0 }, 
              minWidth: 100 
            }}
          >
            Look your Data
          </Button>
          </form>
        
      </div>
  
</>
     );
}

export default PavtiForm;