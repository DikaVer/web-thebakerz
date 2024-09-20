import {auth} from "@/auth";
import {sql} from "@vercel/postgres";
import {NextResponse} from "next/server";
import {PutBlobResult} from "@vercel/blob";
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

    const { storeId, productData} = body;

    if(session){

        const queryUserId = await sql`SELECT user_id FROM stores WHERE id = ${storeId}`;
        const userId = queryUserId.rows[0].user_id;

        // @ts-ignore
        if (userId === session.user?.id || session.user?.role === 'admin') {
            try {

                const {name, description, price, category, file} = productData;

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/image/upload/background`, {
                    method: 'POST',
                    headers: {
                        'content-type': file?.type,
                        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_SECRET_KEY}`
                    },
                    body: JSON.stringify({
                        file: file.file,
                        fileName: file.fileName,
                        path: "storeProducts"
                    }),
                })

                if (!response.ok) {
                    return NextResponse.json(
                        {
                            message: 'Failed to upload image'
                        }, {
                            status: 400
                        });
                }

                const {url} = await response.json() as PutBlobResult;


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
                        ${price},
                        ${category},
                        ${url},
                        ${storeId}
                        ) RETURNING id, name, description, price, category, image_url`;

                return NextResponse.json(
                    {
                        message: 'Product added successfully',
                        productData: productRow.rows[0]
                    }, {
                        status: 200
                    });

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

    } else {
        return NextResponse.json(
            {
                message: 'Unauthorized access'
            }, {
                status: 401
            });
    }

}