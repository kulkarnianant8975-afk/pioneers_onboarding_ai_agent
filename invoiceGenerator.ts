import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { InvoiceData } from './src/types';

export class InvoiceGenerator {
  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  private formatCurrency(n: number): string {
    return 'INR ' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  public async generate(data: InvoiceData): Promise<jsPDF> {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const W = 210; // Page width
    const H = 297; // Page height
    const lm = 20; // Left margin
    const rm = 20; // Right margin
    const cw = W - lm - rm; // Content width
    let y = 0;

    // --- PREMIUM BRAND HEADER (SLEEK BAR) ---
    doc.setFillColor(15, 23, 42); // Navy / Zinc-900
    doc.rect(0, 0, W, 45, 'F');
    
    // Logo Icon (Matching Preview UI) - EXTRA LARGE & BOLD
    y = 8;
    doc.setFillColor(37, 99, 235); // Brand Blue
    doc.roundedRect(lm, y, 32, 32, 6, 6, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(36); // Extra Large 36pt
    doc.text('P', lm + 11, y + 22);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text('PIONEERS', lm + 40, y + 15);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // Slate-400
    doc.text('DIGITAL MARKETING AGENCY', lm + 40, y + 22);

    doc.setFontSize(32);
    doc.setTextColor(255, 255, 255);
    doc.text('INVOICE', W - rm, y + 18, { align: 'right' });

    // --- WATERMARK (Subtle Gray instead of Opacity) ---
    doc.setFontSize(150);
    doc.setTextColor(248, 250, 252); // Very light gray
    doc.text('P', W / 2, H / 2, { align: 'center', angle: 45 });

    y = 60;

    // --- META INFO ---
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('ISSUED FROM', lm, y);
    doc.text('BILL TO', lm + (cw / 2), y);
    doc.text('PAYMENT DETAILS', W - rm, y, { align: 'right' });

    y += 6;
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    
    // Agency info
    doc.text(data.agencyName.toUpperCase(), lm, y);
    
    // Client info
    doc.text(data.clientName || 'CLIENT BUSINESS', lm + (cw / 2), y);
    
    // Invoice #
    doc.setTextColor(37, 99, 235); // Brand Blue
    doc.text(`${data.invoiceNumber}`, W - rm, y, { align: 'right' });
    
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    
    // Agency Address
    const agLines = data.agencyAddress.split('\n');
    let agY = y;
    agLines.forEach(line => {
      doc.text(line.trim(), lm, agY);
      agY += 4.5;
    });
    doc.text(data.agencyEmail, lm, agY);

    // Client Address
    const clLines = (data.clientAddress || '').split('\n').slice(0, 3);
    let clY = y;
    clLines.forEach(line => {
      doc.text(line.trim(), lm + (cw / 2), clY);
      clY += 4.5;
    });
    if (data.clientEmail) doc.text(data.clientEmail, lm + (cw / 2), clY);

    // Dates
    doc.text(`Date: ${data.invoiceDate}`, W - rm, y + 4.5, { align: 'right' });
    doc.text(`Due: ${data.dueDate}`, W - rm, y + 9, { align: 'right' });
    
    let periodText = '';
    if (data.durationType === 'monthly') {
      const end = Math.min(data.startMonth + data.monthsPayingNow - 1, data.duration);
      periodText = data.monthsPayingNow === 1 
        ? `Month ${data.startMonth} of ${data.duration}` 
        : `Month ${data.startMonth}–${end} of ${data.duration}`;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235);
      doc.text(`Period: ${periodText}`, W - rm, y + 14, { align: 'right' });
    }

    y = Math.max(agY, clY, y + 20) + 15;

    // --- ITEMS TABLE (Premium Grid Style) ---
    const description = data.serviceCategory === 'package' 
      ? `${data.pkgName} Package: Digital Marketing Services`
      : `${data.pkgName}: Pioneers Excellence Service`;
      
    const durationText = data.durationType === 'one-time' 
      ? 'One-Time' 
      : data.monthsPayingNow + ' Month' + (data.monthsPayingNow > 1 ? 's' : '');
    
    const tableBody = [
      [
        { content: periodText ? `${description}\n(${periodText})` : description, styles: { fontStyle: 'bold' as const, fontSize: 10 } },
        { content: this.formatCurrency(data.monthlyRate), styles: { textColor: [148, 163, 184], textDecoration: 'lineThrough' } },
        this.formatCurrency(data.agreedRate),
        durationText,
        { content: this.formatCurrency(data.agreedRate * data.monthsPayingNow), styles: { halign: 'right' as const, fontStyle: 'bold' as const, fontSize: 11 } }
      ]
    ];

    autoTable(doc, {
      startY: y,
      margin: { left: lm, right: rm },
      head: [['Description', 'Package Price', 'Purchased Price', 'Duration', 'Amount']],
      body: tableBody,
      theme: 'grid',
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
        cellPadding: 5
      },
      styles: {
        fontSize: 10,
        cellPadding: 4, // Reduced from 6 to give more space
        textColor: [30, 41, 59],
        lineColor: [226, 232, 240], // Light Gray
        lineWidth: 0.1
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 28, halign: 'left' },
        2: { cellWidth: 28, halign: 'left' },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 32, halign: 'right' }
      }
    });

    y = (doc as any).lastAutoTable.finalY + 12;

    // --- TOTALS AREA ---
    const totalBoxW = 70;
    const tx = W - rm - totalBoxW;
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('Subtotal:', tx + 5, y);
    doc.setTextColor(30, 41, 59);
    doc.text(this.formatCurrency(data.subtotal), W - rm - 5, y, { align: 'right' });
    
    if (data.discount > 0) {
      y += 7;
      doc.setTextColor(100, 116, 139);
      doc.text(`Discount:`, tx + 5, y);
      doc.setTextColor(220, 38, 38);
      doc.text(`-( ${this.formatCurrency(data.discount)} )`, W - rm - 5, y, { align: 'right' });
    }
    
    y += 7;
    doc.setTextColor(100, 116, 139);
    doc.text(`Amount Paid:`, tx + 5, y);
    doc.setTextColor(5, 150, 105);
    doc.text(`-( ${this.formatCurrency(data.amountPaid)} )`, W - rm - 5, y, { align: 'right' });

    y += 10;
    // Total Amount Box
    doc.setFillColor(37, 99, 235); // Blue
    doc.roundedRect(tx, y - 5, totalBoxW, 14, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Remaining Due:', tx + 2, y + 4);
    doc.setFontSize(13);
    doc.text(this.formatCurrency(data.amountRemaining), W - rm - 2, y + 4, { align: 'right' });

    // --- STATUS STAMP (Using Light Colors instead of Opacity) ---
    const stampX = lm + 10;
    const stampY = y + 20;
    const stampText = data.status.toUpperCase();
    const stampColor = data.status === 'paid' ? [236, 253, 245] : [254, 242, 242]; // Emerald-50 vs Rose-50 (BG)
    const textColor = data.status === 'paid' ? [5, 150, 105] : [220, 38, 38]; // Emerald-600 vs Rose-600
    
    doc.setDrawColor(textColor[0], textColor[1], textColor[2]);
    doc.setLineWidth(0.5);
    doc.setFillColor(stampColor[0], stampColor[1], stampColor[2]);
    doc.roundedRect(stampX, stampY - 12, 45, 18, 2, 2, 'FD');
    
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text(stampText, stampX + 22.5, stampY + 1, { align: 'center', angle: -10 });

    // --- PAYMENT METHODS (GRID) ---
    if (data.showBankDetails) {
      y += 45;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 116, 139);
      doc.text('BANKING & TRANSFERS', lm, y);
      
      y += 6;
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(lm, y - 4, cw, 25, 2, 2, 'F');
      
      doc.setFontSize(9);
      const col1 = lm + 5;
      const col2 = lm + 100;
      
      doc.setTextColor(100, 116, 139);
      doc.text('Beneficiary Name:', col1, y + 5);
      doc.setTextColor(30, 41, 59);
      doc.text('Pioneers Digital Agency', col1 + 35, y + 5);

      doc.setTextColor(100, 116, 139);
      doc.text('Bank Name:', col2, y + 5);
      doc.setTextColor(30, 41, 59);
      doc.text(data.bankName, col2 + 25, y + 5);

      doc.setTextColor(100, 116, 139);
      doc.text('Account Number:', col1, y + 15);
      doc.setTextColor(30, 41, 59);
      doc.text(data.accountNumber, col1 + 35, y + 15);

      doc.setTextColor(100, 116, 139);
      doc.text('IFSC Code:', col2, y + 15);
      doc.setTextColor(30, 41, 59);
      doc.text(data.ifscCode, col2 + 25, y + 15);
    }

    // --- SIGNATURE AREA ---
    const sigY = 265;
    
    doc.setDrawColor(226, 232, 240);
    doc.line(W - rm - 50, sigY - 1, W - rm, sigY - 1);
    
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(data.agencyCEO, W - rm, sigY + 5, { align: 'right' });
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('CHIEF EXECUTIVE OFFICER', W - rm, sigY + 9, { align: 'right' });

    // --- FOOTER ---
    const footerY = 285;
    doc.setFillColor(30, 41, 59); // Slate-800
    doc.rect(0, footerY, W, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Digital Invoice  |  Confidence in Results  |  ${data.agencyEmail}`, W / 2, footerY + 7, { align: 'center' });

    return doc;
  }
}
