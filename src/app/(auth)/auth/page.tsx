import { Metadata } from "next"
import Link from "next/link"
import {UserAuthForm} from "@/components/authentication/user-auth-form";
import {pacifico} from "@/components/fonts";

export const metadata: Metadata = {
    title: "Authentication",
    description: "TheBakerz authentication to sign in the platform.",
}

export default async function Page() {

    return (
            <div className="container relative h-[800px] flex-col items-center justify-center grid ">
                {/*<div className={"container flex flex-col items-center w-full gap-1"}>*/}
                {/*    <p className={"flex text-6xl font-bold"}>TheBakerz</p>*/}
                {/*    <p className={"flex text-grayText"}>Sign in to order delicious treats</p>*/}
                {/*</div>*/}
                <div className="lg:p-8">
                    <div className="mx-auto flex flex-col justify-center space-y-6 w-[350px]">
                        <div className={"container flex flex-col items-center w-full gap-1"}>
                            <p className={`flex text-7xl ${pacifico.className}`}>TheBakerz</p>
                            <p className={"flex text-grayText"}>Sign in to order delicious treats</p>
                        </div>
                        <UserAuthForm/>
                        <p className="px-8 text-center text-sm text-muted-foreground">
                            By clicking continue, you agree to our{" "}
                            <Link
                                href="/terms"
                                className="underline underline-offset-4 hover:text-primary"
                            >
                                Terms of Service
                            </Link>{" "}
                            and{" "}
                            <Link
                                href="/privacy"
                                className="underline underline-offset-4 hover:text-primary"
                            >
                                Privacy Policy
                            </Link>
                            .
                        </p>
                    </div>
                </div>
            </div>
    );
}