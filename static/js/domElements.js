// DOM Element Selections
const productSelect = document.getElementById('productSelect');
const productName = document.getElementById('product-name');
const productHandle = document.getElementById('product-handle');
const currentCategories = document.getElementById('current-categories');
const addCategoryBtn = document.getElementById('add-category-btn');
const addCategoryForm = document.getElementById('add-category-form');
const level1Categories = document.getElementById('level1-categories');
const level2Categories = document.getElementById('level2-categories');
const level3Categories = document.getElementById('level3-categories');
const selectedCategoriesContainer = document.getElementById('selected-categories');
const confirmAddCategory = document.getElementById('confirm-add-category');
const cancelAddCategory = document.getElementById('cancel-add-category');
const addButtonText = document.getElementById('add-button-text');
const loadingSpinner = document.getElementById('loading-spinner');
const successMessage = document.getElementById('success-message');
const createCategoryBtn = document.getElementById('newCategoryBtn');
const categoryModal = document.getElementById('categoryModal');
const categoryForm = document.getElementById('categoryForm');
const cancelCategoryBtn = document.getElementById('cancelCategoryBtn');
const cancelCategoryBtn2 = document.getElementById('cancelCategoryBtn2'); // Added this as it's selected separately
const categoryLevel = document.getElementById('categoryLevel');
const parentCategoryDiv = document.getElementById('parentCategoryDiv');
const parentCategory = document.getElementById('parentCategory');
const exportCsvBtn = document.getElementById('export-csv-btn');
// Note: lastModifiedText and lastModifiedNotification were mentioned in a commented-out function updateLastModifiedNotification
// If these elements exist or are planned, they should be added here.
// const lastModifiedText = document.getElementById('last-modified-text');
// const lastModifiedNotification = document.getElementById('last-modified-notification'); 