const mongoose = require('mongoose');

const mongoUrl = process.env.MONGO_URL_008765 || "mongodb+srv://jaypalsinghchouhan2008_db_user:wY3aSciunTApOZ5Q@cluster0.eya39fg.mongodb.net/token_008765?appName=Cluster0";

const conn = mongoose.createConnection(mongoUrl);

conn.on('connected', () => {
  console.log('Connected to 008765 MongoDB database successfully');
});

conn.on('error', (err) => {
  console.error('008765 MongoDB connection error:', err);
});

module.exports = conn;
