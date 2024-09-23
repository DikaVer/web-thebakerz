import {auth} from "@/auth";
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

export async function POST(req: Request) {

    // Validate the secret key
    if (!isAuthorized(req)) {
        return NextResponse.json({
            message: 'Unauthorized access'
        }, {
            status: 401
        });
    }

    const session = await auth()

    const body = await req.json();

    const { storeId, deliveryOptionsData} = body;

    if(session){

        const queryUserId = await sql`SELECT user_id FROM stores WHERE id = ${storeId}`;
        const userId = queryUserId.rows[0].user_id;

        // @ts-ignore
        if (userId === session.user?.id || session.user?.role === 'admin') {
            try {

                const keyDelivery = `delivery-options-${storeId}`;

                await kv.lpush(keyDelivery, deliveryOptionsData);

                return NextResponse.json(
                    {
                        message: 'Delivery Options updated successfully',
                        deliveryOptionsData: deliveryOptionsData
                    }, {
                        status: 200
                    });

            } catch (error) {
                return NextResponse.json(
                    {
                        message: 'Failed to update delivery options'
                    }, {
                        status: 500
                    });
            }

        } else {
            return NextResponse.json(
                {
                    message: 'Unauthorized access'
                }, {
                    status: 401
                });
        }

    } else {
        return NextResponse.json(
            {
                message: 'Unauthorized access'
            }, {
                status: 401
            });
    }

}