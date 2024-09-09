import {auth, signOut} from "@/auth";
import {Button} from "@/components/ui/button";
import {
    deleteSessionId,
    getAll,
} from "@/lib/actions/session-store";

const SettingsPage = async () => {
    const session = await auth();
    const products = await getAll("products");
    const checkoutSession = await getAll("checkout");

    return (
        <div>
            {JSON.stringify(session)}
            <form action={async () => {
                "use server"
                await signOut();
            }
            }>
                <button type="submit">Sign Out</button>
            </form>
            <form
                action={async () => {
                    "use server"
                    await deleteSessionId()
                }}>
                <button type="submit">Clean Session</button>
            </form>
            Products: {JSON.stringify(products)}
            <br/>
            Checkout Session: {JSON.stringify(checkoutSession)}

        </div>
    );
}

export default SettingsPage;