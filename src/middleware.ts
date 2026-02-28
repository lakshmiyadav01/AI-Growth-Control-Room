import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Only initialize Ratelimit if Redis env variables are available
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    : null;

const ratelimit = redis
    ? new Ratelimit({
        redis: redis,
        limiter: Ratelimit.slidingWindow(50, '1 d'), // 50 requests per day per IP
        analytics: true,
    })
    : null;

export async function middleware(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';

    // 1. Rate Limiting Protection (Denial of Wallet)
    if (ratelimit) {
        const { success, pending, limit, reset, remaining } = await ratelimit.limit(ip);
        if (!success) {
            return NextResponse.json(
                { error: "Too many requests. Rate limit exceeded." },
                { status: 429 }
            );
        }
    }

    // 2. Authentication Protection (Placeholder for Supabase SSR)
    // When you implement Supabase Auth, verify the session here:
    // const supabase = createServerClient(...)
    // const { data: { user } } = await supabase.auth.getUser()
    // if (!user) return NextResponse.redirect(new URL('/login', request.url))

    const response = NextResponse.next();
    return response;
}

export const config = {
    matcher: '/api/:path*',
};
