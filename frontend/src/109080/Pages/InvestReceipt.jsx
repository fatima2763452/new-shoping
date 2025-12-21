import React, { useRef } from 'react';
import { useLocation } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import NavBar from '../Components/NavBar';
import { imgAndSign } from "./data.js";

import logoImg from '../img/LOGO.jpg';
import signatureImg from '../img/signature.jpg';


function InvestReceipt() {
  const token = localStorage.getItem('authToken');
  const location = useLocation();
  const {
    companyName,
    customerName,
    fatherName,
    dob,
    gender,
    mobileNumber,
    email,
    aadhaar,
    address,
    initialDeposit,
    applicationDate,
    photo // If you have photo URL in state
  } = location.state || {};

  const receiptRef = useRef();

  const handleDownloadPDF = async () => {
    const btn = document.querySelector('.no-print');
    if (btn) btn.style.display = 'none'; // Hide button before screenshot
    const element = receiptRef.current;
    element.style.width = '595px';
    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'pt', 'a4');
    pdf.addImage(imgData, 'PNG', 0, 0, 595, (canvas.height * 595) / canvas.width);
    pdf.save('Confirmation Form.pdf');
    element.style.width = '';
    if (btn) btn.style.display = 'block'; // Show button again
  };

  return (
    <>
      <NavBar />
      <div style={{ background: '#fff', minHeight: '100vh', padding: '0', margin: 0 }}>
        <div
          ref={receiptRef}
          style={{
            margin: '0 auto',
            padding: '30px 0 0 0',
            width: '100%',
            fontFamily: 'Arial, Helvetica, sans-serif',
            color: '#222',
            background: '#fff',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 10 }}>
            <div style={{ fontWeight: 600, fontSize: '1.3em', marginBottom: 2 , color: '#007bff'}}>
              {companyName || 'INVESTMENT Pvt. Ltd.'}
            </div>
            <div style={{ fontSize: '1em', marginBottom: 10 }}>
             <span style={{ }}>We are registered with the Securities and Exchange Board of India (SEBI) as a Stock Broker.</span>
            </div>
          </div>
          <hr style={{ margin: '10px 0 20px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '90%', margin: '0 auto' }}>
            <div style={{ width: '65%' }}>
              <div style={{ fontWeight: 'bold', marginBottom: 10 , fontSize : '16px'}}>Customer Personal Information</div>
              <div style={{ marginBottom: 8 }}><b>First Name </b>  : <span style={{ marginLeft: "10px", }}>{customerName?.split(' ')[0] || ''}</span></div>
              <div style={{ marginBottom: 8 }}><b>Last Name</b>   : <span style={{marginLeft: "10px", }}>{customerName?.split(' ')[1] || ''}</span></div>
              <div style={{ marginBottom: 8 }}><b>Father's Name </b>  : <span style={{ marginLeft: "10px", }}>{fatherName}</span></div>
              <div style={{ marginBottom: 8 }}><b>Date of Birth</b>   : <span style={{ marginLeft: "10px", }}>{dob ? new Date(dob).toLocaleDateString('en-GB') : ''}</span></div>
              <div style={{ marginBottom: 8 }}><b>Gender</b>   : <span style={{ marginLeft: "10px", }}>{gender}</span></div>
              <div style={{ marginBottom: 8 }}><b>Mobile Number</b>   : <span style={{marginLeft: "10px",  }}>{mobileNumber}</span></div>
              <div style={{ marginBottom: 8 }}><b>Email ID </b>  : <span style={{marginLeft: "10px", }}>{email}</span></div>
              <div style={{ marginBottom: 8 }}><b>Aadhaar Number</b>   : <span style={{ marginLeft: "10px" }}>{aadhaar}</span></div>
              <div style={{ marginBottom: 8 }}><b>Address</b>   : <span style={{marginLeft: "10px", }}>{address}</span></div>
              <div style={{ marginBottom: 8 }}><b>Initial Deposit</b>   : <span style={{marginLeft: "10px", }}>{initialDeposit ? `INR ${Number(initialDeposit).toLocaleString('en-IN')}` : ''}</span></div>
              <div style={{ marginBottom: 8 }}><b>Date of Application</b>  : <span style={{ }}>{applicationDate ? new Date(applicationDate).toLocaleDateString('en-GB') : ''}</span></div>
            </div>
            <div
              style={{
                width: '120px',
                height: '140px',
                textAlign: 'center',
                marginLeft: 10,
                background: '#fff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                position: 'relative'
              }}
            >
              <div style={{ fontSize: '0.95em', margin: '8px 0', fontWeight: 500, color: '#1565c0' }}></div>
              {photo ? (
                <img
                  src={photo}
                  alt="Customer"
                  style={{
                    width: '120px',
                    height: '120px',
                    objectFit: 'cover',
                    border: 'none',
                    borderRadius: 0,
                    marginTop: 0
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '120px',
                    height: '120px',
                    border: '1px solid #222',
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <img
                    src={`${process.env.PUBLIC_URL}/media/default-photo.jpg`}
                    alt="Default"
                    style={{
                      width: '80px',
                      height: '80px',
                      objectFit: 'contain'
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          <hr style={{ margin: '30px 0 10px 0' }} />
          <div style={{ width: '90%', margin: '0 auto', fontSize: '1em', marginBottom: 30 }}>
            <p style={{ marginBottom: 5 }}>
              I hereby declare that all the above information is true to the best of my knowledge.
            </p>

          </div>
          <div style={{ width: '90%', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 50 }}>
            <span style={{ fontStyle: 'italic', fontSize: '1em' }}>Signature of Authorized Officer</span>
            <img
              src={signatureImg}
              alt="Signature"
              style={{ maxWidth: 120, height: 'auto' }}
            />
          </div>
          
          <div className="text-center mt-4" style={{ marginBottom: 30 }}>
            <button className="btn btn-primary no-print" onClick={handleDownloadPDF}>
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default InvestReceipt;