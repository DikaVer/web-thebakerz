const { Pool } = require('pg');

export const connectionPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    user: process.env.DATABASE_USER,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_DATABASE,
    password: process.env.DATABASE_PASSWORD,
    port: 5432,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

import { BlobServiceClient } from "@azure/storage-blob";

export const blobClient = BlobServiceClient.fromConnectionString(
    process.env.AZURE_STORAGE_CONNECTION_STRING as string
);

export const containerClientAvatar = blobClient.getContainerClient(
    process.env.CONTAINER_NAME_AVATARS as string
);


