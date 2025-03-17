import { Metadata } from "next"
import { redirect } from "next/navigation";
import {pacifico} from "@/components/fonts";
import React from "react";
import TwoStepAuthForm from "@/components/authentication/two-step-auth-form";
import {globalGETRateLimit} from "@/lib/actions/requests";
import {getCurrentSession} from "@/lib/actions/session";
import {getTranslations} from "next-intl/server";

export const metadata: Metadata = {
    title: "Authentication",
    description: "TheBakerz authentication to sign in the platform.",
}

export default async function Page() {

    if (!globalGETRateLimit()) {
        return "Too many requests";
    }

    const { session, user } = await getCurrentSession();
    

    if (session !== null) {
        return redirect("/");
    }

    const t = await getTranslations("TheBakerz");

    return (
        <main className="relative flex flex-col isolate min-h-screen items-center justify-center">
            {/*<div className={"container flex flex-col items-center w-full gap-1"}>*/}
            {/*    <p className={"flex text-6xl font-bold"}>TheBakerz</p>*/}
            {/*    <p className={"flex text-grayText"}>Sign in to order delicious treats</p>*/}
            {/*</div>*/}
            <div
                aria-hidden="true"
                className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
            >
                <div
                    style={{
                        clipPath:
                            'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                    }}
                    className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                />
            </div>
            <div
                aria-hidden="true"
                className="absolute inset-x-0 top-[calc(60%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(65%-30rem)]"
            >
                <div
                    style={{
                        clipPath:
                            'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                    }}
                    className="relative left-[calc(50%rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-11rem)] sm:w-[73rem]"
                />
            </div>

            <div className="lg:p-8 w-full">
                <div className="mx-auto flex flex-col justify-center space-y-6 w-[350px]">
                    <div className={"container flex flex-col items-center w-full gap-1"}>
                        <p className={`flex text-7xl ${pacifico.className}`}>TheBakerz</p>
                        <p className={"flex text-grayText"}>{t("Auth_Description")}</p>
                    </div>
                    <TwoStepAuthForm/>
                </div>
            </div>
        </main>
    );
}