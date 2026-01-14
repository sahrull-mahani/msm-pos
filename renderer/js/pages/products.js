window.productPage = function () {
    return {
        products: [],
        categories: [],
        isSaving: false,
        showModal: false,
        showCategoryModal: false,
        newCategoryName: '',
        editMode: false,
        form: { id: null, barcode: '', sku: '', name: '', category_id: '', price: 0, cost: 0, stock: 0, min_stock: 0 },

        async init() {
            await this.refresh()
            this.categories = await window.api.getCategories()
        },

        async refresh() {
            try {
                const data = await window.api.getProducts()
                this.products = data
            } catch (err) {
                console.error('Gagal memuat produk:', err)
                window.ui.error('Error', 'Gagal mengambil data produk dari database')
            }
        },

        openAddModal() {
            this.editMode = false
            this.form = { id: null, barcode: '', sku: '', name: '', category_id: '', price: 0, cost: 0, stock: 0, min_stock: 0 }
            this.showModal = true
        },

        openEditModal(product) {
            this.editMode = true
            this.form = { ...product }
            this.showModal = true
        },

        async saveProduct() {
            if (this.isSaving) return
            this.isSaving = true

            try {
                let res = this.editMode
                    ? await window.api.updateProduct(this.form)
                    : await window.api.addProduct(this.form)

                if (res.success) {
                    this.showModal = false
                    await this.refresh()
                    window.ui.success('Berhasil!', this.editMode ? 'Produk berhasil diperbarui' : 'Produk berhasil ditambahkan')
                } else {
                    window.ui.error('Gagal!', res.message)
                }
            } catch (err) {
                window.ui.error('Sistem Error', 'Terjadi kesalahan saat menyimpan produk')
            } finally {
                setTimeout(() => { this.isSaving = false }, 500)
            }
        },

        async confirmDelete(id) {
            const yakin = await window.ui.confirm('Hapus Produk?', 'Data ini akan dihapus secara permanen dari sistem')

            if (yakin) {
                try {
                    const res = await window.api.deleteProduct(id)
                    if (res.success) {
                        await this.refresh()
                        window.ui.toast('Produk berhasil dihapus')
                    } else {
                        window.ui.error('Gagal!', 'Tidak dapat menghapus produk ini')
                    }
                } catch (err) {
                    window.ui.error('Error', 'Terjadi kesalahan pada database')
                }
            }
        },

        getCategoryName(id) {
            const cat = this.categories.find(c => c.id == id)
            return cat ? cat.name : 'Tanpa Kategori'
        },

        async saveCategory() {
            if (!this.newCategoryName || this.isSaving) return
            this.isSaving = true

            try {
                const res = await window.api.addCategory(this.newCategoryName)

                if (res.success) {
                    this.showCategoryModal = false
                    this.newCategoryName = ''
                    this.categories = await window.api.getCategories()
                    await this.refresh()
                    window.ui.success('Berhasil!', 'Kategori baru ditambahkan')
                } else {
                    const msg = res.message.includes('UNIQUE')
                        ? 'Nama kategori "' + this.newCategoryName + '" sudah ada'
                        : res.message
                    window.ui.error('Gagal!', msg)
                }
            } catch (err) {
                window.ui.error('Sistem Error', 'Terjadi kesalahan pada server')
            } finally {
                setTimeout(() => { this.isSaving = false }, 500)
            }
        },
    }
}