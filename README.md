# MSM POS (Point of Sales)

MSM POS adalah aplikasi **Point of Sales (POS)** berbasis desktop yang dibangun menggunakan **Electron JS**. Aplikasi ini dirancang untuk membantu pengelolaan transaksi penjualan secara cepat, modern, dan mudah digunakan, dengan antarmuka ringan dan responsif.

Aplikasi ini cocok digunakan untuk toko retail, UMKM, maupun kebutuhan kasir sederhana hingga menengah.

---

## 🚀 Teknologi yang Digunakan

MSM POS dibangun dengan kombinasi teknologi modern berikut:

* **Electron JS**
  Digunakan untuk membangun aplikasi desktop lintas platform (Windows, macOS, Linux) menggunakan teknologi web.

* **Alpine.js**
  Framework JavaScript ringan untuk mengelola interaksi dan state UI secara reaktif tanpa kompleksitas berlebih.

* **Tailwind CSS**
  Utility-first CSS framework untuk membangun tampilan UI yang konsisten, modern, dan responsif dengan cepat.

* **SweetAlert2**
  Digunakan untuk menampilkan alert, konfirmasi, dan notifikasi interaktif yang elegan (contoh: konfirmasi hapus data, notifikasi sukses/gagal).

---

## ✨ Fitur Utama

* 📦 Manajemen Produk
* 🧾 Transaksi Penjualan
* 💰 Perhitungan Total & Kembalian Otomatis
* 🛒 Keranjang Belanja Dinamis
* 🔔 Notifikasi Interaktif (SweetAlert2)
* 🎨 UI Modern & Responsif (Tailwind CSS)
* ⚡ Performa Cepat & Ringan
* 🖥️ Aplikasi Desktop (Offline-ready)

---

## 📂 Struktur Proyek

Berikut adalah struktur folder utama pada aplikasi **MSM POS**:

```
electron-pos/
│
├── main/
│   ├── main.js                # Entry point main process Electron
│   ├── database/
│   │   ├── sqlite.js          # Konfigurasi & koneksi database SQLite
│   │   └── migrations/        # File migrasi database
│   ├── services/              # Service layer (hardware & integration)
│   │   ├── printer.service.js      # Service printer struk
│   │   ├── cashdrawer.service.js   # Service cash drawer
│   │   ├── barcode.service.js      # Service barcode scanner
│   │   └── poledisplay.service.js  # Service pole display
│   └── ipc/                   # IPC handler (Main ↔ Renderer)
│       ├── auth.ipc.js        # IPC autentikasi
│       ├── transaction.ipc.js # IPC transaksi penjualan
│       └── product.ipc.js     # IPC manajemen produk
│
├── renderer/
│   ├── index.html             # Entry UI renderer process
│   ├── assets/                # Asset statis (icons, images, fonts)
│   ├── alpine/                # Alpine.js store & state management
│   │   ├── auth.store.js
│   │   ├── cart.store.js
│   │   └── user.store.js
│   └── pages/                 # Halaman aplikasi
│       ├── login.html
│       ├── pos.html
│       ├── products.html
│       ├── users.html
│       └── reports.html
│
└── package.json               # Konfigurasi dependency & script
```

---

## 🛠️ Instalasi & Menjalankan Aplikasi

Ikuti langkah-langkah berikut untuk menginstal dan menjalankan **MSM POS** di lingkungan development.

### 1️⃣ Install Node.js

Pastikan **Node.js** sudah terpasang di komputer Anda.

* Disarankan menggunakan **Node.js versi LTS**
* Cek instalasi dengan perintah:

```bash
node -v
npm -v
```

---

### 2️⃣ Clone Project

Clone repository MSM POS ke komputer lokal:

```bash
git clone https://github.com/username/msm-pos.git
cd electron-pos
```

---

### 3️⃣ Install Dependency

Install seluruh dependency yang dibutuhkan:

```bash
npm install
# atau
npm i
```

---

### 4️⃣ Seed Database Produk

Jalankan perintah berikut untuk mengisi data produk awal ke database:

```bash
npm run db:seed-products
```

Perintah ini akan membuat data produk default untuk keperluan testing dan development.

---

### 5️⃣ Post Install Setup

Jalankan script post-install untuk setup tambahan (build native module, konfigurasi Electron, dll):

```bash
npm run postinstall
```

---

### 6️⃣ Jalankan Aplikasi (Development Mode)

Untuk menjalankan aplikasi dalam mode development:

```bash
npm run dev
```

Aplikasi **MSM POS** akan terbuka sebagai aplikasi desktop.

---

### 2. Install Dependency

```bash
npm install
```

### 3. Jalankan Aplikasi (Development)

```bash
npm run dev
```

### 4. Build Aplikasi

```bash
npm run build
```

---

## 🎯 Tujuan Pengembangan

MSM POS dikembangkan dengan tujuan:

* Memberikan solusi POS desktop yang sederhana dan efisien
* Mudah dikustomisasi dan dikembangkan lebih lanjut
* Cocok untuk UMKM dan bisnis skala kecil hingga menengah
* Menggunakan teknologi web modern tanpa framework berat

---

## 📌 Catatan

* Aplikasi ini dapat dikembangkan lebih lanjut dengan fitur seperti:

  * Manajemen user & role
  * Laporan penjualan (harian/bulanan)
  * Integrasi database (SQLite / MySQL / IndexedDB)
  * Export data ke PDF / Excel

---

## 👨‍💻 Author

**MSM**

---

## 📄 Lisensi

Proyek ini bersifat open-source dan dapat digunakan serta dimodifikasi sesuai kebutuhan.

---

> MSM POS – Simple, Fast, and Modern Point of Sales Application
