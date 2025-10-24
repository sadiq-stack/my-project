# Product Integration Schema

## Additional Supabase Tables for Shopify <-> TikTok Shop Integration

Run these SQL commands in your Supabase SQL Editor:

### 1. Integrations Table
```sql
-- Store user's platform integrations (Shopify, TikTok Shop)
CREATE TABLE public.integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('shopify', 'tiktok_shop')),
  shop_url TEXT NOT NULL,
  access_token TEXT NOT NULL, -- Encrypted in production
  is_active BOOLEAN DEFAULT TRUE,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, platform, shop_url)
);

-- Enable RLS
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own integrations" ON public.integrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own integrations" ON public.integrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own integrations" ON public.integrations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own integrations" ON public.integrations
  FOR DELETE USING (auth.uid() = user_id);

-- Index
CREATE INDEX idx_integrations_user_id ON public.integrations(user_id);
CREATE INDEX idx_integrations_platform ON public.integrations(platform);
```

### 2. Products Table
```sql
-- Store products from Shopify
CREATE TABLE public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  integration_id UUID REFERENCES public.integrations(id) ON DELETE CASCADE NOT NULL,
  external_id TEXT NOT NULL, -- Shopify product ID
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  currency TEXT DEFAULT 'USD',
  image_url TEXT,
  sku TEXT,
  inventory_quantity INTEGER,
  product_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(integration_id, external_id)
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own products" ON public.products
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products" ON public.products
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products" ON public.products
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products" ON public.products
  FOR DELETE USING (auth.uid() = user_id);

-- Index
CREATE INDEX idx_products_user_id ON public.products(user_id);
CREATE INDEX idx_products_integration_id ON public.products(integration_id);
CREATE INDEX idx_products_external_id ON public.products(external_id);
```

### 3. Product Links Table
```sql
-- Store mappings between Shopify and TikTok Shop products
CREATE TABLE public.product_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  shopify_product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  tiktok_product_id TEXT NOT NULL, -- TikTok Shop product ID
  tiktok_product_title TEXT,
  sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'error', 'disabled')),
  sync_price BOOLEAN DEFAULT TRUE,
  sync_inventory BOOLEAN DEFAULT TRUE,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(shopify_product_id, tiktok_product_id)
);

-- Enable RLS
ALTER TABLE public.product_links ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own product links" ON public.product_links
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own product links" ON public.product_links
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own product links" ON public.product_links
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own product links" ON public.product_links
  FOR DELETE USING (auth.uid() = user_id);

-- Index
CREATE INDEX idx_product_links_user_id ON public.product_links(user_id);
CREATE INDEX idx_product_links_shopify_product_id ON public.product_links(shopify_product_id);
CREATE INDEX idx_product_links_sync_status ON public.product_links(sync_status);
```

### 4. Sync Logs Table
```sql
-- Track sync operations for debugging
CREATE TABLE public.sync_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_link_id UUID REFERENCES public.product_links(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL CHECK (sync_type IN ('price', 'inventory', 'full')),
  status TEXT NOT NULL CHECK (status IN ('success', 'error')),
  details JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own sync logs" ON public.sync_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sync logs" ON public.sync_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Index
CREATE INDEX idx_sync_logs_user_id ON public.sync_logs(user_id);
CREATE INDEX idx_sync_logs_product_link_id ON public.sync_logs(product_link_id);
CREATE INDEX idx_sync_logs_created_at ON public.sync_logs(created_at DESC);
```

### 5. Update Triggers
```sql
-- Apply update trigger to integrations
CREATE TRIGGER update_integrations_updated_at
  BEFORE UPDATE ON public.integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply update trigger to products
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply update trigger to product_links
CREATE TRIGGER update_product_links_updated_at
  BEFORE UPDATE ON public.product_links
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Notes

- **Security**: In production, encrypt access tokens before storing
- **Webhooks**: Consider setting up Shopify webhooks for real-time updates
- **Rate Limits**: Both Shopify and TikTok Shop APIs have rate limits
- **Batch Operations**: Sync operations should be batched for efficiency
- **Error Handling**: Sync logs help debug integration issues

