# Tag Manager Project Outline

## Project Overview

Tag Manager is a web-based tool designed to efficiently manage, categorize, and update product tags using CSV files as data storage. The application allows users to view, filter, and edit product tags, with support for category-based tag management and remapping.

## Problem Statement

Managing product tags across a large catalog is error-prone and inefficient when done manually in spreadsheets. Inconsistent tags lead to poor categorization, search issues, and marketing challenges. This application provides a structured interface to manage these tags efficiently.

## Core Features

- **Product Selection and Filtering**: Search and filter products by name and type
- **Tag Categorization**: View and manage tags organized by categories
- **Tag Assignment**: Add and remove tags from products
- **Tag Definition Management**: Add, edit, delete, and merge tag definitions
- **Tag Filtering**: Create, edit, and apply filters to view specific tags
- **Data Persistence**: Save changes to CSV files and export updated data
- **User Authentication**: Secure login/logout functionality
- **Modification Tracking**: Track and display modified products and tags

## Technical Architecture

### Backend Architecture

The backend is built with Flask and follows a modular, service-oriented architecture:

1. **Entry Point**: `app.py` initializes the Flask app, loads data, and registers Blueprints
2. **Authentication**: `auth.py` manages user authentication with Flask-Login
3. **Data Management**: `datastore.py` handles CSV loading/saving and in-memory state
4. **API Layer**: Organized into Blueprints under the `api/` directory:
   - `tag_routes.py`: Endpoints for tag operations
   - `product_routes.py`: Endpoints for product operations
   - `auth_routes.py`: Endpoints for authentication
   - `filter_routes.py`: Endpoints for filter operations
5. **Service Layer**: Business logic encapsulated in modules under `services/`:
   - `tag_service.py`: Tag management operations
   - `product_service.py`: Product data operations
   - `user_service.py`: User management
   - `memory_service.py`: Documentation management
6. **Utilities**: Helper functions in `utils/helpers.py`

### Frontend Architecture

The frontend uses a modular JavaScript architecture with ES6 modules:

1. **Entry Point**: `main.js` imports and initializes all modules
2. **Module Structure**: Functionality divided into specialized modules:
   - `state.js`: Centralized state management
   - `api.js`: Backend API communication
   - `uiUtils.js`: DOM manipulation utilities
   - `productHandler.js`: Product selection and filtering
   - `tagAssignment.js`: Tag manipulation functions
   - `tagDefinitions.js`: Tag definition management
   - `filterManager.js`: Filter creation and application
   - `eventListeners.js`: DOM event handling
3. **UI Layer**: HTML templates with Jinja2 for server-side rendering
4. **Styling**: CSS for responsive design

### Data Flow

1. **Initialization**:
   - CSV files loaded into `DataStore` on startup
   - User credentials loaded via `auth.py`
   - Flask-Login manages authentication state

2. **User Authentication**:
   - User navigates to app; redirected to `/login` if not authenticated
   - Login form submits credentials; Flask-Login verifies and starts session
   - Authenticated users access the main dashboard

3. **Product Management**:
   - User selects a product from dropdown
   - Frontend fetches product data via API
   - Tags displayed categorized by type
   - User can add/remove tags through the UI

4. **Tag Definition Management**:
   - User can add new tag definitions
   - User can edit existing tag definitions with cascading updates
   - User can delete tag definitions with automatic removal from products
   - User can merge tags to consolidate similar or duplicate tags

5. **Data Persistence**:
   - Changes saved back to CSV files
   - Modified products tracked for status display
   - Export functionality for downloading updated data

## Key Components

### DataStore Class

Central to the application's data management, the `DataStore` class:
- Loads and parses CSV files
- Maintains in-memory representations of products and tags
- Tracks modified products and deleted tags
- Provides methods for saving data back to CSV

### Tag Service

Handles core tag management functionality:
- Categorizing tags based on mappings
- Remapping between current and updated tags
- Adding, editing, and deleting tag definitions
- Merging tags with automatic product updates

### Product Service

Manages product-related operations:
- Fetching product data with tags
- Updating product tags
- Bulk updating tags across products
- Exporting product data

### API Routes

Organized into logical Blueprints:
- Tag routes for tag management operations
- Product routes for product data operations
- Auth routes for authentication
- Filter routes for filter management

### Frontend Modules

Modular JavaScript architecture:
- State management for centralized application state
- API client for backend communication
- UI utilities for DOM manipulation
- Specialized modules for product, tag, and filter management

## Data Structure

### CSV Files

- **Product CSV**: Contains product data with columns for Handle, Title, Type, Current Tags, etc.
- **Tag Mapping CSV**: Maps current tags to updated tags and categories

### In-Memory Representations

- **Product DataFrame**: Pandas DataFrame for product data
- **Tag Mappings**: Structures for tag details, category mappings, etc.
- **Modified Products**: Set of handles for modified products
- **Deleted Tags**: Set of tags that have been deleted

## User Interface

The UI is organized into several sections:

1. **Product Selection**: 
   - Search box for finding products
   - Dropdown for selecting products
   - Type filter for filtering by product type

2. **Tag Management**:
   - Filter controls for applying tag filters
   - Category selector for choosing tag categories
   - Two-column interface for adding/removing tags

3. **Tag Definition Management**:
   - Add new tag definitions
   - Edit existing tag definitions
   - Delete tag definitions
   - Merge tags

4. **Data Export**:
   - Export updated data to CSV
   - Save current state to CSV

## Authentication

- Flask-Login for session management
- User credentials stored in CSV
- Password hashing with Werkzeug
- Login/logout flow with redirects

## Current Status

The application is fully functional with all core features implemented:
- CSV loading and parsing
- Product viewing and filtering
- Tag categorization and management
- Tag definition management (add, edit, delete, merge)
- User authentication
- Data export and saving

## Future Improvements

Potential enhancements for future development:
- Database integration (SQLite or PostgreSQL)
- Role-based permissions
- User management interface
- Batch operations for tag management
- Advanced filtering options
- Mobile compatibility improvements
- Error handling enhancements
- Data backup/restore functionality

## Technical Constraints

- Data persistence limited to CSV files
- No relational database integration
- Basic authentication without role-based authorization
- In-memory state management
- Limited error handling and validation

## Dependencies

- Flask: Web framework
- Flask-Login: User authentication
- Werkzeug: Password hashing
- Pandas: CSV processing
- HTML/CSS/JavaScript: Frontend

## Development Environment

- Local development on Windows
- Run via `python app.py`
- Manual CSV file management
- No automated tests or CI/CD

## Deployment

- Currently runs on Flask development server
- Not production-hardened
- CSV files stored alongside codebase

## Conclusion

Tag Manager provides a user-friendly interface for managing product tags efficiently. The modular architecture ensures maintainability and extensibility, while the CSV-based approach offers simplicity for the current use case. Future improvements could focus on database integration, enhanced security, and additional features for larger-scale deployment.
