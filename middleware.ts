import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function decodeJwtPayload(token: string): { isAdmin?: boolean } | null {
  try {
    const base64Url = token.split('.')[1]
    if (!base64Url) return null
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

// Public paths that everyone can access without login
const publicOnly = ['/login', '/signup']

// Paths allowed for logged-in users
const userAllowed = ['/', '/profile', '/add_item', '/verifyemail', '/chat']

// Helper to check path or its subpaths
function isPathMatch(path: string, prefix: string) {
  return path === prefix || path.startsWith(prefix + '/')
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('token')?.value || ''
  const payload = token ? decodeJwtPayload(token) : null
  const isAdmin = payload?.isAdmin === true

  if (!token || !payload) {
    // Unauthenticated users can only visit public pages
    if (publicOnly.includes(pathname)) return NextResponse.next()
    // Redirect all other requests to login
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAdmin) {
    // Admins should be redirected from login/signup to /admin
    if (publicOnly.includes(pathname)) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    // Admins can access everything else including /admin and subpaths
    return NextResponse.next()
  }

  // Normal logged-in users

  // Block admins paths from users
  if (isPathMatch(pathname, '/admin')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Block access to login/signup for logged-in users
  if (publicOnly.includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Allow only user-allowed paths for logged-in users
  const allowed = userAllowed.some(prefix => isPathMatch(pathname, prefix))
  if (allowed) return NextResponse.next()

  // Block all other paths
  return NextResponse.redirect(new URL('/', request.url))
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/signup',
    '/verifyemail',
    '/admin/:path*',
    '/profile/:path*',
    '/add_item/:path*',
    '/chat/:path*',
  ],
}
