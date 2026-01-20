window.usersPage = function () {
    return {
        users: [],
        roles: [],
        showModal: false,
        isEdit: false,
        isLoading: false, // Pelindung 1: State Lock
        form: { id: null, role_id: '' },

        async init() {
            window.appData = this
            await this.refresh()
            this.roles = await window.api.getRoles()
        },

        async refresh() {
            const data = await window.api.getUsers()
            this.users = JSON.parse(JSON.stringify(data))
        },

        openAddModal() {
            this.isEdit = false
            this.isLoading = false // Reset state loading
            this.form = { id: null, role_id: '' }

            // Reset input manual DOM
            const inputUser = document.getElementById('input_username')
            const inputPass = document.getElementById('input_password')
            if (inputUser) inputUser.value = ''
            if (inputPass) inputPass.value = ''

            this.showModal = true
        },

        editUser(u) {
            this.isEdit = true
            this.isLoading = false
            this.form = { id: u.id, role_id: u.role_id }
            this.showModal = true

            setTimeout(() => {
                document.getElementById('input_username').value = u.username
                document.getElementById('input_password').value = ''
            }, 50)
        },

        async saveUser() {
            if (this.isLoading) return; // Mencegah klik ganda

            this.isLoading = true; // Kunci tombol

            try {
                const username = document.getElementById('input_username').value.trim();
                const password = document.getElementById('input_password').value;

                const res = this.isEdit
                    ? await window.api.updateUser({ id: this.form.id, username, password, role_id: this.form.role_id })
                    : await window.api.createUser({ username, password, role_id: this.form.role_id });

                if (res.success) {
                    this.showModal = false;
                    await this.refresh();
                    window.ui.success('Berhasil', 'Data disimpan');
                } else {
                    window.ui.error('Gagal', res.message);
                }
            } catch (e) {
                console.error(e);
            } finally {
                // Beri jeda 1 detik sebelum tombol aktif lagi agar tidak ada klik susulan
                setTimeout(() => { this.isLoading = false; }, 1000);
            }
        },

        async deleteUser(id) {
            const yakin = await window.ui.confirm('Hapus User?', 'Tindakan ini permanen.')
            if (yakin) {
                const res = await window.api.deleteUser(id)
                if (res.success) await this.refresh()
            }
        }
    }
}