window.posPage = function () {
    return {
        searchQuery: '',
        searchResults: [],
        cart: [],
        total: 0,
        cash: 0,
        change: 0,
        isLoading: false,
        user: null,

        async init() {
            window.appData = this

            // Mengambil referensi data user dari mainApp
            if (window.mainAppData) {
                this.user = window.mainAppData.user
            }

            // Fokus otomatis ke input pencarian
            setTimeout(() => {
                const input = document.querySelector('#input-search')
                if (input) input.focus()
            }, 300)
        },

        goToDashboard() {
            if (window.mainAppData) {
                window.mainAppData.currentPage = 'dashboard'
            }
        },

        async searchProduct() {
            if (this.searchQuery.length < 2) {
                this.searchResults = []
                return
            }
            this.searchResults = await window.api.searchProduct(this.searchQuery)
        },

        addToCart(product) {
            const existing = this.cart.find(item => item.id === product.id)
            if (existing) {
                if (existing.qty < product.stock) {
                    existing.qty++
                } else {
                    window.ui.warning('Stok Limit', 'Hanya tersedia ' + product.stock)
                }
            } else {
                this.cart.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    qty: 1,
                    stock: product.stock
                })
            }
            this.searchQuery = ''
            this.searchResults = []
            this.calculateTotal()
        },

        updateQty(index, amount) {
            const item = this.cart[index]
            const newQty = item.qty + amount
            if (newQty > 0 && newQty <= item.stock) {
                item.qty = newQty
            } else if (newQty > item.stock) {
                window.ui.warning('Stok terbatas', 'Stok tidak mencukupi')
            } else if (newQty <= 0) {
                this.removeFromCart(index)
            }
            this.calculateTotal()
        },

        removeFromCart(index) {
            this.cart.splice(index, 1)
            this.calculateTotal()
        },

        calculateTotal() {
            this.total = this.cart.reduce((sum, item) => sum + (item.price * item.qty), 0)
            this.calculateChange()
        },

        calculateChange() {
            this.change = Math.max(0, this.cash - this.total)
        },

        formatRupiah(val) {
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                maximumFractionDigits: 0
            }).format(val)
        },

        clearCart() {
            this.cart = []
            this.total = 0
            this.cash = 0
            this.change = 0
            this.isLoading = false
        },

        async processCheckout() {
            if (this.isLoading) return
            if (this.cart.length === 0) return
            if (this.cash < this.total) return window.ui.error('Uang kurang!')

            const yakin = await window.ui.confirm('Konfirmasi', 'Proses transaksi ini?')
            if (yakin) {
                this.isLoading = true
                try {
                    const payload = {
                        items: JSON.parse(JSON.stringify(this.cart)),
                        total_price: this.total,
                        cash_amount: this.cash,
                        change_amount: this.change,
                        user_id: this.user ? this.user.id : null
                    }

                    const res = await window.api.saveTransaction(payload)
                    if (res.success) {
                        window.ui.success('Berhasil', 'Transaksi selesai')
                        this.clearCart()
                    } else {
                        window.ui.error('Gagal', res.message)
                    }
                } catch (err) {
                    console.error(err)
                } finally {
                    setTimeout(() => { this.isLoading = false }, 1000)
                }
            }
        }
    }
}