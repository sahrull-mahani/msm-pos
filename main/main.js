const { app, BrowserWindow } = require('electron')
const path = require('path')
const { initAuthIPC } = require('./ipc/auth.ipc.js')
const { initProductsIPC } = require('./ipc/products.ipc.js')

function createWindow() {
  // Membuat jendela browser utama
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // Mengarahkan ke file preload jika dibutuhkan di masa depan
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    }
  })

  // Memuat file HTML dari folder renderer
  // Kita menggunakan path.join agar kompatibel dengan Windows dan Linux/Mac
  win.loadFile(path.join(__dirname, '../renderer/index.html'))
}

// Jalankan fungsi createWindow saat Electron siap
app.whenReady().then(() => {
  initAuthIPC()
  initProductsIPC()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Menutup aplikasi saat semua jendela ditutup (kecuali di macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})