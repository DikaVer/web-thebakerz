import {sql} from "@vercel/postgres";
import {NextResponse} from "next/server";
export const config = {
    runtime: 'edge', // 'nodejs' is the default
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

    // Product List is an array of product ids
    const { productList } = body;

    try {

        const productRow = await sql`
            SELECT * FROM products
            WHERE id = ANY(${productList})`;

        return NextResponse.json(
            {
                product: productRow.rows[0]
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