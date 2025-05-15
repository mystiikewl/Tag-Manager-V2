from flask import Flask, jsonify, request, render_template
import json
import sqlite3
import pandas as pd
import os
from flask_talisman import Talisman  # Add security headers

app = Flask(__name__)

# Security headers configuration
Talisman(app, 
    content_security_policy={
        'default-src': "'self'",
        'script-src': "'self' 'unsafe-inline' 'unsafe-eval'",
        'style-src': "'self' 'unsafe-inline'",
    },
    force_https=False  # Set to True in production
)

# Database configuration
DATABASE = 'data/products.db'

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def ensure_table_schema():
    """Ensure the product_categories and product_category_mapping tables have the correct schema."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if product_categories table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='product_categories'")
    if cursor.fetchone() is None:
        cursor.execute('''
            CREATE TABLE product_categories (
                product_id TEXT PRIMARY KEY,
                product_name TEXT NOT NULL,
                last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
    else:
        # Add last_modified column if it doesn't exist
        cursor.execute("PRAGMA table_info(product_categories)")
        columns = [column[1] for column in cursor.fetchall()]
        if 'last_modified' not in columns:
            # Create a new table with the desired schema
            cursor.execute('''
                CREATE TABLE product_categories_new (
                    product_id TEXT PRIMARY KEY,
                    product_name TEXT NOT NULL,
                    last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Copy data from old table to new table
            cursor.execute('''
                INSERT INTO product_categories_new (product_id, product_name, last_modified)
                SELECT product_id, product_name, CURRENT_TIMESTAMP
                FROM product_categories
            ''')
            
            # Drop old table and rename new table
            cursor.execute('DROP TABLE product_categories')
            cursor.execute('ALTER TABLE product_categories_new RENAME TO product_categories')
    
    # Check if product_category_mapping table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='product_category_mapping'")
    if cursor.fetchone() is None:
        cursor.execute('''
            CREATE TABLE product_category_mapping (
                product_id TEXT,
                category_id TEXT,
                PRIMARY KEY (product_id, category_id),
                FOREIGN KEY (product_id) REFERENCES product_categories(product_id)
            )
        ''')
    
    conn.commit()
    conn.close()

# Initialize database with products from CSV
def init_products():
    if not os.path.exists('data/input_file.csv'):
        return
    
    ensure_table_schema()  # Ensure table has correct schema
    
    df = pd.read_csv('data/input_file.csv')
    products = df[['Handle', 'Title']].values.tolist()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Insert products if they don't exist
    for handle, title in products:
        cursor.execute(
            "INSERT OR IGNORE INTO product_categories (product_id, product_name) VALUES (?, ?)",
            (handle, title)
        )
    
    conn.commit()
    conn.close()

# Initialize the database when starting the app
with app.app_context():
    ensure_table_schema()  # Ensure schema is correct even if no CSV file
    init_products()

@app.route('/api/products')
def get_products():
    conn = get_db_connection()
    products = conn.execute('SELECT * FROM product_categories ORDER BY LOWER(product_name) ASC').fetchall()
    conn.close()
    return jsonify([dict(product) for product in products])

@app.route('/api/products/<product_id>/categories', methods=['GET'])
def get_product_categories(product_id):
    """Get all categories for a specific product."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get all categories for the product
        cursor.execute('''
            SELECT category_id 
            FROM product_category_mapping 
            WHERE product_id = ?
        ''', (product_id,))
        
        category_ids = [row[0] for row in cursor.fetchall()]
        
        # Get category details from JSON file
        with open('data/category.json') as f:
            all_categories = json.load(f)
        
        # Format categories with their full details
        categories = []
        for category_id in category_ids:
            category = next((cat for cat in all_categories if cat['category_name'] == category_id), None)
            if category:
                categories.append({
                    'id': category['category_name'],
                    'name': category['category_name'],
                    'level': category['category_level'],
                    'parent': category.get('connected_to')
                })
        
        return jsonify(categories)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/products/<product_id>/categories', methods=['POST'])
