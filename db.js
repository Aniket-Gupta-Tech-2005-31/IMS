const mongoose = require('mongoose');
require('dotenv').config();

const mongoURL = process.env.LOCAL_MONGODB_URL;

mongoose.connect(mongoURL);

const db = mongoose.connection;

db.on('connected', () => {
    console.log("Connected to MongoDB server");
});

db.on('error', (err) => {
    console.log("MongoDB connection error : ", err);
});

db.on('disconnected', () => {
    console.log("Disconnected from MongoDB server");
});


module.exports = db;