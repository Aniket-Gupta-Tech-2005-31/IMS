const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();
require('./db'); // Connect to MongoDB

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.urlencoded({ extended: true })); // Parse form data (from HTML forms)
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as view engine and views folder
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Default route redirect
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Routes
const loginRoutes = require('./routes/loginRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productsRoutes = require('./routes/productsRoutes');

app.use('/', loginRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/category', categoryRoutes);
app.use('/products', productsRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
