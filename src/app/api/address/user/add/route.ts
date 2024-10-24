import { NextResponse } from "next/server";
import {auth} from "@/auth";
import {sql} from "@vercel/postgres";
import {AddressDataFieldSchema} from "@/lib/schemas";
import {create} from "node:domain";
import {createNanoid} from "@/lib/utils";


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


                const userLocation = await sql`
                INSERT INTO addresses_users (
                    user_id,
                    route,
                    street_number,
                    sub_premise,
                    premise,
                    country,
                    zip_code,
                    city,
                    state,
                    latitude,
                    longitude,
                    delivery_notes
                    ) VALUES (
                        ${userId},
                        ${locationData.route},
                        ${locationData.street_number},
                        ${locationData.sub_premise},
                        ${locationData.premise},
                        ${locationData.country},
                        ${locationData.zip_code},
                        ${locationData.city},
                        ${locationData.state},
                        ${locationData.latitude},
                        ${locationData.longitude},
                        ${locationData.delivery_notes}
                    ) RETURNING id`;


                return NextResponse.json(
                    {
                        message: 'Address added successfully',
                        locationDataId: userLocation.rows[0].id
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
                    data: {userId, locationData},
                    error: error
                }, {
                    status: 500
                });
        }



    } else {
        return NextResponse.json(
            {
                message: 'Unauthorized access',
                locationDataId: createNanoid(12)
            }, {
                status: 200
            });
    }

}
