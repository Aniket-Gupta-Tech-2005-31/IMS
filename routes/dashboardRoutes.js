const express = require('express');
const router = express.Router();
const Product = require('../models/productSchema');
const Category = require('../models/categorySchema');

// Dashboard View
router.get('/', (req, res) => {
    res.render('dashboard');
});

// Fetch all categories
router.get('/getCategories', async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// Fetch all products
router.get('/getProducts', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

module.exports = router;
