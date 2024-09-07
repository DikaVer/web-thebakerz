'use server';
import {auth} from "@/auth";
import {CustomAdapterUser} from "@/lib/definitions";

export const extractSessionRole = async () => {
    const session = await auth();

    const login = !!session;

    let role;
    let name;
    if (login) {
        role = (session?.user as CustomAdapterUser).role;
        name = session?.user?.name;
    }
    return {login, role, name};
}
