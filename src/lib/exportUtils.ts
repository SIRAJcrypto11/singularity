"use client";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const fmt = (v: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v);

export function exportIncomeStatementPDF(income: number, expense: number, categoryBreakdown: any[], period: string) {
  const doc = new jsPDF();
  const pw = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFillColor(30, 30, 40);
  doc.rect(0, 0, pw, 45, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('SNISHOP ERP', 14, 20);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Laporan Laba Rugi (Income Statement)', 14, 30);
  doc.text(`Periode: ${period}`, 14, 38);
  doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, pw - 14, 38, { align: 'right' });

  let y = 60;
  doc.setTextColor(0, 0, 0);
  
  // Revenue Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('PENDAPATAN', 14, y);
  y += 8;
  doc.setDrawColor(200, 200, 200);
  doc.line(14, y, pw - 14, y);
  y += 6;
  
  const incomeItems = categoryBreakdown.filter(c => c.type === 'income');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  incomeItems.forEach(item => {
    doc.text(`  ${item.name}`, 14, y);
    doc.text(fmt(item.total), pw - 14, y, { align: 'right' });
    y += 7;
  });
  if (incomeItems.length === 0) { doc.text('  (Tidak ada data)', 14, y); y += 7; }
  
  y += 2;
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(230, 255, 230);
  doc.rect(14, y - 5, pw - 28, 10, 'F');
  doc.text('Total Pendapatan', 18, y + 1);
  doc.text(fmt(income), pw - 18, y + 1, { align: 'right' });
  y += 18;

  // Expense Section
  doc.setFontSize(12);
  doc.text('PENGELUARAN', 14, y);
  y += 8;
  doc.line(14, y, pw - 14, y);
  y += 6;
  
  const expenseItems = categoryBreakdown.filter(c => c.type === 'expense');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  expenseItems.forEach(item => {
    doc.text(`  ${item.name}`, 14, y);
    doc.text(fmt(item.total), pw - 14, y, { align: 'right' });
    y += 7;
  });
  if (expenseItems.length === 0) { doc.text('  (Tidak ada data)', 14, y); y += 7; }
  
  y += 2;
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(255, 230, 230);
  doc.rect(14, y - 5, pw - 28, 10, 'F');
  doc.text('Total Pengeluaran', 18, y + 1);
  doc.text(fmt(expense), pw - 18, y + 1, { align: 'right' });
  y += 20;

  // Net Profit
  doc.setFillColor(30, 30, 40);
  doc.rect(14, y - 6, pw - 28, 14, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.text('LABA BERSIH', 18, y + 2);
  doc.text(fmt(income - expense), pw - 18, y + 2, { align: 'right' });
  
  // Footer
  const ph = doc.internal.pageSize.getHeight();
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Dokumen ini digenerate secara otomatis oleh Singularity ERP System', pw / 2, ph - 10, { align: 'center' });

  doc.save(`Laporan_LabaRugi_${period.replace(/\s/g,'_')}.pdf`);
}

export function exportJournalPDF(transactions: any[], period: string) {
  const doc = new jsPDF('landscape');
  const pw = doc.internal.pageSize.getWidth();

  doc.setFillColor(30, 30, 40);
  doc.rect(0, 0, pw, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('SNISHOP ERP - Jurnal Transaksi', 14, 18);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Periode: ${period} | Dicetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 28);

  const rows = transactions.map((tx: any, i: number) => [
    i + 1,
    new Date(tx.date).toLocaleDateString('id-ID'),
    tx.category || '-',
    tx.note || tx.category || '-',
    tx.type === 'income' ? fmt(tx.amount) : '-',
    tx.type === 'expense' ? fmt(tx.amount) : '-',
  ]);

  const totalIn = transactions.filter((t:any) => t.type === 'income').reduce((a:number, c:any) => a + c.amount, 0);
  const totalOut = transactions.filter((t:any) => t.type === 'expense').reduce((a:number, c:any) => a + c.amount, 0);
  rows.push(['', '', '', 'TOTAL', fmt(totalIn), fmt(totalOut)]);

  autoTable(doc, {
    startY: 42,
    head: [['No', 'Tanggal', 'Kategori', 'Deskripsi', 'Debit (Masuk)', 'Kredit (Keluar)']],
    body: rows,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [30, 30, 40], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 245, 250] },
    didParseCell: (data: any) => {
      if (data.row.index === rows.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [230, 230, 240];
      }
    },
  });

  doc.save(`Jurnal_Transaksi_${period.replace(/\s/g,'_')}.pdf`);
}

