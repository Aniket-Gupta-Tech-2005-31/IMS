const express = require('express');
const router = express.Router();
const multer = require('multer');
const Category = require('../models/categorySchema');
const productsSchema = require('../models/productSchema');

// Memory storage to get image as buffer
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/', (req, res) => {
    res.render('category');
});


// fetch category 
router.get('/get-categories', async (req, res) => {
    try {
        const categories = await Category.find({});
        res.status(200).json({ success: true, data: categories });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// add category
router.post('/add-category', upload.single('image'), async (req, res) => {
    try {
        const { name, description, tags, sellers } = req.body;
        const image = req.file;

        if (!name) {
            return res.status(400).json({ success: false, message: 'Category name is required.' });
        }

        const newCategoryData = {
            name,
            description,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            sellers: JSON.parse(sellers) // Parse JSON sellers list
        };

        if (image) {
            newCategoryData.image = {
                data: image.buffer.toString('base64'),
                contentType: image.mimetype
            };
        }

        const newCategory = new Category(newCategoryData);
        await newCategory.save();

        return res.status(200).json({ success: true, message: 'Category saved successfully' });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

// edit category
router.put('/update-category/:id', upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, tags, sellers } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: 'Name is required.' });
        }

        const updateFields = {
            name,
            description,
            tags: JSON.parse(tags),
            sellers: JSON.parse(sellers)
        };

        // Handle image update
        if (req.file) {
            updateFields.image = {
                data: req.file.buffer.toString('base64'),
                contentType: req.file.mimetype
            };
        }

        const updated = await Category.findByIdAndUpdate(id, updateFields, { new: true });

        if (!updated) {
            return res.status(404).json({ success: false, message: 'Category not found.' });
        }

        res.json({ success: true, data: updated });
    } catch (err) {
        console.error('Update error:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// delete category
router.delete('/delete-category/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Category.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Category not found.' });
        }

        res.json({ success: true, message: 'Category deleted successfully.' });
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// Get products by category name with pagination
router.get('/products-by-category/:categoryName', async (req, res) => {
    const { categoryName } = req.params;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);

    try {
        const totalProducts = await productsSchema.countDocuments({ categories: categoryName });

        if (totalProducts === 0) {
            return res.json({ success: true, data: [], total: 0, message: 'No products found for this category.' });
        }

        const products = await productsSchema.find({ categories: categoryName })
            .skip((page - 1) * limit)
            .limit(limit);

        res.json({ success: true, data: products, total: totalProducts });
    } catch (error) {
        console.error('Error fetching products by category:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

router.get('/details/:categoryName', async (req, res) => {
    try {
        const categoryName = req.params.categoryName;
        const category = await Category.findOne({ name: categoryName });

        if (!category) {
            return res.json({ success: false, message: 'Category not found' });
        }

        res.json({ success: true, data: category });
    } catch (err) {
        console.error('Error fetching category details:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch category details' });
    }
});



module.exports = router;
