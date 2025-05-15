# System Patterns Documentation

## Key Technical Decisions

- Implemented a new API endpoint `/api/export/csv` for exporting product categories as CSV.
- Utilized pandas for CSV generation and streaming response to handle large datasets efficiently.
- Implemented color-coded category display system using Tailwind CSS classes:
  - Level 1: Blue (bg-blue-100, text-blue-800)
  - Level 2: Red (bg-red-100, text-red-800)
  - Level 3: Green (bg-green-100, text-green-800)

## Component Relationships

- The CSV export feature integrates with the existing product and category management system.
- Frontend JavaScript function `exportToCSV()` calls the backend endpoint to initiate the export process.
- Category display system uses a consistent color scheme across all category-related components:
  - Category chips in the main view
  - Selected categories in the add category form
  - Remove buttons with matching colors

## Critical Implementation Paths

- The export process begins with a request to the `/api/export/csv` endpoint, which retrieves category data from the database and formats it as a CSV file.
- The frontend handles the response, triggering a file download for the user.
- Category styling is implemented through a level-based color mapping system in the `loadProductCategories` function.
- Color transitions and hover effects are handled through Tailwind CSS classes.

## Additional Notes

- Ensure that security headers are applied consistently across all API endpoints.
- Monitor the performance of the CSV export feature for potential optimizations.
- Category color scheme should be consistent across all views and components.
- Consider accessibility when choosing colors for category levels.

# System Patterns

## Current Architecture

### Frontend Organization

1. Single Page Application (SPA)

   - All JavaScript code contained in index.html
   - Direct DOM manipulation
   - Event-driven architecture

2. Category Management System
   - Three-level hierarchical structure
   - Parent-child relationship tracking
   - Dynamic category loading based on selection

### Design Patterns in Use

1. Event Handler Pattern

   - Direct event binding to DOM elements
   - Centralized event handling in script section
   - Event delegation for dynamic elements

2. State Management

   - Global state for selected categories
   - Product state tracking
   - UI state management

3. Async Operations
   - Promise-based API calls
   - Error handling with try-catch
   - Loading state management

### Component Structure

1. Product Management

   - Product selection dropdown
   - Product details display
   - Last modified tracking

2. Category System

   - Category creation modal
   - Category selection interface
   - Hierarchical category display

3. Export Functionality
   - CSV export button
   - Progress indication
   - File download handling

### Data Flow

1. Category Selection

   ```mermaid
   graph TD
   A[Select Category] --> B{Has Children?}
   B -->|Yes| C[Load Sub-categories]
   B -->|No| D[Update Selection]
   C --> E[Display Sub-categories]
   E --> F[Enable Selection]
   ```

2. Product Management
   ```mermaid
   graph TD
   A[Select Product] --> B[Fetch Details]
   B --> C[Display Info]
   C --> D[Load Categories]
   D --> E[Show Current Categories]
   ```

### Future Considerations

1. Planned Modularization

   - Separate concerns into modules
   - Implement proper state management
   - Add testing infrastructure

2. Code Organization

   - Move to separate JavaScript files
   - Implement module system
   - Add build process

3. Testing Strategy
   - Unit tests for functions
   - Integration tests for features
   - End-to-end testing

### Lessons Learned

1. Refactoring Approach

   - Need for incremental changes
   - Better test coverage before refactoring
   - Careful consideration of state management

2. State Management

   - Importance of clear state flow
   - Need for better state isolation
   - Consider using state management library

3. Error Handling
   - Consistent error message display
   - Proper error recovery
   - User-friendly error feedback
