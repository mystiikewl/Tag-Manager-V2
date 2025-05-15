import sqlite3

def clear_database():
    """Clear the existing products database."""
    conn = sqlite3.connect('data/products-MSI.db')
    cursor = conn.cursor()
    
    try:
        # Start transaction
        cursor.execute('BEGIN TRANSACTION')
        
        # Drop existing tables if they exist
        cursor.execute('DROP TABLE IF EXISTS product_categories')
        cursor.execute('DROP TABLE IF EXISTS product_category_mapping')
        
        # Commit transaction
        conn.commit()
        print("Database cleared successfully!")
        
    except Exception as e:
        # Rollback on error
        conn.rollback()
        print(f"Error during clearing database: {str(e)}")
        raise
    
    finally:
        conn.close()

if __name__ == '__main__':
    clear_database()