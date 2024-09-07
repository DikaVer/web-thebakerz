import {auth} from "@/auth";
import {redirect} from "next/navigation";


export default async function Page() {
    const session = await auth();

    if (session) {
        redirect("/");
    }

    return (
        <div className="z-10 flex-grow container mx-auto text-center">
            <div className="flex flex-col min-h-screen">
                <p className={"text-3xl my-10"}>The Magic link was sent.</p>
                <p>
                    Check your email for the magic link to sign in.
                </p>
            </div>
        </div>
    );
}