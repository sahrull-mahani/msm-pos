const { BrowserWindow } = require('electron')

class PrinterService {
    async printReceipt(data) {
        let printWindow = new BrowserWindow({
            show: false,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        })

        const receiptHtml = this.generateReceiptHtml(data)

        // Load HTML ke window tersembunyi
        await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(receiptHtml)}`)

        // Eksekusi Cetak
        printWindow.webContents.print({
            silent: true,
            printBackground: true,
            deviceName: 'Generic / Text Only',
            // Tambahkan pengaturan pageSize untuk mencegah pengulangan halaman
            pageSize: { width: 58000, height: 100000 } // Ukuran dalam mikron (58mm x 100mm)
        }, (success, failureReason) => {
            if (!success) console.error('Gagal mencetak:', failureReason)
            printWindow.close()
        })
    }

    generateReceiptHtml(data) {
        const itemsHtml = data.items.map(item => `
            <div class="item-row">
                <div class="item-name">${item.name.toUpperCase()}</div>
                <div class="item-details">
                    <span>${item.qty} x ${this.formatCurrency(item.price)}</span>
                    <span style="float:right">${this.formatCurrency(item.qty * item.price)}</span>
                </div>
            </div>
        `).join('')

        return `
            <html>
            <head>
                <style>
                    * { 
                        box-sizing: border-box; 
                        -webkit-print-color-adjust: exact; 
                    }
                    body { 
                        font-family: 'Courier New', Courier, monospace; 
                        width: 48mm; /* Area cetak aman Axopos 58mm */
                        margin: 0; 
                        padding: 0; 
                        font-size: 12px;
                        color: #000;
                    }
                    .text-center { text-align: center; }
                    .line { border-top: 1px dashed #000; margin: 5px 0; }
                    .item-row { margin-bottom: 5px; }
                    .item-name { font-weight: bold; }
                    .flex { display: flex; justify-content: space-between; }
                    .total-section { margin-top: 10px; }
                    .bold { font-weight: bold; }
                    * { page-break-inside: avoid; break-inside: avoid; }
                </style>
            </head>
            <body>
                <div class="text-center">
                    <div style="font-size: 14px; font-weight: bold;">STRUK PENJUALAN</div>
                    <div>Toko MSM POS Saya</div>
                </div>
                
                <div class="line"></div>
                <div style="font-size: 10px;">
                    Tgl: ${new Date().toLocaleString('id-ID')}<br>
                    ID : TR-${Date.now().toString().slice(-6)}
                </div>
                <div class="line"></div>

                <div class="items">
                    ${itemsHtml}
                </div>

                <div class="line"></div>

                <div class="total-section">
                    <div class="flex bold">
                        <span>TOTAL </span>
                        <span>${this.formatCurrency(data.total_price)}</span>
                    </div>
                    <div class="flex">
                        <span>BAYAR </span>
                        <span>${this.formatCurrency(data.cash_amount)}</span>
                    </div>
                    <div class="flex">
                        <span>KEMBALI </span>
                        <span>${this.formatCurrency(data.change_amount)}</span>
                    </div>
                </div>

                <div class="line"></div>
                <div class="text-center" style="font-size: 10px;">
                    TERIMA KASIH<br>
                    Sudah Berbelanja
                </div>
                <div style="height: 60px;"></div> </body>
            </html>
        `
    }

    formatCurrency(val) {
        return new Intl.NumberFormat('id-ID').format(val)
    }
}

module.exports = new PrinterService()