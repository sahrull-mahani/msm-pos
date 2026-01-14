const { app } = require('electron')
const Database = require('better-sqlite3')
const path = require('path')

// Tunggu sampai Electron siap (meskipun ini headless)
app.whenReady().then(() => {
    runSeeder()
})

function runSeeder() {
    try {
        console.log('--- Memulai Seeding Produk & Kategori ---')
        
        // Path tetap sama, arahkan ke root project
        const dbPath = path.join(__dirname, '../../../msm_pos.db')
        const db = new Database(dbPath)

        // 1. Pastikan Tabel Tersedia
        db.exec(`
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
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
            );
        `)

        // 2. Seed Kategori
        const insertCat = db.prepare('INSERT OR IGNORE INTO categories (name) VALUES (?)')
        insertCat.run('Makanan')
        insertCat.run('Minuman')
        insertCat.run('Snack')

        const foodId = db.prepare('SELECT id FROM categories WHERE name = ?').get('Makanan').id
        const drinkId = db.prepare('SELECT id FROM categories WHERE name = ?').get('Minuman').id
        const snackId = db.prepare('SELECT id FROM categories WHERE name = ?').get('Snack').id

        // 3. Seed Produk
        const insertProd = db.prepare(`
            INSERT OR IGNORE INTO products (barcode, sku, name, category_id, price, cost, stock, min_stock)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `)

        insertProd.run('8990001', 'F001', 'Nasi Goreng Spesial', foodId, 25000, 15000, 50, 5)
        insertProd.run('8990002', 'D001', 'Es Teh Manis', drinkId, 5000, 2000, 100, 10)
        insertProd.run('8990003', 'S001', 'Keripik Singkong', snackId, 10000, 6000, 30, 5)

        console.log('✅ Berhasil: Database telah diisi')
        app.quit() // Keluar dari proses Electron setelah selesai
    } catch (error) {
        console.error('❌ Gagal Seeding:', error.message)
        app.exit(1)
    }
}