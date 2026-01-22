window.posPage = function () {
    return {
        searchQuery: '',
        searchResults: [],
        cart: [],
        total: 0,
        cash: 0,
        cashDisplay: '',
        change: 0,
        isLoading: false,
        isSearching: false, // Tambahkan flag pencarian
        user: null,
        globalDiscountType: 'rp',
        globalDiscountInput: 0,
        globalDiscountAmount: 0,

        async init() {
            window.appData = this
            if (window.mainAppData) {
                this.user = window.mainAppData.user
            }

            // --- SINTAKS SHORTCUT KEYBOARD ---
            window.addEventListener('keydown', (e) => {
                // F6: Fokus ke Pencarian Produk
                if (e.key === 'F6') {
                    e.preventDefault()
                    const searchInput = document.querySelector('#input-search')
                    if (searchInput) {
                        searchInput.focus()
                        searchInput.select()
                    }
                }

                // F8: Fokus ke Nominal Bayar
                if (e.key === 'F8') {
                    e.preventDefault()
                    const cashInput = document.querySelector('#input-cash')
                    if (cashInput) {
                        cashInput.focus()
                        cashInput.select()
                    }
                }
            })

            setTimeout(() => {
                document.querySelector('#input-search')?.focus()
            }, 300)
        },

        // --- FUNGSI PROSES BAYAR ---
        async processCheckout() {
            // 1. Validasi
            if (this.cart.length === 0) {
                window.ui.error('Keranjang masih kosong!')
                return
            }
            if (this.cash < this.total) {
                window.ui.error('Uang bayar tidak cukup!')
                return
            }

            // 2. Set loading state
            this.isLoading = true

            // 3. Siapkan data untuk dikirim ke IPC (Backend)
            const payload = {
                items: JSON.parse(JSON.stringify(this.cart)), // Deep copy agar bersih
                total_price: this.total,
                cash_amount: this.cash,
                change_amount: this.change,
                user_id: this.user ? this.user.id : null
            }

            try {
                // 4. Panggil IPC save-transaction
                const res = await window.api.saveTransaction(payload)

                if (res.success) {
                    // Berhasil! Tampilkan kembalian dengan SweetAlert
                    window.ui.success(
                        'Transaksi Berhasil!',
                        `Kembalian: ${this.formatRupiah(this.change)}`
                    )

                    // 5. Reset Keranjang & Input
                    this.clearCart()
                } else {
                    window.ui.error('Gagal menyimpan: ' + res.message)
                }
            } catch (err) {
                console.error('Checkout Error:', err)
                window.ui.error('Terjadi kesalahan pada server/database.')
            } finally {
                this.isLoading = false
            }
        },

        async searchProduct() {
            const query = this.searchQuery.trim()
            if (query.length < 1) {
                this.searchResults = []
                return
            }

            // Mencegah request bertumpuk (spamming)
            if (this.isSearching) return
            this.isSearching = true

            try {
                this.searchResults = await window.api.searchProduct(query)
            } catch (err) {
                console.error('Search error:', err)
            } finally {
                this.isSearching = false
            }
        },

        async addToCartFromSearch() {
            const query = this.searchQuery.trim()
            if (!query) return

            try {
                // Saat enter/scan, langsung tembak database tanpa peduli hasil sementara
                const items = await window.api.searchProduct(query)

                if (items && items.length > 0) {
                    this.addToCart(items[0])
                } else {
                    window.ui.error('Produk tidak ditemukan')
                }
            } catch (err) {
                console.error('Error saat enter:', err)
            }
        },

        handleQtyInput(index, event) {
            let rawValue = event.target.value.replace(/[^0-9]/g, '') // Hanya ambil angka
            let item = this.cart[index]

            // Jika input dihapus bersih, biarkan kosong sementara di layar agar user bisa mengetik
            if (rawValue === '') {
                item.qty = ''
                return
            }

            let val = parseInt(rawValue)

            // Validasi maksimal stok
            if (val > item.stock) {
                window.ui.warning('Stok Terbatas', `Maksimal stok adalah ${item.stock}`)
                val = item.stock
            }

            // Update nilai item (pastikan tetap di baris yang sama)
            item.qty = val
            this.calculateTotal()
        },

        // Pastikan fungsi addToCart menggunakan perbandingan yang kuat
        addToCart(product) {
            const existingIndex = this.cart.findIndex(i => i.id === product.id)

            if (existingIndex !== -1) {
                this.cart[existingIndex].qty++
            } else {
                this.cart.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    stock: product.stock,
                    qty: 1,
                    // Inisialisasi properti diskon agar reaktif
                    discountType: 'rp',
                    discountInput: 0,
                    discountAmount: 0
                })
            }

            this.searchQuery = ''
            this.searchResults = []
            this.calculateTotal()
        },

        handleItemDiscount(index) {
            let item = this.cart[index]

            // 1. Ambil angka murni
            let rawValue = String(item.discountInput).replace(/[^0-9]/g, '')

            // 2. Update state (simpan sebagai angka agar perhitungan tidak NaN)
            item.discountInput = rawValue === '' ? 0 : parseInt(rawValue)

            // 3. Panggil kalkulasi untuk update total dan discountAmount
            this.calculateTotal()
        },

        handleGlobalDiscount() {
            let rawValue = String(this.globalDiscountInput).replace(/[^0-9]/g, '')
            this.globalDiscountInput = rawValue === '' ? 0 : parseInt(rawValue)
            this.calculateTotal()
        },

        validateInputQty(index) {
            let item = this.cart[index]

            // Jangan lakukan apa-apa jika input sedang benar-benar kosong (saat user menghapus)
            // agar user bisa mengetik angka baru. Tapi jangan biarkan data tersimpan sebagai null.
            if (this.cart[index].qty === '' || this.cart[index].qty === null) {
                return
            }

            let val = parseInt(this.cart[index].qty)

            if (isNaN(val) || val < 1) {
                this.cart[index].qty = 1
            } else if (val > item.stock) {
                window.ui.warning('Stok Terbatas', `Maksimal stok adalah ${item.stock}`)
                this.cart[index].qty = item.stock
            } else {
                this.cart[index].qty = val
            }

            this.calculateTotal()
        },

        updateQty(index, amount) {
            const item = this.cart[index]
            const newQty = item.qty + amount

            if (newQty > 0) {
                if (newQty <= item.stock) {
                    item.qty = newQty
                } else {
                    window.ui.warning('Stok Limit', 'Stok hanya ada ' + item.stock)
                }
            } else {
                this.removeFromCart(index)
            }
            this.calculateTotal()
        },

        handleCashInput(e) {
            // 1. Ambil hanya angka
            let rawValue = e.target.value.replace(/[^0-9]/g, '')

            // 2. Simpan sebagai angka murni untuk kalkulasi
            this.cash = rawValue === '' ? 0 : parseInt(rawValue)

            // 3. Format tampilan hanya dengan titik (Pemisah Ribuan)
            // Contoh: 50000 menjadi 50.000
            if (rawValue === '') {
                this.cashDisplay = ''
            } else {
                this.cashDisplay = new Intl.NumberFormat('id-ID').format(this.cash)
            }

            this.calculateChange()
        },

        calculateTotal() {
            let subtotalProduk = 0

            this.cart.forEach(item => {
                const price = Number(item.price) || 0
                const qty = Number(item.qty) || 0
                const discInput = Number(item.discountInput) || 0

                // Hitung nominal potongan (Amount) berdasarkan tipe
                if (item.discountType === 'percent') {
                    item.discountAmount = (price * qty) * (discInput / 100)
                } else {
                    // Jika nominal Rp, jangan sampai melebihi harga total item
                    item.discountAmount = Math.min(discInput, price * qty)
                }

                // Harga item setelah dipotong diskon item
                subtotalProduk += (price * qty) - item.discountAmount
            })

            // Hitung diskon global (nota)
            const globalDiscInput = Number(this.globalDiscountInput) || 0
            if (this.globalDiscountType === 'percent') {
                this.globalDiscountAmount = subtotalProduk * (globalDiscInput / 100)
            } else {
                this.globalDiscountAmount = Math.min(globalDiscInput, subtotalProduk)
            }

            this.total = Math.max(0, subtotalProduk - this.globalDiscountAmount)
            this.calculateChange()
        },

        calculateChange() {
            this.change = Math.max(0, this.cash - this.total)
        },

        clearCart() {
            this.cart = []
            this.total = 0
            this.cash = 0
            this.cashDisplay = ''
            this.change = 0
            this.isLoading = false
        },

        formatRupiah(val) {
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                maximumFractionDigits: 0
            }).format(val)
        },

        goToDashboard() {
            if (window.mainAppData) window.mainAppData.currentPage = 'dashboard'
        }
    }
}