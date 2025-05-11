let products = []; // All products

// DOM Elements
const modal = document.getElementById("add-product-modal");
const openModalBtn = document.getElementById("open-modal-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const addCategoryForm = document.getElementById("add-category-form");
const productsContainer = document.getElementById("products-container");
const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");
const submitBtn = document.querySelector(".submit-btn");
const dateInput = document.getElementById("date-filter");

// Edit mode tracking
let editMode = false;
let currentEditId = null;

// Format date as DD/MM/YYYY
function formatDateToDDMMYYYY(dateStr) {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Modal Logic
openModalBtn.onclick = () => {
    modal.style.display = "flex";
    resetForm();
};

// Close modal on button click or outside click
closeModalBtn.onclick = () => {
    modal.style.display = "none";
    resetForm();
};
// Close modal on outside click
window.onclick = (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
        resetForm();
    }
};

// Toggle Category Dropdown
document.getElementById('select-box').addEventListener('click', () => {
    document.getElementById('category-checkboxes').classList.toggle('show');
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!document.getElementById('select-box').contains(e.target) &&
        !document.getElementById('category-checkboxes').contains(e.target)) {
        document.getElementById('category-checkboxes').classList.remove('show');
    }
});

// Load on page
window.addEventListener('DOMContentLoaded', () => {
    fetchCategories();
    fetchAndDisplayProducts();
});

// Load categories dynamically
async function fetchCategories() {
    try {
        const res = await fetch('/products/categories');
        const categories = await res.json();
        const container = document.getElementById('category-checkboxes');
        container.innerHTML = '';

        // Filter dropdown
        categoryFilter.innerHTML = `<option value="">All</option>`;
        categories.forEach(cat => {
            const checkbox = document.createElement('div');
            checkbox.classList.add('checkbox-item');
            checkbox.innerHTML = `
                <label>
                    <input type="checkbox" name="category" value="${cat.name}"> ${cat.name}
                </label>`;
            container.appendChild(checkbox);

            const option = document.createElement('option');
            option.value = cat.name;
            option.textContent = cat.name;
            categoryFilter.appendChild(option);
        });
    } catch (err) {
        console.error("Error loading categories:", err);
    }
}

// Fetch products and display
async function fetchAndDisplayProducts() {
    try {
        const res = await fetch('/products/getProducts');
        products = await res.json();
        renderProducts(products);
    } catch (err) {
        console.error("Error loading products:", err);
    }
}

// Render products to table
function renderProducts(productList) {
    productsContainer.innerHTML = '';
    productList.forEach(product => {
        const imageTag = product.image?.data
            ? `<img src="data:${product.image.contentType};base64,${product.image.data}" width="60" height="60" />`
            : `<img src="/image/dummy_category.png" width="60" height="60" />`;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${imageTag}</td>
            <td>${product.name}</td>
            <td>${product.categories.join(', ')}</td>
            <td>₹${product.purchasePrice}</td>
            <td>₹${product.sellingPrice}</td>
            <td>${formatDateToDDMMYYYY(product.createdAt)}</td>
            <td class="editAndDelete">
                <button onclick="editProduct('${product._id}')">Edit</button>
                <button onclick="deleteProduct('${product._id}')">Delete</button>
            </td>
        `;
        productsContainer.appendChild(row);
    });
}

// Handle Add/Edit Form Submission
addCategoryForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const selectedCategories = Array.from(document.querySelectorAll('input[name="category"]:checked'))
        .map(cb => cb.value);

    const name = document.getElementById('product-name').value;
    const purchasePrice = document.getElementById('purchase-price').value;
    const sellingPrice = document.getElementById('selling-price').value;
    const imageInput = document.getElementById('product-image');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('purchasePrice', purchasePrice);
    formData.append('sellingPrice', sellingPrice);
    formData.append('categories', JSON.stringify(selectedCategories));
    if (imageInput.files[0]) {
        formData.append('image', imageInput.files[0]);
    } else {
        formData.append('image', '/image/dummy_category.png');
    }

    try {
        const url = editMode ? `/products/editProduct/${currentEditId}` : '/products/add';
        const method = editMode ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            body: formData
        });

        if (res.ok) {
            Swal.fire("Success", `Product ${editMode ? 'updated' : 'added'} successfully`, "success");
            modal.style.display = "none";
            resetForm();
            fetchAndDisplayProducts();
        } else {
            Swal.fire("Error", `Failed to ${editMode ? 'update' : 'add'} product`, "error");
        }
    } catch (err) {
        console.error("Error submitting product:", err);
    }
});

// Reset form and state
function resetForm() {
    addCategoryForm.reset();
    editMode = false;
    currentEditId = null;
    submitBtn.textContent = "Add Product";
    // Uncheck all checkboxes
    document.querySelectorAll('input[name="category"]').forEach(cb => cb.checked = false);
}

// Delete Product
async function deleteProduct(id) {
  const confirmed = await Swal.fire({
          title: "Are you sure?",
          text: "You won't be able to revert this!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, delete it!"
      });
    if (!confirmed) return;

    try {
        const res = await fetch(`/products/${id}`, { method: 'DELETE' });
        if (res.ok) {
            Swal.fire("Deleted!", "Product deleted.", "success");
            fetchAndDisplayProducts();
        } else {
            Swal.fire("Error", "Failed to delete product", "error");
        }
    } catch (error) {
        console.error("Delete error:", error);
    }
}

// Edit Product
async function editProduct(id) {
    const product = products.find(p => p._id === id);
    if (!product) return;

    document.getElementById('product-name').value = product.name;
    document.getElementById('purchase-price').value = product.purchasePrice;
    document.getElementById('selling-price').value = product.sellingPrice;

    // Check matching categories
    const allCheckboxes = document.querySelectorAll('input[name="category"]');
    allCheckboxes.forEach(cb => {
        cb.checked = product.categories.includes(cb.value);
    });

    // Switch modal to edit mode
    editMode = true;
    currentEditId = id;
    submitBtn.textContent = "Update Product";
    modal.style.display = "flex";
}

// Search Product Live
searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(term)
    );
    renderProducts(filtered);
});

// Date Filter (DD/MM/YYYY)
function filterByDate(products, selectedDate) {
    if (!selectedDate) return products;
    const [year, month, day] = selectedDate.split("-");
    const formattedInputDate = `${day}/${month}/${year}`;
    return products.filter(product => {
        const productDate = formatDateToDDMMYYYY(product.createdAt);
        return productDate === formattedInputDate;
    });
}

dateInput.addEventListener('change', () => {
    const selectedDate = dateInput.value;
    const filteredProducts = filterByDate(products, selectedDate);
    renderProducts(filteredProducts);
});

// Category Filter
categoryFilter.addEventListener('change', (e) => {
    const selected = e.target.value;
    const filtered = selected
        ? products.filter(p => p.categories.includes(selected))
        : products;
    renderProducts(filtered);
});
