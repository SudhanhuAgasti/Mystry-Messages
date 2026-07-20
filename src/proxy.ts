// IT IS FOR MIDDLEWARE !!

// import {NextRequest, NextResponse } from 'next/server'
// export {default} from "next-auth/middleware"
// import { getToken } from 'next-auth/jwt'
 
// // This function can be marked `async` if using `await` inside
// export  async function proxy(request: NextRequest) {

//     const token=await getToken({req:request})
//     const url=request.nextUrl

//     if (token && (
//         url.pathname.startsWith('/sign-in') ||
//         url.pathname.startsWith('/sign-up') ||
//         url.pathname.startsWith('/verify')  ||
//         url.pathname.startsWith('/')
//     )) {
//         return NextResponse.redirect(new URL('/dashboard', request.url))
//     }
//   return NextResponse.redirect(new URL('/home', request.url))
// }
 
// // See "Matching Paths" below to learn more
// export const config = {
//   matcher: [
//     "/",
//     "/sign-in",
//     "/sign-up",
//     "/verify/:path*",
//     "/dashboard/:path*",
//   ],
// };


// HERE WE USE proxy SO THE COD BE LIKE ......
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request });
  const url = request.nextUrl;

  // Logged-in user auth pages par na jaye
  if (
    token &&
    (
      url.pathname === "/" ||
      url.pathname.startsWith("/sign-in") ||
      url.pathname.startsWith("/sign-up") ||
      url.pathname.startsWith("/verify")
    )
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Logged-out user dashboard access na kare
  if (!token && url.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/home", request.url));
    // Agar hamare paas sign-in page hai to "/sign-in" bhi use kar sakte ho.
  }

  // Baaki sab requests normal chale
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/sign-in",
    "/sign-up",
    "/verify/:path*",
    "/dashboard/:path*",
  ],
};