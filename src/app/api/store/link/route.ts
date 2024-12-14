import {auth} from "@/auth";
import {connectionPool} from "@/db";
import {NextResponse} from "next/server";

export const runtime = "edge"


export async function POST(req: Request) {

    const session = await auth()

    const body = await req.json();

    const { storeId, userId} = body;

    if(session){
        try {

            // @ts-ignore
            if (session.user?.role === 'admin') {


                const updateStore = connectionPool.query(`
                  UPDATE stores
                  SET
                    user_id = '${userId}'
                  WHERE id = '${storeId}'`);

                const updateUser = await connectionPool.query(`
                  UPDATE users
                  SET
                    role = 'bakerz'
                  WHERE id = '${userId}';
                `);


                await Promise.all([updateStore, updateUser]);



                return NextResponse.json(
                    {
                        message: 'User linked successfully',
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
                    message: 'Failed to link user'
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