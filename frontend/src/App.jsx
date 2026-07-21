
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SecretToken from './SecretToken';


import Admin2Holdings from './000000/Pages/Holdings';
import Admin2Pavti from './000000/Pages/Pavti';
import Admin2Receipt from './000000/Pages/Receipt';
import Admin2PavtiForm from './000000/Pages/PavtiForm';
import Admin2Form from './000000/Pages/Form';
import Admin2FormTwo from './000000/Pages/FormTwo';
import Admin2TredBuyReceipt from './000000/Pages/TredBuyReceipt';
import Admin2AverageCalce from './000000/Pages/AverageCalce';
import Admin2InvestForm from './000000/Pages/InvestForm';
import Admin2InvestReceipt from './000000/Pages/InvestReceipt';

import Admin3Holdings from './330077/Pages/Holdings';
import Admin3Pavti from './330077/Pages/Pavti';
import Admin3Receipt from './330077/Pages/Receipt';
import Admin3PavtiForm from './330077/Pages/PavtiForm';
import Admin3Form from './330077/Pages/Form';
import Admin3FormTwo from './330077/Pages/FormTwo';
import Admin3TredBuyReceipt from './330077/Pages/TredBuyReceipt';
import Admin3AverageCalce from './330077/Pages/AverageCalce';
import Admin3InvestForm from './330077/Pages/InvestForm';
import Admin3InvestReceipt from './330077/Pages/InvestReceipt';

import Admin4Holdings from './440066/Pages/Holdings';
import Admin4Pavti from './440066/Pages/Pavti';
import Admin4Receipt from './440066/Pages/Receipt';
import Admin4PavtiForm from './440066/Pages/PavtiForm';
import Admin4Form from './440066/Pages/Form';
import Admin4FormTwo from './440066/Pages/FormTwo';
import Admin4TredBuyReceipt from './440066/Pages/TredBuyReceipt';
import Admin4AverageCalce from './440066/Pages/AverageCalce';
import Admin4InvestForm from './440066/Pages/InvestForm';
import Admin4InvestReceipt from './440066/Pages/InvestReceipt';

import Admin5Holdings from './000111/Pages/Holdings';
import Admin5Pavti from './000111/Pages/Pavti';
import Admin5Receipt from './000111/Pages/Receipt';
import Admin5PavtiForm from './000111/Pages/PavtiForm';
import Admin5Form from './000111/Pages/Form';
import Admin5FormTwo from './000111/Pages/FormTwo';
import Admin5TredBuyReceipt from './000111/Pages/TredBuyReceipt';
import Admin5AverageCalce from './000111/Pages/AverageCalce';
import Admin5InvestForm from './000111/Pages/InvestForm';
import Admin5InvestReceipt from './000111/Pages/InvestReceipt';

import Admin6Holdings from './208030/Pages/Holdings';
import Admin6Pavti from './208030/Pages/Pavti';
import Admin6Receipt from './208030/Pages/Receipt';
import Admin6PavtiForm from './208030/Pages/PavtiForm';
import Admin6Form from './208030/Pages/Form';
import Admin6FormTwo from './208030/Pages/FormTwo';
import Admin6TredBuyReceipt from './208030/Pages/TredBuyReceipt';
import Admin6AverageCalce from './208030/Pages/AverageCalce';
import Admin6InvestForm from './208030/Pages/InvestForm';
import Admin6InvestReceipt from './208030/Pages/InvestReceipt';

import Admin7Holdings from './307040/Pages/Holdings';
import Admin7Pavti from './307040/Pages/Pavti';
import Admin7Receipt from './307040/Pages/Receipt';
import Admin7PavtiForm from './307040/Pages/PavtiForm';
import Admin7Form from './307040/Pages/Form';
import Admin7FormTwo from './307040/Pages/FormTwo';
import Admin7TredBuyReceipt from './307040/Pages/TredBuyReceipt';
import Admin7AverageCalce from './307040/Pages/AverageCalce';
import Admin7InvestForm from './307040/Pages/InvestForm';
import Admin7InvestReceipt from './307040/Pages/InvestReceipt'; 


import Admin8Holdings from './809010/Pages/Holdings';
import Admin8Pavti from './809010/Pages/Pavti';
import Admin8Receipt from './809010/Pages/Receipt';
import Admin8PavtiForm from './809010/Pages/PavtiForm';
import Admin8Form from './809010/Pages/Form';
import Admin8FormTwo from './809010/Pages/FormTwo';
import Admin8TredBuyReceipt from './809010/Pages/TredBuyReceipt';
import Admin8AverageCalce from './809010/Pages/AverageCalce';
import Admin8InvestForm from './809010/Pages/InvestForm';
import Admin8InvestReceipt from './809010/Pages/InvestReceipt';
// import Admin8SMSSystem from './809010/Pages/SMS_System/SMSForm';


import Admin10Holdings from './778899/Pages/Holdings';
import Admin10Pavti from './778899/Pages/Pavti';
import Admin10Receipt from './778899/Pages/Receipt';
import Admin10PavtiForm from './778899/Pages/PavtiForm';
import Admin10Form from './778899/Pages/Form';
import Admin10FormTwo from './778899/Pages/FormTwo';
import Admin10TredBuyReceipt from './778899/Pages/TredBuyReceipt';
import Admin10AverageCalce from './778899/Pages/AverageCalce';
import Admin10InvestForm from './778899/Pages/InvestForm';
import Admin10InvestReceipt from './778899/Pages/InvestReceipt'; 


import Admin1Holdings from './109080/Pages/Holdings';
import Admin1Pavti from './109080/Pages/Pavti';
import Admin1Receipt from './109080/Pages/Receipt';
import Admin1PavtiForm from './109080/Pages/PavtiForm';
import Admin1Form from './109080/Pages/Form';
import Admin1FormTwo from './109080/Pages/FormTwo';
import Admin1TredBuyReceipt from './109080/Pages/TredBuyReceipt';
import Admin1AverageCalce from './109080/Pages/AverageCalce';
import Admin1InvestForm from './109080/Pages/InvestForm';
import Admin1InvestReceipt from './109080/Pages/InvestReceipt';


