import {sql} from "@vercel/postgres";
import {NextResponse} from "next/server";
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
            SELECT * FROM stores
            WHERE id = ${`${storeId}`}`;

        return NextResponse.json(
            {
                store: storeRow.rows[0]
            }, {
                status: 200
            });


    } catch (error) {
        return NextResponse.json(
            {
                message: 'Failed to get product'
            }, {
                status: 500
            });
    }
}