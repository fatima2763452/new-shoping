const mongoose = require('mongoose');
const conn = require('../db');

const entrySchema = new mongoose.Schema({
  customerId: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    enum: ['buy', 'sell'],
    required: true,
  },
  symbol: {
    type: String,
    required: true,
    uppercase: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  lot: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: true,
  },
  ltp: {
    type: Number,
    required: true,
  },
  marginRs: {
    type: Number,
    default: 0,
  },
  marginPct: {
    type: Number,
    default: 0,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    default: '',
  },
  exchange: {
    type: String,
    enum: ['NSE', 'BSE'],
    default: 'NSE',
  },
  tradeType: {
    type: String,
    enum: ['INTRADAY', 'DELIVERY'],
    default: 'INTRADAY',
  },
  brokeragePct: {
    type: Number,
    default: 0.01,
  },
  brokerageFee: {
    type: Number,
    required: true,
  },
  estimatedTotal: {
    type: Number,
    required: true,
  },
  customInvested: {
    type: Number
  },
  customUpnl: {
    type: Number
  },
  customTotalPnl: {
    type: Number
  }
}, {
  timestamps: true,
});

const Entry = conn.model('Entry', entrySchema);

module.exports = Entry;
