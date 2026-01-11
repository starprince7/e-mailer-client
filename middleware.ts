import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  if (request.method === 'POST' && request.nextUrl.pathname.startsWith('/api/send-email')) {
    const apiKey = request.cookies.get('resend_api_key')?.value;
    
    if (apiKey) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-api-key', apiKey);
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
