const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    contactNumber: { type: String, required: true },
    location: { type: String, required: true }
});

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    tags: [String],
    image: {
        data: String,         // Base64 string
        contentType: String   // e.g., 'image/jpeg'
    },
    sellers: [sellerSchema] // Array of sellers
});

module.exports = mongoose.model('Category', categorySchema);