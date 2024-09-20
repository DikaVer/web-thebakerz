import {auth} from "@/auth";
import {sql} from "@vercel/postgres";
import {NextResponse} from "next/server";
export const config = {
    runtime: 'edge', // 'nodejs' is the default
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

    const { storeId, productId} = body;

    if(session){

        const queryUserId = await sql`SELECT user_id FROM stores WHERE id = ${storeId}`;
        const userId = queryUserId.rows[0].user_id;

        // @ts-ignore
        if (userId === session.user?.id || session.user?.role === 'admin') {
            try {
                const queryDelete = await sql`
                    UPDATE products
                    SET deleted = TRUE
                    WHERE id = ${productId} AND store_id = ${storeId}`;

                return NextResponse.json(
                    {
                        message: 'Product deleted successfully'
                    }, {
                        status: 200
                    });

            } catch (error) {

                return NextResponse.json(
                    {
                        message: 'Failed to delete product'
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