const { ipcMain } = require('electron')
const db = require('../db')

function initPosIPC() {
    // Cari produk untuk kasir
    ipcMain.handle('pos:search-product', async (event, query) => {
        try {
            const stmt = db.prepare(`
                SELECT * FROM products 
                WHERE (barcode = ? OR name LIKE ?) AND stock > 0 
                LIMIT 10
            `)
            return stmt.all(query, `%${query}%`)
        } catch (error) {
            return []
        }
    })

    // Simpan Transaksi (Placeholder untuk nanti)
    ipcMain.handle('pos:save-transaction', async (event, data) => {
        // Logika simpan ke tabel transactions & transaction_details
        return { success: true }
    })
}

module.exports = initPosIPC