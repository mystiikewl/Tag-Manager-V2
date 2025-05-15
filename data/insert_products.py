import sqlite3
import csv

def insert_products():
    """Insert products into the database from the CSV file."""
    conn = sqlite3.connect('data/products-MSI.db')
    cursor = conn.cursor()
    
    try:
        # Open the CSV file
        with open('data/input_file.csv', newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            
            for row in reader:
                # Insert product into product_categories table
                cursor.execute('''
                    INSERT INTO product_categories (product_id, product_name)
                    VALUES (?, ?)
                ''', (row['Handle'], row['Title']))
                
                # Insert into product_category_mapping if applicable
                if row['Product Category']:
                    cursor.execute('''
                        INSERT INTO product_category_mapping (product_id, category_id)
                        VALUES (?, ?)
                    ''', (row['Handle'], row['Product Category']))
        
        # Commit transaction
        conn.commit()
        print("Products inserted successfully!")
        
    except Exception as e:
        # Rollback on error
        conn.rollback()
        print(f"Error during product insertion: {str(e)}")
        raise
    
    finally:
        conn.close()

if __name__ == '__main__':
    insert_products()