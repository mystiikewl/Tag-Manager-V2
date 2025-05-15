// UI Handlers for DOM manipulation

function showSuccessMessage(message = 'Category successfully added!') {
    successMessage.textContent = message;
    successMessage.classList.remove('hidden');
    successMessage.classList.add('opacity-100');
    setTimeout(() => {
        successMessage.classList.remove('opacity-100');
        successMessage.classList.add('opacity-0');
        setTimeout(() => {
            successMessage.classList.add('hidden');
            successMessage.classList.remove('opacity-0');
        }, 500);
    }, 3000);
}

function setLoading(isLoading) {
    if (isLoading) {
        addButtonText.textContent = 'Adding...';
        loadingSpinner.classList.remove('hidden');
        confirmAddCategory.disabled = true;
    } else {
        addButtonText.textContent = 'Add';
        loadingSpinner.classList.add('hidden');
        confirmAddCategory.disabled = false;
    }
}

function populateProductDropdown(products) {
    productSelect.innerHTML = '<option value="">Select a product...</option>';
    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.product_id;
        option.textContent = product.product_name;
        productSelect.appendChild(option);
    });
}

function updateProductDisplay(product) {
    productName.textContent = product.product_name;
    productHandle.textContent = product.product_handle;
}

function displayCurrentProductCategories(categories) {
    currentCategories.innerHTML = '';
    const levelColors = {
        1: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
        2: 'bg-red-100 text-red-800 hover:bg-red-200',
        3: 'bg-green-100 text-green-800 hover:bg-green-200'
    };
    categories.forEach(category => {
        const chip = document.createElement('div');
        const level = category.level || 1;
        const colorClass = levelColors[level] || levelColors[1];
        chip.className = `inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium ${colorClass} mr-2 mb-2 shadow-sm transition-colors duration-200`;
        const text = document.createElement('span');
        text.textContent = category.name;
        chip.appendChild(text);
        const removeBtn = document.createElement('button');
        removeBtn.className = `ml-2 ${level === 1 ? 'text-blue-600 hover:text-blue-800' : 
                                  level === 2 ? 'text-red-600 hover:text-red-800' : 
                                  'text-green-600 hover:text-green-800'} focus:outline-none`;
        removeBtn.innerHTML = '×';
        removeBtn.onclick = async () => {
            try {
                const response = await removeCategoryFromProductAPI(currentProductId, category.id);
                if (response.message) {
                    showSuccessMessage(response.message);
                    await refreshCategoryViews();
                }
            } catch (error) {
                alert(`Error: ${error.message}`);
            }
        };
        chip.appendChild(removeBtn);
        currentCategories.appendChild(chip);
    });
}

function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg transition-opacity duration-500 z-50';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    // Remove the error message after 3 seconds
    setTimeout(() => {
        errorDiv.style.opacity = '0';
        setTimeout(() => errorDiv.remove(), 500);
    }, 3000);
}

function handleCategorySelection(category, isSelected) {
    if (isSelected) {
        selectedCategories.add(category.id);
        // Load sub-categories if they exist
        if (category.hasChildren) {
            loadSubCategories(category.id, parseInt(category.level) + 1);
        }
    } else {
        selectedCategories.delete(category.id);
        // Clear sub-categories if they exist
        if (category.hasChildren) {
            clearSubCategories(parseInt(category.level) + 1);
        }
    }
    updateSelectedCategoriesDisplay();
}

function createCategoryCard(category, level) {
    const card = document.createElement('div');
    card.className = 'p-3 rounded-lg border border-gray-300 bg-white shadow-md hover:shadow-lg transition-all duration-200 ease-in-out hover:-translate-y-0.5 inline-flex items-start text-left min-w-[120px] max-w-xs';
    card.dataset.categoryId = category.id;
    card.dataset.level = level;
    if (category.parent_id) {
        card.dataset.parentId = category.parent_id;
    }
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `category-${category.id}`;
    checkbox.className = 'mt-[3px] w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-1 focus:ring-offset-1 focus:ring-offset-white mr-2.5 shrink-0';
    
    const label = document.createElement('label');
    label.htmlFor = `category-${category.id}`;
    label.className = 'cursor-pointer text-sm font-medium text-gray-700';
    label.textContent = category.name;
    
    card.appendChild(checkbox);
    card.appendChild(label);
    
    // Add click handler to the card
    card.addEventListener('click', (e) => {
        if (e.target !== checkbox) {
            checkbox.checked = !checkbox.checked;
        }
        handleCategorySelection(category, checkbox.checked);
    });
    
    return card;
}

function clearCategoryDisplayLevels() {
    level1Categories.innerHTML = '';
    level2Categories.innerHTML = '';
    level3Categories.innerHTML = '';
}

