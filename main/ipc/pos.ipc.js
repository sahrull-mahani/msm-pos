const { ipcMain } = require('electron')
const db = require('../db')

function initPosIPC() {
    // Cari produk
    ipcMain.handle('pos:search-product', async (event, query) => {
        try {
            const stmt = db.prepare(`
                SELECT * FROM products 
                WHERE (barcode = ? OR name LIKE ?) AND stock > 0 AND status = 'active'
                LIMIT 10
            `)
            return stmt.all(query, `%${query}%`)
        } catch (error) {
            return []
        }
    })

    // Simpan Transaksi Lengkap
    ipcMain.handle('pos:save-transaction', async (event, data) => {
        const { items, total_price, cash_amount, change_amount, user_id } = data;

        // Gunakan Transaction (Begin/Commit) agar jika satu gagal, semua batal
        const transaction = db.transaction(() => {
            // 1. Simpan Header Transaksi
            const info = db.prepare(`
                INSERT INTO transactions (total_price, cash_amount, change_amount, user_id, created_at)
                VALUES (?, ?, ?, ?, datetime('now', 'localtime'))
            `).run(total_price, cash_amount, change_amount, user_id);

            const transactionId = info.lastInsertRowid;

            // 2. Simpan Detail & Update Stok
            const insertDetail = db.prepare(`
                INSERT INTO transaction_details (transaction_id, product_id, qty, price, subtotal)
                VALUES (?, ?, ?, ?, ?)
            `);

            const updateStock = db.prepare(`
                UPDATE products SET stock = stock - ? WHERE id = ?
            `);

            for (const item of items) {
                // Simpan detail
                insertDetail.run(transactionId, item.id, item.qty, item.price, (item.price * item.qty));
                // Potong stok
                updateStock.run(item.qty, item.id);
            }

            return transactionId;
        });

        try {
            const resultId = transaction();
            return { success: true, transactionId: resultId };
        } catch (error) {
            console.error("Database Error:", error);
            return { success: false, message: error.message };
        }
    })
}

module.exports = initPosIPC