import 'server-only';

const { Pool } = require('pg');

// Create and export the PostgreSQL connection pool
export const connectionPool = new Pool({
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


import { BlobServiceClient } from "@azure/storage-blob";

// Fall back to a syntactically-valid placeholder when the env var is absent so
// that importing this module never throws during `next build` (page-data
// collection evaluates it). With real env present, behaviour is unchanged.
const blobConnectionString =
    process.env.NEXT_PRIVATE_AZURE_STORAGE_CONNECTION_STRING ||
    "DefaultEndpointsProtocol=https;AccountName=placeholder;AccountKey=hiujjji=;EndpointSuffix=core.windows.net";

const blobClient = BlobServiceClient.fromConnectionString(blobConnectionString);

export const containerClientAvatar = blobClient.getContainerClient(process.env.NEXT_PRIVATE_BLOB_AVATAR_CONTAINER!);

export const containerClientProduct = blobClient.getContainerClient(process.env.NEXT_PRIVATE_BLOB_PRODUCTS_CONTAINER!);

export const containerClientBackground = blobClient.getContainerClient(process.env.NEXT_PRIVATE_BLOB_BACKGROUND_CONTAINER!);


import { CosmosClient } from "@azure/cosmos";

// Same placeholder strategy as the blob client above: keep module load safe
// when Cosmos env vars are absent (e.g. closed-site build with no secrets).
const cosmosClient = new CosmosClient({
    endpoint: process.env.NEXT_PRIVATE_COSMOS_DB_URI || "https://placeholder.documents.azure.com:443/",
    key: process.env.NEXT_PRIVATE_COSMOS_DB_KEY || "hiujjji=",
});

export const cosmosDB = cosmosClient.database(process.env.NEXT_PRIVATE_COSMOS_DB_NAME || "placeholder");
export const containerWorkingHours = cosmosDB.container("WorkingHours");
export const containerProducts = cosmosDB.container("Products");
export const containerProductsOrder = cosmosDB.container("ProductsOrder");
export const containerCart = cosmosDB.container("Carts");
export const containerOrders = cosmosDB.container("Orders");
export const containerOrdersUnpaid = cosmosDB.container("OrdersUnpaid");
export const containerDeliveryRegions = cosmosDB.container("DeliveryRegions");
export const containerDeliveryLocations = cosmosDB.container("DeliveryLocations");
export const containerTransfers = cosmosDB.container("Transfers");
export const containerFavorites = cosmosDB.container("Favorites");
export const containerRescueDeals = cosmosDB.container("RescueDeals");
export const containerInventoryHolds = cosmosDB.container("InventoryRescueHolds");

export const containerPromotionGroups = cosmosDB.container("PromotionGroups");
export const containerProductPromotions = cosmosDB.container("ProductPromotions");

export const containerLoyaltySettings = cosmosDB.container("LoyaltySettings");
export const containerLoyaltyItems = cosmosDB.container("LoyaltyItems");

export const containerProductLoyaltyItems = cosmosDB.container("ProductLoyaltyItems");


