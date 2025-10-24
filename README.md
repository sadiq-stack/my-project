# ShipTracker - AfterShip Clone

A comprehensive multi-carrier shipment tracking platform built with Next.js 14, Supabase, and DaisyUI. Track packages from multiple carriers in one unified dashboard with real-time updates and detailed tracking history.

## 🚀 Features

### Core Features
- **Multi-Carrier Support**: Track shipments from UPS, FedEx, USPS, DHL, Amazon, and more
- **Real-Time Dashboard**: View all your shipments with live status updates
- **Detailed Tracking Timeline**: Complete history of package movements
- **Smart Search & Filtering**: Find shipments quickly by tracking number, carrier, or status
- **Product Integration**: Link Shopify products to TikTok Shop for automated syncing
- **Secure Authentication**: User accounts with email/password via Supabase Auth
- **Responsive Design**: Beautiful UI that works on all devices using DaisyUI
- **Server-Side Rendering**: Optimized for performance and SEO with Next.js 14 App Router

### Production-Ready Features ⚡ NEW
- **Comprehensive Validation**: All inputs validated with custom validation rules
- **Professional Logging**: Structured logging system with multiple log levels
- **Error Handling**: Centralized error handling with proper user feedback
- **Rate Limiting**: Protection against API abuse with configurable limits
- **Toast Notifications**: Beautiful user feedback for all actions
- **Health Monitoring**: `/api/health` endpoint for uptime checks
- **Security**: XSS prevention, input sanitization, and secure authentication
- **Performance**: Caching headers, pagination, and optimized queries

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Backend**: Supabase (PostgreSQL + Auth)
- **Styling**: Tailwind CSS + DaisyUI
- **Deployment**: Vercel
- **Authentication**: Supabase Auth with SSR

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Supabase account ([supabase.com](https://supabase.com))
- Git installed

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd aftership-clone
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [app.supabase.com](https://app.supabase.com)
2. Go to Project Settings > API
3. Copy your project URL and anon key

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Set Up Database

1. Open your Supabase project dashboard
2. Navigate to SQL Editor
3. Open the `DATABASE_SCHEMA.md` file in this project
4. Copy and paste each SQL section into the SQL Editor and execute them in order:
   - Profiles table
   - Carriers table (with default carriers)
   - Shipments table
   - Tracking events table
   - Triggers

This will create all necessary tables, relationships, and Row Level Security (RLS) policies.

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
aftership-clone/
├── app/                          # Next.js 14 App Router
│   ├── api/                      # API endpoints
│   │   ├── carriers/             # Carriers API
│   │   ├── dashboard/            # Dashboard stats API
│   │   └── shipments/            # Shipments CRUD API
│   ├── dashboard/                # Dashboard page
│   ├── shipments/                # Shipments list & detail pages
│   ├── add-shipment/             # Add shipment page
│   ├── signin/                   # Sign in page
│   ├── signup/                   # Sign up page
│   ├── track/                    # Public tracking page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── Navbar.tsx                # Navigation bar
│   ├── Footer.tsx                # Footer
│   ├── ShipmentCard.tsx          # Shipment display card
│   ├── StatusBadge.tsx           # Status badge component
│   ├── TrackingTimeline.tsx      # Tracking events timeline
│   ├── DashboardStats.tsx        # Dashboard statistics
│   ├── DeleteShipmentButton.tsx  # Delete confirmation
│   └── Loading.tsx               # Loading spinner
├── lib/                          # Utility libraries
│   ├── supabase/                 # Supabase clients
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client
│   │   └── middleware.ts         # Auth middleware
│   └── rate-limit.ts             # Rate limiting utility
├── types/                        # TypeScript definitions
│   └── index.ts                  # Type definitions
├── middleware.ts                 # Next.js middleware
├── DATABASE_SCHEMA.md            # Database setup SQL
└── package.json                  # Dependencies
```

## 🔐 Security Features

- **Row Level Security (RLS)**: All database tables use RLS to ensure users can only access their own data
- **Rate Limiting**: API endpoints include rate limiting to prevent abuse
- **Authentication**: Secure session management with Supabase Auth and SSR
- **Input Validation**: All API endpoints validate input data
- **Error Handling**: Comprehensive error handling and logging

## 🚀 Deployment to Vercel

### Option 1: Deploy via Vercel Dashboard

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your repository
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` (your Vercel deployment URL)
6. Click "Deploy"

### Option 2: Deploy via CLI

```bash
npm install -g vercel
vercel login
vercel
```

Follow the prompts and add your environment variables when asked.

## 📊 Database Schema

The application uses the following main tables:

- **profiles**: Extended user information
- **carriers**: Shipping carriers (UPS, FedEx, etc.)
- **shipments**: User's tracked packages
- **tracking_events**: Shipment tracking history

See `DATABASE_SCHEMA.md` for complete schema details and setup SQL.

## 🎨 UI Components

All components use DaisyUI for consistent styling:

- Form inputs and buttons
- Cards and modals
- Navigation and footers
- Badges and alerts
- Timeline for tracking events
- Responsive grid layouts

## 📝 API Endpoints

### Carriers
- `GET /api/carriers` - List all active carriers

### Shipments
- `GET /api/shipments` - Get user's shipments (with optional status filter)
- `POST /api/shipments` - Create new shipment
- `GET /api/shipments/[id]` - Get specific shipment with tracking events
- `PUT /api/shipments/[id]` - Update shipment
- `DELETE /api/shipments/[id]` - Delete shipment

### Tracking Events
- `POST /api/shipments/[id]/events` - Add tracking event

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

All endpoints include:
- Authentication checks
- Rate limiting
- Error handling
- Request validation

## 🧪 Testing

After setup, test the following flows:

1. **Sign Up**: Create a new account
2. **Add Shipment**: Add a test shipment with any carrier
3. **View Dashboard**: Check statistics and recent shipments
4. **Filter Shipments**: Test search and status filters
5. **View Details**: Click on a shipment to see tracking timeline
6. **Delete Shipment**: Remove a test shipment

## 🐛 Troubleshooting

### Database Connection Issues
- Verify your Supabase URL and anon key in `.env.local`
- Check that RLS policies are correctly set up
- Ensure tables were created successfully

### Authentication Problems
- Clear browser cookies and local storage
- Verify email confirmation (check spam folder)
- Check Supabase Auth settings

### Build Errors
- Delete `.next` folder and `node_modules`
- Run `npm install` again
- Ensure all environment variables are set

## 🤝 Contributing

This project follows these key principles:

1. Use TypeScript for all files
2. Follow DaisyUI component patterns
3. Include comments in all components
4. Implement proper error handling
5. Test on localhost before deploying
6. Ensure Vercel compatibility

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🙏 Acknowledgments

- Built following Next.js 14 best practices
- Styled with DaisyUI for rapid UI development
- Powered by Supabase for backend and authentication
- Deployed on Vercel for optimal performance

---

**Built with ❤️ using Next.js, Supabase, and DaisyUI**

For questions or issues, please open an issue on GitHub.

#   m y - p r o j e c t  
 