import {auth} from "@/auth";
import {connectionPool} from "@/db";
import {NextResponse} from "next/server";
import {descriptionSchema} from "@/lib/schemas";
export const runtime = "edge";

export async function POST(req: Request) {


    const body = await req.json();

    const { storeId, description} = body;

    const validateFields = descriptionSchema.safeParse(description);

    if (!validateFields.success) {
        return NextResponse.json(
            {
                message: "Invalid description"
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

        await connectionPool.query(`
          UPDATE stores
          SET
            description = '${description}'
          WHERE id = '${storeId}';
        `);



        return NextResponse.json(
            {
                message: 'Description updated successfully'
            }, {
                status: 200
            });

    } catch (error) {
        return NextResponse.json(
            {
                message: 'Failed to update description'
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