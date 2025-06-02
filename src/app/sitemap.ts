import { connectionPool, containerProducts } from '@/db'
import { exampleStore } from '@/lib/local-variables'
import { MetadataRoute } from 'next'


// Static pages sitemap
async function getStaticPages(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.thebakerz.com'
  const currentDate = new Date().toISOString()
  
  return [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about-us`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/become-partner`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/support`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/support/contact-us`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/policies/privacy-policy`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/policies/refund-policy`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/policies/terms-of-use`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/socials`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
  ]
}

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
    const validStores = result.rows.filter((store: any) => {
      if (!store.id || exampleStore.includes(store.id)) {
        return false
      }
      return true
    })
    
    // Get product counts for each store
    const storesWithCounts = await Promise.all(
      validStores.map(async (store: any) => {
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

// Generate stores sitemap
async function getStorePages(): Promise<MetadataRoute.Sitemap> {
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

// Generate products sitemap
async function getProductPages(): Promise<MetadataRoute.Sitemap> {
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

// Main sitemap function that combines all pages
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    // Fetch all sitemaps in parallel for better performance
    const [staticPages, storePages, productPages] = await Promise.all([
      getStaticPages(),
      getStorePages(), 
      getProductPages()
    ])
    
    // Combine all pages into one comprehensive sitemap
    return [
      ...staticPages,
      ...storePages,
      ...productPages,
    ]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    // Return at least static pages if database fails
    return await getStaticPages()
  } finally {
    // Close database connections
    try {
      await connectionPool.end()
    } catch (error) {
      console.error('Error closing database connection:', error)
    }
  }
} 