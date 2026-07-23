/**
 * @fileoverview Server-only API client for the current user's business data.
 *
 * Exports getBusinessUserAPI, which resolves the logged-in user from the
 * session and fetches their business account details from the internal
 * /api/user/[userId]/business endpoint using bearer token authentication,
 * cached for 300 seconds under the 'store' tag.
 */
import 'server-only';
import { StoreBusinessData } from "../../actions/store";
import { getCurrentSession } from "@/lib/actions/session";

export const getBusinessUserAPI = async (): Promise<StoreBusinessData | null> => {

    const session = await getCurrentSession();
    if(!session?.user) {
        return null;
    }

    return await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/${session.user.id}/business/`, {
        headers: {
            'Authorization': `Bearer ${process.env.NEXT_PRIVATE_SECRET_BEARER}`,
        },
        next: {
            tags: ['store'],
            revalidate: 300
        }
    }).then(res => res.json());
};