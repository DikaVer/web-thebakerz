import { NextResponse } from "next/server";
import {auth} from "@/auth";
import {sql} from "@vercel/postgres";
import {AddressDataStoreField} from "@/lib/definitions";

export const runtime = "edge"

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

    const { storeId, locationDataRaw} = body;

    if(session){
        try {

            // @ts-ignore
            if (userId === session.user?.id || session.user?.role === 'admin') {

                const { locationData }: { locationData: AddressDataStoreField } = locationDataRaw;


                const userLocation = await sql`
                UPDATE addresses_users
                SET
                    route = ${locationData.route},
                    street_number = ${locationData.street_number},
                    sub_premise = ${locationData.sub_premise},
                    premise = ${locationData.premise},
                    country = ${locationData.country},
                    zip_code = ${locationData.zip_code},
                    city = ${locationData.city},
                    state = ${locationData.state},
                    latitude = ${locationData.latitude},
                    longitude = ${locationData.longitude}
                 WHERE store_id = ${`${storeId}`}
                 RETURNING *`;


                return NextResponse.json(
                    {
                        message: 'Address updated successfully',
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
                    message: 'Failed to update address'
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
