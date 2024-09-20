export default async function Page() {

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