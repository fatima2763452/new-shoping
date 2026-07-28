const mongoose = require('mongoose');

const mongoUrl = process.env.MONGO_URL_005432 || "mongodb+srv://jaypalsinghchouhan2008_db_user:wY3aSciunTApOZ5Q@cluster0.eya39fg.mongodb.net/token_005432?appName=Cluster0";

const conn = mongoose.createConnection(mongoUrl);

conn.on('connected', () => {
  console.log('Connected to 005432 MongoDB database successfully');
});

conn.on('error', (err) => {
  console.error('005432 MongoDB connection error:', err);
});

module.exports = conn;
