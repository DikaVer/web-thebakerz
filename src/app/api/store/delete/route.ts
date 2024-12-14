import {auth} from "@/auth";
import {connectionPool} from "@/db";
import {NextResponse} from "next/server";
export const runtime = "edge"

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

    const { storeId} = body;

    if(session){
        try {

            // @ts-ignore
            if (session.user?.role === 'admin') {


                const storeRow = await connectionPool.query(`
                  UPDATE stores
                  SET
                    deleted = '${true}'
                  WHERE id = '${storeId}'`);


                return NextResponse.json(
                    {
                        message: 'Store was removed successfully',
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
                    message: 'Failed to remove store'
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