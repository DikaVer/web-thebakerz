import {UnderConstruction} from "@/app/(error_layout)/not-found";

export async function generateMetadata() {
    return {
        title: "Payments | TheBakerz",
        description: "Manage your bakery payments securely",
        robots: {
            index: false,
            follow: false
        }
    };
}

export default async function Page() {

    return UnderConstruction();
}