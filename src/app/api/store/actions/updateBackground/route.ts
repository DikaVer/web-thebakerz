import {auth} from "@/auth";
import {connectionPool} from "@/db";
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

            const queryUserId = await connectionPool.query(`
              SELECT user_id FROM stores WHERE id = '${storeId}';
            `);

            const userId = queryUserId.rows[0].user_id;

            // @ts-ignore
            if (userId === session.user?.id || session.user?.role === 'admin') {

                // @ts-ignore
                const filename = `storeBackgrounds/${storeId}/${nanoid()}.${contentType}`;

                const blob = await put(filename, file, {
                    contentType,
                    access: 'public',
                });


                await connectionPool.query(`
                  UPDATE stores
                  SET
                    background_url = '${blob.url}'
                  WHERE id = '${storeId}';
                `);


                return NextResponse.json(
                    {
                        message: 'Background image updated successfully'
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