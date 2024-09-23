import {auth} from "@/auth";
import {sql} from "@vercel/postgres";
import {NextResponse} from "next/server";
import {PutBlobResult} from "@vercel/blob";

export const config = {
    runtime: 'edge', // 'nodejs' is the default
};

const fetchImage = async (file: any) => {
    return await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/image/upload/background`, {
        method: 'POST',
        headers: {
            'content-type': file.type,
            'Authorization': `Bearer ${process.env.NEXT_PRIVATE_API_SECRET_KEY}`
        },
        body: file,
    });
}

const isAuthorized = (req: Request) => {
    const authHeader = req.headers.get('Authorization');
    const secretKey = authHeader?.split(' ')[1]; // Extract the key after 'Bearer'

    // Validate the secret key
    return secretKey === process.env.NEXT_PRIVATE_API_SECRET_KEY;
};


// Update product can be done by the admin
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

    const { storeId, productId, productData} = body;

    // @ts-ignore
    if(session && session.user?.role === 'admin'){

        try {
            const {name, description, price, category, file} = productData;

            const response = file ? await fetchImage(file) : undefined;

            if (response && !response.ok) {
                return NextResponse.json(
                    {
                        message: 'Failed to upload image'
                    }, {
                        status: 400
                    });
            }

            const result = response ? await response.json() as PutBlobResult : undefined;


            if (result) {
                const productRow = await sql`
                UPDATE products
                SET
                name = ${name},
                description = ${description},
                price = ${price},
                category = ${category},
                image_url = ${result.url}
                WHERE
                id = ${productId} AND store_id = ${storeId}}
                RETURNING id, name, description, price, category, image_url`;


                return NextResponse.json(
                    {
                        message: 'Product updated successfully',
                        productData: productRow.rows[0]
                    }, {
                        status: 200
                    });

            } else {

                const productRow = await sql`
                UPDATE products
                SET
                name = ${name},
                description = ${description},
                price = ${price},
                category = ${category}
                WHERE
                id = ${productId} AND store_id = ${storeId}}
                RETURNING id, name, description, price, category, image_url`;


                return NextResponse.json(
                    {
                        message: 'Product updated successfully',
                        productData: productRow.rows[0]
                    }, {
                        status: 200
                    });
            }

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

}