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

// Optional: Individual API filters (not used in current frontend)
router.get('/filterByCategory', async (req, res) => {
    const { category } = req.query;
    try {
        const products = await Product.find({ categories: { $in: [category] } });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: 'Failed to filter by category' });
    }
});

router.get('/filterByDate', async (req, res) => {
    const { date } = req.query;
    try {
        const start = new Date(date);
        const end = new Date(start);
        end.setDate(end.getDate() + 1);

        const products = await Product.find({
            createdAt: {
                $gte: start,
                $lt: end
            }
        });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: 'Failed to filter by date' });
    }
});

module.exports = router;
