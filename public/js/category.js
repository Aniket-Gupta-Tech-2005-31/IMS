

// Call fetchAndDisplayCategories when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    fetchAndDisplayCategories();
});

// Fetch and display all categories from the backend
async function fetchAndDisplayCategories() {
    try {
        // Ensure the correct API path is used
        const res = await fetch('/category/get-categories');
        const result = await res.json();

        if (result.success) {
            const categories = result.data;
            const container = document.getElementById('category-container');
            container.innerHTML = ''; // Clear any existing content

            categories.forEach(cat => {
                const item = document.createElement('div');
                item.className = 'category-item';
                // Use the stored timestamp from the DB if available; otherwise, use current timestamp
                item.dataset.timestamp = cat.createdAt ? new Date(cat.createdAt).getTime() : Date.now();

                // Build the image source from the Base64 data if available; otherwise, use a fallback image
                const imgSrc = (cat.image && cat.image.data)
                    ? `data:${cat.image.contentType};base64,${cat.image.data}`
                    : '/img/logo.png';

                item.innerHTML = `
            <img src="${imgSrc}" alt="${cat.name}">
            <div class = "category-div">
                <div class="category-name">${cat.name}</div>
                <div class="category-description">${cat.description || ''}</div>
                <div class="category-tags">
                    ${cat.tags && cat.tags.length > 0 ? cat.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                </div>
            </div>
            <div class="category-actions">
                <button onclick="editCategory(this)">✏️</button>
                <button onclick="removeCategory(this)">❌</button>
            </div>
          `;
          item.dataset.id = cat._id; 
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
      `,
        confirmButtonText: 'Add Category',
        focusConfirm: false,
        preConfirm: () => {
            const name = document.getElementById('swal-category-name').value.trim();
            const description = document.getElementById('swal-category-description').value.trim();
            const tags = document.getElementById('swal-category-tags').value.trim();
            const imageFile = document.getElementById('swal-category-image').files[0];

            // If you want image to be optional, remove imageFile from the condition
            if (!name || !description || !imageFile) {
                Swal.showValidationMessage('Please fill in name, description, and choose an image.');
                return false;
            }

            return { name, description, tags, imageFile };
        }
    }).then(async result => {
        if (result.isConfirmed) {
            const { name, description, tags, imageFile } = result.value;

            // Use FormData to send data to backend
            const formData = new FormData();
            formData.append('name', name);
            formData.append('description', description);
            formData.append('tags', tags);
            formData.append('image', imageFile);  // field name 'image' must match multer settings on backend

            try {
                const response = await fetch('/category/add-category', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();
                if (data.success) {
                    Swal.fire('Success', 'Category added to database!', 'success')
                        .then(() => {
                            // Refresh the category list after adding a new category
                            fetchAndDisplayCategories();
                        });
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

// Function to edit a category 
function editCategory(btn) {
    const item = btn.closest('.category-item');
    const categoryId = item.dataset.id;
    const nameEl = item.querySelector('.category-name');
    const descEl = item.querySelector('.category-description');
    const tagsEl = item.querySelector('.category-tags');
    const imgEl = item.querySelector('img');
    const currentTags = Array.from(tagsEl.querySelectorAll('.tag')).map(t => t.innerText).join(', ');

    Swal.fire({
        title: 'Edit Category',
        html: `
            <input type="text" id="swal-category-name" class="swal2-input" value="${nameEl.innerText}">
            <textarea id="swal-category-description" class="swal2-textarea">${descEl.innerText}</textarea>
            <input type="text" id="swal-category-tags" class="swal2-input" value="${currentTags}" placeholder="Tags (comma separated)">
            <input type="file" id="swal-category-image" class="swal2-file" accept="image/*">
        `,
        confirmButtonText: 'Save Changes',
        focusConfirm: false,
        preConfirm: () => {
            const name = document.getElementById('swal-category-name').value.trim();
            const description = document.getElementById('swal-category-description').value.trim();
            const tags = document.getElementById('swal-category-tags').value.trim();
            const imageFile = document.getElementById('swal-category-image').files[0];
            if (!name || !description) {
                Swal.showValidationMessage('Name & description are required');
                return false;
            }
            return { name, description, tags, imageFile };
        }
    }).then(async result => {
        if (result.isConfirmed) {
            const { name, description, tags, imageFile } = result.value;

            const formData = new FormData();
            formData.append('name', name);
            formData.append('description', description);
            formData.append('tags', tags);
            if (imageFile) {
                formData.append('image', imageFile);
            }

            try {
                const res = await fetch(`/category/update-category/${categoryId}`, {
                    method: 'PUT',
                    body: formData
                });
                const data = await res.json();
                if (data.success) {
                    Swal.fire('Updated!', 'Category updated in database.', 'success');
                    fetchAndDisplayCategories(); // Refresh the list
                } else {
                    Swal.fire('Error', data.message || 'Something went wrong.', 'error');
                }
            } catch (err) {
                console.error(err);
                Swal.fire('Error', 'Failed to update category.', 'error');
            }
        }
    });
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




// Initialize drag & drop reordering (ensure this runs after the element exists)
new Sortable(document.getElementById('category-container'), {
    animation: 150,
    ghostClass: 'sortable-ghost'
});

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

// Toggle grid/list view
function setView(view) {
    const container = document.getElementById('category-container');
    container.classList.toggle('grid', view === 'grid');
    container.classList.toggle('list', view === 'list');
}


