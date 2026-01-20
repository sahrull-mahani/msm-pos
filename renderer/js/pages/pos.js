window.posPage = function () {
    return {
        searchQuery: '',
        searchResults: [],
        cart: [],
        total: 0,
        cash: 0,
        change: 0,

        init() {
            window.appData = this
            // Fokus ke input search saat halaman dimuat
            setTimeout(() => document.querySelector('input')?.focus(), 200)
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
                existing.qty++
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
            window.ui.toast('Ditambahkan: ' + product.name)
        },

        updateQty(index, amount) {
            const item = this.cart[index]
            const newQty = item.qty + amount
            if (newQty > 0 && newQty <= item.stock) {
                item.qty = newQty
            } else if (newQty > item.stock) {
                window.ui.warning('Stok terbatas', 'Hanya tersedia ' + item.stock)
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
            return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
        },

        clearCart() {
            this.cart = []
            this.total = 0
            this.cash = 0
            this.change = 0
        },

        async processCheckout() {
            if (this.cash < this.total) return window.ui.error('Uang kurang!')
            
            const yakin = await window.ui.confirm('Konfirmasi Bayar', 'Lanjutkan transaksi sebesar ' + this.formatRupiah(this.total) + '?')
            if (yakin) {
                // Proses simpan ke database di sini nanti
                window.ui.success('Transaksi Berhasil!', 'Kembalian: ' + this.formatRupiah(this.change))
                this.clearCart()
            }
        }
    }
}