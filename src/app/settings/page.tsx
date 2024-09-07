import {auth, signOut} from "@/auth";
import {Button} from "@/components/ui/button";
import {deleteSessionId} from "@/lib/actions/session-store";

const SettingsPage = async () => {
    const session = await auth();

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
        </div>
    );
}

export default SettingsPage;