import Admin9Holdings from './657687/Pages/Holdings';
import Admin9Pavti from './657687/Pages/Pavti';
import Admin9Receipt from './657687/Pages/Receipt';
import Admin9PavtiForm from './657687/Pages/PavtiForm';
import Admin9Form from './657687/Pages/Form';
import Admin9FormTwo from './657687/Pages/FormTwo';
import Admin9TredBuyReceipt from './657687/Pages/TredBuyReceipt';
import Admin9AverageCalce from './657687/Pages/AverageCalce';
import Admin9InvestForm from './657687/Pages/InvestForm';
import Admin9InvestReceipt from './657687/Pages/InvestReceipt';

import Admin11Holdings from './434567/Pages/Holdings';
import Admin11Pavti from './434567/Pages/Pavti';
import Admin11Receipt from './434567/Pages/Receipt';
import Admin11PavtiForm from './434567/Pages/PavtiForm';
import Admin11Form from './434567/Pages/Form';
import Admin11FormTwo from './434567/Pages/FormTwo';
import Admin11TredBuyReceipt from './434567/Pages/TredBuyReceipt';
import Admin11AverageCalce from './434567/Pages/AverageCalce';
import Admin11InvestForm from './434567/Pages/InvestForm';
import Admin11InvestReceipt from './434567/Pages/InvestReceipt';

import Admin12Holdings from './885533/Pages/Holdings';
import Admin12Pavti from './885533/Pages/Pavti';
import Admin12Receipt from './885533/Pages/Receipt';
import Admin12PavtiForm from './885533/Pages/PavtiForm';
import Admin12Form from './885533/Pages/Form';
import Admin12FormTwo from './885533/Pages/FormTwo';
import Admin12TredBuyReceipt from './885533/Pages/TredBuyReceipt';
import Admin12AverageCalce from './885533/Pages/AverageCalce';
import Admin12InvestForm from './885533/Pages/InvestForm';
import Admin12InvestReceipt from './885533/Pages/InvestReceipt';

import Admin13Holdings from './995622/Pages/Holdings';
import Admin13Pavti from './995622/Pages/Pavti';
import Admin13Receipt from './995622/Pages/Receipt';
import Admin13PavtiForm from './995622/Pages/PavtiForm';
import Admin13Form from './995622/Pages/Form';
import Admin13FormTwo from './995622/Pages/FormTwo';
import Admin13TredBuyReceipt from './995622/Pages/TredBuyReceipt';
import Admin13AverageCalce from './995622/Pages/AverageCalce';
import Admin13InvestForm from './995622/Pages/InvestForm';
import Admin13InvestReceipt from './995622/Pages/InvestReceipt';

import Admin14Holdings from './270615/Pages/Holdings';
import Admin14Pavti from './270615/Pages/Pavti';
import Admin14Receipt from './270615/Pages/Receipt';
import Admin14PavtiForm from './270615/Pages/PavtiForm';
import Admin14Form from './270615/Pages/Form';
import Admin14FormTwo from './270615/Pages/FormTwo';
import Admin14TredBuyReceipt from './270615/Pages/TredBuyReceipt';
import Admin14AverageCalce from './270615/Pages/AverageCalce';
import Admin14InvestForm from './270615/Pages/InvestForm';
import Admin14InvestReceipt from './270615/Pages/InvestReceipt';

import Admin15Holdings from './338011/Pages/Holdings';
import Admin15Pavti from './338011/Pages/Pavti';
import Admin15Receipt from './338011/Pages/Receipt';
import Admin15PavtiForm from './338011/Pages/PavtiForm';
import Admin15Form from './338011/Pages/Form';
import Admin15FormTwo from './338011/Pages/FormTwo';
import Admin15TredBuyReceipt from './338011/Pages/TredBuyReceipt';
import Admin15AverageCalce from './338011/Pages/AverageCalce';
import Admin15InvestForm from './338011/Pages/InvestForm';
import Admin15InvestReceipt from './338011/Pages/InvestReceipt';

import Admin16Holdings from './559011/Pages/Holdings';
import Admin16Pavti from './559011/Pages/Pavti';
import Admin16Receipt from './559011/Pages/Receipt';
import Admin16PavtiForm from './559011/Pages/PavtiForm';
import Admin16Form from './559011/Pages/Form';
import Admin16FormTwo from './559011/Pages/FormTwo';
import Admin16TredBuyReceipt from './559011/Pages/TredBuyReceipt';
import Admin16AverageCalce from './559011/Pages/AverageCalce';
import Admin16InvestForm from './559011/Pages/InvestForm';
import Admin16InvestReceipt from './559011/Pages/InvestReceipt';


import Admin17Holdings from './991100/Pages/Holdings';
import Admin17Pavti from './991100/Pages/Pavti';
import Admin17Receipt from './991100/Pages/Receipt';
import Admin17PavtiForm from './991100/Pages/PavtiForm';
import Admin17Form from './991100/Pages/Form';
import Admin17FormTwo from './991100/Pages/FormTwo';
import Admin17TredBuyReceipt from './991100/Pages/TredBuyReceipt';
import Admin17AverageCalce from './991100/Pages/AverageCalce';
import Admin17InvestForm from './991100/Pages/InvestForm';
import Admin17InvestReceipt from './991100/Pages/InvestReceipt';


import Admin18Holdings from './229900/Pages/Holdings';
import Admin18Pavti from './229900/Pages/Pavti';
import Admin18Receipt from './229900/Pages/Receipt';
import Admin18PavtiForm from './229900/Pages/PavtiForm';
import Admin18Form from './229900/Pages/Form';
import Admin18FormTwo from './229900/Pages/FormTwo';
import Admin18TredBuyReceipt from './229900/Pages/TredBuyReceipt';
import Admin18AverageCalce from './229900/Pages/AverageCalce';
import Admin18InvestForm from './229900/Pages/InvestForm';
import Admin18InvestReceipt from './229900/Pages/InvestReceipt';




import Admin19Holdings from './441906/Pages/Holdings';
import Admin19Pavti from './441906/Pages/Pavti';
import Admin19Receipt from './441906/Pages/Receipt';
import Admin19PavtiForm from './441906/Pages/PavtiForm';
import Admin19Form from './441906/Pages/Form';
import Admin19FormTwo from './441906/Pages/FormTwo';
import Admin19TredBuyReceipt from './441906/Pages/TredBuyReceipt';
import Admin19AverageCalce from './441906/Pages/AverageCalce';
import Admin19InvestForm from './441906/Pages/InvestForm';
import Admin19InvestReceipt from './441906/Pages/InvestReceipt';


