import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const privateRoutes = ['/message', '/user', '/']
const authRoutes = ['/auth']

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
    const token = request.cookies.get('access_token')?.value || request.cookies.get('refresh_token')?.value // Get the value of the token

    const { pathname } = request.nextUrl

    // Check if the user is on the auth route and has an access token
    if (authRoutes.some((path) => pathname.startsWith(path)) && token) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    // Check if the user is on the private route and has no access token
    if (privateRoutes.some((path) => pathname.startsWith(path)) && !authRoutes.includes(pathname) && !token) {
        return NextResponse.redirect(new URL('/auth', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|api|.*\\..*).*)'],
}
