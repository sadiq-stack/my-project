# AfterShip Clone - Database Schema

## Supabase Tables Setup

Run these SQL commands in your Supabase SQL Editor to set up the database:

### 1. Users Table (Extended from Supabase Auth)
```sql
-- This extends the built-in auth.users table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  company_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
```

### 2. Carriers Table
```sql
CREATE TABLE public.carriers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  website TEXT,
  logo_url TEXT,
  tracking_url_template TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.carriers ENABLE ROW LEVEL SECURITY;

-- Policies (public read access)
CREATE POLICY "Anyone can view active carriers" ON public.carriers
  FOR SELECT USING (is_active = TRUE);

-- Insert default carriers
INSERT INTO public.carriers (name, slug, website, tracking_url_template) VALUES
  ('UPS', 'ups', 'https://www.ups.com', 'https://www.ups.com/track?tracknum={tracking_number}'),
  ('FedEx', 'fedex', 'https://www.fedex.com', 'https://www.fedex.com/fedextrack/?tracknumbers={tracking_number}'),
  ('USPS', 'usps', 'https://www.usps.com', 'https://tools.usps.com/go/TrackConfirmAction?tLabels={tracking_number}'),
  ('DHL', 'dhl', 'https://www.dhl.com', 'https://www.dhl.com/en/express/tracking.html?AWB={tracking_number}'),
  ('Amazon Logistics', 'amazon', 'https://www.amazon.com', 'https://www.amazon.com/progress-tracker/package/{tracking_number}');
```

### 3. Shipments Table
```sql
CREATE TABLE public.shipments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  carrier_id UUID REFERENCES public.carriers(id) NOT NULL,
  tracking_number TEXT NOT NULL,
  title TEXT,
  description TEXT,
  origin TEXT,
  destination TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'cancelled')),
  estimated_delivery_date TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, tracking_number, carrier_id)
);

-- Enable RLS
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own shipments" ON public.shipments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own shipments" ON public.shipments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shipments" ON public.shipments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own shipments" ON public.shipments
  FOR DELETE USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_shipments_user_id ON public.shipments(user_id);
CREATE INDEX idx_shipments_status ON public.shipments(status);
CREATE INDEX idx_shipments_tracking_number ON public.shipments(tracking_number);
```

### 4. Tracking Events Table
```sql
CREATE TABLE public.tracking_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shipment_id UUID REFERENCES public.shipments(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL,
  location TEXT,
  description TEXT NOT NULL,
  event_time TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view events for their shipments" ON public.tracking_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.shipments
      WHERE shipments.id = tracking_events.shipment_id
      AND shipments.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert events for their shipments" ON public.tracking_events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.shipments
      WHERE shipments.id = tracking_events.shipment_id
      AND shipments.user_id = auth.uid()
    )
  );

-- Index for performance
CREATE INDEX idx_tracking_events_shipment_id ON public.tracking_events(shipment_id);
CREATE INDEX idx_tracking_events_event_time ON public.tracking_events(event_time DESC);
```

### 5. Update Trigger for updated_at
```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to shipments
CREATE TRIGGER update_shipments_updated_at
  BEFORE UPDATE ON public.shipments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Setup Instructions

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste each section above
4. Execute them in order
5. Verify tables are created in the Table Editor

## Notes

- All tables use Row Level Security (RLS) for secure data access
- The schema supports multi-tenant usage with user isolation
- Indexes are added for common query patterns
- Foreign key constraints ensure data integrity
- The tracking_number is unique per user and carrier combination

