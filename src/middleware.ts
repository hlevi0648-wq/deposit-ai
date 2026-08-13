import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher(['/builder(.*)', '/dashboard(.*)', '/api/forms(.*)']);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect();
});

export const config = {
  matcher: ['/((?!.*\\..*|_next|sign-in|sign-up).*)', '/', '/(api|trpc)(.*)'],
};
