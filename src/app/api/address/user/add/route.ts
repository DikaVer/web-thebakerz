import { NextResponse } from "next/server";
import {auth} from "@/auth";
import {sql} from "@vercel/postgres";
import {AddressDataStoreField} from "@/lib/definitions";

const isAuthorized = (req: Request) => {
    const authHeader = req.headers.get('Authorization');
    const secretKey = authHeader?.split(' ')[1]; // Extract the key after 'Bearer'

    // Validate the secret key
    return secretKey === process.env.NEXT_PRIVATE_API_SECRET_KEY;
};

// This function will handle saving the address
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

    const { userId, locationDataRaw} = body;

    if(session){
        try {

            // @ts-ignore
            if (userId === session.user?.id || session.user?.role === 'admin') {

                const { locationData }: { locationData: AddressDataStoreField } = locationDataRaw;


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
                    longitude
                    ) VALUES (
                        ${userId},
                        ${locationData.route},
                        ${locationData.street_number},
                        ${locationData.subPremise},
                        ${locationData.premise},
                        ${locationData.country},
                        ${locationData.zipCode},
                        ${locationData.city},
                        ${locationData.state},
                        ${locationData.latitude},
                        ${locationData.longitude}
                    ) RETURNING *`;


                return NextResponse.json(
                    {
                        message: 'Address added successfully',
                        locationData: userLocation.rows[0]
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
                    message: 'Failed to add address'
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
