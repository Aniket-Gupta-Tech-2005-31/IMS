
// Call fetchAndDisplayCategories when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    fetchAndDisplayCategories();
});

// Fetch and display all categories from the backend
async function fetchAndDisplayCategories() {
    try {
        const res = await fetch('/category/get-categories');
        const result = await res.json();

        if (result.success) {
            const categories = result.data;
            const container = document.getElementById('category-container');
            container.innerHTML = '';

            categories.forEach(cat => {
                const item = document.createElement('div');
                item.className = 'category-item';
                item.dataset.timestamp = cat.createdAt ? new Date(cat.createdAt).getTime() : Date.now();

                const imgSrc = (cat.image && cat.image.data)
                    ? `data:${cat.image.contentType};base64,${cat.image.data}`
                    : '/img/logo.png';

                item.innerHTML = `
                <img src="${imgSrc}" alt="${cat.name}">
                <div class="category-div">
                    <div class="category-name">${cat.name}</div>
                    <div class="category-description">${cat.description || ''}</div>
                    <div class="category-tags">
                        ${cat.tags?.length ? cat.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                    </div>
                </div>
                <div class="category-actions">
                    <button onclick="editCategory(this)">✏️</button>
                    <button onclick="removeCategory(this)">❌</button>
                </div>
                <div class="category-info">
                    <button onclick="openProductsPopup('${cat.name}')">See All Products</button>
                    <button onclick="viewCategoryDetails('${cat.name}')">See Details</button>
                </div>
                `;
                item.dataset.id = cat._id;
                item.dataset.sellers = JSON.stringify(cat.sellers || []);
                container.appendChild(item);
            });
        } else {
            console.error('Failed to fetch categories:', result.message);
        }
    } catch (err) {
        console.error('Error fetching categories:', err);
    }
}



