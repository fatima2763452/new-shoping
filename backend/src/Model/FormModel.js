const mongoose = require("mongoose");
const { nanoid } = require("nanoid");

const formSchema = new mongoose.Schema(
  {
    // generate a ~10-character unique ID on each new doc:
    uniquckId: {
      type: String,
      default: () => nanoid(10),
    },
    token: { type : String, required: true },
    clientName: { type: String },
    stockName: { type: String },
    idCode: { type: String },
    quantity: { type: Number },
    lotSize: {
      type: Number,
      default: 0,
    },
    buyPrice: { type: Number },
    sellPrice: { type: Number },
    tradeDate: { type: Date },
    formBrokerage: { type: Number },
    address: { type: String },
    margin: { type: Number },
    mobileNumber: { type: Number },
    orgnization: {
      type: String,
    },
    mode: {
      type: String,
      enum: ["buy", "sell"],
      required: true,
    },


  },
  { timestamps: true }
);

const FormModel = mongoose.model("FormModel", formSchema);
module.exports = { FormModel };
