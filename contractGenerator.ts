import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ContractData, MonthPlan, ServiceItem, PaymentInstalment, AddOnService, TermCondition } from './src/types';

export class ContractGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin = 15;
  private orangeColor: [number, number, number] = [234, 88, 12]; // #ea580c (Vibrant Orange)
  private darkBlue: [number, number, number] = [30, 41, 59]; // #1e293b (Slate 800)
  private lightGray: [number, number, number] = [241, 245, 249]; // #f1f5f9 (Slate 100)
  private lightOrange: [number, number, number] = [255, 247, 237]; // #fff7ed (Orange 50)
  private rs = 'Rs. '; // Using standard characters to avoid font stretching issues

  private currentY: number = 0;
  private currentData!: ContractData;

  constructor() {
    this.doc = new jsPDF();
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
  }

  private safeParsePrice(price: string): number {
    if (!price) return 0;
    // Remove currency symbols, commas, and spaces
    const cleanPrice = price.replace(/[^\d.]/g, '');
    const parsed = parseFloat(cleanPrice);
    return isNaN(parsed) ? 0 : parsed;
  }

  public generate(data: ContractData): jsPDF {
    console.log('Starting PDF generation for:', data.clientName);
    
    const safeData: ContractData = {
      clientName: data.clientName || 'Valued Client',
      contactPerson: data.contactPerson || '',
      location: data.location || 'Not Specified',
      duration: data.duration || '3 Months',
      monthlyValue: data.monthlyValue || '15,000',
      totalValue: data.totalValue || '45,000',
      packageName: data.packageName || 'Premium Plan',
      plans: Array.isArray(data.plans) ? data.plans.map(p => ({
        ...p,
        title: p.title || 'New Phase',
        subtitle: p.subtitle || '',
        price: p.price || '0',
        services: Array.isArray(p.services) ? p.services.map(s => ({
          ...s,
          id: s.id || Math.random().toString(),
          name: s.name || 'Service',
          details: s.details || '',
          included: !!s.included
        })) : []
      })) : this.getDefaultPlans(),
      addOnServices: Array.isArray(data.addOnServices) ? data.addOnServices : [],
      paymentSchedule: Array.isArray(data.paymentSchedule) ? data.paymentSchedule : this.getDefaultPaymentSchedule(),
      termsAndConditions: Array.isArray(data.termsAndConditions) ? data.termsAndConditions : this.getDefaultTerms(),
      agreementNumber: data.agreementNumber || `PDA-2026-${Math.floor(Math.random() * 900) + 100}`,
      agreementDate: data.agreementDate || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      validityDays: data.validityDays || '15',
      footerNote: data.footerNote || '',
      agencyName: data.agencyName || 'PIONEERS',
      agencyType: data.agencyType || 'Digital Marketing Agency',
      agencyAddress: data.agencyAddress || 'Mantri Complex, Basmat Road, Parbhani 431401',
      agencyEmail: data.agencyEmail || 'pdmasolutions@gmail.com',
      agencyCEO: data.agencyCEO || 'Madhav Sharma'
    };

    this.currentData = safeData;
    this.currentY = 0;
    
    // Reset character spacing to avoid stretching issues
    if ((this.doc as any).setCharSpace) {
      (this.doc as any).setCharSpace(0);
    }

    try {
      console.group('PDF Generation Progress');
      console.log('Validating data...');
      this.addPage1(safeData);
      console.log('Page 1 added');
      this.addRemainingContent(safeData);
      console.log('Remaining content added');
      this.addFooter(safeData);
      console.log('Footer added');
      console.groupEnd();
      
      console.log('PDF generation completed successfully');
      return this.doc;
    } catch (error) {
      console.groupEnd();
      console.error('Error during PDF generation:', error);
      throw error;
    }
  }

  private getDefaultPaymentSchedule(): PaymentInstalment[] {
    return [
      { id: '1', name: 'Instalment 1 (100% — Month 1 Advance)', due: 'On agreement signing', amount: '15,000' },
      { id: '2', name: 'Instalment 2 (100% — Month 2 Advance)', due: 'Start of Month 2', amount: '15,000' },
      { id: '3', name: 'Instalment 3 (100% — Month 3 Advance)', due: 'Start of Month 3', amount: '15,000' },
    ];
  }

  private getDefaultTerms(): TermCondition[] {
    return [
      { id: '1.', title: 'All services are rendered on a monthly basis. Continuity of service depends on timely payment as per the instalment schedule.', details: '' },
      { id: '2.', title: 'Advertisement (ad) budget is NOT included in the package price. Ad spend will be billed separately based on the agreed monthly budget.', details: '' },
      { id: '3.', title: 'Content and creatives require client approval within 48 hours of submission. Delays may affect the monthly content calendar.', details: '' },
      { id: '4.', title: 'A minimum lock-in period of 3 months applies. Early termination will require settlement of any outstanding balance.', details: '' },
      { id: '5.', title: 'Pioneers Digital Marketing Agency retains the right to use content created for portfolio and case study purposes unless explicitly restricted.', details: '' },
      { id: '6.', title: 'This estimate is valid for 15 days from the date of issue. Post validity, prices may be revised.', details: '' },
    ];
  }

  private checkPageBreak(neededHeight: number) {
    if (this.currentY + neededHeight > this.pageHeight - 35) {
      this.doc.addPage();
      // No header on subsequent pages as requested
      this.currentY = 20;
      return true;
    }
    return false;
  }

  private getDefaultPlans(): MonthPlan[] {
    return [
      {
        title: 'MONTH 1 - Admission Sprint',
        subtitle: 'HD Shoot + Full Setup + Content + Ads',
        price: '29,500',
        services: [
          { id: '1', name: 'HD Video Shoot + Photoshoot', details: 'Campus shoot, Dr. Navandar Sir intro, teacher videos, student reviews, infrastructure - (4 hrs)', included: true },
          { id: '2', name: 'Meta Ads Management', details: 'FB + Insta: Account setup, verification, campaign creation, audience targeting (parents/students), weekly reporting & optimisation', included: true },
          { id: '3', name: 'Reel / Video Edits', details: 'Max 60 sec each | 2 revisions per reel', included: true },
          { id: '4', name: 'Social Media Graphics', details: 'Square + Story formats | 2 revisions each', included: true },
          { id: '5', name: 'Google My Business Setup', details: 'Account creation, verification, Maps listing, photos upload, first post', included: true },
          { id: '6', name: 'Branding Kit', details: 'Logo guide, colour palette, font set, social media templates for consistent brand identity', included: true },
          { id: '7', name: 'Bi-Weekly Performance Report', details: 'Detailed report on reach, engagement, leads & ad spend efficiency', included: true },
          { id: '8', name: 'WhatsApp Support', details: 'Direct communication with your Pioneers account manager', included: true },
          { id: '9', name: 'Website Development', details: '5-page website of the foundation', included: true },
          { id: '10', name: 'Whatsapp Bulk Message Setup', details: 'One time setup for the bulk messages', included: true },
        ]
      },
      {
        title: 'MONTH 2 - Brand Growth',
        subtitle: 'Premium Content + Ads',
        price: '15,000',
        services: [
          { id: '1', name: 'Meta Ads Management', details: 'Campaign optimisation, retargeting, lookalike audience, weekly reporting & A/B testing', included: true },
          { id: '2', name: 'Reel / Video Edits', details: 'Max 60 sec each | 2 revisions per reel', included: true },
          { id: '3', name: 'Social Media Graphics', details: 'Square + Story formats | 2 revisions each', included: true },
          { id: '4', name: 'Google Business Profile', details: 'Profile optimisation, review management, Q&A, post updates', included: true },
          { id: '5', name: 'Bi-Weekly Performance Report', details: 'Detailed report on reach, engagement, leads & ad spend efficiency', included: true },
          { id: '6', name: 'WhatsApp Support', details: 'Direct communication with your Pioneers account manager', included: true },
        ]
      },
      {
        title: 'MONTH 3 - Scale + Retarget',
        subtitle: 'Premium Content + Ads',
        price: '15,000',
        services: [
          { id: '1', name: 'Meta Ads Management', details: 'Admission push campaigns, retargeting, lookalike audience, closing deadline ads, final optimisation', included: true },
          { id: '2', name: 'Reel / Video Edits', details: 'Max 60 sec each | 2 revisions per reel', included: true },
          { id: '3', name: 'Social Media Graphics', details: 'Square + Story formats | 2 revisions each', included: true },
          { id: '4', name: 'Google Business Profile', details: 'Profile optimisation, review management, Q&A, post updates', included: true },
          { id: '5', name: 'Bi-Weekly Performance Report', details: 'Detailed report on reach, engagement, leads & ad spend efficiency', included: true },
          { id: '6', name: '3-Month Summary Report', details: 'Comprehensive performance review - growth, leads generated, top content, next phase recommendations', included: true },
          { id: '7', name: 'WhatsApp Support', details: 'Direct communication with your Pioneers account manager', included: true },
        ]
      }
    ];
  }

  private addPageHeader(data: ContractData) {
    const W = this.pageWidth;
    const lm = this.margin;
    const rm = this.margin;
    
    // --- PREMIUM BRAND HEADER (SLEEK BAR) ---
    this.doc.setFillColor(...this.darkBlue);
    this.doc.rect(0, 0, W, 45, 'F');
    
    // Logo Icon (Matching Invoice / Preview UI) - EXTRA LARGE & BOLD
    const logoY = 8;
    this.doc.setFillColor(37, 99, 235); // Brand Blue
    this.doc.roundedRect(lm, logoY, 32, 32, 6, 6, 'F');
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(36); // Extra Large 36pt
    this.doc.text('P', lm + 11, logoY + 22);

    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(24);
    this.doc.setTextColor(255, 255, 255);
    this.doc.text('PIONEERS', lm + 40, logoY + 15);
    this.doc.setFontSize(8);
    this.doc.setTextColor(148, 163, 184); // Slate-400
    this.doc.text('DIGITAL MARKETING AGENCY', lm + 40, logoY + 22);

    // Right Content Info (Service Agreement Title)
    this.doc.setFontSize(26);
    this.doc.setTextColor(255, 255, 255);
    this.doc.text('SERVICE AGREEMENT', W - rm, logoY + 16, { align: 'right' });
    
    this.doc.setTextColor(200, 200, 200); 
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`AGR No: ${data.agreementNumber}`, W - rm, logoY + 22, { align: 'right' });
    this.doc.text(`Date: ${data.agreementDate}`, W - rm, logoY + 26, { align: 'right' });
    this.doc.setTextColor(...this.orangeColor);
    this.doc.text(`Valid for: ${data.validityDays} Days`, W - rm, logoY + 31, { align: 'right' });
  }

  private addPage1(data: ContractData) {
    this.addPageHeader(data);
    this.currentY = 75; 

    // PREPARED FOR - Lavender/Gray Box
    const boxHeight = 50; // Increased from 42 to prevent cutoff
    const leftBoxWidth = this.pageWidth * 0.48 - this.margin;
    this.doc.setFillColor(...this.lightGray);
    this.doc.rect(this.margin, this.currentY, leftBoxWidth, boxHeight, 'F');
    
    // Reset character spacing to zero at the start of each text block to prevent stretching
    if ((this.doc as any).setCharSpace) (this.doc as any).setCharSpace(0);

    this.doc.setTextColor(...this.orangeColor);
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('PREPARED FOR', this.margin + 6, this.currentY + 10);
    
    this.doc.setTextColor(...this.darkBlue);
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    const clientName = (data.clientName || 'Valued Client').toString();
    const splitClient = this.doc.splitTextToSize(clientName, leftBoxWidth - 12);
    this.doc.text(splitClient, this.margin + 6, this.currentY + 20);
    
    this.doc.setTextColor(100, 100, 110);
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    const clientInfoY = this.currentY + (splitClient.length > 1 ? 28 : 27);
    if (data.contactPerson) {
      this.doc.text(`Contact Person: ${data.contactPerson}`, this.margin + 6, clientInfoY);
    }
    this.doc.text(`Location: ${data.location}`, this.margin + 6, clientInfoY + 6);

    // CONTRACT SUMMARY - Peach Box
    const summaryX = this.pageWidth * 0.48 + 5;
    const summaryWidth = this.pageWidth - summaryX - this.margin;
    this.doc.setFillColor(...this.lightOrange);
    this.doc.rect(summaryX, this.currentY, summaryWidth, boxHeight, 'F');
    
    // Header
    this.doc.setTextColor(...this.orangeColor);
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('CONTRACT SUMMARY', summaryX + 6, this.currentY + 10);
    
    const summaryBaseY = this.currentY + 18;
    const summaryLineHeight = 7.5; // Uniform line height

    // Reset character spacing before each text line to be absolutely sure
    const drawSummaryLine = (label: string, value: string, y: number, fontSize: number, isBold: boolean, color?: [number, number, number]) => {
      if ((this.doc as any).setCharSpace) (this.doc as any).setCharSpace(0);
      this.doc.setFontSize(fontSize);
      this.doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      if (color) this.doc.setTextColor(...color);
      this.doc.text(`${label}: ${value}`, summaryX + 6, y);
    };

    // Duration
    drawSummaryLine('Duration', data.duration || '3 Months', summaryBaseY, 10, false, [70, 70, 80]);
    
    // Monthly Value
    drawSummaryLine('Monthly Value', `${this.rs}${data.monthlyValue || '0'}`, summaryBaseY + summaryLineHeight, 10.5, true, this.darkBlue);
    
    // Total Contract Value
    drawSummaryLine('Total Contract Value', `${this.rs}${data.totalValue || '0'}`, summaryBaseY + (summaryLineHeight * 2), 13, true, this.orangeColor);
    
    // Package
    drawSummaryLine('Package', data.packageName || 'Premium Plan', summaryBaseY + (summaryLineHeight * 3) + 1, 9, false, [110, 110, 110]);

    this.currentY = this.currentY + boxHeight + 10;

    const plans = data.plans || this.getDefaultPlans();
    if (plans.length > 0) {
      this.addMonthSection(plans[0], 0);
    }
  }

  private addMonthSection(plan: MonthPlan, index: number) {
    this.checkPageBreak(50);
    const headerHeight = plan.subtitle ? 16 : 10;
    this.addMonthHeader(this.currentY, plan.title, plan.subtitle, plan.price, index);
    this.currentY += headerHeight + 6;

    const services = Array.isArray(plan.services) ? plan.services : [];

    if (services.length > 0) {
      autoTable(this.doc, {
        startY: this.currentY,
        margin: { left: this.margin, right: this.margin },
        head: [['#', 'Service', 'Details / Quantity', 'Included']],
        body: services.map((s, i) => [(i+1).toString(), s.name || '', (s.details || '').trim().replace(/\n{2,}/g, '\n'), '']),
        theme: 'grid',
        headStyles: { 
          fillColor: this.darkBlue, 
          textColor: 255, 
          fontSize: 9, 
          fontStyle: 'bold',
          halign: 'left'
        },
        bodyStyles: { fontSize: 8.5, textColor: [40, 40, 40], valign: 'middle' },
        columnStyles: {
          0: { cellWidth: 8, halign: 'center' },
          1: { cellWidth: 52, fontStyle: 'bold' },
          2: { cellWidth: 100 },
          3: { cellWidth: 20, halign: 'center' }
        },
        alternateRowStyles: { fillColor: [250, 250, 250] },
        styles: {
          lineColor: [220, 220, 220],
          lineWidth: 0.1,
          cellPadding: 3
        },
        didDrawCell: (data) => {
          if (data.section === 'body' && data.column.index === 3) {
            const service = services[data.row.index];
            if (service && service.included) {
              const centerX = data.cell.x + data.cell.width / 2;
              const centerY = data.cell.y + data.cell.height / 2;
              this.drawCheckmark(centerX, centerY, 3.5);
            }
          }
        }
      });
      this.currentY = (this.doc as any).lastAutoTable.finalY + 8;
    }
  }

  private addMonthHeader(y: number, title: string, subtitle: string, price: string, index: number) {
    // If there's a subtitle, expand the header to 16px to accommodate both lines
    const headerHeight = subtitle ? 16 : 10;
    const headerColor = index >= 2 ? this.orangeColor : this.darkBlue;
    
    this.doc.setFillColor(...headerColor);
    this.doc.rect(this.margin, y, this.pageWidth - 2 * this.margin, headerHeight, 'F');
    
    // Icon Square
    this.doc.setFillColor(255, 255, 255, 0.2);
    this.doc.rect(this.margin + 3, y + 3, 6, 6, 'F');
    
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    const displayTitle = (title || `MONTH ${index + 1}`).toString().toUpperCase();

    if (subtitle) {
      // Two-line header: title on top, subtitle below
      this.doc.text(displayTitle, this.margin + 12, y + 7);
      this.doc.setFontSize(7.5);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(220, 220, 220);
      this.doc.text(subtitle, this.margin + 12, y + 13);
    } else {
      // Single-line header: vertically centred
      this.doc.text(displayTitle, this.margin + 12, y + 6.5);
    }
  }

  private addRemainingContent(data: ContractData) {
    const plans = data.plans || this.getDefaultPlans();
    if (plans.length > 1) {
      plans.slice(1).forEach((plan, i) => {
        this.addMonthSection(plan, i + 1);
      });
    }

    if (data.addOnServices && data.addOnServices.length > 0) {
      this.checkPageBreak(40);
      this.doc.setFillColor(...this.darkBlue);
      this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 10, 'F');
      this.doc.setTextColor(255, 255, 255);
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('ADD ON SERVICES', this.margin + 5, this.currentY + 7);
      this.currentY += 10;

      autoTable(this.doc, {
        startY: this.currentY,
        margin: { left: this.margin, right: this.margin },
        head: [['Service Name', 'Description', 'Quantity', 'Price']],
        body: (data.addOnServices || []).map(a => [
          (a.name || 'Add-on').toString(),
          (a.included || '').toString().trim().replace(/\n{2,}/g, '\n'),
          (a.quantity || '1').toString(),
          (a.price || '0').toString()
        ]),
        theme: 'grid',
        headStyles: { fillColor: this.darkBlue, textColor: 255, fontSize: 9, fontStyle: 'bold' },
        bodyStyles: { fontSize: 8.5, textColor: [40, 40, 40] },
        styles: { lineColor: [220, 220, 220], lineWidth: 0.1, cellPadding: 3 }
      });
      this.currentY = (this.doc as any).lastAutoTable.finalY + 8;
    }

    // Payment Schedule
    this.checkPageBreak(60);
    this.doc.setFillColor(...this.darkBlue);
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 10, 'F');
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('PAYMENT SCHEDULE', this.margin + 5, this.currentY + 7);
    this.currentY += 10;

    const schedule = data.paymentSchedule || this.getDefaultPaymentSchedule();
    autoTable(this.doc, {
      startY: this.currentY,
      margin: { left: this.margin, right: this.margin },
      head: [['Instalment', 'Due', 'Amount']],
      body: (schedule || []).map(s => [
        (s.name || '').toString(),
        (s.due || '').toString(),
        `${this.rs}${(s.amount || '0').toString()}`
      ]),
      theme: 'grid',
      headStyles: { fillColor: this.darkBlue, textColor: 255, fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 8.5, textColor: [40, 40, 40] },
      columnStyles: {
        2: { halign: 'right', textColor: this.orangeColor, fontStyle: 'bold' }
      },
      styles: { lineColor: [220, 220, 220], lineWidth: 0.1, cellPadding: 3 }
    });
    this.currentY = (this.doc as any).lastAutoTable.finalY;

    // Total Value Bar
    this.doc.setFillColor(...this.orangeColor);
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 12, 'F');
    
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('TOTAL CONTRACT VALUE', this.margin + 5, this.currentY + 8);
    
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    const monthlyVal = (data.monthlyValue || '0').toString();
    const totalVal = (data.totalValue || '0').toString();
    const numMonths = (data.plans || []).length || 3;
    const calculation = `${numMonths} × ${this.rs}${monthlyVal}/month = ${this.rs}${totalVal}`;
    this.doc.text(calculation, this.pageWidth / 2, this.currentY + 8, { align: 'center' });
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`${this.rs}${data.totalValue}`, this.pageWidth - this.margin - 5, this.currentY + 8, { align: 'right' });
    this.currentY += 18;

    this.doc.setTextColor(150, 150, 150);
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'italic');
    const paymentNote = `* All payments via Bank Transfer / UPI / Cheque payable to ${(data.agencyName || 'Pioneers Digital Marketing Agency').toString()}.`;
    this.doc.text(paymentNote, this.margin, this.currentY);
    
    // Explicit Ad Budget Note (Highly prominent as requested)
    this.currentY += 6;
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...this.orangeColor);
    const adNote = data.adBudgetNote || 'Advertisement (ad) budget is NOT included in the package price. Ad spend will be billed separately.';
    this.doc.text(`* ${adNote}`, this.margin, this.currentY);
    this.currentY += 12;

    // Terms & Conditions
    this.checkPageBreak(80);
    this.doc.setFillColor(...this.darkBlue);
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 10, 'F');
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('TERMS & CONDITIONS', this.margin + 5, this.currentY + 7);
    this.currentY += 15;

    const terms = data.termsAndConditions || this.getDefaultTerms();
    terms.forEach((term, i) => {
      this.checkPageBreak(15);
      this.doc.setTextColor(...this.orangeColor);
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${i + 1}.`, this.margin, this.currentY);
      
      this.doc.setTextColor(40, 40, 40);
      if (i < 2) {
        this.doc.setFont('helvetica', 'bold');
      } else {
        this.doc.setFont('helvetica', 'normal');
      }
      
      const splitText = this.doc.splitTextToSize((term.title || '').trim().replace(/\n{2,}/g, '\n'), this.pageWidth - 2 * this.margin - 10);
      this.doc.text(splitText, this.margin + 8, this.currentY);
      this.currentY += (splitText.length * 4.5) + 3;
    });

    if (data.footerNote) {
      this.checkPageBreak(30);
      this.currentY += 10;
      this.doc.setTextColor(100, 100, 100);
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'italic');
      const splitFooter = this.doc.splitTextToSize(data.footerNote, this.pageWidth - 2 * this.margin);
      this.doc.text(splitFooter, this.margin, this.currentY);
      this.currentY += (splitFooter.length * 4) + 5;
    }

    this.addSignatureBlock(data);
  }

  private addSignatureBlock(data: ContractData) {
    this.checkPageBreak(80);
    this.currentY += 10;
    
    // Agency Box - Dark Blue
    this.doc.setFillColor(...this.darkBlue);
    this.doc.rect(this.margin, this.currentY, (this.pageWidth / 2) - this.margin - 5, 50, 'F');
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'bold');
    const agencyTitle = `FOR ${(data.agencyName || 'PIONEERS').toString().toUpperCase()}`;
    this.doc.text(agencyTitle, this.margin + 5, this.currentY + 10);
    
    this.doc.setDrawColor(255, 255, 255);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin + 5, this.currentY + 35, (this.pageWidth / 2) - 10, this.currentY + 35);
    
    this.doc.text(`${data.agencyCEO || ''} — CEO`, this.margin + 5, this.currentY + 41);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Authorised Signatory', this.margin + 5, this.currentY + 46);

    // Client Box - Orange
    this.doc.setFillColor(...this.orangeColor);
    this.doc.rect(this.pageWidth / 2 + 5, this.currentY, (this.pageWidth / 2) - this.margin - 5, 50, 'F');
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'bold');
    const clientSignatureName = (data.clientType || data.clientName || 'Client').toString().toUpperCase();
    this.doc.text(`FOR ${clientSignatureName}`, this.pageWidth / 2 + 10, this.currentY + 10);
    
    this.doc.setDrawColor(255, 255, 255);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.pageWidth / 2 + 10, this.currentY + 35, this.pageWidth - this.margin - 10, this.currentY + 35);
    
    this.doc.text(data.contactPerson || '', this.pageWidth / 2 + 10, this.currentY + 41);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Name, Designation & Sign', this.pageWidth / 2 + 10, this.currentY + 46);

    this.currentY += 60;
    
    // Bottom bar
    this.doc.setFillColor(...this.darkBlue);
    this.doc.rect(0, this.pageHeight - 15, this.pageWidth, 15, 'F');
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(8);
    const agencyN = (data.agencyName || 'PIONEERS').toString();
    const agencyA = (data.agencyAddress || '').toString();
    const agencyE = (data.agencyEmail || '').toString();
    const footerText = `${agencyN} | ${agencyA} | ${agencyE}`;
    this.doc.text(footerText, this.pageWidth / 2, this.pageHeight - 7, { align: 'center' });
  }

  private addFooter(data: ContractData) {
    const pageCount = (this.doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setTextColor(150, 150, 150);
      this.doc.setFontSize(8);
      const agencyName = (data.agencyName || 'PIONEERS').toString();
      const agencyEmail = (data.agencyEmail || 'pdmasolutions@gmail.com').toString();
      this.doc.text(`${agencyName} | ${agencyEmail}`, this.margin, this.pageHeight - 10);
      this.doc.text(`Page ${i} of ${pageCount}`, this.pageWidth - this.margin, this.pageHeight - 10, { align: 'right' });
    }
  }

  private drawCheckmark(x: number, y: number, size: number) {
    this.doc.setDrawColor(...this.orangeColor);
    this.doc.setLineWidth(0.8);
    // Draw a simple checkmark using segments
    this.doc.line(x - size/2, y, x - size/4, y + size/2);
    this.doc.line(x - size/4, y + size/2, x + size/2, y - size/2);
  }
}
