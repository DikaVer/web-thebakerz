import {auth} from "@/auth";
import {sql} from "@vercel/postgres";
import {NextResponse} from "next/server";
import {productApiSchema} from "@/lib/schemas";
export const runtime = "edge"


export async function POST(req: Request) {

    const body = await req.json();

    const { storeId, productData} = body;

    const validateField = productApiSchema.safeParse(productData);

    if (!validateField.success) {
        return NextResponse.json(
            {
                message: "Invalid product data",
            }, {
                status: 400
            });
    }

    const session = await auth()

    if(session){

        try {

            const queryUserId = await sql`SELECT user_id FROM stores WHERE id = ${`${storeId}`}`;
            const userId = queryUserId.rows[0].user_id;

            // @ts-ignore
            if (userId === session.user?.id || session.user?.role === 'admin') {

                    const {name, description, price, category, file_url} = productData;

                    // Convert price from float to integer
                    const priceNew = Math.round(price * 100);


                    const productRow = await sql`
                        INSERT INTO products (
                            name,
                            description,
                            price,
                            category,
                            image_url,
                            store_id
                        ) VALUES (
                            ${name},
                            ${description},
                            ${priceNew},
                            ${category},
                            ${file_url},
                            ${storeId}
                            ) RETURNING id, name, description, price, category, image_url`;

                    return NextResponse.json(
                        {
                            message: 'Product added successfully',
                            productData: productRow.rows[0]
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