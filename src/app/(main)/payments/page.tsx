import {pacifico} from "@/components/fonts";
import Image from "next/image";

export default async function Page() {

    return (
        <div className={`flex flex-col gap-y-10 my-10 items-center justify-center`}>
            <p className={`text-5xl ${pacifico.className}`}>
                Coming Soon!
            </p>
            <div className="w-2/3 h-2/3">
                <Image
                    src="/landing/HomeBaker.svg"
                    alt="Verify Email Image"
                    width={200} // Adjust based on desired size
                    height={200} // Adjust based on desired size
                    className="w-full h-full"
                    priority
                />
            </div>
        </div>
    );
}