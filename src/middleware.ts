import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
    '/dashboard(.*)',
    '/groups(.*)',
    '/apna-finance(.*)',
    '/api/upload(.*)', // Protect OCR upload
]);

export default clerkMiddleware(async (auth, req) => {
    try {
        const { userId, redirectToSignIn } = await auth();
        if (!userId && isProtectedRoute(req)) return redirectToSignIn();
    } catch (e) {
        // Ignore auth errors during build/static generation
    }
});

export const config = {
    matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
