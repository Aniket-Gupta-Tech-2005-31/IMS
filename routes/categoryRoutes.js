const express = require('express');
const router = express.Router();
const multer = require('multer');
const Category = require('../models/categorySchema');

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
        const { name, description, tags } = req.body;
        const image = req.file;

        if (!name) {
            return res.status(400).json({ success: false, message: 'Category name is required.' });
        }

        const newCategoryData = {
            name,
            description,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : []
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
        const { name, description, tags } = req.body;

        if (!name || !description) {
            return res.status(400).json({ success: false, message: 'Name and description are required.' });
        }

        const updateFields = {
            name,
            description,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : []
        };

        if (req.file) {
            updateFields.image = {
                data: req.file.buffer,
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


module.exports = router;
