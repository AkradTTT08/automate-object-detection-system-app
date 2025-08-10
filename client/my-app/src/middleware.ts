import { NextRequest, NextResponse } from 'next/server';

const public_paths = ['/login', '/_next', '/api'];

export async function middleware(req: NextRequest){
    const url = req.nextUrl;
    if (public_paths.some( p => url.pathname.startsWith(p))){
        return NextResponse.next();
    };

    const token = req.cookies.get('access_token')?.value;
    if (!token) {
        return NextResponse.redirect(new URL('/login', url));
    }

    try {
        return NextResponse.next();
    } catch {
        return NextResponse.redirect(new URL('/login', url));
    }
};

export const config = {
    matcher: [
        '/cameras/:path*',
        '/alerts/:path*',
    ],
};