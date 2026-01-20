const { ipcMain } = require('electron')
const Database = require('better-sqlite3')
const path = require('path')

const db = new Database('msm_pos.db')

function initAuthIPC() {
    // 1. Setup Tabel Roles dan Users dengan Role
    db.exec(`
        CREATE TABLE IF NOT EXISTS roles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL
        );

        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            role_id INTEGER REFERENCES roles(id)
        );
    `)

    // 2. Isi Role Default jika masih kosong
    const roleCount = db.prepare('SELECT count(*) as count FROM roles').get().count
    if (roleCount === 0) {
        db.prepare("INSERT INTO roles (name) VALUES ('owner'), ('admin'), ('kasir')").run()
    }

    // 3. Tambah User Owner Default jika kosong
    const userCount = db.prepare('SELECT count(*) as count FROM users').get().count
    if (userCount === 0) {
        const ownerRole = db.prepare("SELECT id FROM roles WHERE name = 'owner'").get()
        db.prepare('INSERT INTO users (username, password, role_id) VALUES (?, ?, ?)')
            .run('admin', 'admin123', ownerRole.id)
    }

    // 4. Handler Login (Sekarang mengambil data role_name)
    ipcMain.handle('auth:login', async (event, { username, password }) => {
        try {
            // Query ini menggabungkan tabel users dan roles
            const user = db.prepare(`
            SELECT users.id, users.username, roles.name as role_name 
            FROM users 
            JOIN roles ON users.role_id = roles.id 
            WHERE users.username = ? AND users.password = ?
        `).get(username, password)

            if (user) {
                return { success: true, user }
            } else {
                return { success: false, message: 'Username atau Password salah!' }
            }
        } catch (error) {
            return { success: false, message: 'Database error: ' + error.message }
        }
    })

    // 5. Handler untuk membersihkan session (opsional)
    ipcMain.handle('auth:clear-session', async () => {
        return { success: true }
    })
}

module.exports = { initAuthIPC }