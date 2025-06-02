#!/usr/bin/env node

/**
 * Generate TheBakerz Sitemaps Script
 * 
 * This script automatically generates sitemap-stores.xml and sitemap-products.xml
 * by fetching active stores and products from the database.
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
 * Generate XML sitemap header
 */
function generateSitemapHeader() {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;
}

/**
 * Generate XML sitemap footer
 */
function generateSitemapFooter() {
    return `
</urlset>`;
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
 * Fetch all active products from CosmosDB
 */
async function fetchActiveProducts() {
    try {
        console.log('Fetching active products from CosmosDB...');
        
        const querySpec = {
            query: `
                SELECT 
                    c.id, 
                    c.constId,
                    c.store_id, 
                    c.web_name, 
                    c.name, 
                    c.category,
                    c.description,
                    c.price,
                    c.picture, 
                    c.additionalImages,
                    c.updatedAt,
                    c.createdAt,
                    c.hide_product,
                    c.archive
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
function generateStoreUrlEntry(store, priority = 0.7) {
    // Based on your routing structure: /(store)/[id]/
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
function generateProductUrlEntry(product, priority = 0.6) {
    // Based on your routing structure: /(store)/[id]/item/[productId]/
    const productUrl = `${SITE_URL}/${product.store_id}/item/${product.constId}`;
    
    const lastmod = product.updatedAt || product.createdAt || new Date().toISOString();
    
    // Determine change frequency based on product age and category
    const productAge = new Date() - new Date(product.createdAt || new Date());
    const isNewProduct = productAge < (7 * 24 * 60 * 60 * 1000); // 7 days
    const changefreq = isNewProduct ? 'daily' : 'weekly';
    
    // Adjust priority based on factors
    if (isNewProduct) priority = Math.min(priority + 0.1, 0.9);
    if (product.category === 'featured' || product.category === 'bestseller') {
        priority = Math.min(priority + 0.2, 0.9);
    }

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
 * Generate stores sitemap
 */
async function generateStoresSitemap() {
    try {
        console.log('\n=== Generating Stores Sitemap ===');
        
        const stores = await fetchActiveStores();
        
        let xml = generateSitemapHeader();
        xml += `
  
  <!-- TheBakerz Stores Sitemap -->
  <!-- Last updated: ${new Date().toISOString()} -->
  <!-- Automatically generated from database -->
  <!-- Optimized for mobile-first indexing and marketplace SEO -->`;

        if (stores.length === 0) {
            console.log('No active stores found');
            xml += `
  
  <!-- No active stores found -->`;
        } else {
            // Sort stores by product count and generate entries
            stores.forEach((store, index) => {
                // Determine priority based on store activity and position
                let priority = 0.7; // Default priority
                
                if (store.product_count > 20) priority = 0.9; // High activity stores
                else if (store.product_count > 10) priority = 0.8; // Medium activity stores
                else if (store.product_count > 5) priority = 0.7; // Regular stores
                else priority = 0.6; // Low activity stores
                
                // Featured stores (first few with most products) get higher priority
                if (index < 5 && store.product_count > 5) {
                    priority = Math.min(priority + 0.1, 0.9);
                }

                xml += generateStoreUrlEntry(store, priority);
            });
        }

        xml += generateSitemapFooter();
        
        // Write to file
        const filePath = path.join(process.cwd(), 'sitemap-stores.xml');
        await fs.writeFile(filePath, xml, 'utf8');
        
        console.log(`✅ Generated sitemap-stores.xml with ${stores.length} stores`);
        console.log(`📁 Saved to: ${filePath}`);
        
        return stores.length;
    } catch (error) {
        console.error('❌ Error generating stores sitemap:', error);
        throw error;
    }
}

/**
 * Generate products sitemap
 */
async function generateProductsSitemap() {
    try {
        console.log('\n=== Generating Products Sitemap ===');
        
        const products = await fetchActiveProducts();
        
        let xml = generateSitemapHeader();
        xml += `
  
  <!-- TheBakerz Products Sitemap -->
  <!-- Last updated: ${new Date().toISOString()} -->
  <!-- Automatically generated from database -->
  <!-- Optimized for e-commerce product visibility and mobile-first indexing -->`;

        if (products.length === 0) {
            console.log('No active products found');
            xml += `
  
  <!-- No active products found -->`;
        } else {
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
                    // Determine priority based on various factors
                    let priority = 0.6; // Default priority
                    
                    const productAge = new Date() - new Date(product.createdAt || new Date());
                    const isNewProduct = productAge < (7 * 24 * 60 * 60 * 1000); // 7 days
                    
                    // Category-based priority
                    if (product.category === 'featured' || product.category === 'bestseller') {
                        priority = 0.9;
                    } else if (product.category === 'seasonal' || product.category === 'special') {
                        priority = 0.7;
                    } else if (isNewProduct) {
                        priority = 0.8;
                    }

                    xml += generateProductUrlEntry(product, priority);
                });
            });
        }

        xml += `
  
  <!-- 
  Best practices implemented:
  - Only active, visible products included
  - Products sorted by store for better organization
  - Priority based on category, age, and performance
  - Mobile-first indexing with mobile tags
  - Product images included for better search visibility
  - Last modification dates based on actual update timestamps
  -->`;

        xml += generateSitemapFooter();
        
        // Write to file
        const filePath = path.join(process.cwd(), 'sitemap-products.xml');
        await fs.writeFile(filePath, xml, 'utf8');
        
        console.log(`✅ Generated sitemap-products.xml with ${products.length} products`);
        console.log(`📁 Saved to: ${filePath}`);
        
        return products.length;
    } catch (error) {
        console.error('❌ Error generating products sitemap:', error);
        throw error;
    }
}

/**
 * Update main sitemap index with new timestamps
 */
async function updateMainSitemap() {
    try {
        console.log('\n=== Updating Main Sitemap Index ===');
        
        const currentTime = new Date().toISOString();
        
        const sitemapIndexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">  
  <!-- TheBakerz Sitemap Index - Main sitemap for marketplace -->
  <!-- Last updated: ${currentTime} -->
  <!-- Optimized for 2024 e-commerce SEO best practices -->
  
  <!-- Core static pages sitemap -->
  <sitemap>
    <loc>${SITE_URL}/sitemap-pages.xml</loc>
    <lastmod>${currentTime}</lastmod>
  </sitemap>
  
  <!-- Store listings sitemap (dynamic stores) -->
  <sitemap>
    <loc>${SITE_URL}/sitemap-stores.xml</loc>
    <lastmod>${currentTime}</lastmod>
  </sitemap>
  
  <!-- Product pages sitemap (dynamic products) -->
  <sitemap>
    <loc>${SITE_URL}/sitemap-products.xml</loc>
    <lastmod>${currentTime}</lastmod>
  </sitemap>
  
  <!-- High-priority product categories (for better crawl budget management) -->
  <sitemap>
    <loc>${SITE_URL}/sitemap-categories.xml</loc>
    <lastmod>${currentTime}</lastmod>
  </sitemap>
  
  <!-- Images sitemap for better image search visibility -->
  <sitemap>
    <loc>${SITE_URL}/sitemap-images.xml</loc>
    <lastmod>${currentTime}</lastmod>
  </sitemap>
  
  <!-- Blog/content sitemap (if applicable) -->
  <sitemap>
    <loc>${SITE_URL}/sitemap-blog.xml</loc>
    <lastmod>${currentTime}</lastmod>
  </sitemap>
  
  <!-- Video content sitemap (if applicable) -->
  <sitemap>
    <loc>${SITE_URL}/sitemap-videos.xml</loc>
    <lastmod>${currentTime}</lastmod>
  </sitemap>
  
  <!-- News sitemap for timely content (if applicable) -->
  <sitemap>
    <loc>${SITE_URL}/sitemap-news.xml</loc>
    <lastmod>${currentTime}</lastmod>
  </sitemap>

</sitemapindex>`;

        const filePath = path.join(process.cwd(), 'sitemap.xml');
        await fs.writeFile(filePath, sitemapIndexXml, 'utf8');
        
        console.log(`✅ Updated sitemap.xml index`);
        console.log(`📁 Saved to: ${filePath}`);
    } catch (error) {
        console.error('❌ Error updating main sitemap:', error);
        throw error;
    }
}

/**
 * Main execution function
 */
async function main() {
    console.log('🚀 Starting TheBakerz Sitemap Generation...');
    console.log(`📅 Timestamp: ${new Date().toISOString()}`);
    console.log(`🌐 Site URL: ${SITE_URL}`);
    
    try {
        // Generate sitemaps
        const [storeCount, productCount] = await Promise.all([
            generateStoresSitemap(),
            generateProductsSitemap()
        ]);
        
        // Update main sitemap index
        await updateMainSitemap();
        
        console.log('\n🎉 Sitemap generation completed successfully!');
        console.log(`📊 Summary:`);
        console.log(`   - Stores: ${storeCount}`);
        console.log(`   - Products: ${productCount}`);
        console.log(`   - Total URLs: ${storeCount + productCount}`);
        
        console.log('\n📋 Next Steps:');
        console.log('1. Submit updated sitemaps to Google Search Console');
        console.log('2. Test robots.txt accessibility');
        console.log('3. Monitor crawl budget and indexing performance');
        console.log('4. Set up automated sitemap generation (daily/weekly)');
        
    } catch (error) {
        console.error('\n💥 Sitemap generation failed:', error);
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
    generateStoresSitemap,
    generateProductsSitemap,
    updateMainSitemap
}; 