def assign_categories(product_id):
    try:
        data = request.get_json()
        category_ids = data.get('category_ids', [])
        
        if not category_ids:
            return jsonify({'error': 'No categories provided'}), 400
            
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get current categories
        cursor.execute('''
            SELECT category_id 
            FROM product_category_mapping 
            WHERE product_id = ?
        ''', (product_id,))
        current_categories = {row[0] for row in cursor.fetchall()}
        
        # Get parent categories for all selected categories
        parent_categories = set()
        for category_id in category_ids:
            # Read categories from JSON file
            with open('data/category.json') as f:
                categories = json.load(f)
            
            # Find the category and its parents
            current_category = next((cat for cat in categories if cat['category_name'] == category_id), None)
            while current_category and current_category.get('connected_to'):
                parent_name = current_category['connected_to']
                parent_categories.add(parent_name)
                current_category = next((cat for cat in categories if cat['category_name'] == parent_name), None)
        
        # Combine all categories to add (including parents)
        categories_to_add = set(category_ids) | parent_categories
        
        # Update last_modified timestamp
        cursor.execute('''
            UPDATE product_categories 
            SET last_modified = CURRENT_TIMESTAMP 
            WHERE product_id = ?
        ''', (product_id,))
        
        # Add all missing categories
        added_categories = []
        for category_id in categories_to_add:
            if category_id not in current_categories:
                try:
                    cursor.execute(
                        'INSERT INTO product_category_mapping (product_id, category_id) VALUES (?, ?)',
                        (product_id, category_id)
                    )
                    added_categories.append(category_id)
                except sqlite3.IntegrityError:
                    continue
        
        conn.commit()
        
        # Return the updated list of categories
        cursor.execute('''
            SELECT category_id 
            FROM product_category_mapping 
            WHERE product_id = ?
        ''', (product_id,))
        updated_categories = [row[0] for row in cursor.fetchall()]
        
        return jsonify({
            'message': 'Categories assigned successfully',
            'added_categories': added_categories,
            'parent_categories_added': len(parent_categories - set(category_ids)),
            'categories': updated_categories
        })
        
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/categories')
def get_categories():
    try:
        with open('data/category.json') as f:
            categories = json.load(f)
        
        # Format categories for dropdown - show hierarchy
        formatted_categories = []
        for cat in categories:
            if cat['category_level'] == 'Level 1 Category':
                formatted_categories.append({
                    'id': cat['category_name'],
                    'name': cat['category_name'],
                    'level': 1
                })
            elif cat['connected_to']:
                formatted_categories.append({
                    'id': cat['category_name'],
                    'name': f"{cat['connected_to']} > {cat['category_name']}",
                    'level': 2 if cat['category_level'] == 'Level 2 Category' else 3
                })
        
        return jsonify(formatted_categories)
    except FileNotFoundError:
        return jsonify({'error': 'Categories file not found'}), 404

@app.route('/api/categories/level1')
def get_level1_categories():
    try:
        with open('data/category.json') as f:
            categories = json.load(f)
        
        # Get all level 1 categories
        level1_categories = [
            {
                'id': cat['category_name'],
                'name': cat['category_name'],
                'level': 1,
                'hasChildren': any(
                    subcat['category_level'] == 'Level 2 Category' and 
                    subcat['connected_to'] == cat['category_name']
                    for subcat in categories
                )
            }
            for cat in categories
            if cat['category_level'] == 'Level 1 Category'
        ]
        
        return jsonify(level1_categories)
    except FileNotFoundError:
        return jsonify({'error': 'Categories file not found'}), 404

@app.route('/api/categories/level2/<parent>')
def get_level2_categories(parent):
    try:
        with open('data/category.json') as f:
            categories = json.load(f)
        
        level2_categories = [
            {
                'id': cat['category_name'],
                'name': cat['category_name'],
                'level': 2,
                'hasChildren': any(
                    subcat['category_level'] == 'Level 3 Category' and 
                    subcat['connected_to'] == cat['category_name']
                    for subcat in categories
                )
            }
            for cat in categories
            if cat['category_level'] == 'Level 2 Category' and cat['connected_to'] == parent
        ]
        
        return jsonify(level2_categories)
    except FileNotFoundError:
        return jsonify({'error': 'Categories file not found'}), 404

@app.route('/api/categories/level3/<parent>')
def get_level3_categories(parent):
    try:
        with open('data/category.json') as f:
            categories = json.load(f)
        
        level3_categories = [
            {
                'id': cat['category_name'],
                'name': cat['category_name'],
                'level': 3,
                'hasChildren': False  # Level 3 categories don't have children
            }
            for cat in categories
            if cat['category_level'] == 'Level 3 Category' and cat['connected_to'] == parent
        ]
        
        return jsonify(level3_categories)
    except FileNotFoundError:
        return jsonify({'error': 'Categories file not found'}), 404

