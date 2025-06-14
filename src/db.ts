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

const blobClient = BlobServiceClient.fromConnectionString(
    process.env.NEXT_PRIVATE_AZURE_STORAGE_CONNECTION_STRING as string
);

export const containerClientAvatar = blobClient.getContainerClient(process.env.NEXT_PRIVATE_BLOB_AVATAR_CONTAINER!);

export const containerClientProduct = blobClient.getContainerClient(process.env.NEXT_PRIVATE_BLOB_PRODUCTS_CONTAINER!);

export const containerClientBackground = blobClient.getContainerClient(process.env.NEXT_PRIVATE_BLOB_BACKGROUND_CONTAINER!);


import { CosmosClient } from "@azure/cosmos";

const cosmosClient = new CosmosClient({
    endpoint: process.env.NEXT_PRIVATE_COSMOS_DB_URI!,
    key: process.env.NEXT_PRIVATE_COSMOS_DB_KEY!,
});

export const cosmosDB = cosmosClient.database(process.env.NEXT_PRIVATE_COSMOS_DB_NAME!);
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
export const containerHolds = cosmosDB.container("Holds");


