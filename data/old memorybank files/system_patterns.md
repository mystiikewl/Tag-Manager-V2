# System Patterns

## Architecture Overview

- Web application with MVC pattern
- Frontend: HTML templates with JavaScript
- Backend: Python web framework
- Data layer: Database + CSV processing
- Network: Multi-interface support with security headers
- Error handling: Comprehensive logging system

## Key Components

1. File Upload Handler

   - CSV parsing
   - Data validation
   - Temporary storage

2. Category Management

   - Category CRUD operations
   - Assignment interface
   - Bulk operations
   - Parent category inheritance
   - Category hierarchy management
   - Category creation modal
   - Error handling and logging
   - Validation system

3. Product Display
   - Filterable product list
   - Category visualization
   - Search functionality
   - Modification tracking
   - Last modified display
   - Error message display

## Database Schema

1. Product Categories

   - `product_categories` table
     - `product_id` (TEXT, PRIMARY KEY)
     - `product_name` (TEXT, NOT NULL)
     - `last_modified` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
   - `product_category_mapping` table (junction table)
     - `product_id` (TEXT, FOREIGN KEY)
     - `category_id` (TEXT)
     - Composite PRIMARY KEY (product_id, category_id)

2. Category Hierarchy
   - Three-level category structure
   - Level 1: Top-level categories
   - Level 2: Sub-categories
   - Level 3: Detailed categories
   - Stored in JSON format
   - Parent-child relationships
   - Automatic parent inheritance

## API Endpoints

1. Product Management

   - GET `/api/products` - List all products
   - GET `/api/products/<product_id>/categories` - Get product categories
   - POST `/api/products/<product_id>/category` - Add category
   - DELETE `/api/products/<product_id>/category/<category_id>` - Remove category
   - GET `/api/products/<product_id>/last-modified` - Get last modified timestamp

2. Category Management
   - GET `/api/categories` - List all categories
   - GET `/api/categories/level1` - Get level 1 categories
   - GET `/api/categories/level2/<parent>` - Get level 2 categories
   - GET `/api/categories/level3/<parent>` - Get level 3 categories

## Frontend Patterns

1. Category Display

   - Category chips for multiple categories
   - Individual remove buttons per category
   - Hierarchical category selection
   - Success/error feedback messages
   - Parent category inheritance display
   - Category creation modal
   - Error message display
   - Loading states

2. Product Management

   - Product selection dropdown
   - Category assignment interface
   - Modification tracking display
   - Last modified notification
   - Visual feedback system
   - Error handling display

3. Data Management

   - Transaction management
   - Integrity error handling
   - Rollback on failure
   - Timestamp tracking
   - Parent category inheritance
   - Error logging
   - Validation system

## Data Flow

1. CSV → Temporary Storage → Database
2. User → Category Creation → Product Assignment
3. Database → Frontend Display → User

4. Category Assignment

   - User selects product
   - Chooses category from hierarchy
   - Frontend sends POST request
   - Backend validates and stores
   - Backend identifies and adds parent categories
   - UI updates with new categories
   - Success message shows parent category additions

5. Category Removal
   - User clicks remove button
   - Frontend sends DELETE request
   - Backend removes mapping
   - UI updates to reflect change

## Category Hierarchy Management

1. Parent Category Inheritance

   - Automatic parent category addition
   - Skip existing parent categories
   - Maintain category hierarchy integrity
   - Track parent-child relationships

2. Category Structure
   - Three-level hierarchy (Level 1, 2, 3)
   - Parent-child relationships in JSON
   - Efficient parent lookup
   - Category validation rules

## Category Data Synchronization

- Categories must exist in both `data/category.json` and the `categories` table in the database to be assignable to products.
- If you add or edit categories in `category.json`, you must run `sync_categories.py` to update the database.
- If the schema of the `categories` table changes, run `migrate_categories_table.py` to migrate the table to the correct schema before syncing.
- This ensures data integrity and that all categories are available for assignment in the app.

## Coding Standards

### Modular Design

- Break code into single-responsibility components
- Use Flask Blueprints for route organization
- Separate concerns (routes, business logic, data access)
- Encapsulate related functionality in modules

### Maintainability

- Consistent naming conventions (snake_case for Python, camelCase for JS)
- Document all functions with docstrings
- Clear project structure following Flask conventions
- Meaningful, atomic commit messages

### Best Practices

- Type hints for all Python code
- Comprehensive error handling at all layers
- Configuration through environment variables
- Unit test coverage for critical paths
- Linting (flake8) and formatting (black)

### Style Guidelines

- PEP 8 compliance for Python
- Consistent code formatting
- ESLint for JavaScript files
- Pre-commit hooks for quality checks

## Error Handling

1. Database Operations

   - Transaction management
   - Integrity error handling
   - Rollback on failure
   - Detailed error logging
   - Error message formatting

2. API Responses

   - Proper HTTP status codes
   - JSON error messages
   - User-friendly error display
   - Debug logging
   - Error tracking

3. Frontend Error Handling
   - User-friendly error messages
   - Visual error feedback
   - Loading state management
   - Error state recovery
   - Debug information display

## Security Patterns

1. Input Validation

   - Category ID validation
   - Product ID validation
   - SQL injection prevention
   - Error logging
   - Validation feedback

2. Data Integrity

   - Foreign key constraints
   - Unique constraints
   - Transaction management
   - Error handling
   - Data validation

3. Network Security

   - Security headers (Flask-Talisman)
   - Content Security Policy
   - Development mode configuration
   - Network interface binding (0.0.0.0)
   - Port configuration (5000)
   - Error logging
   - Security monitoring

4. Access Control
   - Network access management
   - Development vs Production mode
   - HTTPS support (planned)
   - Basic authentication (planned)
   - Error logging
   - Access monitoring
