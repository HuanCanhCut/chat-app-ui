import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const privateRoutes = ['/dashboard']
const authRoutes = ['/login']

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
    const token = request.cookies.get('token')

    // Kiểm tra nếu đường dẫn là privateRoutes và không có token
    if (privateRoutes.some((path) => request.nextUrl.pathname.startsWith(path)) && !token) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Kiểm tra nếu đường dẫn là authRoutes và có token
    if (authRoutes.some((path) => request.nextUrl.pathname.startsWith(path)) && token) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [...privateRoutes, ...authRoutes],
}
