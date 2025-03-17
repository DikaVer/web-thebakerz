import {NextRequest, NextResponse} from 'next/server';

export function middleware(req: NextRequest) {
    // const { pathname } = req.nextUrl;

    // Avoid rewriting if the user is already on the /select-language page.
    // if (pathname.startsWith('/select-language')) {
    //     return NextResponse.next();
    // }

    // Otherwise, continue as normal.
    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        '/((?!_next|api|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)'
    ],
}