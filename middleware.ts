import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const publicRoutes = createRouteMatcher(["/", "/(api|trpc)(.*)"]); 

export default clerkMiddleware(async (auth, req) => {
  if (!publicRoutes(req)) {
    const session = await auth();
    if (!session.userId) {
      return session.redirectToSignIn({ returnBackUrl: req.url });
    }
  }
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};