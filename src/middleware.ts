import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const privateRoutes = ['/message', '/user']
const authRoutes = ['/auth']

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
    const token = request.cookies.get('access_token')?.value // Get the value of the token

    const { pathname } = request.nextUrl

    if (pathname === '/') {
        if (token) {
            return NextResponse.redirect(new URL('/message', request.url))
        } else {
            return NextResponse.redirect(new URL('/auth', request.url))
        }
    }

    // Check if the user is on the auth route and has an access token
    if (authRoutes.some((path) => pathname.startsWith(path)) && token) {
        return NextResponse.redirect(new URL('/message', request.url))
    }

    // Check if the user is on the private route and has no access token
    if (privateRoutes.some((path) => pathname.startsWith(path)) && !authRoutes.includes(pathname) && !token) {
        return NextResponse.redirect(new URL('/auth', request.url))
    }

    return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: ['/message', '/', '/auth', '/user'],
}
