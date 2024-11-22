import {auth} from "@/auth";
import {sql} from "@vercel/postgres";
import {NextResponse} from "next/server";
import {put} from "@vercel/blob";
import {customAlphabet} from "nanoid";
export const runtime = "edge";

const nanoid = customAlphabet(
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    20
)


export async function POST(req: Request) {

    const file = req.body || ''

    if(file === ''){
        return NextResponse.json({
            message: 'No file uploaded'
        }, {
            status: 400
        });
    }

    const contentType = req.headers.get('content-type') || 'text/plain';

    const storeId = req.headers.get('store-id');

    if (!storeId) {
        return NextResponse.json(
            {
                message: 'Unauthorized access'
            }, {
                status: 401
            });
    }

    if(contentType !== 'image/png' && contentType !== 'image/jpeg' && contentType !== 'image/jpg'){
        return NextResponse.json({
            message: 'Invalid file type'
        }, {
            status: 400
        });
    }


    const session = await auth();

    if(session){

        try {

            const queryUserId = await sql`SELECT user_id FROM stores WHERE id = ${storeId}`;
            const userId = queryUserId.rows[0].user_id;

            // @ts-ignore
            if (userId === session.user?.id || session.user?.role === 'admin') {

                // @ts-ignore
                const filename = `storeProducts/${storeId}/${nanoid()}.${contentType}`;

                const blob = await put(filename, file, {
                    contentType,
                    access: 'public',
                });



                return NextResponse.json(
                    {
                        message: 'Product image is uploaded successfully',
                        url: blob.url
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
                    message: `Failed to update background image: ${error}`
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