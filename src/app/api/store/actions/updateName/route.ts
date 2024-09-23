import {auth} from "@/auth";
import {sql} from "@vercel/postgres";
import {NextResponse} from "next/server";
export const config = {
    runtime: 'edge', // 'nodejs' is the default
};

const isAuthorized = (req: Request) => {
    const authHeader = req.headers.get('Authorization');
    const secretKey = authHeader?.split(' ')[1]; // Extract the key after 'Bearer'

    // Validate the secret key
    return secretKey === process.env.NEXT_PRIVATE_API_SECRET_KEY;
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

    const { storeId, nickname} = body;

    if(session){
        try {
            const queryUserId = await sql`SELECT user_id FROM stores WHERE id = ${storeId}`;
            const userId = queryUserId.rows[0].user_id;

            // @ts-ignore
            if (userId === session.user?.id || session.user?.role === 'admin') {


                    const storeNickname = await sql`
                          SELECT
                            nickname
                          FROM stores
                            WHERE
                            nickname = ${nickname}`;

                    if(storeNickname.rows.length > 0){
                        return NextResponse.json(
                            {
                                message: 'Nickname already exists'
                            }, {
                                status: 400
                            });
                    }

                    const storeRow = await sql`
                            UPDATE stores
                            SET
                                nickname = ${nickname}
                            WHERE id = ${storeId}
                            RETURNING id, nickname, description, background_url, user_id`;



                    return NextResponse.json(
                        {
                            message: 'Nickname updated successfully',
                            storeData: storeRow.rows[0]
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
                    message: 'Failed to update nickname'
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