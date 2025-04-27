import { generateState, generateCodeVerifier } from "arctic";
import { google} from "@/lib/actions/auth/oauth";
import { cookies } from "next/headers";
import { globalGETRateLimit} from "@/lib/actions/requests";
import {getTranslations} from "next-intl/server";
import { logger } from "@/lib/logger";
import { getRequestContext } from "@/lib/request-context";

// Initialize logger
const log = logger.child({ module: "google-oauth-initialize" });

export async function GET(request: Request): Promise<Response> {
	const t = await getTranslations("app/api/auth/google");
	const context = await getRequestContext();

	log.info('googleAuth', 'Google OAuth initialization started', {
		requestId: context.requestId,
		clientIP: context.clientIP,
		url: request.url
	});

	if (!await globalGETRateLimit()) {
		log.warn('googleAuth', 'Rate limit exceeded for Google OAuth initialization', {
			requestId: context.requestId,
			clientIP: context.clientIP
		});
		return new Response(t("tooManyRequests"), {
			status: 429
		});
	}

	const { searchParams } = new URL(request.url);

	const state = generateState();
	const codeVerifier = generateCodeVerifier();
	const url = google.createAuthorizationURL(state, codeVerifier, ["openid", "profile", "email"]);

	const next = searchParams.get("next");
	const store_id = searchParams.get("store_id");
	const cookieStore = await cookies();

	cookieStore.set("google_oauth_state", state, {
		path: "/",
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		maxAge: 60 * 10, // 10 minutes
		sameSite: "lax"
	});
	cookieStore.set("google_code_verifier", codeVerifier, {
		path: "/",
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		maxAge: 60 * 10, // 10 minutes
		sameSite: "lax"
	});

	if (next) {
		cookieStore.set("google_redirect", next, {
			path: "/",
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			maxAge: 60 * 10, // same lifetime as the others
			sameSite: "lax",
		});
	}
	if (store_id){
		cookieStore.set("google_store_id",store_id, {
			path: "/",
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			maxAge: 60 * 10, // same lifetime as the others
			sameSite: "lax",
		});
	}

	// Instead of returning a 302 redirect response, return an HTML page
	// with JavaScript that waits a short time to ensure cookies are stored
	// before redirecting to Google
	log.info('googleAuth', 'Returning intermediate page with delayed redirect', {
		requestId: context.requestId,
		clientIP: context.clientIP
	});

	const googleAuthUrl = url.toString();
	const html = `
		<!DOCTYPE html>
		<html>
		<head>
			<title>Redirecting to Google...</title>
			<meta name="robots" content="noindex, nofollow">
			<style>
				body {
					font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
					display: flex;
					align-items: center;
					justify-content: center;
					height: 100vh;
					margin: 0;
					background-color: #f9f9f9;
				}
				.container {
					text-align: center;
				}
				.spinner {
					display: inline-block;
					width: 50px;
					height: 50px;
					border: 3px solid rgba(0,0,0,.3);
					border-radius: 50%;
					border-top-color: #377DFF;
					animation: spin 1s ease-in-out infinite;
				}
				@keyframes spin {
					to { transform: rotate(360deg); }
				}
				h3 {
					margin-top: 20px;
					color: #333;
				}
			</style>
		</head>
		<body>
			<div class="container">
				<div class="spinner"></div>
				<h3>Redirecting to Google login...</h3>
			</div>
			<script>
				// Wait 300ms to ensure cookies are properly stored
				// This prevents the "Invalid request" error when
				// Google redirects back very quickly
				setTimeout(function() {
					window.location.href = "${googleAuthUrl}";
				}, 2000);
			</script>
		</body>
		</html>
	`;

	return new Response(html, {
		status: 200,
		headers: {
			"Content-Type": "text/html; charset=utf-8"
		}
	});
}



