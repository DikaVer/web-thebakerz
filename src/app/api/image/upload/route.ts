import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { customAlphabet } from 'nanoid'

export const config = {
    runtime: 'edge', // 'nodejs' is the default
};

const isAuthorized = (req: Request) => {
    const authHeader = req.headers.get('Authorization');
    const secretKey = authHeader?.split(' ')[1]; // Extract the key after 'Bearer'

    // Validate the secret key
    return secretKey === process.env.NEXT_PRIVATE_API_SECRET_KEY;
};


const nanoid = customAlphabet(
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    24
); // 7-character random string

export async function POST(req: Request) {

    // Retrieve the secret from the Authorization header
    const authHeader = req.headers.get('Authorization');
    const secretKey = authHeader?.split(' ')[1]; // Extract the key after 'Bearer'

    // Validate the secret key
    if (secretKey !== process.env.API_SECRET_KEY) {
        return NextResponse.json({
            message: 'Unauthorized access'
        }, {
            status: 401
        });
    }


    try {
        const body = await req.json();

        const {path, file, fileName} = body;

        const contentType = req.headers.get('content-type') || 'text/plain';

        const filename = `${path}/${nanoid()}.${fileName}`;

        const blob = await put(filename, file, {
            contentType,
            access: 'public',
        });

        return NextResponse.json(blob);

    } catch (error) {
        return NextResponse.json({
            message: 'Failed to upload image'
        }, {
            status: 500
        });
    }
}