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

const allowedOrigins = [
  // "https://amazone-shopping-front.onrender.com",
  // "https://new-shop-g5i2.onrender.com",
  "http://localhost:3000"
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




