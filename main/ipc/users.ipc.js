const { ipcMain } = require('electron')
const Database = require('better-sqlite3')
const db = new Database('msm_pos.db')

function initUsersIPC() {
    // Ambil semua user beserta nama rolenya
    ipcMain.handle('users:get-all', async () => {
        return db.prepare(`
            SELECT users.id, users.username, roles.name as role_name, users.role_id 
            FROM users 
            JOIN roles ON users.role_id = roles.id
        `).all()
    })

    // Ambil daftar role untuk dropdown
    ipcMain.handle('users:get-roles', async () => {
        return db.prepare('SELECT * FROM roles').all()
    })

    // Tambah user baru
    ipcMain.handle('users:create', async (event, { username, password, role_id }) => {
        try {
            const stmt = db.prepare('INSERT INTO users (username, password, role_id) VALUES (?, ?, ?)')
            const info = stmt.run(username, password, role_id)
            return { success: true, id: info.lastInsertRowid }
        } catch (error) {
            return { success: false, message: error.message }
        }
    })

    // Handler Update User
    ipcMain.handle('users:update', async (event, { id, username, password, role_id }) => {
        try {
            if (password && password.trim() !== "") {
                // Update termasuk password
                db.prepare('UPDATE users SET username = ?, password = ?, role_id = ? WHERE id = ?').run(username, password, role_id, id)
            } else {
                // Update tanpa password
                db.prepare('UPDATE users SET username = ?, role_id = ? WHERE id = ?').run(username, role_id, id)
            }
            return { success: true }
        } catch (error) {
            return { success: false, message: error.message }
        }
    })

    // Hapus user
    ipcMain.handle('users:delete', async (event, id) => {
        try {
            db.prepare('DELETE FROM users WHERE id = ?').run(id)
            return { success: true }
        } catch (error) {
            return { success: false, message: error.message }
        }
    })
}

module.exports = { initUsersIPC }