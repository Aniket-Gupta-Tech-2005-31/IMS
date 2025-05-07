
const express = require('express');
const router = express.Router();
const Product = require('../models/productSchema');
const Category = require('../models/categorySchema');
const multer = require('multer');

// Set up multer for image upload
const storage = multer.memoryStorage(); // or use diskStorage
const upload = multer({ storage: storage });


router.get('/', (req, res) => {
    res.render('products')
});

// fetch category dynamic from database 
router.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find({});
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories', error });
    }
});

// Get All Products
router.get('/getProducts', async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error });
    }
});

// Add product 
router.post('/add', upload.single('image'), async (req, res) => {
    try {
        const { name, purchasePrice, sellingPrice, categories } = req.body;
        const categoryArray = JSON.parse(categories);

        const newProduct = new Product({
            name,
            purchasePrice,
            sellingPrice,
            categories: categoryArray,
            image: {
                data: req.file.buffer.toString('base64'),
                contentType: req.file.mimetype
            }
        });

        await newProduct.save();
        res.status(201).json({ message: "Product added" });
    } catch (err) {
        console.error("Add product error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Delete Product
router.delete('/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error });
    }
});


router.put('/editProduct/:id', upload.single('image'), async (req, res) => {
    try {
        const updateData = {
            name: req.body.name,
            purchasePrice: req.body.purchasePrice,
            sellingPrice: req.body.sellingPrice,
            categories: JSON.parse(req.body.categories),
        };

        if (req.file) {
            updateData.image = {
                data: req.file.buffer.toString('base64'),
                contentType: req.file.mimetype,
            };
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        res.json(updatedProduct);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating product', error });
    }
});



module.exports = router;
