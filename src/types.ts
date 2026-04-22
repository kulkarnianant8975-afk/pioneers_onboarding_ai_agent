export interface BrandAssets {
  logoUrl?: string;
  colors?: string[];
  tone?: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  details: string;
  included: boolean;
}

export interface PaymentInstalment {
  id: string;
  name: string;
  due: string;
  amount: string;
}

export interface MonthPlan {
  title: string;
  subtitle: string;
  price: string;
  services: ServiceItem[];
}

export interface AddOnService {
  id: string;
  name: string;
  included: string;
  price: string;
  quantity?: string;
}

export interface TermCondition {
  id: string;
  title: string;
  details: string;
}

export interface ContractData {
  clientName: string;
  clientType?: string;
  email?: string;
  contactPerson?: string;
  contactNumber?: string;
  location?: string;
  duration?: string;
  monthlyValue?: string;
  totalValue?: string;
  packageName?: string;
  plans?: MonthPlan[];
  addOnServices?: AddOnService[];
  paymentSchedule?: PaymentInstalment[];
  paymentTerms?: string[];
  termsAndConditions?: TermCondition[];
  agencyName?: string;
  agencyType?: string;
  agencyAddress?: string;
  agencyEmail?: string;
  agencyCEO?: string;
  agreementNumber?: string;
  agreementDate?: string;
  validityDays?: string;
  footerNote?: string;
  adBudgetNote?: string;
}

export interface Deliverable {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'delivered';
  dueDate?: any;
  deliveredAt?: any;
  notes?: string;
}

export interface Payment {
  id: string;
  amount: number;
  status: 'pending' | 'paid' | 'failed';
  date: any;
  description: string;
  stripeSessionId?: string;
}

export interface Client {
  id: string;
  uid: string;
  name: string;
  email: string;
  status: 'pending' | 'onboarding' | 'completed' | 'active' | 'paused';
  currentStep?: number;
  onboardingError?: string;
  brandAssets?: BrandAssets;
  notionPageId?: string;
  kickoffMeetingId?: string;
  contractUrl?: string;
  createdAt: any;
  lastStepAt?: any;
  lastReminderAt?: any;
  reminderCount?: number;
  // Dynamic Contract Fields
  packageName?: string;
  monthlyValue?: string;
  totalValue?: string;
  duration?: string;
  location?: string;
  contactPerson?: string;
  plans?: MonthPlan[];
  addOnServices?: AddOnService[];
  paymentSchedule?: PaymentInstalment[];
  termsAndConditions?: TermCondition[];
  agencyName?: string;
  agencyType?: string;
  agencyAddress?: string;
  agencyEmail?: string;
  agencyCEO?: string;
  agreementNumber?: string;
  agreementDate?: string;
  validityDays?: string;
  adBudgetNote?: string;
  
  // Project Management
  deliverables?: Deliverable[];
  payments?: Payment[];
  
  // Notion Sync Info
  notionId?: string; // ID of the row in Notion
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  // Client Info
  clientName: string;
  clientAddress: string;
  clientEmail?: string;
  clientPhone?: string;
  // Agency Info
  agencyName: string;
  agencyAddress: string;
  agencyEmail: string;
  agencyPhone?: string;
  agencyCEO: string;
  // Billing Parameters
  serviceCategory: 'package' | 'addon';
  durationType: 'monthly' | 'one-time';
  pkgName: string;
  monthlyRate: number;
  agreedRate: number;
  duration: number;
  monthsPayingNow: number;
  startMonth: number;
  discount: number; // flat amount
  amountPaid: number;
  amountRemaining: number;
  overrideTotal?: number;
  // Line Items (Optional add-ons)
  items: InvoiceItem[];
  subtotal: number;
  total: number;
  // Payment
  paymentMethod: 'upi' | 'card' | 'cheque' | 'bank' | 'cash';
  paymentDetails: {
    upiTxn?: string;
    upiApp?: string;
    cardLast4?: string;
    cardRef?: string;
    chqNum?: string;
    chqBank?: string;
    bankRef?: string;
    bankDate?: string;
    cashBy?: string;
    cashNote?: string;
  };
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
  showBankDetails: boolean;
  status: 'paid' | 'unpaid' | 'partial';
  notes?: string;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  errorMessage?: string;
  action?: () => Promise<void>;
}
