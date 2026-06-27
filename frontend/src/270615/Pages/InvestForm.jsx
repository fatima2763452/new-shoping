import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../Components/NavBar';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';

function InvestForm() {
  const [info, setInfo] = useState({
    companyName: "",
    customerName: "",
    fatherName: "",
    dob: "",
    gender: "",
    mobileNumber: "",
    email: "",
    aadhaar: "",
    address: "",
    initialDeposit: "",
    applicationDate: "",
    photo: null // Add photo field
  });
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value, files } = event.target;
    if (name === "photo") {
      setInfo(data => ({
        ...data,
        photo: files[0] ? URL.createObjectURL(files[0]) : null
      }));
    } else {
      setInfo(data => ({
        ...data,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/InvestReceipt', { state: { ...info } });
  };

  return (
    <>
      <NavBar />
      <Box sx={{ py: 4 }}>
        <form className='row' onSubmit={handleSubmit}>
          <Box className="col-md-6 mb-4" sx={{ width: '100%' }}>
            <TextField
              fullWidth
              label="Company Name"
              name="companyName"
              value={info.companyName}
              onChange={handleChange}
              variant="outlined"
              size="medium"
            />
          </Box>
          <Box className="col-md-6 mb-4" sx={{ width: '100%' }}>
            <TextField
              fullWidth
              label="Customer Name"
              name="customerName"
              value={info.customerName}
              onChange={handleChange}
              variant="outlined"
              size="medium"
            />
          </Box>
          <Box className="col-md-6 mb-4" sx={{ width: '100%' }}>
            <TextField
              fullWidth
              label="Father's Name"
              name="fatherName"
              value={info.fatherName}
              onChange={handleChange}
              variant="outlined"
              size="medium"
            />
          </Box>
          <Box className="col-md-6 mb-4" sx={{ width: '100%' }}>
            <TextField
              fullWidth
              label="Date of Birth"
              name="dob"
              type="date"
              value={info.dob}
              onChange={handleChange}
              variant="outlined"
              size="medium"
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          <Box className="col-md-6 mb-4" sx={{ width: '100%' }}>
            <FormControl fullWidth>
              <InputLabel id="gender-label">Gender</InputLabel>
              <Select
                labelId="gender-label"
                name="gender"
                value={info.gender}
                label="Gender"
                onChange={handleChange}
              >
                <MenuItem value="">Select gender</MenuItem>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box className="col-md-6 mb-4" sx={{ width: '100%' }}>
            <TextField
              fullWidth
              label="Mobile Number"
              name="mobileNumber"
              value={info.mobileNumber}
              onChange={handleChange}
              variant="outlined"
              size="medium"
              type="tel"
            />
          </Box>
          <Box className="col-md-6 mb-4" sx={{ width: '100%' }}>
            <TextField
              fullWidth
              label="Email ID"
              name="email"
              value={info.email}
              onChange={handleChange}
              variant="outlined"
              size="medium"
              type="email"
            />
          </Box>
          <Box className="col-md-6 mb-4" sx={{ width: '100%' }}>
            <TextField
              fullWidth
              label="Aadhaar Number"
              name="aadhaar"
              value={info.aadhaar}
              onChange={handleChange}
              variant="outlined"
              size="medium"
            />
          </Box>
          <Box className="col-md-6 mb-4" sx={{ width: '100%' }}>
            <TextField
              fullWidth
              label="Address"
              name="address"
              value={info.address}
              onChange={handleChange}
              variant="outlined"
              size="medium"
            />
          </Box>
          <Box className="col-md-6 mb-4" sx={{ width: '100%' }}>
            <TextField
              fullWidth
              label="Initial Deposit"
              name="initialDeposit"
              value={info.initialDeposit}
              onChange={handleChange}
              variant="outlined"
              size="medium"
              type="number"
            />
          </Box>
          <Box className="col-md-6 mb-4" sx={{ width: '100%' }}>
            <TextField
              fullWidth
              label="Date of Application"
              name="applicationDate"
              type="date"
              value={info.applicationDate}
              onChange={handleChange}
              variant="outlined"
              size="medium"
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          {/* Image input field */}
          <Box className="col-md-6 mb-4" sx={{ width: '100%' }}>
            <label htmlFor="photo" style={{ display: 'block', marginBottom: 8 }}>Upload Photo</label>
            <input
              type="file"
              id="photo"
              name="photo"
              accept="image/*"
              onChange={handleChange}
              style={{ width: '100%' }}
            />
            {info.photo && (
              <img
                src={info.photo}
                alt="Preview"
                style={{ marginTop: 10, maxWidth: '120px', maxHeight: '120px', borderRadius: 6 }}
              />
            )}
          </Box>
          <Box className="col-12 text-center mt-4">
            <Button type="submit" variant="contained" color="primary">
              Submit & Create
            </Button>
          </Box>
        </form>
      </Box>
    </>
  );
}

export default InvestForm;