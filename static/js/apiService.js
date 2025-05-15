// API Service for backend communication

async function fetchProducts() {
    try {
        const response = await fetch('/api/products');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error; // Re-throw to allow caller to handle
    }
}

async function fetchProductDetailsAPI(productId) {
    // This function is a conceptual placeholder for fetching detailed product info.
    // The original showProductDetails fetched all products then filtered.
    try {
        const products = await fetchProducts();
        const product = products.find(p => p.product_id === productId);
        if (!product) throw new Error('Product not found');
        return product; // Returns basic product info from the list
    } catch (error) {
        console.error(`Error fetching product details for ${productId}:`, error);
        throw error;
    }
}

async function fetchProductCategories(productId) {
    try {
        const response = await fetch(`/api/products/${productId}/categories`);
        if (!response.ok) {
            let errorMsg = `HTTP error! status: ${response.status}`;
            try {
                const errData = await response.json();
                errorMsg = errData.error || errorMsg;
            } catch (e) { /* ignore parsing error */ }
            throw new Error(errorMsg);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching categories for product ${productId}:`, error);
        throw error;
    }
}

async function retryFetch(url, options = {}, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
    }
}

async function fetchLevel1Categories() {
    try {
        return await retryFetch('/api/categories/level1');
    } catch (error) {
        console.error('Error fetching level 1 categories:', error);
        throw new Error('Failed to load top-level categories. Please try again.');
    }
}

async function fetchCategoriesByLevelAndParent(level, parentId) {
    try {
        return await retryFetch(`/api/categories/level${level}/${parentId}`);
    } catch (error) {
        console.error(`Error fetching level ${level} categories for parent ${parentId}:`, error);
        throw new Error(`Failed to load level ${level} categories. Please try again.`);
    }
}

async function createCategoryAPI(name, level, parentId = null) {
    const data = {
        name,
        level: parseInt(level),
        ...(parentId && parseInt(level) > 1 && { parent_id: parentId })
    };
    
    try {
        return await retryFetch('/api/categories/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    } catch (error) {
        console.error('Error creating category:', error);
        if (error.message.includes('already exists')) {
            throw new Error(`Category "${name}" already exists. Please choose a different name.`);
        }
        throw new Error('Failed to create category. Please try again.');
    }
}

async function assignCategoriesToProduct(productId, categoryIds) {
    try {
        return await retryFetch(`/api/products/${productId}/categories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ category_ids: categoryIds })
        });
    } catch (error) {
        console.error('Error assigning categories:', error);
        throw new Error('Failed to assign categories. Please try again.');
    }
}

async function removeCategoryFromProductAPI(productId, categoryId) {
    try {
        const response = await fetch(`/api/products/${productId}/category/${categoryId}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.error || 'Error removing category');
        }
        if (response.status === 204) return { message: 'Category removed successfully' };
        return await response.json(); 
    } catch (error) {
        console.error('Error removing category:', error);
        throw error;
    }
}

async function fetchExportCSV(productId) {
    if (!productId) {
        throw new Error('Product ID is required for CSV export');
    }
    try {
        const response = await fetch(`/api/export/csv?product_id=${productId}`);
        if (!response.ok) {
            throw new Error(response.statusText || 'CSV Export failed');
        }
        if (response.headers.get('content-length') === '0') {
            throw new Error('Empty response from server for CSV export');
        }
        
        const blob = await response.blob();
        const contentDisposition = response.headers.get('content-disposition');
        let filename = 'categories_export.csv';
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
            if (filenameMatch && filenameMatch[1]) {
                filename = filenameMatch[1];
            }
        }
        return { blob, filename };
    } catch (error) {
        console.error('Error exporting CSV:', error);
        throw error;
    }
}

async function fetchLastModifiedTimestamp(productId) {
    try {
        const response = await fetch(`/api/products/${productId}/last-modified`);
        if (response.ok) {
            return await response.json();
        }
        console.warn(`Could not fetch last modified timestamp for product ${productId}`);
        return null; 
    } catch (error) {
        console.error('Error fetching last modified timestamp:', error);
        return null;
    }
}

async function fetchParentCategoriesForNewCategoryDropdown(level) {
    if (level === '2' || level === '3') {
        try {
            // Original code always fetched level1 for parent dropdown
            const response = await fetch('/api/categories/level1'); 
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error loading parent categories for dropdown:', error);
            throw error;
        }
    }
    return []; // No parent needed for Level 1, or invalid level
} 