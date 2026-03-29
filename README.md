# Pioneers Client Onboarding & Billing System

A premium, high-fidelity internal tool for **Pioneers Digital Marketing Agency** to manage client onboarding, generate professional service agreements, and issue branded payment invoices.

## 🚀 Key Features

### 1. Pioneers Original Service Agreements
- **Extra-Large Branding**: High-impact "P" logo and professional typography.
- **Dynamic Content**: Customizable month-by-month service phases.
- **Production Ready**: Optimized PDF generation using `jsPDF` with precise coordinate-based layouts.

### 2. Pioneers Original Invoice System
- **Dual-Pane Editor**: Real-time visual preview alongside intuitive form controls.
- **Branded Invoicing**: Matching "Pioneers Original" aesthetic with PAID/UNPAID status stamps.
- **Flexible Billing**: Toggleable bank details, custom add-on services, and dynamic discounting.

### 3. Client CRM (Experimental)
- Centralized dashboard for tracking client onboarding status.
- Integration with Firebase for secure data persistence.

## 🛠️ Tech Stack
- **Frontend**: React 19 (Vite), Tailwind CSS 4.
- **PDF Core**: `jsPDF`, `jspdf-autotable`.
- **Backend/DB**: Firebase Firestore, Firebase Auth.
- **Animations**: Motion (framer-motion).

## 📦 Local Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Create a `.env.local` file and add your Firebase and Gemini API keys:
   ```env
   VITE_FIREBASE_API_KEY=your_key
   VITE_FIREBASE_AUTH_DOMAIN=your_domain
   ...
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

## 🌐 Production Deployment (Vercel)

This project is optimized for deployment on **Vercel**.

1. **Push to GitHub**:
   Create a repository and push your code.
2. **Connect to Vercel**:
   Import the repository and set the framework to **Vite**.
3. **Add Environment Variables**:
   Copy the keys from your `.env.local` to the Vercel Project Settings.
4. **Authorized Domains**:
   **IMPORTANT**: Add your Vercel URL (e.g., `agency.vercel.app`) to the "Authorized Domains" in your Firebase Console under Authentication > Settings.

---
Designed with excellence by **Pioneers Digital Marketing Agency**.
