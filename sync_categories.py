import sqlite3
import json
import os

DB_PATH = 'data/products.db'
CATEGORY_JSON = 'data/category.json'

def ensure_categories_table():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS categories (
            id TEXT PRIMARY KEY,
            category_level TEXT,
            connected_to TEXT
        )
    ''')
    conn.commit()
    conn.close()

def sync_categories():
    if not os.path.exists(CATEGORY_JSON):
        print(f"{CATEGORY_JSON} not found.")
        return
    
    with open(CATEGORY_JSON, 'r') as f:
        categories = json.load(f)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    for cat in categories:
        cat_id = cat['category_name']
        cat_level = cat['category_level']
        connected_to = cat['connected_to']
        # Insert or ignore if already exists
        cursor.execute('''
            INSERT OR IGNORE INTO categories (id, category_level, connected_to)
            VALUES (?, ?, ?)
        ''', (cat_id, cat_level, connected_to))
    
    conn.commit()
    conn.close()
    print(f"Synced {len(categories)} categories from {CATEGORY_JSON} to database.")

if __name__ == '__main__':
    ensure_categories_table()
    sync_categories() 