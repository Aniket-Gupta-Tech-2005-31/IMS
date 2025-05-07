// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    image: {
        data: String,
        contentType: String
    },
    name: {
        type: String,
        required: true
    },
    purchasePrice: {
        type: Number,
        required: true
    },
    sellingPrice: {
        type: Number,
        required: true
    },
    categories: [{ type: String }],
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