// Function to open SweetAlert for adding a new category
function openAddCategorySwal() {
    Swal.fire({
        title: 'Add New Category',
        html: `
        <input type="text" id="swal-category-name" class="swal2-input" placeholder="Category Name">
        <textarea id="swal-category-description" class="swal2-textarea" placeholder="Category Description"></textarea>
        <input type="text" id="swal-category-tags" class="swal2-input" placeholder="Tags (comma separated)">
        <input type="file" id="swal-category-image" class="swal2-file" accept="image/*">
        <div id="seller-container">
            <h3>Sellers</h3>
            <div class="seller-entry">
                <input type="text" placeholder="Seller Name" class="swal2-input seller-name">
                <input type="text" placeholder="Contact Number" class="swal2-input seller-contact">
                <input type="text" placeholder="Location" class="swal2-input seller-location">
            </div>
        </div>
        <button type="button" onclick="addSeller()">+ Add Seller</button>
      `,
        confirmButtonText: 'Add Category',
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        focusConfirm: false,
        preConfirm: () => {
            const name = document.getElementById('swal-category-name').value.trim();
            const description = document.getElementById('swal-category-description').value.trim();
            const tags = document.getElementById('swal-category-tags').value.trim();
            const imageFile = document.getElementById('swal-category-image').files[0];

            const sellerElements = document.querySelectorAll('.seller-entry');
            const sellers = Array.from(sellerElements).map(el => ({
                name: el.querySelector('.seller-name').value.trim(),
                contactNumber: el.querySelector('.seller-contact').value.trim(),
                location: el.querySelector('.seller-location').value.trim()
            })).filter(s => s.name && s.contactNumber && s.location);

            if (!name || !description || sellers.length === 0) {
                Swal.showValidationMessage('Please fill in all details including at least one seller.');
                return false;
            }

            return { name, description, tags, sellers, imageFile };
        }
    }).then(async result => {
        if (result.isConfirmed) {
            const { name, description, tags, sellers, imageFile } = result.value;

            const formData = new FormData();
            formData.append('name', name);
            formData.append('description', description);
            formData.append('tags', tags);
            formData.append('sellers', JSON.stringify(sellers));
            formData.append('image', imageFile);

            try {
                const response = await fetch('/category/add-category', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();
                if (data.success) {
                    Swal.fire('Success', 'Category added to database!', 'success')
                        .then(() => fetchAndDisplayCategories());
                } else {
                    Swal.fire('Error', data.message || 'Failed to add category.', 'error');
                }
            } catch (err) {
                console.error(err);
                Swal.fire('Error', 'Something went wrong. Check the console.', 'error');
            }
        }
    });
}

// Add new seller input fields
function addSeller() {
    const container = document.getElementById('seller-container');
    const newSeller = document.createElement('div');
    newSeller.className = 'seller-entry';
    newSeller.innerHTML = `
        <label>Seller</label>
        <button type="button" onclick="removeSeller(this)">❌</button>
        <input type="text" placeholder="Seller Name" class="swal2-input seller-name">
        <input type="text" placeholder="Contact Number" class="swal2-input seller-contact">
        <input type="text" placeholder="Location" class="swal2-input seller-location">
    `;
    container.appendChild(newSeller);
}

// Function to remove a seller in the edit modal
function removeSeller(btn) {
    btn.closest('.seller-entry').remove();
}

// Function to edit a category 
function editCategory(btn) {
    const item = btn.closest('.category-item');
    const categoryId = item.dataset.id;
    const nameEl = item.querySelector('.category-name');
    const descEl = item.querySelector('.category-description');
    const tagsEl = item.querySelector('.category-tags');
    const currentTags = Array.from(tagsEl.querySelectorAll('.tag')).map(t => t.innerText).join(', ');

    const sellers = JSON.parse(item.dataset.sellers || '[]');

    Swal.fire({
        title: 'Edit Category',
        html: `
            <input type="text" id="swal-category-name" class="swal2-input" value="${nameEl.innerText}">
            <textarea id="swal-category-description" class="swal2-textarea">${descEl.innerText}</textarea>
            <input type="text" id="swal-category-tags" class="swal2-input" value="${currentTags}" placeholder="Tags (comma separated)">
            <div id="seller-container">${sellers.map((seller, index) => `
                <div class="seller-entry">
                <label>Seller ${index + 1}</label>
                <button type="button" onclick="removeSeller(this)">❌</button>
                    <input type="text" value="${seller.name}" placeholder="Seller Name" class="swal2-input seller-name">
                    <input type="text" value="${seller.contactNumber}" placeholder="Contact Number" class="swal2-input seller-contact">
                    <input type="text" value="${seller.location}" placeholder="Location" class="swal2-input seller-location">
                </div>`).join('')}
            </div>
            <button type="button" onclick="addSeller()">+ Add Seller</button>
        `,
        confirmButtonText: 'Save Changes',
        showCancelButton: true,
        focusConfirm: false,
        preConfirm: () => {
            const name = document.getElementById('swal-category-name').value.trim();
            const description = document.getElementById('swal-category-description').value.trim();
            const tags = document.getElementById('swal-category-tags').value.trim();
            const sellerElements = document.querySelectorAll('.seller-entry');

            const updatedSellers = Array.from(sellerElements).map(el => ({
                name: el.querySelector('.seller-name').value.trim(),
                contactNumber: el.querySelector('.seller-contact').value.trim(),
                location: el.querySelector('.seller-location').value.trim()
            })).filter(s => s.name && s.contactNumber && s.location);

            return { name, description, tags, sellers: updatedSellers };
        }
    }).then(result => {
        if (result.isConfirmed) {
            const { name, description, tags, sellers } = result.value;
            updateCategory(categoryId, name, description, tags, sellers);
        }
    });
}

// Function to update category (including sellers)
async function updateCategory(categoryId, name, description, tags, sellers) {
    try {
        const response = await fetch(`/category/update-category/${categoryId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description, tags, sellers })
        });

        const data = await response.json();
        if (data.success) {
            Swal.fire('Updated!', 'Category updated successfully.', 'success');
            fetchAndDisplayCategories();
        } else {
            Swal.fire('Error', data.message || 'Failed to update category.', 'error');
        }
    } catch (err) {
        console.error('Update Error:', err);
        Swal.fire('Error', 'Something went wrong.', 'error');
    }
}

// Function to remove a category
function removeCategory(btn) {
    const item = btn.closest('.category-item');
    const categoryId = item.dataset.id; // Get the ID from data attribute

    Swal.fire({
        title: 'Delete Category?',
        text: "This action cannot be undone",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it'
    }).then(async result => {
        if (result.isConfirmed) {
            try {
                const res = await fetch(`/category/delete-category/${categoryId}`, {
                    method: 'DELETE'
                });
                const data = await res.json();

                if (data.success) {
                    item.remove(); // Remove from DOM only after successful response
                    Swal.fire('Deleted!', 'Category has been removed.', 'success');
                } else {
                    Swal.fire('Error', data.message || 'Failed to delete category.', 'error');
                }
            } catch (err) {
                console.error(err);
                Swal.fire('Error', 'Something went wrong.', 'error');
            }
        }
    });
}



// Function to view category details
async function viewCategoryDetails(categoryName) {
    try {
        const res = await fetch(`/category/details/${encodeURIComponent(categoryName)}`);
        const result = await res.json();

        if (result.success) {
            const category = result.data;
            showCategoryDetailsPopup(category);
        } else {
            console.error('Failed to fetch category details:', result.message);
        }
    } catch (err) {
        console.error('Error fetching category details:', err);
    }
}

function showCategoryDetailsPopup(category) {
    const popup = document.getElementById('centerpopup');
    const popupContent = document.getElementById('popup-content');

    popupContent.innerHTML = `
    <div class="showCategoryDetailsPopup">
        <h3>Category Details: ${category.name}</h3>
        <p><strong>Description:</strong> ${category.description || 'No description available.'}</p>
        <p><strong>Tags:</strong> ${category.tags?.join(', ') || 'No tags available.'}</p>
        <p><strong>Sellers:</strong></p>
        <ul id="seller-list">
            ${category.sellers.length > 0 ? category.sellers.map((seller, index) => `
                <li>
                    <strong>Seller ${index + 1}:</strong><br>
                    Name: ${seller.name} <br>
                    Contact: ${seller.contactNumber} <br>
                    Location: ${seller.location}
                </li>
            `).join('') : '<li>No sellers available for this category.</li>'}
        </ul>
        <button onclick="closePopup()">Close</button>
    </div>
    `;
    popup.style.display = 'block';
}


function closePopup() {
    const popup = document.getElementById('centerpopup');
    popup.style.display = 'none';
}





// show product by category bu clicking button 
let currentPage = 1;
const productsPerPage = 10; // Show 10 products per page

async function openProductsPopup(categoryName, page = 1) {
    try {
        const res = await fetch(`/category/products-by-category/${encodeURIComponent(categoryName)}?page=${page}&limit=${productsPerPage}`);
        const result = await res.json();

        if (!result.success) throw new Error(result.message || 'Failed to load products.');

        const { data: products, total: totalProducts = 0 } = result;
        showProductsPopup(products, categoryName, page, totalProducts);
    } catch (error) {
        console.error('Error loading products:', error);
        showCustomPopup('Error', error.message || 'Failed to load products. Please try again later.');
    }
}

function showProductsPopup(products, categoryName, page, totalProducts) {
    const popup = document.getElementById('centerpopup');
    const popupContent = document.getElementById('popup-content');
    const totalPages = Math.ceil(totalProducts / productsPerPage);

    popupContent.innerHTML = `
        <h2>Products in ${categoryName}</h2>
        <div class="products-container">
            ${products.length ? products.map(p => `
                <div class="product-item">
                    <img src="data:${p.image.contentType};base64,${p.image.data}" alt="${p.name}" class="product-image"/>
                    <div>${p.name}</div>
                    <div>Price: ₹${p.sellingPrice}</div>
                </div>
            `).join('') : '<p>No products found for this category.</p>'}
        </div>
        <div class="pagination">
            <button ${page === 1 ? 'disabled' : ''} onclick="changePage('${categoryName}', ${page - 1})">Previous</button>
            <span>Page ${page} of ${totalPages}</span>
            <button ${page >= totalPages ? 'disabled' : ''} onclick="changePage('${categoryName}', ${page + 1})">Next</button>
        </div>
        <button class="close-popup" onclick="closeCustomPopup()">Close</button>
    `;
    popup.style.display = 'flex';
}

function changePage(categoryName, page) {
    if (page < 1) return;
    openProductsPopup(categoryName, page);
}

function closeCustomPopup() {
    document.getElementById('centerpopup').style.display = 'none';
}

function showCustomPopup(title, message) {
    const popup = document.getElementById('custom-popup');
    const popupContent = document.getElementById('popup-content');
    popupContent.innerHTML = `<h2>${title}</h2><p>${message}</p><button class="close-popup" onclick="closeCustomPopup()">Close</button>`;
    popup.style.display = 'block';
}


// Toggle grid/list view
function setView(view) {
    const container = document.getElementById('category-container');
    container.classList.toggle('grid', view === 'grid');
    container.classList.toggle('list', view === 'list');
}

// filter
// Filter categories by name or tags
function filterCategories() {
    const query = document.getElementById('search').value.toLowerCase();
    document.querySelectorAll('.category-item').forEach(item => {
        const name = item.querySelector('.category-name').innerText.toLowerCase();
        const tags = Array.from(item.querySelectorAll('.tag')).map(t => t.innerText.toLowerCase());
        item.style.display = (name.includes(query) || tags.some(tag => tag.includes(query))) ? '' : 'none';
    });
}

// Sort categories by name or timestamp
function sortCategories() {
    const container = document.getElementById('category-container');
    const option = document.getElementById('sort-options').value;
    const items = Array.from(container.children);
    items.sort((a, b) => {
        if (option === 'name-asc' || option === 'name-desc') {
            const nameA = a.querySelector('.category-name').innerText.toLowerCase();
            const nameB = b.querySelector('.category-name').innerText.toLowerCase();
            return option === 'name-asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
        } else {
            const timeA = parseInt(a.dataset.timestamp);
            const timeB = parseInt(b.dataset.timestamp);
            return option === 'newest' ? timeB - timeA : timeA - timeB;
        }
    });
    items.forEach(item => container.appendChild(item));
}