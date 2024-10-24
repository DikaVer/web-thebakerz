import {auth} from "@/auth";
import {sql} from "@vercel/postgres";
import {NextResponse} from "next/server";
import {kv} from "@vercel/kv";
import {availabilitySchema} from "@/lib/schemas";
export const runtime = "edge";
import {timeMap} from "@/lib/local-variables";

export async function POST(req: Request) {

    const body = await req.json();

    const { storeId, availabilityData} = body;


    const validateField = availabilitySchema.safeParse(availabilityData);

    if (!validateField.success) {
       return NextResponse.json(
            {
                message: "Invalid availability data",
            }, {
                status: 400
            });
    }

    const today = new Date();

    const filteredAvailabilityData = Object.keys(availabilityData).reduce((acc:{ [key: string]: typeof availabilityData[keyof typeof availabilityData] }, dateKey) => {
        const date = new Date(dateKey);
        if (date > today) {
            const { from, to } = availabilityData[dateKey];
            if (timeMap[from].from < timeMap[to].from) {
                acc[dateKey] = availabilityData[dateKey];
            } else {
                return {};
            }
        }
        return acc;
    }, {});

    if (Object.keys(filteredAvailabilityData).length === 0) {
        return NextResponse.json(
            {
                message: "Invalid availability data",
            }, {
                status: 400
            });
    }




    const session = await auth();

    if(session){

        try {

            const queryUserId = await sql`SELECT user_id FROM stores WHERE id = ${`${storeId}`}`;
            const userId = queryUserId.rows[0].user_id;

            // @ts-ignore
            if (userId === session.user?.id || session.user?.role === 'admin') {


                    const keyAvailability = `availability-${storeId}`;

                    await kv.del(keyAvailability);

                    if (Object.keys(filteredAvailabilityData).length === 0) {
                        return NextResponse.json(
                            {
                                message: 'Availability updated successfully'
                            }, {
                                status: 200
                            });
                    }

                    await kv.hset(keyAvailability, filteredAvailabilityData);

                    return NextResponse.json(
                        {
                            message: 'Availability updated successfully'
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
                        message: 'Failed to update availability'
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