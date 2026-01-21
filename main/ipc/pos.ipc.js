const { ipcMain } = require('electron')
const Database = require('better-sqlite3')
const path = require('path')

const dbPath = path.join(__dirname, '../../msm_pos.db')
const db = new Database(dbPath)

function initPosIPC() {
    // === MIGRASI OTOMATIS: Membuat tabel jika belum ada ===
    try {
        // Tabel Header Transaksi
        db.prepare(`
            CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                total_price REAL NOT NULL,
                cash_amount REAL NOT NULL,
                change_amount REAL NOT NULL,
                user_id INTEGER,
                created_at DATETIME DEFAULT (datetime('now', 'localtime'))
            )
        `).run()

        // Tabel Detail Transaksi
        db.prepare(`
            CREATE TABLE IF NOT EXISTS transaction_details (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                transaction_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                qty INTEGER NOT NULL,
                price REAL NOT NULL,
                subtotal REAL NOT NULL,
                FOREIGN KEY (transaction_id) REFERENCES transactions (id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products (id)
            )
        `).run()
        
        console.log('Migration Success: Transactions tables are ready.')
    } catch (err) {
        console.error('Migration Error:', err)
    }

    // === HANDLER: Cari produk ===
    ipcMain.handle('pos:search-product', async (event, query) => {
        try {
            const cleanQuery = String(query || '').trim()
            if (!cleanQuery) return []

            const stmt = db.prepare(`
                SELECT * FROM products 
                WHERE (CAST(barcode AS TEXT) = ? OR barcode LIKE ? OR name LIKE ?) 
                AND stock > 0 
                AND is_active = '1'
                LIMIT 10
            `)
            
            const searchPattern = `%${cleanQuery}%`
            return stmt.all(cleanQuery, searchPattern, searchPattern)
        } catch (error) {
            console.error('Pencarian Error:', error)
            return []
        }
    })

    // === HANDLER: Simpan Transaksi ===
    ipcMain.handle('pos:save-transaction', async (event, data) => {
        const { items, total_price, cash_amount, change_amount, user_id } = data
        
        // Gunakan Database Transaction agar data konsisten (All or Nothing)
        const runTransaction = db.transaction(() => {
            // 1. Insert ke table transactions
            const info = db.prepare(`
                INSERT INTO transactions (total_price, cash_amount, change_amount, user_id)
                VALUES (?, ?, ?, ?)
            `).run(total_price, cash_amount, change_amount, user_id)

            const transactionId = info.lastInsertRowid

            // 2. Siapkan statement untuk detail dan update stok
            const insertDetail = db.prepare(`
                INSERT INTO transaction_details (transaction_id, product_id, qty, price, subtotal)
                VALUES (?, ?, ?, ?, ?)
            `)
            const updateStock = db.prepare(`
                UPDATE products SET stock = stock - ? WHERE id = ?
            `)

            // 3. Loop item dalam keranjang
            for (const item of items) {
                insertDetail.run(transactionId, item.id, item.qty, item.price, (item.price * item.qty))
                updateStock.run(item.qty, item.id)
            }
            return transactionId
        })

        try {
            const resultId = runTransaction()
            return { success: true, transactionId: resultId }
        } catch (error) {
            console.error('Save Transaction Error:', error)
            return { success: false, message: error.message }
        }
    })
}

module.exports = initPosIPC