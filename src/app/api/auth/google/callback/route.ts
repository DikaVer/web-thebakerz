import { cookies } from "next/headers";
import { google} from "@/lib/actions/auth/oauth";
import { ObjectParser } from "@pilcrowjs/object-parser";
import { decodeIdToken, type OAuth2Tokens } from "arctic";
import {globalGETRateLimit} from "@/lib/utils/helper/requests";
import {createSession, generateSessionToken, setSessionTokenCookie} from "@/lib/actions/session";
import {createUserGoogle, getUserFromEmail, getUserFromGoogleId} from "@/lib/actions/user";
import {replaceGuestCart} from "@/lib/actions/cart";
import {getTranslations} from "next-intl/server";
import { logger } from "@/lib/logger";
import { getRequestContext } from "@/lib/request-context";
import { replaceGuestAddress } from "@/lib/actions/delivery-actions";

// Initialize logger for Google OAuth callback
const log = logger.child({ module: "google-oauth-callback" });

export async function GET(request: Request): Promise<Response> {
	const t = await getTranslations("app/api/auth/google");
	const context = await getRequestContext();
	
	log.info('googleCallback', 'Google OAuth callback started', {
		requestId: context.requestId,
		clientIP: context.clientIP,
		url: request.url
	});

	if (!await globalGETRateLimit()) {
		log.warn('googleCallback', 'Rate limit exceeded for Google OAuth callback', {
			requestId: context.requestId,
			clientIP: context.clientIP
		});
		return new Response(t("tooManyRequests"), {
			status: 429
		});
	}
	
	const url = new URL(request.url);
	const code = url.searchParams.get("code");
	const state = url.searchParams.get("state");
	
	const cookieStore = await cookies();

	const storedState = cookieStore.get("google_oauth_state")?.value ?? null;
	const codeVerifier = cookieStore.get("google_code_verifier")?.value ?? null;
	
	// Enhanced logging to debug potential timing issues with fast redirects
	log.debug('googleCallback', 'Retrieved OAuth parameters before validation', {
		requestId: context.requestId,
		clientIP: context.clientIP,
		codeParam: code ? 'present' : 'null', // Avoid logging sensitive code itself
		stateParam: state ? 'present' : 'null',
		storedStateCookie: storedState ? 'present' : 'null',
		codeVerifierCookie: codeVerifier ? 'present' : 'null',
		hasCode: code !== null,
		hasState: state !== null,
		hasStoredState: storedState !== null,
		hasCodeVerifier: codeVerifier !== null
	});

	// Check for missing parameters
	if (code === null || state === null || storedState === null || codeVerifier === null) {
		log.warn('googleCallback', 'Missing required OAuth parameters', {
			requestId: context.requestId,
			clientIP: context.clientIP,
			hasCode: code !== null,
			hasState: state !== null,
			hasStoredState: storedState !== null,
			hasCodeVerifier: codeVerifier !== null
		});
		return new Response(t("pleaseRestartProcess"), {
			status: 400
		});
	}
	
	// Check for state mismatch
	if (state !== storedState) {
		log.warn('googleCallback', 'OAuth state mismatch', {
			requestId: context.requestId,
			clientIP: context.clientIP,
			receivedState: state,
			storedState: storedState
		});
		return new Response(t("pleaseRestartProcess"), {
			status: 400
		});
	}

	let tokens: OAuth2Tokens;
	try {
		log.debug('googleCallback', 'Validating authorization code', {
			requestId: context.requestId,
			clientIP: context.clientIP
		});
		tokens = await google.validateAuthorizationCode(code, codeVerifier);
	} catch (error) {
		log.error('googleCallback', 'Failed to validate authorization code', {
			requestId: context.requestId,
			clientIP: context.clientIP,
			error: error instanceof Error ? error.message : String(error)
		});
		return new Response(t("pleaseRestartProcess"), {
			status: 400
		});
	}

	// Clear OAuth cookies after successful validation
	log.debug('googleCallback', 'Clearing OAuth cookies after successful validation', {
		requestId: context.requestId,
		clientIP: context.clientIP
	});

	const claims = decodeIdToken(tokens.idToken());
	const claimsParser = new ObjectParser(claims);

	const googleId = claimsParser.getString("sub");
	const name = claimsParser.getString("name");
	const picture = claimsParser.getString("picture");
	const email = claimsParser.getString("email");
	
	log.info('googleCallback', 'Successfully decoded ID token', {
		requestId: context.requestId,
		clientIP: context.clientIP,
		email,
		googleId
	});

	const redirectCookie = cookieStore.get("google_redirect")?.value || "/";
	const redirectTo = redirectCookie.startsWith('/') ? redirectCookie : `/${redirectCookie}`;
	const storeId = cookieStore.get("google_store_id")?.value || null;

	// Check for existing user with Google ID
	const existingUser = await getUserFromGoogleId(googleId);
	if (existingUser !== null) {
		log.info('googleCallback', 'Found existing user with Google ID', {
			requestId: context.requestId,
			clientIP: context.clientIP,
			email,
			userId: existingUser.id
		});
		
		const sessionToken = generateSessionToken();
		const session = await createSession(sessionToken, existingUser.id);
		await setSessionTokenCookie(sessionToken, session.expiresAt);
		
		if (storeId) {
			log.debug('googleCallback', 'Replacing guest cart for existing user', {
				requestId: context.requestId,
				userId: existingUser.id,
				storeId
			});
			await replaceGuestCart(storeId);
			await replaceGuestAddress();
		}
		
		log.info('googleCallback', 'Authentication successful, redirecting existing user', {
			requestId: context.requestId,
			clientIP: context.clientIP,
			userId: existingUser.id,
			redirectTo
		});

		cookieStore.delete("google_oauth_state");
		cookieStore.delete("google_code_verifier");
		cookieStore.delete("google_redirect");
		cookieStore.delete("google_store_id");
		
		return new Response(null, {
			status: 302,
			headers: {
				Location: redirectTo
			}
		});
	}

	// Check for existing user with email
	let user = await getUserFromEmail(email);

	if (user !== null) {
		log.info('googleCallback', 'Found existing user with matching email', {
			requestId: context.requestId,
			clientIP: context.clientIP,
			email,
			userId: user.id
		});
	} else {
		log.info('googleCallback', 'Creating new user from Google account', {
			requestId: context.requestId,
			clientIP: context.clientIP,
			email
		});
		user = await createUserGoogle(googleId, email, name, picture);
	}

	const sessionToken = generateSessionToken();
	const session = await createSession(sessionToken, user.id);
	await setSessionTokenCookie(sessionToken, session.expiresAt);
	
	if (storeId) {
		log.debug('googleCallback', 'Replacing guest cart for user', {
			requestId: context.requestId,
			userId: user.id,
			storeId
		});
		await replaceGuestCart(storeId);
		await replaceGuestAddress();
	}
	
	log.info('googleCallback', 'Authentication successful, redirecting user', {
		requestId: context.requestId,
		clientIP: context.clientIP,
		userId: user.id,
		isNewUser: existingUser === null && await getUserFromEmail(email) === null,
		redirectTo
	});

	cookieStore.delete("google_oauth_state");
	cookieStore.delete("google_code_verifier");
	cookieStore.delete("google_redirect");
	cookieStore.delete("google_store_id");
	
	return new Response(null, {
		status: 302,
		headers: {
			Location: redirectTo
		}
	});
}
