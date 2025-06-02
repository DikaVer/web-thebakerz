import { MetadataRoute } from 'next'
import { Pool } from 'pg'
import { CosmosClient } from '@azure/cosmos'

// Example stores to exclude from sitemaps
const exampleStore = ['OrGoD8o3jQ', 'NwzUMel5X6', 'S8gWY29Zhx']

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
})

const cosmosClient = new CosmosClient({
  endpoint: process.env.NEXT_PRIVATE_COSMOS_DB_URI!,
  key: process.env.NEXT_PRIVATE_COSMOS_DB_KEY!,
})

const cosmosDB = cosmosClient.database(process.env.NEXT_PRIVATE_COSMOS_DB_NAME!)
const containerProducts = cosmosDB.container("Products")

// Fetch active stores from PostgreSQL
async function fetchActiveStores() {
  try {
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
    `

    const result = await connectionPool.query(query)
    
    // Filter out example stores
    const validStores = result.rows.filter(store => {
      if (!store.id || exampleStore.includes(store.id)) {
        return false
      }
      return true
    })
    
    // Get product counts for each store
    const storesWithCounts = await Promise.all(
      validStores.map(async (store) => {
        try {
          const countQuery = {
            query: "SELECT VALUE COUNT(1) FROM c WHERE c.store_id = @storeId AND c.archive = false AND c.hide_product = false",
            parameters: [{ name: "@storeId", value: store.id }]
          }
          
          const { resources } = await containerProducts.items
            .query(countQuery, { partitionKey: store.id })
            .fetchAll()
          
          return {
            ...store,
            product_count: resources[0] || 0
          }
        } catch (error) {
          console.warn(`Could not get product count for store ${store.id}:`, error)
          return {
            ...store,
            product_count: 0
          }
        }
      })
    )
    
    // Sort by product count (highest first)
    storesWithCounts.sort((a, b) => {
      if (b.product_count !== a.product_count) {
        return b.product_count - a.product_count
      }
      const aName = a.nickname || a.id || ''
      const bName = b.nickname || b.id || ''
      return aName.localeCompare(bName)
    })
    
    return storesWithCounts
  } catch (error) {
    console.error('Error fetching stores:', error)
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.thebakerz.com'
  const stores = await fetchActiveStores()
  
  return stores.map((store, index) => {
    // Determine priority based on store activity and position
    let priority = 0.7 // Default priority
    
    if (store.product_count > 20) priority = 0.9
    else if (store.product_count > 10) priority = 0.8
    else if (store.product_count > 5) priority = 0.7
    else priority = 0.6
    
    // Featured stores (first few with most products) get higher priority
    if (index < 5 && store.product_count > 5) {
      priority = Math.min(priority + 0.1, 0.9)
    }
    
    const changefreq = priority >= 0.8 ? 'daily' : 'weekly'
    
    return {
      url: `${baseUrl}/${store.id}`,
      lastModified: new Date().toISOString(),
      changeFrequency: changefreq as any,
      priority: priority,
      images: store.picture ? [store.picture] : undefined,
    }
  })
} 