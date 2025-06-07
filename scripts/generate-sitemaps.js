#!/usr/bin/env node

/**
 * Generate TheBakerz Comprehensive Sitemap & Robots.txt Script
 * 
 * This script automatically generates a single sitemap.xml file containing all pages
 * and creates a robots.txt file by fetching data from PostgreSQL and CosmosDB.
 * 
 * Usage: node scripts/generate-sitemaps.js
 */

const { Pool } = require('pg');
const { CosmosClient } = require('@azure/cosmos');
const fs = require('fs').promises;
const path = require('path');

// Load environment variables
require('dotenv').config();

// Example stores to exclude from sitemaps (imported from src/lib/local-variables.ts)
const exampleStore = ['OrGoD8o3jQ', 'NwzUMel5X6', 'S8gWY29Zhx'];

// Database connections
const connectionPool = new Pool({
    connectionString: process.env.NEXT_PRIVATE_DATABASE_URL,
    user: process.env.NEXT_PRIVATE_DATABASE_USER,
    host: process.env.NEXT_PRIVATE_DATABASE_HOST,
    database: process.env.DATABASE_DATABASE,
    password: process.env.NEXT_PRIVATE_DATABASE_PASSWORD,
    port: 5432,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

const cosmosClient = new CosmosClient({
    endpoint: process.env.NEXT_PRIVATE_COSMOS_DB_URI,
    key: process.env.NEXT_PRIVATE_COSMOS_DB_KEY,
});

const cosmosDB = cosmosClient.database(process.env.NEXT_PRIVATE_COSMOS_DB_NAME);
const containerProducts = cosmosDB.container("Products");

// Configuration
const SITE_URL = 'https://www.thebakerz.com';

// Video configuration for pages with embedded videos
const pageVideos = {
    '/become-partner': {
        title: 'TheBakerz Platform Demo - How to Grow Your Bakery Business',
        description: 'Discover how TheBakerz platform helps bakers create their online presence, manage orders, and grow their business. See the platform features and tools designed specifically for bakery businesses.',
        thumbnailUrl: 'https://img.youtube.com/vi/2hlFLVs1oMk/maxresdefault.jpg',
        contentUrl: 'https://www.youtube.com/watch?v=2hlFLVs1oMk',
        duration: 120, // seconds
        uploadDate: '2024-12-01T00:00:00Z',
        tags: ['bakery', 'business', 'platform', 'partnership', 'TheBakerz', 'demo']
    }
};

/**
 * Escape XML special characters
 */
function escapeXml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Generate XML sitemap header with video namespace
 */
function generateSitemapHeader() {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">`;
}

/**
 * Generate XML sitemap footer
 */
function generateSitemapFooter() {
    return `
</urlset>`;
}

/**
 * Generate video XML for a page
 */
function generateVideoXml(videoData) {
    if (!videoData) return '';
    
    let videoXml = `
    <video:video>
      <video:thumbnail_loc>${escapeXml(videoData.thumbnailUrl)}</video:thumbnail_loc>
      <video:title>${escapeXml(videoData.title)}</video:title>
      <video:description>${escapeXml(videoData.description)}</video:description>
      <video:content_loc>${escapeXml(videoData.contentUrl)}</video:content_loc>
      <video:duration>${videoData.duration}</video:duration>
      <video:publication_date>${videoData.uploadDate}</video:publication_date>
      <video:family_friendly>yes</video:family_friendly>
      <video:live>no</video:live>`;
    
    if (videoData.tags && videoData.tags.length > 0) {
        videoXml += `
      <video:tag>${escapeXml(videoData.tags.join(', '))}</video:tag>`;
    }
    
    videoXml += `
    </video:video>`;
    
    return videoXml;
}

/**
 * Generate static pages URLs with video support
 */
function generateStaticPagesXml() {
    const currentDate = new Date().toISOString();
    const staticPages = [
        { url: SITE_URL, priority: 1.0, changefreq: 'daily' },
        { url: `${SITE_URL}/about-us`, priority: 0.95, changefreq: 'weekly' },
        { url: `${SITE_URL}/become-partner`, priority: 0.98, changefreq: 'weekly' },
        { url: `${SITE_URL}/search`, priority: 0.95, changefreq: 'daily' },
        { url: `${SITE_URL}/auth`, priority: 0.95, changefreq: 'monthly' },
        { url: `${SITE_URL}/support`, priority: 0.92, changefreq: 'weekly' },
        { url: `${SITE_URL}/support/contact-us`, priority: 0.9, changefreq: 'monthly' },
        { url: `${SITE_URL}/policies/privacy-policy`, priority: 0.9, changefreq: 'weekly' },
        { url: `${SITE_URL}/policies/refund-policy`, priority: 0.9, changefreq: 'weekly' },
        { url: `${SITE_URL}/policies/terms-of-use`, priority: 0.9, changefreq: 'weekly' },
        { url: `${SITE_URL}/socials`, priority: 0.92, changefreq: 'weekly' },
    ];

    let xml = `
  
  <!-- Static Pages -->`;

    staticPages.forEach(page => {
        const urlPath = page.url.replace(SITE_URL, '') || '/';
        const videoData = pageVideos[urlPath];
        
        xml += `
  <url>
    <loc>${escapeXml(page.url)}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <mobile:mobile/>`;

        // Add video data if available
        if (videoData) {
            xml += generateVideoXml(videoData);
        }

        xml += `
  </url>`;
    });

    return xml;
}

/**
 * Fetch all active stores from PostgreSQL
 */
async function fetchActiveStores() {
    try {
        console.log('Fetching active stores from PostgreSQL...');
        
        const query = `
            SELECT 
                s.id,
                s.user_id,
                s.nickname,
                s.description,
                s.slug,
                s.hidden,
                s.deleted,
                u.image AS picture,
                u.name AS "ownerName"
            FROM stores s
            JOIN users u ON s.user_id = u.id
            WHERE s.deleted = false 
                AND s.hidden = false
            ORDER BY s.nickname ASC
        `;

        const result = await connectionPool.query(query);
        console.log(`Found ${result.rows.length} active stores`);
        
        // Validate and clean the store data, excluding example stores
        const validStores = result.rows.filter(store => {
            if (!store.id) {
                console.warn('Skipping store with missing ID:', store);
                return false;
            }
            // Exclude example stores from sitemap
            if (exampleStore.includes(store.id)) {
                console.log(`Excluding example store: ${store.id} (${store.nickname || 'No nickname'})`);
                return false;
            }
            return true;
        });
        
        console.log(`Valid stores after filtering: ${validStores.length} (excluded ${result.rows.length - validStores.length} example/invalid stores)`);
        
        // Get product counts for each store from CosmosDB
        const storesWithCounts = await Promise.all(
            validStores.map(async (store) => {
                try {
                    const countQuery = {
                        query: "SELECT VALUE COUNT(1) FROM c WHERE c.store_id = @storeId AND c.archive = false AND c.hide_product = false",
                        parameters: [{ name: "@storeId", value: store.id }]
                    };
                    
                    const { resources } = await containerProducts.items
                        .query(countQuery, { partitionKey: store.id })
                        .fetchAll();
                    
                    return {
                        ...store,
                        product_count: resources[0] || 0
                    };
                } catch (error) {
                    console.warn(`Could not get product count for store ${store.id}:`, error.message);
                    return {
                        ...store,
                        product_count: 0
                    };
                }
            })
        );
        
        // Sort by product count (highest first) then by name
        storesWithCounts.sort((a, b) => {
            if (b.product_count !== a.product_count) {
                return b.product_count - a.product_count;
            }
            // Handle null/undefined nicknames safely
            const aName = a.nickname || a.id || '';
            const bName = b.nickname || b.id || '';
            return aName.localeCompare(bName);
        });
        
        return storesWithCounts;
    } catch (error) {
        console.error('Error fetching stores:', error);
        throw error;
    }
}


/**
 * Database fields to select when querying products.
 */
const PRODUCT_FIELDS = [
    'c.id',
    'c.store_id',
    'c.category',
    'c.name',
    'c.min_order',
    'c.min_lead_time',
    'c.description',
    'c.variants',
    'c.price',
    'c.picture',
    'c.ingredients',
    'c.allergies',
    'c.dietary',
    'c.additionalImages',
    'c.hide_product',
    'c.isPostDelivery'
];

/**
 * Fetch all active products from CosmosDB
 */
async function fetchActiveProducts() {
    try {
        console.log('Fetching active products from CosmosDB...');
        
        const querySpec = {
            query: `
                SELECT 
                    ${PRODUCT_FIELDS.join(', ')}
                FROM c 
                WHERE c.archive = false 
                    AND c.hide_product = false
                ORDER BY c.updatedAt DESC
            `
        };

        const { resources: products } = await containerProducts.items
            .query(querySpec)
            .fetchAll();

        console.log(`Found ${products.length} active products`);
        
        // Filter out products from example stores
        const validProducts = products.filter(product => {
            if (exampleStore.includes(product.store_id)) {
                console.log(`Excluding product from example store: ${product.id} (store: ${product.store_id})`);
                return false;
            }
            return true;
        });
        
        console.log(`Valid products after filtering: ${validProducts.length} (excluded ${products.length - validProducts.length} products from example stores)`);
        
        return validProducts;
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
}

/**
 * Generate store URL entry
 */
function generateStoreUrlEntry(store, priority = 0.85) {
    const storeUrl = `${SITE_URL}/${store.id}`;
    const lastmod = new Date().toISOString();
    const changefreq = priority >= 0.8 ? 'daily' : 'weekly';
    
    // Safe store name for captions
    const storeName = store.ownerName || store.nickname || `Store ${store.id}`;
    const storeDescription = store.description || 'Fresh baked goods and artisan treats';
    
    let entry = `
  <url>
    <loc>${escapeXml(storeUrl)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
    <mobile:mobile/>`;

    // Add store image if available
    if (store.picture) {
        const imageUrl = store.picture.startsWith('http') ? 
            store.picture : 
            `${SITE_URL}${store.picture}`;
        
        entry += `
    <image:image>
      <image:loc>${escapeXml(imageUrl)}</image:loc>
      <image:caption>${escapeXml(storeName)} - ${escapeXml(storeDescription)}</image:caption>
    </image:image>`;
    }

    entry += `
  </url>`;
    
    return entry;
}

/**
 * Generate product URL entry
 */
function generateProductUrlEntry(product, priority = 0.8) {
    const productUrl = `${SITE_URL}/${product.store_id}/item/${product.constId}`;
    const lastmod = product.updatedAt || product.createdAt || new Date().toISOString();
    
    // Determine change frequency based on product age and category
    const productAge = new Date() - new Date(product.createdAt || new Date());
    const isNewProduct = productAge < (7 * 24 * 60 * 60 * 1000); // 7 days
    const changefreq = isNewProduct ? 'daily' : 'weekly';
    
    // Keep priority consistent at 0.8 for all products
    priority = 0.8;

    // Safe product name and description
    const productName = product.name || product.web_name || `Product ${product.id}`;
    const productDescription = product.description || 'Fresh baked goods';

    let entry = `
  <url>
    <loc>${escapeXml(productUrl)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
    <mobile:mobile/>`;

    // Add main product image
    if (product.picture) {
        const imageUrl = product.picture.startsWith('http') ? 
            product.picture : 
            `${SITE_URL}${product.picture}`;
        
        entry += `
    <image:image>
      <image:loc>${escapeXml(imageUrl)}</image:loc>
      <image:caption>${escapeXml(productName)} - ${escapeXml(productDescription)}</image:caption>
    </image:image>`;
    }

    // Add additional images (max 3 additional)
    if (product.additionalImages && Array.isArray(product.additionalImages)) {
        const additionalImages = product.additionalImages.slice(0, 3);
        additionalImages.forEach((imageUrl, index) => {
            if (imageUrl) {
                const fullImageUrl = imageUrl.startsWith('http') ? 
                    imageUrl : 
                    `${SITE_URL}${imageUrl}`;
                
                entry += `
    <image:image>
      <image:loc>${escapeXml(fullImageUrl)}</image:loc>
      <image:caption>${escapeXml(productName)} - Additional view ${index + 1}</image:caption>
    </image:image>`;
            }
        });
    }

    entry += `
  </url>`;
    
    return entry;
}

/**
 * Generate comprehensive sitemap
 */
async function generateComprehensiveSitemap() {
    try {
        console.log('\n=== Generating Comprehensive Sitemap with Video Support ===');
        
        // Fetch all data in parallel
        const [stores, products] = await Promise.all([
            fetchActiveStores(),
            fetchActiveProducts()
        ]);
        
        let xml = generateSitemapHeader();
        xml += `
  
  <!-- TheBakerz Comprehensive Sitemap -->
  <!-- Last updated: ${new Date().toISOString()} -->
  <!-- Automatically generated from database -->
  <!-- Optimized for mobile-first indexing and marketplace SEO -->
  <!-- Includes video sitemap support for YouTube embeds -->`;

        // Add static pages (including video metadata)
        xml += generateStaticPagesXml();

        // Add store pages
        if (stores.length > 0) {
            xml += `
  
  <!-- Store Pages (${stores.length} stores) -->`;
            
            stores.forEach((store, index) => {
                // Set consistent priority for all stores
                const priority = 0.85;

                xml += generateStoreUrlEntry(store, priority);
            });
        }

        // Add product pages
        if (products.length > 0) {
            xml += `
  
  <!-- Product Pages (${products.length} products) -->`;
            
            // Group products by store for better organization
            const productsByStore = {};
            products.forEach(product => {
                if (!productsByStore[product.store_id]) {
                    productsByStore[product.store_id] = [];
                }
                productsByStore[product.store_id].push(product);
            });

            // Generate entries for each store's products
            Object.keys(productsByStore).forEach(storeId => {
                const storeProducts = productsByStore[storeId];
                
                xml += `
  
  <!-- Products from Store: ${storeId} (${storeProducts.length} products) -->`;
                
                storeProducts.forEach(product => {
                    // Set consistent priority for all products
                    const priority = 0.8;

                    xml += generateProductUrlEntry(product, priority);
                });
            });
        }

        xml += `
  
  <!-- 
  Comprehensive sitemap includes:
  - Static pages (homepage, about, policies, etc.)
  - All active store pages with priorities based on activity
  - All active product pages with images and categories
  - Mobile-first indexing with mobile tags
  - SEO optimized with proper priorities and change frequencies
  - Video sitemap support for YouTube embeds and marketing videos
  -->`;

        xml += generateSitemapFooter();
        
        // Write to file
        const filePath = path.join(process.cwd(), 'sitemap.xml');
        await fs.writeFile(filePath, xml, 'utf8');
        
        console.log(`✅ Generated comprehensive sitemap.xml with video support`);
        console.log(`📊 Summary:`);
        console.log(`   - Static pages: 10 (${Object.keys(pageVideos).length} with videos)`);
        console.log(`   - Stores: ${stores.length}`);
        console.log(`   - Products: ${products.length}`);
        console.log(`   - Videos: ${Object.keys(pageVideos).length}`);
        console.log(`   - Total URLs: ${10 + stores.length + products.length}`);
        console.log(`📁 Saved to: ${filePath}`);
        
        return { stores: stores.length, products: products.length, videos: Object.keys(pageVideos).length };
    } catch (error) {
        console.error('❌ Error generating comprehensive sitemap:', error);
        throw error;
    }
}

/**
 * Generate robots.txt file
 */
async function generateRobotsTxt() {
    try {
        console.log('\n=== Generating Robots.txt ===');
        
        const robotsContent = `# TheBakerz Robots.txt - Optimized for E-commerce Marketplace SEO
# Last updated: ${new Date().toLocaleDateString()}
# Website: ${SITE_URL}

# === MAIN CRAWLERS ===
User-agent: *

# === ALLOW PUBLIC CONTENT ===
# Main marketing and informational pages
Allow: /
Allow: /about-us
Allow: /become-partner
Allow: /search
Allow: /socials

# Support and help pages
Allow: /support
Allow: /support/contact-us

# Policy pages (important for trust and compliance)
Allow: /policies/privacy-policy
Allow: /policies/refund-policy
Allow: /policies/terms-of-use

# Store pages (public storefronts)
Allow: /*/
Allow: /*/item/*/

# Media and assets
Allow: /images/
Allow: /icons/
Allow: /assets/
Allow: /_next/static/
Allow: /public/

# Mobile-specific resources (2024 mobile-first indexing)
Allow: /*mobile$
Allow: /*responsive$
Allow: /assets/mobile/
Allow: /images/mobile/

# === BLOCK PRIVATE AND NON-INDEXABLE CONTENT ===

# Authentication and user account areas
Allow: /auth
Disallow: /login
Disallow: /register
Disallow: /account/

# Admin dashboard (admin-only access)
Disallow: /dashboard/
Disallow: /admin/

# User private areas
Disallow: /favorites
Disallow: /orders
Disallow: /settings
Disallow: /profile

# E-commerce checkout and payment flows
Disallow: /*/checkout
Disallow: /*/pay/
Disallow: /*/order/success
Disallow: /*/order/failed
Disallow: /cart
Disallow: /payment

# Store management (store owner only)
Disallow: /*/products
Disallow: /*/settings
Disallow: /*/orders/
Disallow: /*/item/add-item

# Transit and temporary redirect pages
Disallow: /transit-login
Disallow: /transit-exit

# API endpoints
Disallow: /api/

# Enhanced faceted navigation management (2024 best practices)
# Block filter combinations but allow category-level pages
Disallow: /*?*sort=*&*
Disallow: /*?*filter=*&*
Disallow: /*?*price=*&*
Disallow: /*?*color=*&*
Disallow: /*?*size=*&*
Disallow: /*?*brand=*&*
Allow: /*?category=*

# Specific parameter patterns
Disallow: /*?*
Disallow: /*&*
Disallow: /search?*
Disallow: /*sort=*
Disallow: /*filter=*
Disallow: /*page=*
Disallow: /*minPrice=*
Disallow: /*maxPrice=*

# Marketplace-specific URL patterns to avoid duplicate content
Disallow: /*/item/*/reviews?*
Disallow: /*/item/*/compare*
Disallow: /*/products/compare*
Disallow: /*/search?*

# Technical and system files
Disallow: /.well-known/
Disallow: /_next/
Disallow: /node_modules/

# Development and staging areas
Disallow: /dev/
Disallow: /test/
Disallow: /staging/
Disallow: /.git/

# File types that don't need indexing
Disallow: /*.pdf$
Disallow: /*.doc$
Disallow: /*.docx$
Disallow: /*.xls$
Disallow: /*.xlsx$
Disallow: /*.json$

# Seasonal and expired content (when applicable)
Disallow: /*/expired/
Disallow: /*/out-of-stock/

# === SPECIFIC CRAWLER RULES ===

# Google-specific rules (2024 optimizations)
User-agent: Googlebot
# Inherit all rules above
# Allow specific Google services
Allow: /robots.txt
Allow: /sitemap.xml
# Allow Google to access structured data
Allow: /api/structured-data

# Bing-specific rules  
User-agent: Bingbot
# Inherit all rules above
Crawl-delay: 2

# Block problematic bots and scrapers (updated list)
User-agent: SemrushBot
Disallow: /

User-agent: AhrefsBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: DotBot
Disallow: /

User-agent: BLEXBot
Disallow: /

User-agent: PetalBot
Disallow: /

User-agent: YandexBot
Crawl-delay: 5

# Social media crawlers (allow for proper sharing)
User-agent: facebookexternalhit
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: LinkedInBot
Allow: /

User-agent: WhatsApp
Allow: /

User-agent: TelegramBot
Allow: /

# === SITEMAP LOCATION ===
# Comprehensive sitemap containing all pages with video support
Sitemap: ${SITE_URL}/sitemap.xml

# === CRAWL OPTIMIZATION ===
# Note: Crawl-delay is not supported by Google but respected by others
# Set reasonable delays for non-Google bots to prevent server overload

# === NOTES FOR DEVELOPERS ===
# - Update sitemap when adding new store/product categories
# - Monitor crawl budget usage in Google Search Console
# - Regularly review for new dynamic URL patterns to block
# - Test robots.txt changes in Google Search Console Robots Tester
# - Consider creating separate robots.txt for staging environments
# - Implement automated sitemap generation for dynamic content
# - Monitor Core Web Vitals and page speed for mobile-first indexing
# - Use structured data markup for products and reviews
# - Regularly audit faceted navigation patterns to prevent index bloat
# - Video sitemap support included for YouTube embeds and marketing content`;

        const filePath = path.join(process.cwd(), 'robots.txt');
        await fs.writeFile(filePath, robotsContent, 'utf8');
        
        console.log(`✅ Generated robots.txt with video sitemap support`);
        console.log(`📁 Saved to: ${filePath}`);
        
    } catch (error) {
        console.error('❌ Error generating robots.txt:', error);
        throw error;
    }
}

/**
 * Main execution function
 */
async function main() {
    console.log('🚀 Starting TheBakerz Comprehensive Sitemap & Robots.txt Generation...');
    console.log(`📅 Timestamp: ${new Date().toISOString()}`);
    console.log(`🌐 Site URL: ${SITE_URL}`);
    console.log(`🎥 Video support: Enabled for YouTube embeds`);
    
    try {
        // Generate sitemap and robots.txt in parallel
        const [sitemapResult] = await Promise.all([
            generateComprehensiveSitemap(),
            generateRobotsTxt()
        ]);
        
        console.log('\n🎉 Generation completed successfully!');
        console.log(`📊 Final Summary:`);
        console.log(`   - Static pages: 10`);
        console.log(`   - Stores: ${sitemapResult.stores}`);
        console.log(`   - Products: ${sitemapResult.products}`);
        console.log(`   - Videos: ${sitemapResult.videos}`);
        console.log(`   - Total URLs: ${10 + sitemapResult.stores + sitemapResult.products}`);
        console.log(`   - Files created: sitemap.xml, robots.txt`);
        
        console.log('\n📋 Next Steps:');
        console.log('1. Submit sitemap.xml to Google Search Console');
        console.log('2. Test robots.txt accessibility at /robots.txt');
        console.log('3. Monitor crawl budget and indexing performance');
        console.log('4. Set up automated generation (daily/weekly)');
        console.log('5. Monitor video indexing in Google Video Search');
        
    } catch (error) {
        console.error('\n💥 Generation failed:', error);
        process.exit(1);
    } finally {
        // Close database connections
        await connectionPool.end();
        console.log('\n🔒 Database connections closed');
    }
}

// Run the script
if (require.main === module) {
    main().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = {
    generateComprehensiveSitemap,
    generateRobotsTxt
}; 