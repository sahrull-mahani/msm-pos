const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: '#1e293b',
    color: '#ffffff',
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
})

window.ui = {
    // Notifikasi sukses (Hijau)
    success(title, text = '') {
        return Swal.fire({
            icon: 'success',
            title: title,
            text: text,
            background: '#0f172a',
            color: '#ffffff',
            confirmButtonColor: '#22c55e',
            timer: 2000
        })
    },

    // Notifikasi error (Merah)
    error(title, text = '') {
        return Swal.fire({
            icon: 'error',
            title: title,
            text: text,
            background: '#0f172a',
            color: '#ffffff',
            confirmButtonColor: '#ef4444'
        })
    },

    // Notifikasi peringatan (Kuning)
    warning(title, text = '') {
        return Swal.fire({
            icon: 'warning',
            title: title,
            text: text,
            background: '#0f172a',
            color: '#ffffff',
            confirmButtonColor: '#f59e0b'
        })
    },

    // Notifikasi informasi (Biru)
    info(title, text = '') {
        return Swal.fire({
            icon: 'info',
            title: title,
            text: text,
            background: '#0f172a',
            color: '#ffffff',
            confirmButtonColor: '#3b82f6'
        })
    },

    // Notifikasi pertanyaan/konfirmasi (Misal untuk hapus data)
    async confirm(title, text = '') {
        const result = await Swal.fire({
            title: title,
            text: text,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, Lanjutkan',
            cancelButtonText: 'Batal',
            background: '#0f172a',
            color: '#ffffff'
        })
        return result.isConfirmed
    },

    // Toast (Notifikasi kecil di pojok untuk aksi cepat)
    toast(title, icon = 'success') {
        Toast.fire({
            icon: icon,
            title: title
        })
    }
}