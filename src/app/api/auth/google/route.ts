import { generateState, generateCodeVerifier } from "arctic";
import { google} from "@/lib/actions/auth/oauth";
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

	return new Response(null, {
		status: 302,
		headers: {
			Location: url.toString()
		}
	});
}



