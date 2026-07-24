// File: src/lib/thermalPrinter.ts

export interface PrintOrderData {
  orderNumber: string;
  tableNumber: string;
  customerName: string;
  customerPhone?: string | null;
  items: {
    name: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    notes?: string | null;
  }[];
  subtotal: number;
  tax: number;
  serviceCharge: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  outletName: string;
  outletAddress: string;
}

export function printThermalReceipt(data: PrintOrderData) {
  const printWindow = window.open('', '_blank', 'width=400,height=600');
  if (!printWindow) {
    alert('Gagal membuka jendela cetak. Pastikan pop-up dibolehkan.');
    return;
  }

  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 4px 0; vertical-align: top;">
          <strong>${item.name}</strong> x ${item.quantity}
          ${item.notes ? `<br><small style="color: #666; font-style: italic;">Note: ${item.notes}</small>` : ''}
        </td>
        <td style="padding: 4px 0; text-align: right; vertical-align: top;">
          Rp ${item.subtotal.toLocaleString('id-ID')}
        </td>
      </tr>
    `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Struk Pesanan ${data.orderNumber}</title>
        <style>
          @page { size: 58mm auto; margin: 0; }
          body {
            font-family: 'Courier New', Courier, monospace;
            width: 280px;
            margin: 0 auto;
            padding: 10px;
            font-size: 12px;
            color: #000;
            background: #fff;
          }
          .header { text-align: center; margin-bottom: 10px; border-bottom: 1px dashed #000; padding-bottom: 8px; }
          .header h2 { margin: 0; font-size: 16px; font-weight: bold; }
          .header p { margin: 2px 0; font-size: 11px; }
          .meta { font-size: 11px; margin-bottom: 8px; border-bottom: 1px dashed #000; padding-bottom: 8px; }
          .meta table { width: 100%; }
          .items { width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 11px; }
          .totals { width: 100%; border-top: 1px dashed #000; padding-top: 6px; font-size: 11px; }
          .totals td { padding: 2px 0; }
          .footer { text-align: center; margin-top: 12px; border-top: 1px dashed #000; padding-top: 8px; font-size: 10px; }
          @media print {
            body { width: 100%; padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>${data.outletName || 'Mosac Fine Dining'}</h2>
          <p>${data.outletAddress || 'Jl. Senopati No. 45, Jakarta Selatan'}</p>
        </div>

        <div class="meta">
          <table>
            <tr><td>No. Pesanan:</td><td style="text-align: right;"><strong>${data.orderNumber}</strong></td></tr>
            <tr><td>Meja:</td><td style="text-align: right;"><strong>${data.tableNumber}</strong></td></tr>
            <tr><td>Pelanggan:</td><td style="text-align: right;">${data.customerName}</td></tr>
            <tr><td>Waktu:</td><td style="text-align: right;">${new Date(data.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</td></tr>
            <tr><td>Metode:</td><td style="text-align: right;">${data.paymentMethod} (${data.paymentStatus})</td></tr>
          </table>
        </div>

        <table class="items">
          ${itemsHtml}
        </table>

        <table class="totals">
          <tr><td>Subtotal</td><td style="text-align: right;">Rp ${data.subtotal.toLocaleString('id-ID')}</td></tr>
          <tr><td>Pajak (10%)</td><td style="text-align: right;">Rp ${data.tax.toLocaleString('id-ID')}</td></tr>
          <tr><td>Service (5%)</td><td style="text-align: right;">Rp ${data.serviceCharge.toLocaleString('id-ID')}</td></tr>
          ${data.discount > 0 ? `<tr><td>Diskon</td><td style="text-align: right;">- Rp ${data.discount.toLocaleString('id-ID')}</td></tr>` : ''}
          <tr style="font-weight: bold; font-size: 13px;">
            <td style="padding-top: 6px;">TOTAL</td>
            <td style="text-align: right; padding-top: 6px;">Rp ${data.total.toLocaleString('id-ID')}</td>
          </tr>
        </table>

        <div class="footer">
          <p>Terima kasih atas kunjungan Anda!</p>
          <p>PesenGo Smart Order PWA</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
