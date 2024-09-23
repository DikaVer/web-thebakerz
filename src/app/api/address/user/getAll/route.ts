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

    const { userId } = body;

    try {

        const locationRows = await sql`
            SELECT *
            FROM 
                addresses_users 
            WHERE 
                user_id = ${userId}`;

        return NextResponse.json(
            {
                locations: locationRows.rows,

            }, {
                status: 200
            });


    } catch (error) {
        return NextResponse.json(
            {
                message: 'Failed to get addresses'
            }, {
                status: 500
            });
    }
}