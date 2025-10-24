# Product Integration Feature - Shopify to TikTok Shop

## 🎯 Overview

This feature allows users to connect their Shopify stores and TikTok Shop accounts, sync products, and automatically keep inventory and prices in sync between platforms.

## 🚀 Features

- **Platform Integrations**: Connect Shopify and TikTok Shop accounts
- **Product Sync**: Automatically sync products from Shopify to your database
- **Product Linking**: Create links between Shopify and TikTok Shop products
- **Auto Sync**: Keep prices and inventory synchronized
- **Sync Logs**: Track all sync operations for debugging
- **Batch Operations**: Sync multiple products efficiently

## 📊 Database Tables

The following tables were added (see `DATABASE_PRODUCT_SCHEMA.md`):

1. **integrations** - Stores platform connections (Shopify, TikTok Shop)
2. **products** - Stores synced products from Shopify
3. **product_links** - Maps Shopify products to TikTok Shop products
4. **sync_logs** - Tracks sync operations and errors

## 🛠️ Setup Instructions

### 1. Run Database Schema

```bash
# In Supabase SQL Editor, run the SQL from DATABASE_PRODUCT_SCHEMA.md
```

### 2. Get Shopify API Credentials

1. Go to your Shopify Admin: `your-store.myshopify.com/admin`
2. Navigate to **Apps** > **Develop apps**
3. Create a private app or custom app
4. Get your **Admin API access token**
5. Required scopes:
   - `read_products`
   - `write_products`
   - `read_inventory`
   - `write_inventory`

### 3. Get TikTok Shop API Credentials

1. Register at [TikTok Shop Seller Center](https://seller.tiktokglobalshop.com)
2. Apply for API access
3. Get your App Key, App Secret, and Access Token
4. Note: TikTok Shop API implementation is a placeholder - actual implementation requires their official SDK

### 4. Connect Integration

1. Go to `/integrations` in your app
2. Click "Add Integration"
3. Select platform (Shopify)
4. Enter your shop URL: `your-store.myshopify.com`
5. Enter your access token
6. Click "Add Integration"

### 5. Sync Products

1. On the integrations page, click "Sync Products"
2. Wait for sync to complete
3. View synced products at `/products`

### 6. Link Products

1. Go to `/product-links`
2. Click "Create Link"
3. Select Shopify product
4. Enter TikTok Shop product ID
5. Choose sync settings (price/inventory)
6. Click "Create Link"

### 7. Sync Products

- Click "Sync Now" on any product link to manually sync
- Or set up automated syncing via cron jobs (see below)

## 🔄 Automated Syncing

### Option 1: Vercel Cron Jobs

Create `/app/api/cron/sync-products/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Sync all active product links
  // Implementation here...

  return NextResponse.json({ success: true })
}
```

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/sync-products",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

### Option 2: Shopify Webhooks

Set up webhooks for real-time updates:
- `products/update` - Update product when changed
- `inventory_levels/update` - Update inventory when changed

## 🔌 API Endpoints

### Integrations
- `GET /api/integrations` - List integrations
- `POST /api/integrations` - Add integration

### Products
- `GET /api/products` - List synced products
- `POST /api/integrations/shopify/products` - Sync Shopify products

### Product Links
- `GET /api/product-links` - List product links
- `POST /api/product-links` - Create product link
- `POST /api/product-links/[id]/sync` - Sync specific link

## 📱 Pages

1. **`/integrations`** - Manage platform connections
2. **`/products`** - View synced products
3. **`/product-links`** - Manage product links and sync

## 🔐 Security Considerations

### Current Implementation
- Access tokens stored in database (visible in code)
- Basic rate limiting on API endpoints
- RLS policies for multi-tenant data isolation

### Production Recommendations

1. **Encrypt Tokens**:
```typescript
import crypto from 'crypto'

function encrypt(text: string): string {
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(process.env.ENCRYPTION_KEY!),
    Buffer.from(process.env.ENCRYPTION_IV!)
  )
  return cipher.update(text, 'utf8', 'hex') + cipher.final('hex')
}
```

2. **Use Environment Variables**:
```env
ENCRYPTION_KEY=your-32-byte-key
ENCRYPTION_IV=your-16-byte-iv
CRON_SECRET=your-cron-secret
```

3. **Implement OAuth**:
- Use Shopify OAuth instead of private apps
- Implement TikTok Shop OAuth flow
- Store refresh tokens securely

4. **Add Webhook Verification**:
```typescript
function verifyShopifyWebhook(data: string, hmac: string): boolean {
  const hash = crypto
    .createHmac('sha256', process.env.SHOPIFY_SECRET!)
    .update(data, 'utf8')
    .digest('base64')
  return hash === hmac
}
```

## 🐛 Troubleshooting

### Products Not Syncing
- Check Shopify access token has correct scopes
- Verify shop URL is correct
- Check rate limiting (Shopify has API limits)
- View error logs in sync_logs table

### Sync Failing
- Ensure TikTok Shop API credentials are valid
- Check product ID mapping is correct
- Verify network connectivity to APIs
- Check Supabase logs for errors

### Integration Can't Connect
- Verify credentials are correct
- Check network/firewall settings
- Ensure API access is enabled in platform settings

## 📊 Monitoring

### View Sync Logs

```sql
SELECT * FROM sync_logs 
WHERE user_id = 'your-user-id'
ORDER BY created_at DESC 
LIMIT 50;
```

### Check Failed Syncs

```sql
SELECT pl.*, p.title
FROM product_links pl
JOIN products p ON p.id = pl.shopify_product_id
WHERE pl.sync_status = 'error'
AND pl.user_id = 'your-user-id';
```

## 🚧 Known Limitations

1. **TikTok Shop API**: Placeholder implementation - requires official API documentation
2. **Batch Sync**: Current implementation syncs one product at a time
3. **Webhooks**: Not implemented - requires manual sync or cron
4. **Product Variants**: Only syncs primary variant
5. **Image Sync**: Only syncs first product image

## 🔮 Future Enhancements

1. ✅ Add product variant support
2. ✅ Implement Shopify webhooks for real-time sync
3. ✅ Add TikTok Shop API integration (when available)
4. ✅ Batch sync operations for better performance
5. ✅ Sync multiple product images
6. ✅ Add sync scheduling per product link
7. ✅ Email notifications for sync errors
8. ✅ Export/import product mappings

## 💡 Usage Tips

1. **Test with Few Products**: Start with 2-3 products to test the workflow
2. **Manual Sync First**: Use manual sync before setting up automation
3. **Monitor Logs**: Check sync logs regularly for errors
4. **Backup Data**: Export product links before making bulk changes
5. **Rate Limits**: Be mindful of API rate limits from both platforms

## 📞 Support

For issues:
1. Check database logs in Supabase
2. Review sync_logs table for errors
3. Verify API credentials
4. Check network connectivity

---

Built following Next.js 14, Supabase, and DaisyUI best practices.

