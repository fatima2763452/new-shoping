require('dotenv').config();
const mongoose = require('mongoose');

async function updateDb() {
  try {
    const mongoUrl = process.env.MONGO_URL;
    if (!mongoUrl) {
        console.error("MONGO_URL not found in .env");
        process.exit(1);
    }
    console.log("Connecting to:", mongoUrl);
    await mongoose.connect(mongoUrl);
    console.log("Connected to MongoDB successfully");

    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      console.log("Checking collection:", collection.collectionName);
      
      const result = await collection.updateMany(
         { token: '220088' },
         { $set: { token: '000000' } }
      );
      if (result.matchedCount > 0) {
        console.log(`Updated ${result.modifiedCount} documents in ${collection.collectionName}`);
      }
    }
    console.log("Database token replacement complete.");
    process.exit(0);
  } catch(err) {
    console.error("Error connecting to DB or updating:", err);
    process.exit(1);
  }
}

updateDb();
