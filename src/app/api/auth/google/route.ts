import { generateState, generateCodeVerifier } from "arctic";
import { google} from "@/lib/actions/oauth";
import { cookies } from "next/headers";
import { globalGETRateLimit} from "@/lib/actions/requests";

export async function GET(request: Request): Promise<Response> {
	if (!await globalGETRateLimit()) {
		return new Response("Too many requests", {
			status: 429
		});
	}

	const { searchParams } = new URL(request.url);

	const state = generateState();
	const codeVerifier = generateCodeVerifier();
	const url = google.createAuthorizationURL(state, codeVerifier, ["openid", "profile", "email"]);


	const next = searchParams.get("next");
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

	return new Response(null, {
		status: 302,
		headers: {
			Location: url.toString()
		}
	});
}

// import { cookies } from "next/headers";
// import { google} from "@/lib/actions/oauth";
// import { ObjectParser } from "@pilcrowjs/object-parser";
//
//
// import { decodeIdToken, type OAuth2Tokens } from "arctic";
// import {globalGETRateLimit} from "@/lib/actions/requests";
// import {createSession, generateSessionToken, setSessionTokenCookie} from "@/lib/actions/session";
// import {createUserGoogle, getUserFromEmail, getUserFromGoogleId} from "@/lib/actions/user";
//
// export async function GET(request: Request): Promise<Response> {
// 	if (!await globalGETRateLimit()) {
// 		return new Response("Too many requests", {
// 			status: 429
// 		});
// 	}
// 	const url = new URL(request.url);
// 	const code = url.searchParams.get("code");
// 	const state = url.searchParams.get("state");
// 	const cookieStore = await cookies();
//
// 	const storedState = cookieStore.get("google_oauth_state")?.value ?? null;
// 	const codeVerifier = cookieStore.get("google_code_verifier")?.value ?? null;
// 	if (code === null || state === null || storedState === null || codeVerifier === null) {
// 		return new Response("Please restart the process.", {
// 			status: 400
// 		});
// 	}
// 	if (state !== storedState) {
// 		return new Response("Please restart the process.", {
// 			status: 400
// 		});
// 	}
//
// 	let tokens: OAuth2Tokens;
// 	try {
// 		tokens = await google.validateAuthorizationCode(code, codeVerifier);
// 	} catch {
// 		return new Response("Please restart the process.", {
// 			status: 400
// 		});
// 	}
//
// 	const claims = decodeIdToken(tokens.idToken());
// 	const claimsParser = new ObjectParser(claims);
//
// 	const googleId = claimsParser.getString("sub");
// 	const name = claimsParser.getString("name");
// 	const picture = claimsParser.getString("picture");
// 	const email = claimsParser.getString("email");
//
// 	const redirectTo = cookieStore.get("google_redirect")?.value || "/";
//
// 	// console.log("Redirecting to", cookieStore.get("google_redirect")?.value );
//
// 	const existingUser = await getUserFromGoogleId(googleId);
// 	if (existingUser !== null) {
// 		const sessionToken = generateSessionToken();
// 		const session = await createSession(sessionToken, existingUser.id);
// 		await setSessionTokenCookie(sessionToken, session.expiresAt);
// 		return new Response(null, {
// 			status: 302,
// 			headers: {
// 				Location: redirectTo
// 			}
// 		});
// 	}
//
// 	let user = await getUserFromEmail(email);
//
// 	if (user !== null) {
//
// 	} else {
// 		user = await createUserGoogle(googleId, email, name, picture);
// 	}
//
// 	const sessionToken = generateSessionToken();
// 	const session = await createSession(sessionToken, user.id);
// 	await setSessionTokenCookie(sessionToken, session.expiresAt);
// 	return new Response(null, {
// 		status: 302,
// 		headers: {
// 			Location: redirectTo
// 		}
// 	});
// }


