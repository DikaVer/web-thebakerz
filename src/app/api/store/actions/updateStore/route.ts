import {auth} from "@/auth";
import {sql} from "@vercel/postgres";
import {NextResponse} from "next/server";
import {storeEditSchema} from "@/lib/schemas";
export const runtime = "edge";


export async function POST(req: Request) {

    const body = await req.json();

    const { storeId, storeEditData} = body;

    const validateStoreEditData = storeEditSchema.safeParse(storeEditData);

    if (!validateStoreEditData.success) {
        return NextResponse.json(
            {
                message: validateStoreEditData
            }, {
                status: 400
            });
    }

    const session = await auth()

    if(session){
        //array with updated fields
        const updatedFields: string[] = [];

        try {
            const queryUserId = await sql`SELECT user_id, nickname, description FROM stores WHERE id = ${storeId}`;
            const userId = queryUserId.rows[0].user_id;
            const prevNickname = queryUserId.rows[0].nickname;
            const prevDescription = queryUserId.rows[0].description;


            // @ts-ignore
            if (userId === session.user?.id || session.user?.role === 'admin') {


                const { nickname,
                    description,
                    name
                } = validateStoreEditData.data;

                if (nickname !== prevNickname) {
                    const storeNickname = await sql`
                    SELECT
                        nickname
                    FROM stores
                    WHERE
                    nickname = ${nickname} OR id = ${nickname}`;

                    if(storeNickname.rows.length > 0){
                        return NextResponse.json(
                            {
                                message: 'Nickname already exists'
                            }, {
                                status: 400
                            });
                    }

                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/store/action/updateName`, {
                        method: 'POST',
                        headers: {
                            'content-type': "application/json",
                            'Authorization': `Bearer ${process.env.NEXT_PRIVATE_API_SECRET_KEY}`
                        },
                        body: JSON.stringify({
                            storeId: storeId,
                            nickname: nickname
                        }),
                    })

                    if (!response.ok) {
                        return NextResponse.json(
                            {
                                message: 'Failed to update nickname, contact support'
                            }, {
                                status: 400
                            });
                    }
                    updatedFields.push('nickname');
                }

                if (description !== prevDescription) {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/store/action/updateDescription`, {
                        method: 'POST',
                        headers: {
                            'content-type': "application/json",
                            'Authorization': `Bearer ${process.env.NEXT_PRIVATE_API_SECRET_KEY}`
                        },
                        body: JSON.stringify({
                            storeId: storeId,
                            description: description
                        }),
                    })

                    if (!response.ok) {
                        return NextResponse.json(
                            {
                                success: updatedFields,
                                message: 'Failed to update description, contact support'
                            }, {
                                status: 400
                            });
                    }
                    updatedFields.push('description');
                }

                if(session.user?.name !== name){
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/action/updateName`, {
                        method: 'POST',
                        headers: {
                            'content-type': "application/json",
                            'Authorization': `Bearer ${process.env.NEXT_PRIVATE_API_SECRET_KEY}`
                        },
                        body: JSON.stringify({
                            userId: userId,
                            nickname: name,
                            session: session
                        }),
                    })

                    if (!response.ok) {
                        return NextResponse.json(
                            {
                                success: updatedFields,
                                message: 'Failed to update store name, contact support'
                            }, {
                                status: 400
                            });
                    }
                    updatedFields.push('name');
                }

                if(background){
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/store/action/updateBackground`, {
                        method: 'POST',
                        headers: {
                            'content-type': "application/json",
                            'Authorization': `Bearer ${process.env.NEXT_PRIVATE_API_SECRET_KEY}`
                        },
                        body: JSON.stringify({
                            storeId: storeId,
                            file: background
                        }),
                    })

                    if (!response.ok) {
                        return NextResponse.json(
                            {
                                success: updatedFields,
                                message: 'Failed to update background, contact support'
                            }, {
                                status: 400
                            });
                    }
                    updatedFields.push('background');
                }

                if(image){
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/action/updateAvatar`, {
                        method: 'POST',
                        headers: {
                            'content-type': "application/json",
                            'Authorization': `Bearer ${process.env.NEXT_PRIVATE_API_SECRET_KEY}`
                        },
                        body: JSON.stringify({
                            storeId: userId,
                            file: image,
                            session: session
                        }),
                    })

                    if (!response.ok) {
                        return NextResponse.json(
                            {
                                success: updatedFields,
                                message: 'Failed to update image, contact support'
                            }, {
                                status: 400
                            });
                    }
                    updatedFields.push('image');
                }




                return NextResponse.json(
                    {
                        message: 'Store updated successfully',
                        success: updatedFields
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
                    message: 'Failed to update store',
                    success: updatedFields
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