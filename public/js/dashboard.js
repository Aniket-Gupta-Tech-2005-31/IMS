let products = [];
let categories = [];

// DOM Elements
const totalProductsEl = document.getElementById('total-products');
const totalCategoriesEl = document.getElementById('total-categories');
const categoryFilter = document.getElementById('category-filter');
const searchInput = document.getElementById('search-input');
const dateFilter = document.getElementById('date-filter');
const applyFiltersBtn = document.getElementById('apply-filters');
const popupOverlay = document.getElementById('popup-overlay');
const filteredResultsEl = document.getElementById('filtered-results');
const closePopupBtn = document.getElementById('close-popup');
const productsListEl = document.getElementById('products-list');
const showAllProductsBtn = document.getElementById('show-all-products');

// Fetch data on load
window.addEventListener('DOMContentLoaded', fetchData);

// Fetch categories and products
async function fetchData() {
    try {
        const [categoryRes, productRes] = await Promise.all([
            fetch('/dashboard/getCategories'),
            fetch('/dashboard/getProducts')
        ]);

        if (!categoryRes.ok || !productRes.ok) {
            throw new Error("Failed to fetch one or more resources");
        }

        categories = await categoryRes.json();
        products = await productRes.json();

        populateCategoryFilter();
        updateTotals();
        renderTopProducts(); // ✅ Call this to render top 5
    } catch (err) {
        console.error("Error fetching data:", err);
        alert("Something went wrong while loading data!");
    }
}

// Format date to DD/MM/YYYY
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}

// Populate category dropdown
function populateCategoryFilter() {
    categoryFilter.innerHTML = ''; 

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select Category';
    categoryFilter.appendChild(defaultOption);

    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.name;
        option.textContent = cat.name;
        categoryFilter.appendChild(option);
    });
}

// Update total counts
function updateTotals() {
    totalProductsEl.textContent = products.length;
    totalCategoriesEl.textContent = categories.length;
}

// Apply filters
applyFiltersBtn.addEventListener('click', () => {
    const searchTerm = searchInput.value;
    const selectedCategory = categoryFilter.value;
    const selectedDate = dateFilter.value;

    let filtered = [...products];

    if (searchTerm) {
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(searchTerm)
        );
    }

    if (selectedCategory) {
        filtered = filtered.filter(p =>
            p.categories.includes(selectedCategory)
        );
    }

    if (selectedDate) {
        const selectedDateObj = new Date(selectedDate).toDateString();
        filtered = filtered.filter(p =>
            new Date(p.createdAt).toDateString() === selectedDateObj
        );
    }

    renderFilteredProducts(filtered);
});

// Render the first 10 products
function renderTopProducts() {
    productsListEl.innerHTML = ''; 

    const top5Products = products.slice(0, 10);
    top5Products.forEach(p => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${p.name}</td>
            <td>${p.categories.join(', ')}</td>
            <td>₹${p.sellingPrice}</td>
            <td>${formatDate(p.createdAt)}</td>
        `;
        productsListEl.appendChild(row);
    });
}

// Show All Products button click handler
showAllProductsBtn.addEventListener('click', () => {
    window.location.href = '/products';
});

// Render filtered products
function renderFilteredProducts(filteredProducts) {
    filteredResultsEl.innerHTML = '';

    if (filteredProducts.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="4">No matching products found.</td>`;
        filteredResultsEl.appendChild(row);
    } else {
        filteredProducts.forEach(p => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${p.name}</td>
                <td>${p.categories.join(', ')}</td>
                <td>₹${p.purchasePrice}</td>
                <td>₹${p.sellingPrice}</td>
               <td>${formatDate(p.createdAt)}</td>
            `;
            filteredResultsEl.appendChild(row);
        });
    }

    popupOverlay.classList.remove('hidden');
}

// Close popup
closePopupBtn.addEventListener('click', () => {
    popupOverlay.classList.add('hidden');
});



