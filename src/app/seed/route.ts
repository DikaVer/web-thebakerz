import { db } from '@vercel/postgres';
import { stores, categories, products } from '@/lib/placeholder-data';

// const client = await db.connect();
//
//
// async function seedUser() {
//   await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
//
//   await client.sql`
//     CREATE TABLE IF NOT EXISTS users (
//       user_id SERIAL PRIMARY KEY,
//       name VARCHAR(255) NOT NULL,
//       email VARCHAR(255) NOT NULL,
//       phone_number VARCHAR(50),
//       addresses VARCHAR(50),
//       avatar_url VARCHAR(255) NOT NULL
//     );
//   `;
// }
//
// async function seedStore() {
//     await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
//
//     await client.sql`
//         CREATE TABLE IF NOT EXISTS stores (
//         store_id VARCHAR(255) PRIMARY KEY,
//         description VARCHAR(50000) NOT NULL,
//         email VARCHAR(255) NOT NULL,
//         phone_number VARCHAR(255),
//         addresses VARCHAR(255) NOT NULL,
//         avatar_url VARCHAR(255) NOT NULL,
//         background_url VARCHAR(255) NOT NULL
//     );
//   `;
//
//     const insertedStores = await Promise.all(
//         stores.map(
//             (store) => client.sql`
//         INSERT INTO stores (store_id, description, email, phone_number, addresses, avatar_url, background_url)
//         VALUES (${store.name}, ${store.description}, ${store.email}, ${store.phone_number}, ${store.addresses}, ${store.avatar_url}, ${store.background_url});
//       `,
//         ),
//     );
//
//     return insertedStores;
// }
//
// async function seedCategory() {
//     await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
//
//     await client.sql`
//     CREATE TABLE IF NOT EXISTS product_categories (
//       category_id VARCHAR(50) PRIMARY KEY
//     );
//   `;
//
//     const insertedCategories = await Promise.all(
//         categories.map(
//             (category) => client.sql`
//         INSERT INTO product_categories (category_id)
//         VALUES (${category.name});
//       `,
//         ),
//     );
//
//     return insertedCategories;
// }
//
// async function seedProduct() {
//   await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
//
//   await client.sql`
//     CREATE TABLE IF NOT EXISTS products (
//       product_id SERIAL PRIMARY KEY,
//       store_id VARCHAR(50) NOT NULL,
//       category_id VARCHAR(50) NOT NULL,
//       name VARCHAR(50) NOT NULL,
//       description VARCHAR(255) NOT NULL,
//       price INTEGER NOT NULL,
//       image_url VARCHAR(255) NOT NULL,
//       FOREIGN KEY (store_id) REFERENCES stores(store_id),
//       FOREIGN KEY (category_id) REFERENCES product_categories(category_id)
//     );
//   `;
//
//     const insertedProducts = await Promise.all(
//         products.map(
//         (product) => client.sql`
//             INSERT INTO products (store_id, category_id, name, description, price, image_url)
//             VALUES (${product.store_id}, ${product.category_id}, ${product.name}, ${product.description}, ${product.price}, ${product.image_url});
//         `,
//         ),
//     );
//
//     return insertedProducts;
//
// }


export async function GET() {
    try {
        // await client.sql`BEGIN`;
        // await seedProduct();
        // await client.sql`COMMIT`;

        return Response.json({ message: 'Database seeded successfully' });
    } catch (error) {
        // await client.sql`ROLLBACK`;
        return Response.json({ error }, { status: 500 });
    }
}