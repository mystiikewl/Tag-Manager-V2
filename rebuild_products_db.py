import sqlite3
import csv

# Create a new SQLite database
conn = sqlite3.connect('data/products.db')
cursor = conn.cursor()

# Create tables
cursor.execute('''
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    handle TEXT,
    title TEXT,
    body_html TEXT,
    vendor TEXT,
    product_category TEXT,
    type TEXT,
    tags TEXT,
    published BOOLEAN,
    option1_name TEXT,
    option1_value TEXT,
    variant_sku TEXT,
    variant_price REAL,
    variant_inventory_policy TEXT,
    last_updated TEXT
)
''')

# Read data from the CSV file and insert into the database
with open('data/input_file.csv', 'r', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        cursor.execute('''
        INSERT INTO products (handle, title, body_html, vendor, product_category, type, tags, published, option1_name, option1_value, variant_sku, variant_price, variant_inventory_policy, last_updated)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'deny', ?)
        ''', (row['Handle'], row['Title'], row['Body (HTML)'], row['Vendor'], row['Product Category'], row['Type'], row['Current Tags'], row['Published'], row['Option1 Name'], row['Option1 Value'], row['Variant SKU'], row['Variant Price'], row['Last Updated']))

# Commit changes and close the connection
conn.commit()
conn.close()