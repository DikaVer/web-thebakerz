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

export const containerClientAvatar = blobClient.getContainerClient("avatars");

export const containerClientProduct = blobClient.getContainerClient("products");


import { CosmosClient } from "@azure/cosmos";

const cosmosClient = new CosmosClient({
    endpoint: process.env.NEXT_PRIVATE_COSMOS_DB_URI!,
    key: process.env.NEXT_PRIVATE_COSMOS_DB_KEY!,
});

export const cosmosDB = cosmosClient.database("TheBakerzCosmosDB");
export const containerWorkingHours = cosmosDB.container("WorkingHours");
export const containerProducts = cosmosDB.container("Products");
export const containerProductsOrder = cosmosDB.container("ProductsOrder");
export const containerCart = cosmosDB.container("Carts");
export const containerOrders = cosmosDB.container("Orders");



