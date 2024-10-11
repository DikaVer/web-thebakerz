import {auth} from "@/auth";
import {sql} from "@vercel/postgres";
import {NextResponse} from "next/server";
import {nameSchema} from "@/lib/schemas";
export const runtime = "edge";


export async function POST(req: Request) {


    const body = await req.json();

    const { userId, nickname} = body;

    if (!userId) {
        return NextResponse.json(
            {
                message: 'Missing user'
            }, {
                status: 401
            });
    }

    const validateFields = nameSchema.safeParse(nickname);

    if (!validateFields.success) {
        return NextResponse.json(
            {
                message: "Invalid name"
            }, {
                status: 400
            });
    }

    const session = await auth();

    if(session){
        try {

            // @ts-ignore
            if (userId === session.user?.id || session.user?.role === 'admin') {


                await sql`
                    UPDATE users
                    SET
                        name = ${nickname}
                    WHERE id = ${userId}`;



                return NextResponse.json(
                    {
                        message: 'Name updated successfully'
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
                    message: 'Failed to update name'
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