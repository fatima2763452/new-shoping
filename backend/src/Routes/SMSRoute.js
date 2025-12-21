const express = require('express');
const router = express.Router();
const { SMSController } = require('../Controller/SMSController'); // ✅ destructure correctly

router.post('/send', SMSController); // ✅ now it's a function

module.exports = router;
