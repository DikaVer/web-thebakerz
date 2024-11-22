import { NextResponse } from "next/server";
import {auth} from "@/auth";
import {sql} from "@vercel/postgres";
import {AddressDataFieldSchema} from "@/lib/schemas";

export const runtime = "edge"


// This function will handle saving the address
export async function POST(req: Request) {

    const body = await req.json();

    let { userId, locationData} = body;

    const validateFields = AddressDataFieldSchema.safeParse(locationData);

    if (!validateFields.success) {
        return NextResponse.json(
            {
                message: 'Invalid address data'
            }, {
                status: 400
            });
    }


    const session = await auth()


    if(session){
        try {

            if (!userId){
                userId = session.user?.id;
            }

            // @ts-ignore
            if (userId === session.user?.id || session.user?.role === 'admin') {


                if (locationData.id !== undefined) {
                    await sql`
                        DELETE FROM addresses_users
                        WHERE
                            user_id = ${`${userId}`} AND id = ${locationData.id}`;
                } else {
                    return NextResponse.json(
                        {
                            message: 'Location ID is required for deletion'
                        }, {
                            status: 400
                        });
                }


                return NextResponse.json(
                    {
                        message: 'Address deleted successfully',
                        locationDataId: locationData.id
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
                    message: 'Failed to add address',
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
