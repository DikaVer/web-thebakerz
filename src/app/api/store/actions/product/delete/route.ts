import {auth} from "@/auth";
import {sql} from "@vercel/postgres";
import {NextResponse} from "next/server";
import {productApiSchema} from "@/lib/schemas";
export const runtime = "edge"


export async function POST(req: Request) {

    const body = await req.json();

    const { storeId, productId} = body;


    const session = await auth()

    if(session){

        try {

            const queryUserId = await sql`SELECT user_id FROM stores WHERE id = ${storeId}`;
            const userId = queryUserId.rows[0].user_id;

            // @ts-ignore
            if (userId === session.user?.id || session.user?.role === 'admin') {

                const queryStore = await sql`SELECT store_id FROM products WHERE id = ${productId}`;
                const storeIdProduct = queryStore.rows[0].store_id;

                if(storeIdProduct !== storeId){
                    return NextResponse.json(
                        {
                            message: 'Unauthorized access'
                        }, {
                            status: 401
                        });
                }

                await sql`UPDATE products SET deleted=TRUE WHERE id = ${productId}`;


                return NextResponse.json(
                    {
                        message: 'Product deleted successfully',
                    }, {
                        status: 200
                    });

            } else {
                return NextResponse.json(
                    {
                        message: 'Unauthorized access'
                    }, {
                        status: 401
                    });
            }

        } catch (error) {
            return NextResponse.json(
                {
                    message: 'Failed to add product'
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

}