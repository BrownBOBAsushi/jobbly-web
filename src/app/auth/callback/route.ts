// src/app/auth/callback/route.ts
import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // DEBUG LOGGING: Print the exact URL hitting the server
  console.log("🔹 CALLBACK HIT. Full URL:", request.url);

  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    console.log("✅ Code found:", code.substring(0, 5) + "...");
    
    const cookieStore = request.cookies
    const response = NextResponse.redirect(`${origin}${next}`)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      console.log("✅ Session exchanged. Redirecting to:", `${origin}${next}`);
      return response
    } else {
      console.error("❌ Exchange Error:", error.message)
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(error.message)}`)
    }
  }

  // If we are here, CODE IS MISSING.
  console.error("❌ MISSING CODE. Search Params:", searchParams.toString());
  return NextResponse.redirect(`${origin}/auth/auth-code-error?error=No_code_provided`)
}