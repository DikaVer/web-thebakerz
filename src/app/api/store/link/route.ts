import {auth} from "@/auth";
import {sql} from "@vercel/postgres";
import {NextResponse} from "next/server";
export const config = {
    runtime: 'edge', // 'nodejs' is the default
};


export async function POST(req: Request) {

    const session = await auth()

    const body = await req.json();

    const { storeId, userId} = body;

    if(session){
        try {

            // @ts-ignore
            if (session.user?.role === 'admin') {


                await sql`
                    UPDATE stores
                    SET
                        user_id = ${userId}
                    WHERE id = ${storeId}`;

                await sql`
                    UPDATE users
                    SET
                        role = 'bakerz'
                    WHERE id = ${userId}`;



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