const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    tags: [String],
    image: {
        data: String,         // Base64 string
        contentType: String   // e.g., 'image/jpeg'
    }
});

module.exports = mongoose.model('Category', categorySchema);
