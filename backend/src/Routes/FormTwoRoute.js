const express = require('express');
const router = express.Router();

const { createFormTwo, getFormTwo} = require("../Controller/formTwoController");

router.post("/createFormTwo", createFormTwo);
router.get("/getFormTwo", getFormTwo);

module.exports = router