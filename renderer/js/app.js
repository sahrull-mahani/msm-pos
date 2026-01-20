window.mainApp = function () {
    // 1. Cek data di storage dengan proteksi maksimal
    const rawUser = localStorage.getItem('userData')
    const savedUser = rawUser ? JSON.parse(rawUser) : { username: 'Guest', role_name: 'kasir' }
    const savedLogin = localStorage.getItem('isLoggedIn') === 'true'

    return {
        isLoggedIn: savedLogin,
        user: savedUser,
        currentPage: '',
        content: '',

        init() {
            window.app = this

            // 2. Jika tidak login, paksa ke login. Jika login, ke dashboard
            this.currentPage = this.isLoggedIn ? 'dashboard' : 'login'

            console.log('Aplikasi dimulai di halaman:', this.currentPage)
            this.loadPage(this.currentPage)

            this.$watch('currentPage', (val) => {
                if (val) this.loadPage(val)
            })
        },

        // Fungsi pengecekan role yang aman
        hasRole(roles) {
            // Jika user belum login atau tidak punya role, jangan beri akses apa pun
            if (!this.user || !this.user.role_name) return false

            const userRole = this.user.role_name.toLowerCase()

            // Jika input 'roles' adalah string (misal: 'owner')
            if (typeof roles === 'string') {
                return userRole === roles.toLowerCase()
            }

            // Jika input 'roles' adalah array (misal: ['owner', 'admin'])
            return roles.map(r => r.toLowerCase()).includes(userRole)
        },

        async loadPage(page) {
            try {
                const resp = await fetch(`pages/${page}.html`)
                if (!resp.ok) throw new Error('Halaman tidak ditemukan')

                const html = await resp.text()
                this.content = html

                // Trigger refresh data untuk komponen halaman
                setTimeout(() => {
                    if (window.appData && typeof window.appData.refresh === 'function') {
                        window.appData.refresh()
                    }
                }, 100)
            } catch (err) {
                console.error('Gagal memuat halaman:', err)
                // Jika error parah, balikkan ke login
                if (page !== 'login') this.currentPage = 'login'
            }
        },

        async login(username, password) {
            const res = await window.api.login({ username, password })
            if (res.success) {
                this.isLoggedIn = true
                this.user = res.user
                localStorage.setItem('isLoggedIn', 'true')
                localStorage.setItem('userData', JSON.stringify(res.user))
                this.currentPage = 'dashboard'
                window.ui.toast('Selamat Datang!')
            } else {
                window.ui.error('Login Gagal', res.message)
            }
        },

        async logout() {
            const yakin = await window.ui.confirm('Logout', 'Yakin ingin keluar?')
            if (yakin) {
                localStorage.clear()
                this.isLoggedIn = false
                this.user = { username: 'Guest', role_name: 'kasir' }
                this.currentPage = 'login'
                // Paksa reload agar state benar-benar bersih
                location.reload()
            }
        }
    }
}