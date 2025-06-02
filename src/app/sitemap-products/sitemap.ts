import { MetadataRoute } from 'next'
import { CosmosClient } from '@azure/cosmos'

// Example stores to exclude from sitemaps
const exampleStore = ['OrGoD8o3jQ', 'NwzUMel5X6', 'S8gWY29Zhx']

const cosmosClient = new CosmosClient({
  endpoint: process.env.NEXT_PRIVATE_COSMOS_DB_URI!,
  key: process.env.NEXT_PRIVATE_COSMOS_DB_KEY!,
})

const cosmosDB = cosmosClient.database(process.env.NEXT_PRIVATE_COSMOS_DB_NAME!)
const containerProducts = cosmosDB.container("Products")

// Fetch all active products from CosmosDB
async function fetchActiveProducts() {
  try {
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
    }

    const { resources: products } = await containerProducts.items
      .query(querySpec)
      .fetchAll()

    // Filter out products from example stores
    const validProducts = products.filter(product => {
      return !exampleStore.includes(product.store_id)
    })
    
    return validProducts
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

// For now, we'll implement a simple version without pagination
// For production with thousands of products, you'd want to use generateSitemaps
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.thebakerz.com'
  const products = await fetchActiveProducts()
  
  return products.map(product => {
    // Determine priority based on various factors
    let priority = 0.6 // Default priority
    
    const productAge = new Date().getTime() - new Date(product.createdAt || new Date()).getTime()
    const isNewProduct = productAge < (7 * 24 * 60 * 60 * 1000) // 7 days
    
    // Category-based priority
    if (product.category === 'featured' || product.category === 'bestseller') {
      priority = 0.9
    } else if (product.category === 'seasonal' || product.category === 'special') {
      priority = 0.7
    } else if (isNewProduct) {
      priority = 0.8
    }
    
    const changefreq = isNewProduct ? 'daily' : 'weekly'
    const lastmod = product.updatedAt || product.createdAt || new Date().toISOString()
    
    // Collect all images
    const images: string[] = []
    if (product.picture) {
      images.push(product.picture)
    }
    if (product.additionalImages && Array.isArray(product.additionalImages)) {
      images.push(...product.additionalImages.slice(0, 3)) // Max 3 additional images
    }
    
    return {
      url: `${baseUrl}/${product.store_id}/item/${product.constId}`,
      lastModified: lastmod,
      changeFrequency: changefreq as any,
      priority: priority,
      images: images.length > 0 ? images : undefined,
    }
  })
} 