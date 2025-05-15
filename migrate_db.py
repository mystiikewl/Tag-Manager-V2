import sqlite3
import os

def get_db_connection():
    """Get a database connection."""
    conn = sqlite3.connect('data/products.db')
    conn.row_factory = sqlite3.Row
    return conn

def migrate_to_multiple_categories():
    """Migrate the database to support multiple categories per product."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Start transaction
        cursor.execute('BEGIN TRANSACTION')
        
        # Create new junction table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS product_category_mapping (
                product_id TEXT,
                category_id TEXT,
                PRIMARY KEY (product_id, category_id),
                FOREIGN KEY (product_id) REFERENCES product_categories(product_id)
            )
        ''')
        
        # Migrate existing category assignments
        cursor.execute('''
            INSERT INTO product_category_mapping (product_id, category_id)
            SELECT product_id, category_id
            FROM product_categories
            WHERE category_id IS NOT NULL
        ''')
        
        # Remove the single category column
        cursor.execute('''
            CREATE TABLE product_categories_new (
                product_id TEXT PRIMARY KEY,
                product_name TEXT NOT NULL
            )
        ''')
        
        cursor.execute('''
            INSERT INTO product_categories_new (product_id, product_name)
            SELECT product_id, product_name
            FROM product_categories
        ''')
        
        cursor.execute('DROP TABLE product_categories')
        cursor.execute('ALTER TABLE product_categories_new RENAME TO product_categories')
        
        # Commit transaction
        conn.commit()
        print("Migration completed successfully!")
        
    except Exception as e:
        # Rollback on error
        conn.rollback()
        print(f"Error during migration: {str(e)}")
        raise
    
    finally:
        conn.close()

if __name__ == '__main__':
    migrate_to_multiple_categories() 