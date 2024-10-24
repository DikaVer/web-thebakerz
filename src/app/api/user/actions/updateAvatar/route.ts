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

    if(contentType !== 'image/png' && contentType !== 'image/jpeg' && contentType !== 'image/jpg'){
        return NextResponse.json({
            message: 'Invalid file type'
        }, {
            status: 400
        });
    }

    const userId = req.headers.get('user-id');

    if (!userId) {
        return NextResponse.json(
            {
                message: 'Missing user'
            }, {
                status: 401
            });
    }


    const session = await auth();

    if(session){

        try {

            // @ts-ignore
            if (userId === session.user?.id || session.user?.role === 'admin') {

                // @ts-ignore
                const filename = `avatars/${nanoid()}.${file?.type}`;

                const blob = await put(filename, file, {
                    contentType,
                    access: 'public',
                });


                await sql`
                        UPDATE users
                        SET
                            image = ${blob.url}
                        WHERE id = ${`${userId}`}`;

                return NextResponse.json(
                    {
                        message: 'Avatar image updated successfully'
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
                    message: 'Failed to update avatar image'
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