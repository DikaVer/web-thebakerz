import {pacifico} from "@/components/fonts";
import Image from 'next/image';

export default async function Page() {

    return (
        <div className="z-10 flex-grow container mx-auto text-center">
            <div className="flex flex-col justify-center items-center mb-12">
                <p className={` text-4xl md:text-8xl my-10 ${pacifico.className}`}>The link was sent to your email.</p>
                <div className={"flex w-full items-center justify-center"}>
                    <div className="w-1/2 h-1/2">
                        <Image
                            src="/verify/Verify.svg"
                            alt="Verify Email Image"
                            width={200} // Adjust based on desired size
                            height={200} // Adjust based on desired size
                            className="w-full h-full"
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}