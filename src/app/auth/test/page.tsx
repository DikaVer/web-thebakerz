import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { cn } from "@/lib/utils"
import {UserAuthForm} from "@/components/authentication/user-auth-form";

export const metadata: Metadata = {
    title: "Authentication",
    description: "Authentication forms built using the components.",
}

export default function Page() {
    return (
        <body>
        <div className="bg-grayBg">
            <p className={""}>TheBakerz</p>
        </div>
        </body>
    );
}