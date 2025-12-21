const mongoose = require("mongoose");

const formTwoSchema = new mongoose.Schema({
    client : { type : String},
    idCode : {type : String},
    stockName : {type : String},
    quantity : {type : Number},
    mode : {type : String},
    buyPrice : {type : Number},
    tradeDate: {
    type: String,
    default: () => new Date().toISOString().split('T')[0],
    required: true,
  },
})

const FormTwoModel = mongoose.model("FormTwoModel", formTwoSchema);
module.exports = { FormTwoModel };