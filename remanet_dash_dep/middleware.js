// export { default } from "next-auth/middleware";

// export const config = { matcher: ["/(dash)/dashboard", "/(dash)/UsersSettings", "/dashboard", "/UsersSettings"] };

// middleware.js (at project root)

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    console.log("Protected route accessed:", req.nextUrl.pathname);
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard", "/UsersSettings"],
};