import Admin20Holdings from './302010/Pages/Holdings';
import Admin20Pavti from './302010/Pages/Pavti';
import Admin20Receipt from './302010/Pages/Receipt';
import Admin20PavtiForm from './302010/Pages/PavtiForm';
import Admin20Form from './302010/Pages/Form';
import Admin20FormTwo from './302010/Pages/FormTwo';
import Admin20TredBuyReceipt from './302010/Pages/TredBuyReceipt';
import Admin20AverageCalce from './302010/Pages/AverageCalce';
import Admin20InvestForm from './302010/Pages/InvestForm';
import Admin20InvestReceipt from './302010/Pages/InvestReceipt'

import Admin21Holdings from './505050/Pages/Holdings';
import Admin21Pavti from './505050/Pages/Pavti';
import Admin21Receipt from './505050/Pages/Receipt';
import Admin21PavtiForm from './505050/Pages/PavtiForm';
import Admin21Form from './505050/Pages/Form';
import Admin21FormTwo from './505050/Pages/FormTwo';
import Admin21TredBuyReceipt from './505050/Pages/TredBuyReceipt';
import Admin21AverageCalce from './505050/Pages/AverageCalce';
import Admin21InvestForm from './505050/Pages/InvestForm';
import Admin21InvestReceipt from './505050/Pages/InvestReceipt';

import Admin22Holdings from './741852/Pages/Holdings';
import Admin22Pavti from './741852/Pages/Pavti';
import Admin22Receipt from './741852/Pages/Receipt';
import Admin22PavtiForm from './741852/Pages/PavtiForm';
import Admin22Form from './741852/Pages/Form';
import Admin22FormTwo from './741852/Pages/FormTwo';
import Admin22TredBuyReceipt from './741852/Pages/TredBuyReceipt';
import Admin22AverageCalce from './741852/Pages/AverageCalce';
import Admin22InvestForm from './741852/Pages/InvestForm';
import Admin22InvestReceipt from './741852/Pages/InvestReceipt';

import Admin23Holdings from './738479/Pages/Holdings';
import Admin23Pavti from './738479/Pages/Pavti';
import Admin23Receipt from './738479/Pages/Receipt';
import Admin23PavtiForm from './738479/Pages/PavtiForm';
import Admin23Form from './738479/Pages/Form';
import Admin23FormTwo from './738479/Pages/FormTwo';
import Admin23TredBuyReceipt from './738479/Pages/TredBuyReceipt';
import Admin23AverageCalce from './738479/Pages/AverageCalce';
import Admin23InvestForm from './738479/Pages/InvestForm';
import Admin23InvestReceipt from './738479/Pages/InvestReceipt';

import Admin24Holdings from './226699/Pages/Holdings';
import Admin24Pavti from './226699/Pages/Pavti';
import Admin24Receipt from './226699/Pages/Receipt';
import Admin24PavtiForm from './226699/Pages/PavtiForm';
import Admin24Form from './226699/Pages/Form';
import Admin24FormTwo from './226699/Pages/FormTwo';
import Admin24TredBuyReceipt from './226699/Pages/TredBuyReceipt';
import Admin24AverageCalce from './226699/Pages/AverageCalce';
import Admin24InvestForm from './226699/Pages/InvestForm';
import Admin24InvestReceipt from './226699/Pages/InvestReceipt';

import Admin25Holdings from './558844/Pages/Holdings';
import Admin25Pavti from './558844/Pages/Pavti';
import Admin25Receipt from './558844/Pages/Receipt';
import Admin25PavtiForm from './558844/Pages/PavtiForm';
import Admin25Form from './558844/Pages/Form';
import Admin25FormTwo from './558844/Pages/FormTwo';
import Admin25TredBuyReceipt from './558844/Pages/TredBuyReceipt';
import Admin25AverageCalce from './558844/Pages/AverageCalce';
import Admin25InvestForm from './558844/Pages/InvestForm';
import Admin25InvestReceipt from './558844/Pages/InvestReceipt';

import Admin26Holdings from './212121/Pages/Holdings';
import Admin26Pavti from './212121/Pages/Pavti';
import Admin26Receipt from './212121/Pages/Receipt';
import Admin26PavtiForm from './212121/Pages/PavtiForm';
import Admin26Form from './212121/Pages/Form';
import Admin26FormTwo from './212121/Pages/FormTwo';
import Admin26TredBuyReceipt from './212121/Pages/TredBuyReceipt';
import Admin26AverageCalce from './212121/Pages/AverageCalce';
import Admin26InvestForm from './212121/Pages/InvestForm';
import Admin26InvestReceipt from './212121/Pages/InvestReceipt';

import Admin27Holdings from './253035/Pages/Holdings';
import Admin27Pavti from './253035/Pages/Pavti';
import Admin27Receipt from './253035/Pages/Receipt';
import Admin27PavtiForm from './253035/Pages/PavtiForm';
import Admin27Form from './253035/Pages/Form';
import Admin27FormTwo from './253035/Pages/FormTwo';
import Admin27TredBuyReceipt from './253035/Pages/TredBuyReceipt';
import Admin27AverageCalce from './253035/Pages/AverageCalce';
import Admin27InvestForm from './253035/Pages/InvestForm';
import Admin27InvestReceipt from './253035/Pages/InvestReceipt';

import Admin28Holdings from './999999/Pages/Holdings';
import Admin28Pavti from './999999/Pages/Pavti';
import Admin28Receipt from './999999/Pages/Receipt';
import Admin28PavtiForm from './999999/Pages/PavtiForm';
import Admin28Form from './999999/Pages/Form';
import Admin28FormTwo from './999999/Pages/FormTwo';
import Admin28TredBuyReceipt from './999999/Pages/TredBuyReceipt';
import Admin28AverageCalce from './999999/Pages/AverageCalce';
import Admin28InvestForm from './999999/Pages/InvestForm';
import Admin28InvestReceipt from './999999/Pages/InvestReceipt';

