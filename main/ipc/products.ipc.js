const { ipcMain } = require('electron')
const Database = require('better-sqlite3')
const path = require('path')

const dbPath = path.join(__dirname, '../../msm_pos.db')
const db = new Database(dbPath)

function initProductsIPC() {
    // Buat Tabel Category
    db.exec(`
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `)

    // Buat Tabel Produk (dengan foreign key category_id)
    db.exec(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            barcode TEXT UNIQUE,
            sku TEXT,
            name TEXT NOT NULL,
            category_id INTEGER,
            price INTEGER NOT NULL,
            cost INTEGER DEFAULT 0,
            stock INTEGER DEFAULT 0,
            min_stock INTEGER DEFAULT 0,
            is_active INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES categories (id)
        )
    `)

    // Handler ambil kategori untuk dropdown di form
    ipcMain.handle('categories:get-all', async () => {
        return db.prepare('SELECT * FROM categories ORDER BY name ASC').all()
    })

    // Handler Tambah Kategori
    ipcMain.handle('categories:add', async (event, name) => {
        try {
            const stmt = db.prepare('INSERT INTO categories (name) VALUES (?)')
            const info = stmt.run(name)
            return { success: true, id: info.lastInsertRowid }
        } catch (error) {
            return { success: false, message: error.message }
        }
    })

    ipcMain.handle('products:get-all', async () => {
        try {
            // Ambil semua kolom agar x-text di Alpine.js bisa membacanya
            return db.prepare('SELECT * FROM products WHERE is_active = 1 ORDER BY id DESC').all()
        } catch (error) {
            console.error('Error fetching products:', error)
            return []
        }
    })

    // Handler untuk menambah produk baru
    ipcMain.handle('products:add', async (event, product) => {
        try {
            const stmt = db.prepare(`
                INSERT INTO products (barcode, sku, name, category_id, price, cost, stock, min_stock)
                VALUES (@barcode, @sku, @name, @category_id, @price, @cost, @stock, @min_stock)
            `)
            const info = stmt.run(product)
            return { success: true, id: info.lastInsertRowid }
        } catch (error) {
            return { success: false, message: error.message }
        }
    })

    // Handler untuk update produk
    ipcMain.handle('products:update', async (event, product) => {
        try {
            const stmt = db.prepare(`
                UPDATE products SET 
                barcode = @barcode, sku = @sku, name = @name, 
                category_id = @category_id, price = @price, 
                cost = @cost, stock = @stock, min_stock = @min_stock 
                WHERE id = @id
            `)
            stmt.run(product)
            return { success: true }
        } catch (error) {
            return { success: false, message: error.message }
        }
    })

    // Handler untuk delete produk
    ipcMain.handle('products:delete', async (event, id) => {
        try {
            // Gunakan tanda tanya (?) untuk parameter posisi
            const stmt = db.prepare(`UPDATE products SET is_active = 0 WHERE id = ?`)
            stmt.run(id) // Langsung masukkan nilainya
            return { success: true }
        } catch (error) {
            return { success: false, message: error.message }
        }
    })
}

module.exports = { initProductsIPC }