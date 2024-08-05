import { IconCart, IconMenu } from '@/components/ui/icons';
import { Label } from "@/components/ui/label"

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex-col">
            <nav className="text-black pt-4">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex p-2 items-center rounded-full transition duration-300 hover:bg-gray-200">
                            <IconMenu/>
                    </div>
                    <div className={"hover:scale-125 transition duration-300"}>
                        <Label className="text-2xl font-bold mx-auto">TheBakerz</Label>
                    </div>
                    <div className="flex p-2 items-center rounded-full transition duration-300 hover:bg-gray-200">
                        <IconCart/>
                    </div>
                </div>
                <hr className="m-2"/>
            </nav>
            <main className="flex-grow container mx-auto">
            {children}
            </main>
        </div>
    );
}