import Admin29Holdings from './222222/Pages/Holdings';
import Admin29Pavti from './222222/Pages/Pavti';
import Admin29Receipt from './222222/Pages/Receipt';
import Admin29PavtiForm from './222222/Pages/PavtiForm';
import Admin29Form from './222222/Pages/Form';
import Admin29FormTwo from './222222/Pages/FormTwo';
import Admin29TredBuyReceipt from './222222/Pages/TredBuyReceipt';
import Admin29AverageCalce from './222222/Pages/AverageCalce';
import Admin29InvestForm from './222222/Pages/InvestForm';
import Admin29InvestReceipt from './222222/Pages/InvestReceipt';

import Admin30Holdings from './333333/Pages/Holdings';
import Admin30Pavti from './333333/Pages/Pavti';
import Admin30Receipt from './333333/Pages/Receipt';
import Admin30PavtiForm from './333333/Pages/PavtiForm';
import Admin30Form from './333333/Pages/Form';
import Admin30FormTwo from './333333/Pages/FormTwo';
import Admin30TredBuyReceipt from './333333/Pages/TredBuyReceipt';
import Admin30AverageCalce from './333333/Pages/AverageCalce';
import Admin30InvestForm from './333333/Pages/InvestForm';
import Admin30InvestReceipt from './333333/Pages/InvestReceipt';

import Admin31Holdings from './444444/Pages/Holdings';
import Admin31Pavti from './444444/Pages/Pavti';
import Admin31Receipt from './444444/Pages/Receipt';
import Admin31PavtiForm from './444444/Pages/PavtiForm';
import Admin31Form from './444444/Pages/Form';
import Admin31FormTwo from './444444/Pages/FormTwo';
import Admin31TredBuyReceipt from './444444/Pages/TredBuyReceipt';
import Admin31AverageCalce from './444444/Pages/AverageCalce';
import Admin31InvestForm from './444444/Pages/InvestForm';
import Admin31InvestReceipt from './444444/Pages/InvestReceipt';

import Token101010Wrapper from './101010/components/TokenWrapper';
import Token101010Login from './101010/pages/Login';
import Token101010Dashboard from './101010/pages/Dashboard';
import Token101010CustomerDetail from './101010/pages/CustomerDetail';
import Token101010Invoice from './101010/components/customer/Invoice';
import Token101010AccountOpeningForm from './101010/pages/AccountOpeningForm';
import Token101010SecretAdmin from './101010/pages/SecretAdmin';
import Token101010RecycleBin from './101010/pages/RecycleBin';

const ProtectedRoute_101010 = ({ children }) => {
  const innerToken = localStorage.getItem('token');
  if (!innerToken) {
    return <Navigate to="/login" replace />;
  }
  return children;
};


