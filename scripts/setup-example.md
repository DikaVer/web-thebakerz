# Quick Setup Example

## First Time Setup

1. **Install dependencies** (if not already done):
   ```bash
   pnpm install
   ```

2. **Check your environment variables** in `.env` file:
   ```bash
   # Verify these are set
   echo $NEXT_PRIVATE_DATABASE_URL
   echo $NEXT_PRIVATE_COSMOS_DB_URI
   ```

3. **Run the sitemap generation**:
   ```bash
   npm run sitemap:generate
   ```

## Expected Output

You should see something like:
```
🚀 Starting TheBakerz Sitemap Generation...
📅 Timestamp: 2025-02-14T10:30:00.000Z
🌐 Site URL: https://www.thebakerz.com

Fetching active stores from PostgreSQL...
Found 15 active stores

=== Generating Stores Sitemap ===
✅ Generated sitemap-stores.xml with 15 stores
📁 Saved to: /path/to/your/project/sitemap-stores.xml

Fetching active products from CosmosDB...
Found 247 active products

=== Generating Products Sitemap ===
✅ Generated sitemap-products.xml with 247 products
📁 Saved to: /path/to/your/project/sitemap-products.xml

=== Updating Main Sitemap Index ===
✅ Updated sitemap.xml index
📁 Saved to: /path/to/your/project/sitemap.xml

🎉 Sitemap generation completed successfully!
📊 Summary:
   - Stores: 15
   - Products: 247
   - Total URLs: 262

📋 Next Steps:
1. Submit updated sitemaps to Google Search Console
2. Test robots.txt accessibility
3. Monitor crawl budget and indexing performance
4. Set up automated sitemap generation (daily/weekly)

🔒 Database connections closed
```

## Generated Files

After running, you'll have these new/updated files:
- `sitemap.xml` - Main sitemap index
- `sitemap-stores.xml` - All your active stores
- `sitemap-products.xml` - All your active products

## Next Steps

1. **Test the URLs**: Visit `https://yoursite.com/sitemap.xml` to verify it's accessible
2. **Submit to Google**: Add the sitemap in Google Search Console
3. **Set up automation**: Consider daily/weekly automated runs 