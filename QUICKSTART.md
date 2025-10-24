# Quick Start Guide

Follow these steps to get your ShipTracker app up and running in minutes!

## 1️⃣ Install Dependencies

```bash
npm install
```

## 2️⃣ Set Up Supabase

### Create a Supabase Project
1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in project details and create it

### Get Your Credentials
1. Go to Project Settings > API
2. Copy:
   - Project URL
   - Anon/Public key

### Set Up Database
1. In Supabase Dashboard, go to SQL Editor
2. Open `DATABASE_SCHEMA.md` in this project
3. Copy and execute each SQL section in order:
   - ✅ Profiles table
   - ✅ Carriers table (includes default carriers)
   - ✅ Shipments table
   - ✅ Tracking events table
   - ✅ Update triggers

## 3️⃣ Configure Environment

Create `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 4️⃣ Run the App

```bash
npm run dev
```

Open http://localhost:3000

## 5️⃣ Test It Out!

1. **Sign Up**: Create an account at `/signup`
2. **Add Shipment**: Click "Add New Shipment" on dashboard
3. **View Tracking**: See your shipment in the dashboard
4. **Test Features**: Try filtering, searching, and viewing details

## 🚀 Deploy to Vercel

### Quick Deploy

```bash
npm install -g vercel
vercel
```

Add the same environment variables when prompted, but change:
- `NEXT_PUBLIC_APP_URL` to your Vercel deployment URL

### Or via GitHub
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables
5. Deploy!

## 📝 Default Carriers

The database setup includes these carriers by default:
- UPS
- FedEx
- USPS
- DHL
- Amazon Logistics

## 🆘 Common Issues

**Can't connect to database?**
- Check your `.env.local` file has correct credentials
- Verify environment variables don't have extra spaces

**Authentication not working?**
- Check Supabase Auth settings allow email/password
- Look for email confirmation in spam folder

**Build errors?**
- Delete `.next` folder and `node_modules`
- Run `npm install` again
- Make sure Node.js version is 18+

## ✅ You're All Set!

Your AfterShip clone is ready to track shipments. The app includes:
- ✨ Beautiful, responsive UI with DaisyUI
- 🔒 Secure authentication with Supabase
- 📊 Real-time dashboard with statistics
- 🚚 Multi-carrier support
- 🔍 Smart search and filtering
- ⚡ Optimized for Vercel deployment

Need help? Check the full README.md for detailed documentation.

