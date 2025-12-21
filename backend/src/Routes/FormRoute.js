const express = require('express');
const router = express.Router();
const { createForm, getForms, deleteForm, updateForm, getFormsByUniquckId, deleteAllForms, getTradesByTokenAndIdCode } = require("../Controller/formController");

router.post('/createForm', createForm); // create
router.get('/getForm/:token/:uniquckId', getFormsByUniquckId); // get form data as token
router.get('/getFormbyToken/:token', getForms); // fetch all holdins based on token
router.delete('/deleteForm/:uniquckId', deleteForm); // delete
router.put('/updateForm/:token/:idCode', updateForm);
router.get('/getStocks/:token/:idCode', getTradesByTokenAndIdCode); // get all stocks of perticular user
router.delete('/deleteAll', deleteAllForms); // delete all entries

module.exports = router;
