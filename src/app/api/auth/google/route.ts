import { generateState, generateCodeVerifier } from "arctic";
import { google} from "@/lib/actions/auth/oauth";
import { cookies } from "next/headers";
import { globalGETRateLimit} from "@/lib/utils/helper/requests";
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

	// Generate state with timestamp for better debugging
	const timestamp = Date.now();
	const state = `${generateState()}_${timestamp}`;
	const codeVerifier = generateCodeVerifier();
	const url = google.createAuthorizationURL(state, codeVerifier, ["openid", "profile", "email"]);

	const next = searchParams.get("next");
	const store_id = searchParams.get("store_id");
	const cookieStore = await cookies();

	// Clear any existing cookies first to prevent stale data
	log.debug('googleAuth', 'Clearing existing OAuth cookies', {
		requestId: context.requestId,
		clientIP: context.clientIP
	});
	
	cookieStore.delete("google_oauth_state");
	cookieStore.delete("google_code_verifier");
	cookieStore.delete("google_redirect");
	cookieStore.delete("google_store_id");

	// Set new cookies
	log.debug('googleAuth', 'Setting new OAuth cookies', {
		requestId: context.requestId,
		clientIP: context.clientIP,
		stateTimestamp: timestamp
	});

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

	log.info('googleAuth', 'Redirecting to Google OAuth', {
		requestId: context.requestId,
		clientIP: context.clientIP,
		stateTimestamp: timestamp
	});

	return new Response(null, {
		status: 302,
		headers: {
			Location: url.toString()
		}
	});
}



