const mongoose = require('mongoose');

const mongoUrl = process.env.MONGO_URL_101010 || "mongodb+srv://jaypalsinghchouhan2008_db_user:wY3aSciunTApOZ5Q@cluster0.eya39fg.mongodb.net/?appName=Cluster0";

const conn = mongoose.createConnection(mongoUrl);

conn.on('connected', () => {
  console.log('Connected to 101010 MongoDB database successfully');
});

conn.on('error', (err) => {
  console.error('101010 MongoDB connection error:', err);
});

module.exports = conn;
