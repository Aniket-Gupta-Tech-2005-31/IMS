// routes/loginRoutes.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/userSchema');

// GET /login → Render login page
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// POST login form handler
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid username or password' });
    }

    if (user.password !== password) {
      return res.status(400).json({ success: false, message: 'Invalid password' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Set token in cookie
    res.cookie('token', token, { httpOnly: true, secure: false, maxAge: 3600000 });

    res.status(200).json({ success: true, message: 'Login Successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Logout route
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
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