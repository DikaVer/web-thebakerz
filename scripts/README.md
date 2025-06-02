# TheBakerz Sitemap Generation Script

This script automatically generates XML sitemaps for the TheBakerz marketplace by pulling data from your PostgreSQL and CosmosDB databases.

## Overview

The script generates three main sitemap files:
- `sitemap-stores.xml` - All active stores with their metadata
- `sitemap-products.xml` - All active products organized by store
- `sitemap.xml` - Main sitemap index file with updated timestamps

## Prerequisites

1. **Environment Variables**: Make sure your `.env` file contains all necessary database connection strings:
   ```env
   NEXT_PRIVATE_DATABASE_URL=your_postgresql_connection_string
   NEXT_PRIVATE_DATABASE_USER=your_db_user
   NEXT_PRIVATE_DATABASE_HOST=your_db_host
   DATABASE_DATABASE=your_db_name
   NEXT_PRIVATE_DATABASE_PASSWORD=your_db_password
   NEXT_PRIVATE_COSMOS_DB_URI=your_cosmos_db_endpoint
   NEXT_PRIVATE_COSMOS_DB_KEY=your_cosmos_db_key
   NEXT_PRIVATE_COSMOS_DB_NAME=your_cosmos_db_name
   ```

2. **Dependencies**: Install required packages:
   ```bash
   npm install
   # or
   pnpm install
   ```

## Usage

### Quick Start
```bash
npm run sitemap:generate
```

### Manual Execution
```bash
node scripts/generate-sitemaps.js
```

## What the Script Does

### 1. Fetches Active Stores
- Queries PostgreSQL for all non-deleted, non-hidden stores
- Joins with users table to get owner information
- Calculates product count for each store from CosmosDB
- Sorts stores by product count (most active first)

### 2. Fetches Active Products
- Queries CosmosDB for all non-archived, non-hidden products
- Groups products by store for better organization
- Includes product metadata like images, descriptions, and categories

### 3. Generates SEO-Optimized XML
- **Mobile-first indexing** with `<mobile:mobile/>` tags
- **Image sitemaps** with descriptive captions
- **Dynamic priorities** based on store activity and product characteristics
- **Proper change frequencies** based on content age and type
- **URL structure** matching Next.js app router patterns

### 4. Priority System

**Stores:**
- High activity stores (20+ products): Priority 0.9
- Medium activity stores (10+ products): Priority 0.8
- Regular stores (5+ products): Priority 0.7
- Low activity stores (<5 products): Priority 0.6
- Featured stores (top 5): +0.1 bonus priority

**Products:**
- Featured/bestseller category: Priority 0.9
- New products (< 7 days): Priority 0.8
- Seasonal/special category: Priority 0.7
- Standard products: Priority 0.6

## Output Files

The script creates/updates these files in your project root:

1. **sitemap-stores.xml**
   - All active store pages
   - Store owner images included
   - Priority based on store activity

2. **sitemap-products.xml** 
   - All active product pages
   - Product images included (main + up to 3 additional)
   - Organized by store for better structure

3. **sitemap.xml**
   - Main sitemap index
   - References all sub-sitemaps
   - Updated timestamps

## Automation

### Recommended Schedule
- **Daily**: For high-traffic marketplaces with frequent updates
- **Weekly**: For moderate-traffic marketplaces
- **On-demand**: After major content updates

### GitHub Actions Example
```yaml
name: Generate Sitemaps
on:
  schedule:
    - cron: '0 2 * * *' # Daily at 2 AM
  workflow_dispatch: # Manual trigger

jobs:
  generate-sitemaps:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm run sitemap:generate
      - name: Commit updated sitemaps
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add sitemap*.xml
          git diff --staged --quiet || git commit -m "Auto-update sitemaps"
          git push
```

### Vercel Cron Job
You can also set up Vercel cron jobs to run this script periodically:

```typescript
// pages/api/cron/generate-sitemaps.ts
import { generateStoresSitemap, generateProductsSitemap, updateMainSitemap } from '../../../scripts/generate-sitemaps.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const [storeCount, productCount] = await Promise.all([
      generateStoresSitemap(),
      generateProductsSitemap()
    ]);
    
    await updateMainSitemap();
    
    return res.status(200).json({ 
      success: true, 
      storeCount, 
      productCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Sitemap generation failed:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
```

## SEO Benefits

1. **Faster Indexing**: Search engines discover new stores and products immediately
2. **Better Crawl Budget**: Organized sitemaps help search engines prioritize important content
3. **Enhanced Visibility**: Image sitemaps improve product visibility in image search
4. **Mobile Optimization**: Mobile-first indexing tags ensure proper mobile search performance
5. **Dynamic Priorities**: Important content gets crawled more frequently

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify environment variables are correctly set
   - Check database connection strings and credentials
   - Ensure databases are accessible from your environment

2. **Missing Products/Stores**
   - Check that items aren't marked as archived/hidden/deleted
   - Verify database queries are returning expected results
   - Review the filtering logic in the script

3. **Large Dataset Performance**
   - For marketplaces with 10,000+ products, consider implementing pagination
   - Split large sitemaps into multiple files (by category, date, etc.)
   - Optimize database queries with proper indexing

### Monitoring

After running the script:

1. **Submit to Google Search Console**
   - Go to Sitemaps section
   - Submit your main sitemap: `https://yoursite.com/sitemap.xml`

2. **Monitor Indexing**
   - Check coverage reports in Google Search Console
   - Monitor for any errors or warnings
   - Track indexing speed and coverage

3. **Performance Tracking**
   - Monitor organic search traffic
   - Track store/product page visibility
   - Measure crawl budget efficiency

## Contributing

When making changes to the script:

1. Test with a small dataset first
2. Validate generated XML against sitemap standards
3. Test sitemap URLs are accessible
4. Update this README if adding new features

## Support

For issues related to:
- Database connectivity: Check your connection strings and credentials
- XML generation: Validate against sitemap.org standards
- SEO optimization: Review Google's sitemap guidelines
- Performance: Consider implementing pagination for large datasets 