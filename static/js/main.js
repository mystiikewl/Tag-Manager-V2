// Main application initialization and event listeners

document.addEventListener('DOMContentLoaded', init);

function init() {
    loadInitialProductsAndPopulateDropdown();
    setupEventListeners();
}

async function loadInitialProductsAndPopulateDropdown() {
    try {
        const products = await fetchProducts();
        populateProductDropdown(products);
    } catch (error) {
        console.error('Error loading initial products:', error);
    }
}

async function loadInitialCategories() {
    try {
        clearAllSubCategoriesUI();
        const level1Categories = await fetchLevel1Categories();
        level1Categories.forEach(category => {
            const card = createCategoryCard(category, 1);
            level1Categories.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading initial categories:', error);
        showErrorMessage('Failed to load categories. Please try again.');
    }
}

function createLevel1ChangeHandler(category) {
    return async function(e) {
        try {
            if (e.target.checked) {
                const level2Categories = await fetchCategoriesByLevelAndParent(2, category.id);
                populateCategoryLevelDisplay(level2Categories, 2);
                clearSubCategories(3); // Clear level 3 when selecting level 1

                // Add event listeners for level 2 categories
                level2Categories.forEach(subCategory => {
                    const subCategoryElement = document.querySelector(`[data-category-id='${subCategory.id}']`);
                    if (subCategoryElement) {
                        const checkbox = subCategoryElement.querySelector('input[type="checkbox"]');
                        if (checkbox) {
                            checkbox.addEventListener('change', createLevel2ChangeHandler(subCategory));
                        }
                    }
                });
            } else {
                // Clear both level 2 and 3 categories when unchecking level 1
                clearSubCategories(2);
                clearSubCategories(3);
                // Remove category from selected categories if it was selected
                selectedCategories.delete(category.id);
                updateSelectedCategoriesDisplay();
            }
        } catch (error) {
            console.error('Error handling level 1 category change:', error);
            showErrorMessage('Failed to load subcategories. Please try again.');
        }
    };
}

function createLevel2ChangeHandler(category) {
    return async function(e) {
        try {
            if (e.target.checked) {
                const level3Categories = await fetchCategoriesByLevelAndParent(3, category.id);
                populateCategoryLevelDisplay(level3Categories, 3);
            } else {
                clearSubCategories(3);
                // Remove category from selected categories if it was selected
                selectedCategories.delete(category.id);
                updateSelectedCategoriesDisplay();
            }
        } catch (error) {
            console.error('Error handling level 2 category change:', error);
            showErrorMessage('Failed to load subcategories. Please try again.');
        }
    };
}

function removeExistingEventListeners() {
    // Remove event listeners from all category checkboxes
    const allCheckboxes = document.querySelectorAll('[data-category-id] input[type="checkbox"]');
    allCheckboxes.forEach(checkbox => {
        const clone = checkbox.cloneNode(true);
        checkbox.parentNode.replaceChild(clone, checkbox);
    });
}

function setupEventListeners() {
    // Product selection
    productSelect.addEventListener('change', async (e) => {
        currentProductId = e.target.value;
        if (currentProductId) {
            try {
                const product = await fetchProductDetailsAPI(currentProductId);
                updateProductDisplay(product);
                const categories = await fetchProductCategories(currentProductId);
                displayCurrentProductCategories(categories);
                updateLastModifiedUI(await fetchLastModifiedTimestamp(currentProductId));
            } catch (error) {
                console.error('Error displaying product details:', error);
                showErrorMessage('Failed to load product details');
            }
        } else {
            clearProductDetails();
        }
    });

    // Add category button
    addCategoryBtn.addEventListener('click', () => {
        toggleAddCategoryFormVisibility(true);
        selectedCategories.clear();
        updateSelectedCategoriesDisplay();
        loadInitialCategories();
    });

    // New Category button
    createCategoryBtn.addEventListener('click', () => {
        toggleCategoryModalVisibility(true);
    });

    // Cancel buttons in modals
    [cancelCategoryBtn, cancelCategoryBtn2].forEach(btn => {
        btn.addEventListener('click', resetNewCategoryForm);
    });

    // Category level change in new category modal
    categoryLevel.addEventListener('change', async (e) => {
        const level = e.target.value;
        if (level === '2' || level === '3') {
            try {
                const categories = await fetchParentCategoriesForNewCategoryDropdown(level);
                populateParentCategoryDropdown(categories);
                parentCategoryDiv.classList.remove('hidden');
            } catch (error) {
                console.error('Error loading parent categories:', error);
                showErrorMessage('Failed to load parent categories');
            }
        } else {
            parentCategoryDiv.classList.add('hidden');
        }
    });

    // Confirm add category
    confirmAddCategory.addEventListener('click', async () => {
        if (selectedCategories.size === 0) {
            showErrorMessage('Please select at least one category');
            return;
        }
        try {
            setLoading(true);
            const result = await assignCategoriesToProduct(currentProductId, Array.from(selectedCategories));
            if (result) {
                showSuccessMessage('Categories assigned successfully!');
                resetAddCategoryForm();
                await refreshCategoryViews();
            }
        } catch (error) {
            console.error('Error assigning categories:', error);
            showErrorMessage('Failed to assign categories');
        } finally {
            setLoading(false);
        }
    });

    // Create category form submission
    categoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('categoryName').value;
        const level = categoryLevel.value;
        const parentId = parentCategory.value;
        try {
            const result = await createCategoryAPI(name, level, parentId);
            if (result) {
                showSuccessMessage('Category created successfully!');
                resetNewCategoryForm();
                await refreshCategoryViews();
            }
        } catch (error) {
            console.error('Error creating category:', error);
            showErrorMessage(error.message || 'Failed to create category');
        }
    });

    // Export CSV button
    exportCsvBtn.addEventListener('click', async () => {
        if (!currentProductId) {
            showErrorMessage('Please select a product first');
            return;
        }
        try {
            setExportButtonState(true);
            const { blob, filename } = await fetchExportCSV(currentProductId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
            showSuccessMessage('CSV exported successfully!');
        } catch (error) {
            console.error('Error exporting CSV:', error);
            showErrorMessage(error.message || 'Failed to export CSV');
        } finally {
            setExportButtonState(false);
        }
    });
} 