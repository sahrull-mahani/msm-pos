const { ipcMain } = require('electron')
const Database = require('better-sqlite3')
const path = require('path')

// Pastikan path database benar (disimpan di root project)
const db = new Database('msm_pos.db')

function initAuthIPC() {
    // Setup awal tabel
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )
    `)

    // Tambah admin default jika kosong
    const userCount = db.prepare('SELECT count(*) as count FROM users').get().count
    if (userCount === 0) {
        db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run('admin', 'admin123')
    }

    // Handler Login
    ipcMain.handle('auth:login', async (event, { username, password }) => {
        try {
            const user = db.prepare('SELECT id, username FROM users WHERE username = ? AND password = ?')
                .get(username, password)

            if (user) {
                return { success: true, user }
            } else {
                return { success: false, message: 'Username atau Password salah!' }
            }
        } catch (error) {
            return { success: false, message: 'Database error: ' + error.message }
        }
    })
}

module.exports = { initAuthIPC }