import sqlite3

def initialize_database():
    """Initialize the products database and create necessary tables."""
    conn = sqlite3.connect('data/products-MSI.db')
    cursor = conn.cursor()
    
    try:
        # Start transaction
        cursor.execute('BEGIN TRANSACTION')
        
        # Create product categories table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS product_categories (
                product_id TEXT PRIMARY KEY,
                product_name TEXT NOT NULL
            )
        ''')
        
        # Create product category mapping table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS product_category_mapping (
                product_id TEXT,
                category_id TEXT,
                PRIMARY KEY (product_id, category_id),
                FOREIGN KEY (product_id) REFERENCES product_categories(product_id)
            )
        ''')
        
        # Commit transaction
        conn.commit()
        print("Database initialized successfully!")
        
    except Exception as e:
        # Rollback on error
        conn.rollback()
        print(f"Error during database initialization: {str(e)}")
        raise
    
    finally:
        conn.close()

if __name__ == '__main__':
    initialize_database()