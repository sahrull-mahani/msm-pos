window.mainApp = function () {
    return {
        isLoggedIn: localStorage.getItem('isLoggedIn') === 'true',
        currentPage: '',
        content: '',
        products: [], // Properti untuk menampung data produk

        init() {
            // Tentukan halaman awal berdasarkan status login
            this.currentPage = this.isLoggedIn ? 'dashboard' : 'login'

            // Muat halaman pertama kali
            this.loadPage(this.currentPage)

            // Pantau perubahan halaman
            this.$watch('currentPage', (val) => {
                this.loadPage(val)
            })

            window.app = this
        },

        async loadPage(page) {
            try {
                const resp = await fetch(`pages/${page}.html`)
                if (!resp.ok) throw new Error('Halaman tidak ditemukan')

                this.content = await resp.text()

                // Beri jeda agar DOM terisi sebelum refresh data halaman terkait
                setTimeout(() => {
                    if (window.appData && typeof window.appData.refresh === 'function') {
                        window.appData.refresh()
                    }
                }, 100)
            } catch (err) {
                console.error('Gagal memuat halaman:', err)
                window.ui.error('Navigasi Error', 'Gagal memuat halaman ' + page)
            }
        },

        async login(username, password) {
            try {
                const response = await window.api.login({ username, password })

                if (response.success) {
                    this.isLoggedIn = true
                    localStorage.setItem('isLoggedIn', 'true')
                    // Simpan data user jika perlu
                    if (response.user) localStorage.setItem('userData', JSON.stringify(response.user))

                    this.currentPage = 'dashboard'
                    window.ui.toast('Selamat datang kembali!')
                } else {
                    window.ui.error('Login Gagal', response.message)
                }
            } catch (err) {
                window.ui.error('Sistem Error', 'Gagal terhubung ke layanan login')
            }
        },

        async logout() {
            const yakin = await window.ui.confirm('Konfirmasi Logout', 'Apakah Anda yakin ingin keluar dari aplikasi?')

            if (yakin) {
                // 1. Bersihkan storage
                localStorage.removeItem('isLoggedIn')
                localStorage.removeItem('userData')

                // 2. Update state internal
                this.isLoggedIn = false

                // 3. Panggil API main process jika ada pembersihan session khusus
                if (window.api.clearSession) {
                    await window.api.clearSession()
                }

                // 4. Kembali ke halaman login (SPA mode)
                this.currentPage = 'login'

                window.ui.toast('Berhasil keluar', 'info')
            }
        },

        async fetchProducts() {
            try {
                const data = await window.api.getProducts()
                this.products = data
            } catch (err) {
                console.error('Gagal fetch products:', err)
            }
        }
    }
}