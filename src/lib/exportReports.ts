// File: src/lib/exportReports.ts

import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ReportItem {
  orderNumber: string;
  tableNumber: string;
  customerName: string;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  total: number;
  createdAt: string;
}

export async function exportToExcel(reports: ReportItem[], period: string) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Laporan Penjualan');

  worksheet.columns = [
    { header: 'No. Pesanan', key: 'orderNumber', width: 18 },
    { header: 'Meja', key: 'tableNumber', width: 12 },
    { header: 'Pelanggan', key: 'customerName', width: 20 },
    { header: 'Metode Pembayaran', key: 'paymentMethod', width: 18 },
    { header: 'Status Pembayaran', key: 'paymentStatus', width: 18 },
    { header: 'Status Pesanan', key: 'status', width: 18 },
    { header: 'Total (Rp)', key: 'total', width: 15 },
    { header: 'Waktu Transaksi', key: 'createdAt', width: 22 },
  ];

  reports.forEach((item) => {
    worksheet.addRow({
      orderNumber: item.orderNumber,
      tableNumber: item.tableNumber,
      customerName: item.customerName,
      paymentMethod: item.paymentMethod,
      paymentStatus: item.paymentStatus,
      status: item.status,
      total: item.total,
      createdAt: new Date(item.createdAt).toLocaleString('id-ID'),
    });
  });

  // Calculate summary total
  const totalOmzet = reports.reduce((acc, item) => acc + item.total, 0);
  worksheet.addRow({});
  worksheet.addRow({
    orderNumber: 'TOTAL OMZET',
    total: totalOmzet,
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Laporan_Penjualan_${period}_${new Date().toISOString().split('T')[0]}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToPDF(reports: ReportItem[], period: string) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text('Laporan Penjualan - PesenGo', 14, 20);

  doc.setFontSize(11);
  doc.text(`Periode: ${period}`, 14, 28);
  doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 34);

  const totalOmzet = reports.reduce((acc, item) => acc + item.total, 0);
  doc.text(`Total Omzet: Rp ${totalOmzet.toLocaleString('id-ID')}`, 14, 40);
  doc.text(`Total Transaksi: ${reports.length} Pesanan`, 14, 46);

  const tableData = reports.map((item) => [
    item.orderNumber,
    item.tableNumber,
    item.customerName,
    item.paymentMethod,
    item.status,
    `Rp ${item.total.toLocaleString('id-ID')}`,
    new Date(item.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
  ]);

  autoTable(doc, {
    startY: 52,
    head: [['No. Order', 'Meja', 'Pelanggan', 'Metode', 'Status', 'Total', 'Waktu']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [225, 29, 72] },
  });

  doc.save(`Laporan_Penjualan_${period}_${new Date().toISOString().split('T')[0]}.pdf`);
}