function App() {
  const token = localStorage.getItem('authToken') || localStorage.getItem('token'); // Token to identify admin

  React.useEffect(() => {
    if (token !== '101010') {
      // Load Bootstrap CSS
      let bootstrapCSS = document.getElementById('bootstrap-css-cdn');
      if (!bootstrapCSS) {
        bootstrapCSS = document.createElement('link');
        bootstrapCSS.id = 'bootstrap-css-cdn';
        bootstrapCSS.rel = 'stylesheet';
        bootstrapCSS.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css';
        bootstrapCSS.integrity = 'sha384-4Q6Gf2aSP4eDXB8Miphtr37CMZZQ5oXLH2yaXMJ2w8e2ZtHTl7GptT4jmndRuHDT';
        bootstrapCSS.crossOrigin = 'anonymous';
        if (document.head.firstChild) {
          document.head.insertBefore(bootstrapCSS, document.head.firstChild);
        } else {
          document.head.appendChild(bootstrapCSS);
        }
      }

      // Load Bootstrap JS
      let bootstrapJS = document.getElementById('bootstrap-js-cdn');
      if (!bootstrapJS) {
        bootstrapJS = document.createElement('script');
        bootstrapJS.id = 'bootstrap-js-cdn';
        bootstrapJS.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/js/bootstrap.bundle.min.js';
        bootstrapJS.integrity = 'sha384-j1CDi7MgGQ12Z7Qab0qlWQ/Qqz24Gc6BM0thvEMVjHnfYGF0rmFCozFSxQBxwHKO';
        bootstrapJS.crossOrigin = 'anonymous';
        document.body.appendChild(bootstrapJS);
      }
    } else {
      // Remove Bootstrap elements to completely isolate 101010 styling
      const bootstrapCSS = document.getElementById('bootstrap-css-cdn');
      if (bootstrapCSS) {
        bootstrapCSS.remove();
      }
      const bootstrapJS = document.getElementById('bootstrap-js-cdn');
      if (bootstrapJS) {
        bootstrapJS.remove();
      }
    }
  }, [token]);

  return (
    <BrowserRouter>
      <Routes>
        {!token && <Route path="/*" element={<SecretToken />} />}


         {token === '109080' && (
          <>
     
            <Route path="/holdings" element={<Admin1Holdings />} />
            <Route path="/pavti/:idCode" element={<Admin1Pavti />} />
            <Route path="/receipt/:uniquckId" element={<Admin1Receipt />} />
            <Route path="/pavti" element={<Admin1PavtiForm />} />
            <Route path="/form" element={<Admin1Form />} />
            <Route path="/formTwo" element={<Admin1FormTwo />} />
            <Route path="/tredBuyReceipt" element={<Admin1TredBuyReceipt />} />
            <Route path="/averageCalce" element={<Admin1AverageCalce />} />
            <Route path="/investForm" element={<Admin1InvestForm />} />
            <Route path="/investReceipt" element={<Admin1InvestReceipt />} />
            {/* <Route path="/SMSForm" element={<Admin8SMSSystem/>} /> */}
          </>
        )}

        {token === '657687' && (
          <>
     
            <Route path="/holdings" element={<Admin9Holdings />} />
            <Route path="/pavti/:idCode" element={<Admin9Pavti />} />
            <Route path="/receipt/:uniquckId" element={<Admin9Receipt />} />
            <Route path="/pavti" element={<Admin9PavtiForm />} />
            <Route path="/form" element={<Admin9Form />} />
            <Route path="/formTwo" element={<Admin9FormTwo />} />
            <Route path="/tredBuyReceipt" element={<Admin9TredBuyReceipt />} />
            <Route path="/averageCalce" element={<Admin9AverageCalce />} />
            <Route path="/investForm" element={<Admin9InvestForm />} />
            <Route path="/investReceipt" element={<Admin9InvestReceipt />} />
            {/* <Route path="/SMSForm" element={<Admin8SMSSystem/>} /> */}
          </>
        )}
        

        {token === '000000' && (
          <>
  
            <Route path="/holdings" element={<Admin2Holdings />} />
            <Route path="/pavti/:idCode" element={<Admin2Pavti />} />
            <Route path="/receipt/:uniqukId" element={<Admin2Receipt />} />
            <Route path="/pavti" element={<Admin2PavtiForm />} />
            <Route path="/form" element={<Admin2Form />} />
            <Route path="/formTwo" element={<Admin2FormTwo />} />
            <Route path="/tredBuyReceipt" element={<Admin2TredBuyReceipt />} />
            <Route path="/averageCalce" element={<Admin2AverageCalce />} />

             <Route path="/investForm" element={<Admin2InvestForm />} />
            <Route path="/investReceipt" element={<Admin2InvestReceipt />} />
          </>
        )}
        {token === '809010' && (
          <>
     
            <Route path="/holdings" element={<Admin8Holdings />} />
            <Route path="/pavti/:idCode" element={<Admin8Pavti />} />
            <Route path="/receipt/:uniquckId" element={<Admin8Receipt />} />
            <Route path="/pavti" element={<Admin8PavtiForm />} />
            <Route path="/form" element={<Admin8Form />} />
            <Route path="/formTwo" element={<Admin8FormTwo />} />
            <Route path="/tredBuyReceipt" element={<Admin8TredBuyReceipt />} />
            <Route path="/averageCalce" element={<Admin8AverageCalce />} />
            <Route path="/investForm" element={<Admin8InvestForm />} />
            <Route path="/investReceipt" element={<Admin8InvestReceipt />} />
            {/* <Route path="/SMSForm" element={<Admin8SMSSystem/>} /> */}
          </>
        )}
        
        {token === '330077' && (
          <>
            <Route path="/holdings" element={<Admin3Holdings />} />
            <Route path="/pavti/:idCode" element={<Admin3Pavti />} />
            <Route path="/receipt/:uniquckId" element={<Admin3Receipt />} />
            <Route path="/pavti" element={<Admin3PavtiForm />} />
            <Route path="/form" element={<Admin3Form />} />
            <Route path="/formTwo" element={<Admin3FormTwo />} />
            <Route path="/tredBuyReceipt" element={<Admin3TredBuyReceipt />} />
            <Route path="/averageCalce" element={<Admin3AverageCalce />} />
            <Route path="/investForm" element={<Admin3InvestForm />} />
            <Route path="/investReceipt" element={<Admin3InvestReceipt />} />
          </>
        )}
        {token === '440066' && (
          <>
            <Route path="/holdings" element={<Admin4Holdings />} />
            <Route path="/pavti/:idCode" element={<Admin4Pavti />} />
            <Route path="/receipt/:uniquckId" element={<Admin4Receipt />} />
            <Route path="/pavti" element={<Admin4PavtiForm />} />
            <Route path="/form" element={<Admin4Form />} />
            <Route path="/formTwo" element={<Admin4FormTwo />} />
            <Route path="/tredBuyReceipt" element={<Admin4TredBuyReceipt />} />
            <Route path="/averageCalce" element={<Admin4AverageCalce />} />
            <Route path="/investForm" element={<Admin4InvestForm />} />
            <Route path="/investReceipt" element={<Admin4InvestReceipt />} />
          </>
        )}
        {token === '000111' && (
          <>
            <Route path="/holdings" element={<Admin5Holdings />} />
            <Route path="/pavti/:idCode" element={<Admin5Pavti />} />
            <Route path="/receipt/:uniquckId" element={<Admin5Receipt />} />
            <Route path="/pavti" element={<Admin5PavtiForm />} />
            <Route path="/form" element={<Admin5Form />} />
            <Route path="/formTwo" element={<Admin5FormTwo />} />
            <Route path="/tredBuyReceipt" element={<Admin5TredBuyReceipt />} />
            <Route path="/averageCalce" element={<Admin5AverageCalce />} />
            <Route path="/investForm" element={<Admin5InvestForm />} />
            <Route path="/investReceipt" element={<Admin5InvestReceipt />} />
          </>
        )}
        {token === '208030' && (
          <>
            <Route path="/holdings" element={<Admin6Holdings />} />
            <Route path="/pavti/:idCode" element={<Admin6Pavti />} />
            <Route path="/receipt/:uniquckId" element={<Admin6Receipt />} />
            <Route path="/pavti" element={<Admin6PavtiForm />} />
            <Route path="/form" element={<Admin6Form />} />
            <Route path="/formTwo" element={<Admin6FormTwo />} />
            <Route path="/tredBuyReceipt" element={<Admin6TredBuyReceipt />} />
            <Route path="/averageCalce" element={<Admin6AverageCalce />} />
            <Route path="/investForm" element={<Admin6InvestForm />} />
            <Route path="/investReceipt" element={<Admin6InvestReceipt />} />
          </>
        )}
        {token === '307040' && (
          <>
            <Route path="/holdings" element={<Admin7Holdings />} />
            <Route path="/pavti/:idCode" element={<Admin7Pavti />} />
            <Route path="/receipt/:uniquckId" element={<Admin7Receipt />} />
            <Route path="/pavti" element={<Admin7PavtiForm />} />
            <Route path="/form" element={<Admin7Form />} />
            <Route path="/formTwo" element={<Admin7FormTwo />} />
            <Route path="/tredBuyReceipt" element={<Admin7TredBuyReceipt />} />
            <Route path="/averageCalce" element={<Admin7AverageCalce />} />
            <Route path="/investForm" element={<Admin7InvestForm />} />
            <Route path="/investReceipt" element={<Admin7InvestReceipt />} />
          </>
        )}

        {token === '778899' && (
          <>
            <Route path="/holdings" element={<Admin10Holdings />} />
            <Route path="/pavti/:idCode" element={<Admin10Pavti />} />
            <Route path="/receipt/:uniqukId" element={<Admin10Receipt />} />
            <Route path="/pavti" element={<Admin10PavtiForm />} />
            <Route path="/form" element={<Admin10Form />} />
            <Route path="/formTwo" element={<Admin10FormTwo />} />
            <Route path="/tredBuyReceipt" element={<Admin10TredBuyReceipt />} />
            <Route path="/averageCalce" element={<Admin10AverageCalce />} />
            <Route path="/investForm" element={<Admin10InvestForm />} />
            <Route path="/investReceipt" element={<Admin10InvestReceipt />} />
          </>
        )}

         {token === '434567' && (
          <>
     
            <Route path="/holdings" element={<Admin11Holdings />} />
            <Route path="/pavti/:idCode" element={<Admin11Pavti />} />
            <Route path="/receipt/:uniquckId" element={<Admin11Receipt />} />
            <Route path="/pavti" element={<Admin11PavtiForm />} />
            <Route path="/form" element={<Admin11Form />} />
            <Route path="/formTwo" element={<Admin11FormTwo />} />
            <Route path="/tredBuyReceipt" element={<Admin11TredBuyReceipt />} />
            <Route path="/averageCalce" element={<Admin11AverageCalce />} />
            <Route path="/investForm" element={<Admin11InvestForm />} />
            <Route path="/investReceipt" element={<Admin11InvestReceipt />} />
            {/* <Route path="/SMSForm" element={<Admin11SMSSystem/>} /> */}
          </>
        )}

        {token === '885533' && (
          <>
     
            <Route path="/holdings" element={<Admin12Holdings />} />
            <Route path="/pavti/:idCode" element={<Admin12Pavti />} />
            <Route path="/receipt/:uniquckId" element={<Admin12Receipt />} />
            <Route path="/pavti" element={<Admin12PavtiForm />} />
            <Route path="/form" element={<Admin12Form />} />
            <Route path="/formTwo" element={<Admin12FormTwo />} />
            <Route path="/tredBuyReceipt" element={<Admin12TredBuyReceipt />} />
            <Route path="/averageCalce" element={<Admin12AverageCalce />} />
            <Route path="/investForm" element={<Admin12InvestForm />} />
            <Route path="/investReceipt" element={<Admin12InvestReceipt />} />
            {/* <Route path="/SMSForm" element={<Admin12SMSSystem/>} /> */}
          </>
        )}

        {token === '995622' && (
          <>
     
            <Route path="/holdings" element={<Admin13Holdings />} />
            <Route path="/pavti/:idCode" element={<Admin13Pavti />} />
            <Route path="/receipt/:uniquckId" element={<Admin13Receipt />} />
            <Route path="/pavti" element={<Admin13PavtiForm />} />
            <Route path="/form" element={<Admin13Form />} />
            <Route path="/formTwo" element={<Admin13FormTwo />} />
            <Route path="/tredBuyReceipt" element={<Admin13TredBuyReceipt />} />
            <Route path="/averageCalce" element={<Admin13AverageCalce />} />
            <Route path="/investForm" element={<Admin13InvestForm />} />
            <Route path="/investReceipt" element={<Admin13InvestReceipt />} />
            {/* <Route path="/SMSForm" element={<Admin13SMSSystem/>} /> */}
          </>
        )}

        {token === '270615' && (
          <>
     
            <Route path="/holdings" element={<Admin14Holdings />} />
            <Route path="/pavti/:idCode" element={<Admin14Pavti />} />
            <Route path="/receipt/:uniquckId" element={<Admin14Receipt />} />
            <Route path="/pavti" element={<Admin14PavtiForm />} />
            <Route path="/form" element={<Admin14Form />} />
            <Route path="/formTwo" element={<Admin14FormTwo />} />
            <Route path="/tredBuyReceipt" element={<Admin14TredBuyReceipt />} />
            <Route path="/averageCalce" element={<Admin14AverageCalce />} />
            <Route path="/investForm" element={<Admin14InvestForm />} />
            <Route path="/investReceipt" element={<Admin14InvestReceipt />} />
            {/* <Route path="/SMSForm" element={<Admin8SMSSystem/>} /> */}
          </>
        )}

        {token === '338011' && (
          <>
     
            <Route path="/holdings" element={<Admin15Holdings />} />
            <Route path="/pavti/:idCode" element={<Admin15Pavti />} />
            <Route path="/receipt/:uniquckId" element={<Admin15Receipt />} />
            <Route path="/pavti" element={<Admin15PavtiForm />} />
            <Route path="/form" element={<Admin15Form />} />
            <Route path="/formTwo" element={<Admin15FormTwo />} />
            <Route path="/tredBuyReceipt" element={<Admin15TredBuyReceipt />} />
            <Route path="/averageCalce" element={<Admin15AverageCalce />} />
            <Route path="/investForm" element={<Admin15InvestForm />} />
            <Route path="/investReceipt" element={<Admin15InvestReceipt />} />
            {/* <Route path="/SMSForm" element={<Admin8SMSSystem/>} /> */}
          </>
        )}


        
        {token === '559011' && (
          <>
     
            <Route path="/holdings" element={<Admin16Holdings />} />
            <Route path="/pavti/:idCode" element={<Admin16Pavti />} />
            <Route path="/receipt/:uniquckId" element={<Admin16Receipt />} />
            <Route path="/pavti" element={<Admin16PavtiForm />} />
            <Route path="/form" element={<Admin16Form />} />
            <Route path="/formTwo" element={<Admin16FormTwo />} />
            <Route path="/tredBuyReceipt" element={<Admin16TredBuyReceipt />} />
            <Route path="/averageCalce" element={<Admin16AverageCalce />} />
            <Route path="/investForm" element={<Admin16InvestForm />} />
            <Route path="/investReceipt" element={<Admin16InvestReceipt />} />
            {/* <Route path="/SMSForm" element={<Admin8SMSSystem/>} /> */}
          </>
        )}


          {token === '991100' && (
          <>
     
            <Route path="/holdings" element={<Admin17Holdings />} />
            <Route path="/pavti/:idCode" element={<Admin17Pavti />} />
            <Route path="/receipt/:uniquckId" element={<Admin17Receipt />} />
            <Route path="/pavti" element={<Admin17PavtiForm />} />
            <Route path="/form" element={<Admin17Form />} />
            <Route path="/formTwo" element={<Admin17FormTwo />} />
            <Route path="/tredBuyReceipt" element={<Admin17TredBuyReceipt />} />
            <Route path="/averageCalce" element={<Admin17AverageCalce />} />
            <Route path="/investForm" element={<Admin17InvestForm />} />
            <Route path="/investReceipt" element={<Admin17InvestReceipt />} />
            {/* <Route path="/SMSForm" element={<Admin8SMSSystem/>} /> */}
          </>
        )}

         {token === '229900' && (
          <>
     
            <Route path="/holdings" element={<Admin18Holdings />} />
            <Route path="/pavti/:idCode" element={<Admin18Pavti />} />
            <Route path="/receipt/:uniquckId" element={<Admin18Receipt />} />
            <Route path="/pavti" element={<Admin18PavtiForm />} />
            <Route path="/form" element={<Admin18Form />} />
            <Route path="/formTwo" element={<Admin18FormTwo />} />
            <Route path="/tredBuyReceipt" element={<Admin18TredBuyReceipt />} />
            <Route path="/averageCalce" element={<Admin18AverageCalce />} />
            <Route path="/investForm" element={<Admin18InvestForm />} />
            <Route path="/investReceipt" element={<Admin18InvestReceipt />} />
            {/* <Route path="/SMSForm" element={<Admin8SMSSystem/>} /> */}
          </>
        )}

        {token === '441906' && (
          <>
     
           <Route path="/holdings" element={<Admin19Holdings />} />
            <Route path="/pavti/:idCode" element={<Admin19Pavti />} />
            <Route path="/receipt/:uniquckId" element={<Admin19Receipt />} />
            <Route path="/pavti" element={<Admin19PavtiForm />} />
            <Route path="/form" element={<Admin19Form />} />
            <Route path="/formTwo" element={<Admin19FormTwo />} />
            <Route path="/tredBuyReceipt" element={<Admin19TredBuyReceipt />} />
            <Route path="/averageCalce" element={<Admin19AverageCalce />} />
            <Route path="/investForm" element={<Admin19InvestForm />} />
            <Route path="/investReceipt" element={<Admin19InvestReceipt />} />
            {/* <Route path="/SMSForm" element={<Admin8SMSSystem/>} /> */}
          </>
        )}

        {token === '302010' && (
          <>
     
           <Route path="/holdings" element={<Admin20Holdings />} />
            <Route path="/pavti/:idCode" element={<Admin20Pavti />} />
            <Route path="/receipt/:uniquckId" element={<Admin20Receipt />} />
            <Route path="/pavti" element={<Admin20PavtiForm />} />
            <Route path="/form" element={<Admin20Form />} />
            <Route path="/formTwo" element={<Admin20FormTwo />} />
            <Route path="/tredBuyReceipt" element={<Admin20TredBuyReceipt />} />
            <Route path="/averageCalce" element={<Admin20AverageCalce />} />
            <Route path="/investForm" element={<Admin20InvestForm />} />
            <Route path="/investReceipt" element={<Admin20InvestReceipt />} />
            {/* <Route path="/SMSForm" element={<Admin8SMSSystem/>} /> */}
          </>
        )}

        {token === '505050' && (
          <>
     
           <Route path="/holdings" element={<Admin21Holdings />} />
            <Route path="/pavti/:idCode" element={<Admin21Pavti />} />
            <Route path="/receipt/:uniquckId" element={<Admin21Receipt />} />
            <Route path="/pavti" element={<Admin21PavtiForm />} />
            <Route path="/form" element={<Admin21Form />} />
            <Route path="/formTwo" element={<Admin21FormTwo />} />
            <Route path="/tredBuyReceipt" element={<Admin21TredBuyReceipt />} />
            <Route path="/averageCalce" element={<Admin21AverageCalce />} />
            <Route path="/investForm" element={<Admin21InvestForm />} />
            <Route path="/investReceipt" element={<Admin21InvestReceipt />} />
          </>
        )}

        {token === '741852' && (
          <>
     
            <Route path="/holdings" element={<Admin22Holdings />} />
            <Route path="/pavti/:idCode" element={<Admin22Pavti />} />
            <Route path="/receipt/:uniquckId" element={<Admin22Receipt />} />
            <Route path="/pavti" element={<Admin22PavtiForm />} />
            <Route path="/form" element={<Admin22Form />} />
            <Route path="/formTwo" element={<Admin22FormTwo />} />
            <Route path="/tredBuyReceipt" element={<Admin22TredBuyReceipt />} />
            <Route path="/averageCalce" element={<Admin22AverageCalce />} />
            <Route path="/investForm" element={<Admin22InvestForm />} />
            <Route path="/investReceipt" element={<Admin22InvestReceipt />} />
          </>
        )}

        {token === '738479' && (
          <>
            <Route path="/holdings" element={<Admin23Holdings />} />
            <Route path="/pavti/:idCode" element={<Admin23Pavti />} />
            <Route path="/receipt/:uniquckId" element={<Admin23Receipt />} />
            <Route path="/pavti" element={<Admin23PavtiForm />} />
            <Route path="/form" element={<Admin23Form />} />
            <Route path="/formTwo" element={<Admin23FormTwo />} />
            <Route path="/tredBuyReceipt" element={<Admin23TredBuyReceipt />} />
            <Route path="/averageCalce" element={<Admin23AverageCalce />} />
            <Route path="/investForm" element={<Admin23InvestForm />} />
            <Route path="/investReceipt" element={<Admin23InvestReceipt />} />
          </>
        )}

        {token === '226699' && (
          <>
     
            <Route path="/holdings" element={<Admin24Holdings />} />
            <Route path="/pavti/:idCode" element={<Admin24Pavti />} />
            <Route path="/receipt/:uniquckId" element={<Admin24Receipt />} />
            <Route path="/pavti" element={<Admin24PavtiForm />} />
            <Route path="/form" element={<Admin24Form />} />
            <Route path="/formTwo" element={<Admin24FormTwo />} />
            <Route path="/tredBuyReceipt" element={<Admin24TredBuyReceipt />} />
            <Route path="/averageCalce" element={<Admin24AverageCalce />} />
            <Route path="/investForm" element={<Admin24InvestForm />} />
            <Route path="/investReceipt" element={<Admin24InvestReceipt />} />
          </>
        )}

        {token === '558844' && (
          <>
     
            <Route path="/holdings" element={<Admin25Holdings />} />
            <Route path="/pavti/:idCode" element={<Admin25Pavti />} />
            <Route path="/receipt/:uniquckId" element={<Admin25Receipt />} />
            <Route path="/pavti" element={<Admin25PavtiForm />} />
            <Route path="/form" element={<Admin25Form />} />
            <Route path="/formTwo" element={<Admin25FormTwo />} />
            <Route path="/tredBuyReceipt" element={<Admin25TredBuyReceipt />} />
            <Route path="/averageCalce" element={<Admin25AverageCalce />} />
            <Route path="/investForm" element={<Admin25InvestForm />} />
            <Route path="/investReceipt" element={<Admin25InvestReceipt />} />
          </>
        )}

        {token === '212121' && (
          <>
     
            <Route path="/holdings" element={<Admin26Holdings />} />
            <Route path="/pavti/:idCode" element={<Admin26Pavti />} />
            <Route path="/receipt/:uniquckId" element={<Admin26Receipt />} />
            <Route path="/pavti" element={<Admin26PavtiForm />} />
            <Route path="/form" element={<Admin26Form />} />
            <Route path="/formTwo" element={<Admin26FormTwo />} />
            <Route path="/tredBuyReceipt" element={<Admin26TredBuyReceipt />} />
            <Route path="/averageCalce" element={<Admin26AverageCalce />} />
            <Route path="/investForm" element={<Admin26InvestForm />} />
            <Route path="/investReceipt" element={<Admin26InvestReceipt />} />
          </>
        )}

        {token === '253035' && (
          <>
     
            <Route path="/holdings" element={<Admin27Holdings />} />
            <Route path="/pavti/:idCode" element={<Admin27Pavti />} />
            <Route path="/receipt/:uniquckId" element={<Admin27Receipt />} />
            <Route path="/pavti" element={<Admin27PavtiForm />} />
            <Route path="/form" element={<Admin27Form />} />
            <Route path="/formTwo" element={<Admin27FormTwo />} />
            <Route path="/tredBuyReceipt" element={<Admin27TredBuyReceipt />} />
            <Route path="/averageCalce" element={<Admin27AverageCalce />} />
            <Route path="/investForm" element={<Admin27InvestForm />} />
            <Route path="/investReceipt" element={<Admin27InvestReceipt />} />
          </>
        )}

        {token === '999999' && (
          <>
     
            <Route path="/holdings" element={<Admin28Holdings />} />
            <Route path="/pavti/:idCode" element={<Admin28Pavti />} />
            <Route path="/receipt/:uniquckId" element={<Admin28Receipt />} />
            <Route path="/pavti" element={<Admin28PavtiForm />} />
            <Route path="/form" element={<Admin28Form />} />
            <Route path="/formTwo" element={<Admin28FormTwo />} />
            <Route path="/tredBuyReceipt" element={<Admin28TredBuyReceipt />} />
            <Route path="/averageCalce" element={<Admin28AverageCalce />} />
            <Route path="/investForm" element={<Admin28InvestForm />} />
            <Route path="/investReceipt" element={<Admin28InvestReceipt />} />
          </>
        )}

        {token === '222222' && (
          <>
     
            <Route path="/holdings" element={<Admin29Holdings />} />
            <Route path="/pavti/:idCode" element={<Admin29Pavti />} />
            <Route path="/receipt/:uniquckId" element={<Admin29Receipt />} />
            <Route path="/pavti" element={<Admin29PavtiForm />} />
            <Route path="/form" element={<Admin29Form />} />
            <Route path="/formTwo" element={<Admin29FormTwo />} />
            <Route path="/tredBuyReceipt" element={<Admin29TredBuyReceipt />} />
            <Route path="/averageCalce" element={<Admin29AverageCalce />} />
            <Route path="/investForm" element={<Admin29InvestForm />} />
            <Route path="/investReceipt" element={<Admin29InvestReceipt />} />
          </>
        )}

        {token === '333333' && (
          <>
            <Route path="/holdings" element={<Admin30Holdings />} />
            <Route path="/pavti/:idCode" element={<Admin30Pavti />} />
            <Route path="/receipt/:uniquckId" element={<Admin30Receipt />} />
            <Route path="/pavti" element={<Admin30PavtiForm />} />
            <Route path="/form" element={<Admin30Form />} />
            <Route path="/formTwo" element={<Admin30FormTwo />} />
            <Route path="/tredBuyReceipt" element={<Admin30TredBuyReceipt />} />
            <Route path="/averageCalce" element={<Admin30AverageCalce />} />
            <Route path="/investForm" element={<Admin30InvestForm />} />
            <Route path="/investReceipt" element={<Admin30InvestReceipt />} />
          </>
        )}

        {token === '444444' && (
          <>
            <Route path="/holdings" element={<Admin31Holdings />} />
            <Route path="/pavti/:idCode" element={<Admin31Pavti />} />
            <Route path="/receipt/:uniquckId" element={<Admin31Receipt />} />
            <Route path="/pavti" element={<Admin31PavtiForm />} />
            <Route path="/form" element={<Admin31Form />} />
            <Route path="/formTwo" element={<Admin31FormTwo />} />
            <Route path="/tredBuyReceipt" element={<Admin31TredBuyReceipt />} />
            <Route path="/averageCalce" element={<Admin31AverageCalce />} />
            <Route path="/investForm" element={<Admin31InvestForm />} />
            <Route path="/investReceipt" element={<Admin31InvestReceipt />} />
          </>
        )}

        {token === '101010' && (
          <>
            <Route 
              path="/form" 
              element={
                <Token101010Wrapper>
                  <Token101010Dashboard />
                </Token101010Wrapper>
              } 
            />
            <Route 
              path="/recycle-bin" 
              element={
                <Token101010Wrapper>
                  <Token101010RecycleBin />
                </Token101010Wrapper>
              } 
            />
            <Route 
              path="/account-opening" 
              element={
                <Token101010Wrapper>
                  <Token101010AccountOpeningForm />
                </Token101010Wrapper>
              } 
            />
            <Route 
              path="/customer/:id" 
              element={
                <Token101010Wrapper>
                  <Token101010CustomerDetail />
                </Token101010Wrapper>
              } 
            />
            <Route 
              path="/customer/:id/invoice" 
              element={
                <Token101010Wrapper>
                  <Token101010Invoice />
                </Token101010Wrapper>
              } 
            />
            <Route 
              path="/secret-admin" 
              element={
                <Token101010Wrapper>
                  <Token101010SecretAdmin />
                </Token101010Wrapper>
              } 
            />
          </>
        )}

        {token && !['1', '2', '3', '4'].includes(token) && (
          <Route path="/*" element={<div>Admin not found</div>} />
        )}
        <Route path="/" element={<SecretToken />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;