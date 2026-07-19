/**
 * B2B Document Export Utility (PDF & CSV/Excel)
 */

export interface B2BInvoiceData {
  orderId: string
  date: string
  sellerCompany: string
  buyerCompany: string
  productName: string
  quantity: number
  unit: string
  unitPrice: number
  shippingFee: number
  loadingFee: number
  countFee: number
  totalAmount: number
  paymentStatus: string
  carrier: string
}

/**
 * Generates and triggers download of a clean printable B2B Order Invoice HTML/PDF.
 */
export function printB2BInvoice(data: B2BInvoiceData) {
  if (typeof window === 'undefined') return

  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const html = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <title>HÓA ĐƠN GIAO DỊCH B2B - ${data.orderId}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #008080; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: 800; color: #008080; }
        .title { font-size: 20px; font-weight: bold; text-align: right; color: #334155; }
        .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
        .card { background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
        .card h4 { margin: 0 0 8px 0; color: #0f766e; text-transform: uppercase; font-size: 12px; }
        .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .table th, .table td { padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: left; }
        .table th { background: #f1f5f9; font-size: 13px; font-weight: bold; }
        .summary { text-align: right; font-size: 16px; margin-top: 20px; }
        .total { font-size: 20px; font-weight: bold; color: #008080; }
        .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px dashed #cbd5e1; padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo">SF STOCKFLOW B2B</div>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">Nền tảng thanh lý & kho vận B2B</p>
        </div>
        <div class="title">
          HÓA ĐƠN ĐƠN HÀNG<br>
          <span style="font-size: 14px; font-weight: normal; color: #64748b;">Mã: ${data.orderId}</span>
        </div>
      </div>

      <div class="details-grid">
        <div class="card">
          <h4>Bên Bán (Seller)</h4>
          <p style="margin: 0; font-weight: bold;">${data.sellerCompany}</p>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">Doanh nghiệp thành viên StockFlow</p>
        </div>
        <div class="card">
          <h4>Bên Mua (Buyer)</h4>
          <p style="margin: 0; font-weight: bold;">${data.buyerCompany}</p>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">Ngày khởi tạo: ${data.date}</p>
        </div>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Sản phẩm / Dịch vụ</th>
            <th>Số lượng</th>
            <th>Đơn giá (VND)</th>
            <th>Thành tiền (VND)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>${data.productName}</strong></td>
            <td>${data.quantity.toLocaleString()} ${data.unit}</td>
            <td>${data.unitPrice.toLocaleString()}</td>
            <td>${(data.quantity * data.unitPrice).toLocaleString()}</td>
          </tr>
          <tr>
            <td>Cước vận chuyển (${data.carrier})</td>
            <td>1 chuyến</td>
            <td>${data.shippingFee.toLocaleString()}</td>
            <td>${data.shippingFee.toLocaleString()}</td>
          </tr>
          ${data.loadingFee ? `
          <tr>
            <td>Phí bốc xếp hàng hóa</td>
            <td>1 gói</td>
            <td>${data.loadingFee.toLocaleString()}</td>
            <td>${data.loadingFee.toLocaleString()}</td>
          </tr>` : ''}
        </tbody>
      </table>

      <div class="summary">
        <p style="margin: 4px 0;">Trạng thái thanh toán: <strong>${data.paymentStatus}</strong></p>
        <p style="margin: 8px 0 0 0;">Tổng giá trị đơn hàng: <span class="total">${data.totalAmount.toLocaleString()} VND</span></p>
      </div>

      <div class="footer">
        <p>Cảm ơn quý doanh nghiệp đã sử dụng giải pháp StockFlow B2B!</p>
        <p style="font-size: 11px;">Hóa đơn điện tử được khởi tạo tự động bởi hệ thống StockFlow B2B</p>
      </div>
      <script>
        window.onload = function() { window.print(); }
      </script>
    </body>
    </html>
  `

  printWindow.document.write(html)
  printWindow.document.close()
}

/**
 * Export data array to Excel-compatible CSV file.
 */
export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  if (typeof window === 'undefined') return

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n')

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