export function exportJournalExcel(transactions: any[], period: string) {
  const data = transactions.map((tx: any, i: number) => ({
    'No': i + 1,
    'Tanggal': new Date(tx.date).toLocaleDateString('id-ID'),
    'Kategori': tx.category || '-',
    'Deskripsi': tx.note || tx.category || '-',
    'Tipe': tx.type === 'income' ? 'Masuk' : 'Keluar',
    'Jumlah (Rp)': tx.amount,
  }));

  const totalIn = transactions.filter((t:any) => t.type === 'income').reduce((a:number, c:any) => a + c.amount, 0);
  const totalOut = transactions.filter((t:any) => t.type === 'expense').reduce((a:number, c:any) => a + c.amount, 0);
  data.push({ 'No': '' as any, 'Tanggal': '', 'Kategori': '', 'Deskripsi': 'TOTAL MASUK', 'Tipe': '', 'Jumlah (Rp)': totalIn });
  data.push({ 'No': '' as any, 'Tanggal': '', 'Kategori': '', 'Deskripsi': 'TOTAL KELUAR', 'Tipe': '', 'Jumlah (Rp)': totalOut });
  data.push({ 'No': '' as any, 'Tanggal': '', 'Kategori': '', 'Deskripsi': 'SALDO / LABA BERSIH', 'Tipe': '', 'Jumlah (Rp)': totalIn - totalOut });

  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = [{ wch: 5 }, { wch: 15 }, { wch: 18 }, { wch: 30 }, { wch: 10 }, { wch: 18 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Jurnal');
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), `Jurnal_${period.replace(/\s/g,'_')}.xlsx`);
}

export function exportIncomeStatementExcel(income: number, expense: number, categoryBreakdown: any[], period: string) {
  const rows: any[] = [];
  rows.push({ 'Item': 'LAPORAN LABA RUGI', 'Jumlah (Rp)': '' });
  rows.push({ 'Item': `Periode: ${period}`, 'Jumlah (Rp)': '' });
  rows.push({ 'Item': '', 'Jumlah (Rp)': '' });
  rows.push({ 'Item': 'PENDAPATAN', 'Jumlah (Rp)': '' });
  categoryBreakdown.filter(c => c.type === 'income').forEach(c => rows.push({ 'Item': `  ${c.name}`, 'Jumlah (Rp)': c.total }));
  rows.push({ 'Item': 'Total Pendapatan', 'Jumlah (Rp)': income });
  rows.push({ 'Item': '', 'Jumlah (Rp)': '' });
  rows.push({ 'Item': 'PENGELUARAN', 'Jumlah (Rp)': '' });
  categoryBreakdown.filter(c => c.type === 'expense').forEach(c => rows.push({ 'Item': `  ${c.name}`, 'Jumlah (Rp)': c.total }));
  rows.push({ 'Item': 'Total Pengeluaran', 'Jumlah (Rp)': expense });
  rows.push({ 'Item': '', 'Jumlah (Rp)': '' });
  rows.push({ 'Item': 'LABA BERSIH', 'Jumlah (Rp)': income - expense });

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [{ wch: 35 }, { wch: 20 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Laba Rugi');
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), `LabaRugi_${period.replace(/\s/g,'_')}.xlsx`);
}