function populateCategoryLevelDisplay(categories, level) {
    const targetContainer = document.getElementById(`level${level}-categories`);
    if (!targetContainer) return;
    categories.forEach(category => {
        const existingCard = targetContainer.querySelector(`[data-category-id="${category.id}"]`);
        if (!existingCard) {
            const card = createCategoryCard(category, level);
            targetContainer.appendChild(card);
        }
    });
}

function updateSelectedCategoriesDisplay() {
    selectedCategoriesContainer.innerHTML = '';
    selectedCategories.forEach(categoryId => {
        const chip = document.createElement('div');
        chip.className = 'bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-sm mr-2 mb-2';
        const name = document.createElement('span');
        name.textContent = getCategoryNameFromCard(categoryId);
        const removeBtn = document.createElement('button');
        removeBtn.className = 'ml-2 text-blue-600 hover:text-blue-800 focus:outline-none';
        removeBtn.innerHTML = '×';
        removeBtn.onclick = () => {
            selectedCategories.delete(categoryId);
            updateSelectedCategoriesDisplay();
            uncheckCategoryCheckbox(categoryId);
        };
        chip.appendChild(name);
        chip.appendChild(removeBtn);
        selectedCategoriesContainer.appendChild(chip);
    });
}

function getCategoryNameFromCard(categoryId) {
    const card = document.querySelector(`[data-category-id="${categoryId}"]`);
    return card ? card.querySelector('label').textContent : categoryId;
}

function toggleAddCategoryFormVisibility(show) {
    if (show) {
        addCategoryForm.classList.remove('hidden');
    } else {
        addCategoryForm.classList.add('hidden');
    }
}

function resetAddCategoryForm() {
    toggleAddCategoryFormVisibility(false);
    selectedCategories.clear();
    updateSelectedCategoriesDisplay();
    clearCategoryDisplayLevels();
}

function toggleCategoryModalVisibility(show) {
    if (show) {
        categoryModal.classList.remove('hidden');
    } else {
        categoryModal.classList.add('hidden');
    }
}

function resetNewCategoryForm() {
    toggleCategoryModalVisibility(false);
    categoryForm.reset();
    parentCategoryDiv.classList.add('hidden');
}

function populateParentCategoryDropdown(categories) {
    parentCategory.innerHTML = '<option value="">Select parent category...</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        parentCategory.appendChild(option);
    });
}

function setExportButtonState(isLoading) {
    if (isLoading) {
        exportCsvBtn.disabled = true;
        exportCsvBtn.innerHTML = `
            <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Exporting...
        `;
    } else {
        exportCsvBtn.disabled = false;
        exportCsvBtn.innerHTML = `
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
            Export CSV
        `;
    }
}

function updateLastModifiedUI(lastModified) {
    if (lastModified) {
        const productName = productSelect.options[productSelect.selectedIndex].text;
        lastModifiedText.textContent = `${productName} was modified on ${formatDate(lastModified)}`;
        lastModifiedNotification.classList.remove('hidden');
    } else {
        lastModifiedNotification.classList.add('hidden');
    }
}

function clearAllSubCategoriesUI() {
    clearCategoryDisplayLevels();
}

function clearProductDetails() {
    productName.textContent = 'No product selected';
    productHandle.textContent = '';
    currentCategories.innerHTML = '';
}

function uncheckCategoryCheckbox(categoryId) {
    const checkbox = document.querySelector(`input[id="category-${categoryId}"]`);
    if (checkbox) {
        checkbox.checked = false;
    }
}

async function refreshCategoryViews() {
    try {
        const categories = await fetchProductCategories(currentProductId);
        displayCurrentProductCategories(categories);
    } catch (error) {
        console.error('Error refreshing category views:', error);
    }
}

async function loadSubCategories(parentId, level) {
    const targetContainer = document.getElementById(`level${level}-categories`);
    if (!targetContainer) return;
    
    try {
        const categories = await fetchCategoriesByLevelAndParent(level, parentId);
        
        // Don't clear existing categories, append new ones
        categories.forEach(category => {
            // Check if category already exists
            const existingCard = targetContainer.querySelector(`[data-category-id="${category.id}"]`);
            if (!existingCard) {
                const card = createCategoryCard(category, level);
                targetContainer.appendChild(card);
            }
        });
    } catch (error) {
        console.error(`Error loading level ${level} categories:`, error);
        showErrorMessage(`Failed to load level ${level} categories`);
    }
}

function clearSubCategories(level) {
    const targetContainer = document.getElementById(`level${level}-categories`);
    if (targetContainer) {
        // Only remove categories that are children of the deselected parent
        const cards = targetContainer.querySelectorAll(`[data-category-id]`);
        cards.forEach(card => {
            const checkbox = card.querySelector('input[type="checkbox"]');
            if (checkbox && !checkbox.checked) {
                card.remove();
            }
        });
    }
} 