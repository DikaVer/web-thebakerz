import { NextResponse } from "next/server";
import {auth} from "@/auth";
import {sql} from "@vercel/postgres";
import {AddressDataField} from "@/lib/definitions";

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



    const body = await req.json();

    const { storeData } = body;

    try {

            const { nickname, locationData }: { nickname: string; locationData: AddressDataField } = storeData;

            const storeNickname = await sql`
                      SELECT
                        nickname
                      FROM stores
                        WHERE
                        nickname = ${nickname}`;

            if(storeNickname.rows.length > 0){
                return NextResponse.json(
                    {
                        message: 'Nickname already exists'
                    }, {
                        status: 400
                    });
            }

            const storeRow = await sql`
                INSERT INTO stores (
                    nickname
                ) VALUES (
                    ${nickname}
                )
                RETURNING *`;


            const storeLocation = await sql`
            INSERT INTO addresses_stores (
                store_id,
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
                    ${storeRow.rows[0].id},
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
                    message: 'Store added successfully',
                    storeData: storeRow.rows[0],
                    locationData: storeLocation.rows[0]
                }, {
                    status: 200
                });

    } catch (error) {
        console.log(error);
        return NextResponse.json(
            {
                message: 'Failed to add store'
            }, {
                status: 500
            });
    }

}
