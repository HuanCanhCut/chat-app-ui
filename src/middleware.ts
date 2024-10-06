import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { routes } from './config/routes'

const privateRoutes = [routes.dashboard, routes.user]
const authRoutes = [routes.login]

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value // Lấy giá trị của token

    const { pathname } = request.nextUrl

    if (pathname === routes.home) {
        if (token) {
            return NextResponse.redirect(new URL(routes.dashboard, request.url))
        } else {
            return NextResponse.redirect(new URL(routes.login, request.url))
        }
    }

    // Kiểm tra nếu đang ở auth route mà đã có token
    if (authRoutes.some((path) => pathname.startsWith(path)) && token) {
        return NextResponse.redirect(new URL(routes.dashboard, request.url))
    }

    // Kiểm tra nếu đang ở private route và không có token
    if (privateRoutes.some((path) => pathname.startsWith(path)) && !authRoutes.includes(pathname) && !token) {
        return NextResponse.redirect(new URL(routes.login, request.url))
    }

    return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [routes.dashboard, routes.home, routes.login, routes.user],
}
