import {connectionPool} from "@/db";
import {NextResponse} from "next/server";
import {auth} from "@/auth";
import {nicknameSchema} from "@/lib/schemas";
export const runtime = "edge";

export async function POST(req: Request) {

    const body = await req.json();

    const { storeId, nickname} = body;

    const validateFields = nicknameSchema.safeParse(nickname);

    if (!validateFields.success) {
        return NextResponse.json(
            {
                message: 'Invalid nickname'
            }, {
                status: 400
            });
    }

    const session = await auth()

    if(session){

        const queryUserId = await connectionPool.query(`
          SELECT user_id FROM stores WHERE id = '${storeId}';
        `);

        const userId = queryUserId.rows[0].user_id;

        // @ts-ignore
        if (userId === session.user?.id || session.user?.role === 'admin') {
            try {
                const storeNickname = await connectionPool.query(`
                  SELECT
                    nickname
                  FROM stores
                  WHERE
                    nickname = '${nickname}' OR id = '${nickname}';
                `);


                if(storeNickname.rows.length > 0){
                    return NextResponse.json(
                        {
                            message: 'Nickname already exists'
                        }, {
                            status: 400
                        });
                }

                await connectionPool.query(`
                  UPDATE stores
                  SET
                    nickname = '${nickname}'
                  WHERE id = '${storeId}';
                `);



                return NextResponse.json(
                    {
                        message: 'Nickname updated successfully'
                    }, {
                        status: 200
                    });

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

        } else {
            return NextResponse.json(
                {
                    message: 'Unauthorized access'
                }, {
                    status: 401
                });
        }

}