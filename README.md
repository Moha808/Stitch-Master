# StitchMaster - Tailoring Management System ✂️

StitchMaster is a premium, modern, and highly functional Web OS built for tailor shops and fashion designers. It digitizes the entire bespoke fashion workflow—from logging custom client measurements and tracking the production lifecycle to automating billing and visualizing business analytics. 

## ✨ Key Features
- **Customer & Measurement Profiles**: Securely store and retrieve precise measurements for hundreds of clients.
- **Order Tracking Lifecycle**: Track custom outfits through the stages of production (Pending -> In Progress -> Ready -> Delivered).
- **Automated Financial Ledger**: Automatically calculate outstanding balances and total revenue.
- **Online Payment Gateway**: Integrated with Flutterwave to process secure card and bank transfer payments directly on the platform.
- **Role-Based Access Control**: Different dashboard views and permissions for Admin, Staff, and Customers.
- **Modern UI/UX**: Built with a beautiful, fully responsive interface featuring Dark Mode, glassmorphism, and interactive micro-animations.

## 🛠️ Tech Stack
- **Frontend**: React (Vite), Tailwind CSS
- **Backend & Database**: Firebase (Firestore, Authentication)
- **Payments**: Flutterwave API
- **Hosting**: Vercel

## 🚀 Setup & Local Deployment

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
   cd tailoring-ms
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory and add your Firebase and Flutterwave keys:
   ```env
   VITE_FIREBASE_API_KEY="your-api-key"
   VITE_FIREBASE_AUTH_DOMAIN="your-auth-domain"
   VITE_FIREBASE_PROJECT_ID="your-project-id"
   VITE_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
   VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
   VITE_FIREBASE_APP_ID="your-app-id"

   VITE_FLUTTERWAVE_PUBLIC_KEY="your-flutterwave-public-key"
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

*Note: For production deployment on Vercel, make sure to add the Environment Variables in your Vercel project settings!*
