const express = require('express');
const router = express.Router();
const User = require('../models/userSchema'); // Ensure correct path to the User model

// GET /login → Render login page
router.get('/login', (req, res) => {
  res.render('login', { error: null }); // Make sure 'login.ejs' can receive 'error'
});

// POST login form handler
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (user && user.password === password) {
      return res.redirect('/dashboard'); // Redirect to dashboard
    } else {
      return res.json({ success: false, message: 'Invalid username or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});



// Create a new user (Register)
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send('User already exists');
    }

    // Create new user
    const newUser = new User({ username, password });
    await newUser.save();

    res.status(201).send('User registered successfully');
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send('Server error');
  }
});

module.exports = router;
