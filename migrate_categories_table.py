import sqlite3
import os

DB_PATH = 'data/products.db'

def migrate_categories_table():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Check if the categories table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='categories'")
    if cursor.fetchone() is None:
        print("No existing 'categories' table found. Nothing to migrate.")
        conn.close()
        return
    
    # Create new table with correct schema
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS categories_new (
            id TEXT PRIMARY KEY,
            category_level TEXT,
            connected_to TEXT
        )
    ''')
    
    # Copy over existing IDs (if any)
    try:
        cursor.execute('SELECT id FROM categories')
        rows = cursor.fetchall()
        for row in rows:
            cursor.execute('''
                INSERT OR IGNORE INTO categories_new (id) VALUES (?)
            ''', (row[0],))
    except Exception as e:
        print(f"Warning: Could not copy existing IDs: {e}")
    
    # Drop old table and rename new one
    cursor.execute('DROP TABLE categories')
    cursor.execute('ALTER TABLE categories_new RENAME TO categories')
    conn.commit()
    conn.close()
    print("Migrated 'categories' table to new schema.")

if __name__ == '__main__':
    migrate_categories_table() 