import {sql} from "@vercel/postgres";
import {NextResponse} from "next/server";
import {kv} from "@vercel/kv";
export const config = {
    runtime: 'edge', // 'nodejs' is the default
};

const isAuthorized = (req: Request) => {
    const authHeader = req.headers.get('Authorization');
    const secretKey = authHeader?.split(' ')[1]; // Extract the key after 'Bearer'

    // Validate the secret key
    return secretKey === process.env.NEXT_PRIVATE_API_SECRET_KEY;
};


export async function GET(req: Request) {

    // Validate the secret key
    if (!isAuthorized(req)) {
        return NextResponse.json({
            message: 'Unauthorized access'
        }, {
            status: 401
        });
    }

    const body = await req.json();

    const { storeId } = body;

    try {
        const storeRow = await sql`
            SELECT *
            FROM 
                stores 
            WHERE 
                id = ${storeId}`;

        const locationRow = await sql`
            SELECT *
            FROM 
                addresses_stores
            WHERE 
                store_id = ${storeId}`;

        const productsRow = await sql`
            SELECT * FROM products
            WHERE store_id = ${storeId}`;


        const keyAvailability = `availability-${storeId}`;

        const availability = await kv.hgetall(keyAvailability);

        const keyDelivery = `delivery-options-${storeId}`;

        const deliveryOptions = await kv.lrange(keyDelivery, 0, -1);


        return NextResponse.json(
            {
                message: 'Store data fetched successfully',
                store: storeRow.rows[0],
                location: locationRow.rows[0],
                products: productsRow.rows,
                availability: availability,
                deliveryOptions: deliveryOptions

            }, {
                status: 200
            });


    } catch (error) {
        return NextResponse.json(
            {
                message: 'Failed to get store data'
            }, {
                status: 500
            });
    }
}