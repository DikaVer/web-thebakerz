import {auth} from "@/auth";
import {sql} from "@vercel/postgres";
import {NextResponse} from "next/server";
import {kv} from "@vercel/kv";
import {deliveryOptionsSchema} from "@/lib/schemas";
export const runtime = "edge";


export async function POST(req: Request) {

    const body = await req.json();

    const { storeId, deliveryOptionsData} = body;

    const validateField = deliveryOptionsSchema.safeParse(deliveryOptionsData);

    if (!validateField.success) {
        return NextResponse.json(
            {
                message: "Invalid delivery options data",
            }, {
                status: 400
            });
    }


    const session = await auth()

    if(session){

        const queryUserId = await sql`SELECT user_id FROM stores WHERE id = ${`${storeId}`}`;
        const userId = queryUserId.rows[0].user_id;

        // @ts-ignore
        if (userId === session.user?.id || session.user?.role === 'admin') {
            try {

                const keyDelivery = `delivery-${storeId}`;

                await kv.del(keyDelivery);

                // if delivery options are empty, delete the key and return
                if (Object.keys(deliveryOptionsData).length === 0) {
                    return NextResponse.json(
                        {
                            message: 'Delivery Options updated successfully'
                        }, {
                            status: 200
                        });
                }

                await kv.hset(keyDelivery, deliveryOptionsData);

                return NextResponse.json(
                    {
                        message: 'Delivery Options updated successfully'
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