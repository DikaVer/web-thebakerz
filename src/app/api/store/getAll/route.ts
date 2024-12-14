import {connectionPool} from "@/db";
import {NextResponse} from "next/server";
import {kv} from "@vercel/kv";
export const runtime = "edge";

const isAuthorized = (req: Request) => {
    const authHeader = req.headers.get('Authorization');
    const secretKey = authHeader?.split(' ')[1]; // Extract the key after 'Bearer'

    // Validate the secret key
    return secretKey === process.env.NEXT_PRIVATE_API_SECRET_KEY;
};


export async function POST(req: Request) {

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

        const combinedRow = await connectionPool.query(`
          SELECT 
            s.id as store_id, s.nickname, s.description, s.background_url, 
            u.id as user_id, u.name as user_name, u.email, u.image as user_image, u.role as user_role, 
            a.route, a.street_number, a.sub_premise, a.premise, a.city, a.state, a.country, a.zip_code, a.latitude, a.longitude
          FROM 
            stores s
          LEFT JOIN 
            users u ON u.id = s.user_id
          LEFT JOIN 
            addresses_stores a ON a.store_id = s.id
          WHERE 
            s.id = '${storeId}' AND s.deleted = '${false}'`);

        if (combinedRow.rowCount === 0) {
            return NextResponse.json(
                {
                    message: 'Store not found'
                }, {
                    status: 404
                });
        }

        const productsRow = await connectionPool.query(`
          SELECT id, store_id, category, name, description, price, image_url FROM products
          WHERE store_id = '${storeId}' AND deleted = FALSE;
        `);


        const keyAvailability = `availability-${storeId}`;

        const availability = await kv.hgetall(keyAvailability);

        const keyDelivery = `delivery-${storeId}`;

        const deliveryOptions = await kv.hgetall(keyDelivery);


        return NextResponse.json(
            {
                message: 'Store data fetched successfully',
                storeData: combinedRow.rows[0],
                products: productsRow.rows,
                availability: availability,
                deliveryOptions: deliveryOptions,

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