@app.route('/api/products/<product_id>/category/<category_id>', methods=['DELETE'])
def remove_category(product_id, category_id):
    """Remove a category from a product."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Update last_modified timestamp
        cursor.execute('''
            UPDATE product_categories 
            SET last_modified = CURRENT_TIMESTAMP 
            WHERE product_id = ?
        ''', (product_id,))
        
        # Remove category mapping
        cursor.execute('''
            DELETE FROM product_category_mapping 
            WHERE product_id = ? AND category_id = ?
        ''', (product_id, category_id))
        
        conn.commit()
        return jsonify({'message': 'Category removed successfully'})
    except sqlite3.Error as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/products/<product_id>/last-modified', methods=['GET'])
def get_product_last_modified(product_id):
    """Get the last modified timestamp for a product."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT last_modified 
        FROM product_categories 
        WHERE product_id = ?
    ''', (product_id,))
    
    result = cursor.fetchone()
    conn.close()
    
    if result:
        return jsonify({'last_modified': result['last_modified']})
    return jsonify({'error': 'Product not found'}), 404

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/categories/create', methods=['POST'])
def create_category():
    """Create a new category and add it to the category.json file."""
    try:
        data = request.get_json()
        print(f"Received data: {data}")  # Debug log
        
        if not data or 'name' not in data or 'level' not in data:
            print("Missing required fields")  # Debug log
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Validate level
        if data['level'] not in [1, 2, 3]:
            print(f"Invalid level: {data['level']}")  # Debug log
            return jsonify({'error': 'Invalid category level'}), 400
        
        # Validate parent for level 2 and 3
        if data['level'] > 1 and 'parent_id' not in data:
            print("Missing parent_id for level 2 or 3 category")  # Debug log
            return jsonify({'error': 'Parent category required for level 2 and 3 categories'}), 400
        
        try:
            # Read existing categories
            with open('data/category.json', 'r') as f:
                categories = json.load(f)
            
            # Check for duplicate category name
            existing_category = next((cat for cat in categories if cat['category_name'] == data['name']), None)
            if existing_category:
                print(f"Duplicate category name: {data['name']}")  # Debug log
                error_message = {
                    'error': 'Category name already exists',
                    'details': {
                        'existing_category': {
                            'name': existing_category['category_name'],
                            'level': existing_category['category_level'],
                            'parent': existing_category['connected_to']
                        },
                        'attempted_category': {
                            'name': data['name'],
                            'level': f'Level {data["level"]} Category',
                            'parent': data.get('parent_id')
                        }
                    }
                }
                return jsonify(error_message), 400
            
            # Create new category
            new_category = {
                'category_name': data['name'],
                'category_level': f'Level {data["level"]} Category',
                'connected_to': data.get('parent_id') if data['level'] > 1 else None
            }
            
            # Add to categories list
            categories.append(new_category)
            
            # Write back to file
            with open('data/category.json', 'w') as f:
                json.dump(categories, f, indent=2)
            
            print(f"Successfully created category: {new_category}")  # Debug log
            return jsonify({
                'message': 'Category created successfully',
                'category': new_category
            })
            
        except Exception as e:
            print(f"Error handling category file: {str(e)}")  # Debug log
            return jsonify({'error': str(e)}), 500
            
    except Exception as e:
        print(f"Error in create_category endpoint: {str(e)}")  # Debug log
        return jsonify({'error': str(e)}), 500

@app.route('/api/export/csv')
def export_csv():
    """Export product categories as CSV with streaming response."""
    def generate():
        # Yield CSV header
        yield 'product_id,product_name,categories\n'
        
        # Create new connection inside generator
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            # Existing query remains the same
            query = '''
                SELECT pc.product_id, pc.product_name,
                       COALESCE(GROUP_CONCAT(pcm.category_id, ','), '') AS category_ids
                FROM product_categories pc
                LEFT JOIN product_category_mapping pcm ON pc.product_id = pcm.product_id
                GROUP BY pc.product_id, pc.product_name
                ORDER BY LOWER(pc.product_name)
            '''
            
            cursor.execute(query)
            
            # Load categories and create lookup set
            with open('data/category.json') as f:
                categories = json.load(f)
            valid_categories = {cat['category_name'] for cat in categories}
            
            for row in cursor:
                category_ids = row['category_ids'].split(',') if row['category_ids'] else []
                
                # Get only leaf category names (no hierarchy)
                formatted_categories = [
                    cat_id for cat_id in category_ids
                    if cat_id in valid_categories  # Ensure category exists
                ]
                
                # Proper CSV escaping
                product_id = row["product_id"].replace('"', '""')
                product_name = row["product_name"].replace('"', '""')
                # Modified category formatting
                cats = ", ".join(c.replace('"', '""') for c in formatted_categories) if formatted_categories else "No Categories"
                
                # Single cell for all categories
                yield f'"{product_id}","{product_name}","{cats}"\n'
                
        finally:
            conn.close()

    try:
        return app.response_class(
            generate(),
            mimetype='text/csv',
            headers={'Content-Disposition': 'attachment; filename=product_categories.csv'}
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Enable network access
    app.run(
        host='0.0.0.0',  # Listen on all network interfaces
        port=5000,       # Default Flask port
        debug=True       # Enable debug mode for development
    )
