require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8000;
const mongoose = require("mongoose");
const cors = require("cors");

app.use(express.json());

const MONGO_URL = process.env.MONGO_URL;
const formRoute = require("./Routes/FormRoute");
const formTwoRoute = require("./Routes/FormTwoRoute");
const SMSSender = require("./Routes/SMSRoute");
const FormModel = require("./Model/FormModel");   // ✅ सही import

// Scoped routes for token 101010 (Trading Billing System)
const authRoutes_101010 = require("./101010/routes/authRoutes");
const customerRoutes_101010 = require("./101010/routes/customerRoutes");
const tradeRoutes_101010 = require("./101010/routes/tradeRoutes");

// Scoped routes for token 202020 (Shree Laxmi Trader)
const authRoutes_202020 = require("./202020/routes/authRoutes");
const customerRoutes_202020 = require("./202020/routes/customerRoutes");
const tradeRoutes_202020 = require("./202020/routes/tradeRoutes");

const allowedOrigins = [
  // "https://amazone-shopping-front.onrender.com",
  "https://new-shop-g5i2.onrender.com",
  "http://localhost:3000",
  "http://localhost:4000",
  "http://localhost:5173"
];

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

// Routes
app.use('/api/forms', formRoute);
app.use('/api/formTwo', formTwoRoute);
app.use('/api/sms', SMSSender);

// Scoped routes for token 101010 (Trading Billing System)
app.use('/api/101010/auth', authRoutes_101010);
app.use('/api/101010/customers', customerRoutes_101010);
app.use('/api/101010/trades', tradeRoutes_101010);

// Scoped routes for token 202020 (Shree Laxmi Trader)
app.use('/api/202020/auth', authRoutes_202020);
app.use('/api/202020/customers', customerRoutes_202020);
app.use('/api/202020/trades', tradeRoutes_202020);


// DB connect + default update
mongoose.connect(MONGO_URL)
  .then(async () => {
    console.log("mongoDB is Connect");

    // सिर्फ़ उन records में organization set करो जिनमें field नहीं है
    // await FormModel.updateMany(
    //   { orgnization: { $exists: false } },
    //   { $set: { orgnization: "VIPUL ORGANIZATION" } }
    // );

    // console.log("Default organization updated ✅");

    app.listen(PORT, () => {
      console.log(`Server is Listen on ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });




