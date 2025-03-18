import { UnderConstruction} from "@/app/(error_layout)/not-found";


export async function generateMetadata() {
    return {
        title: "Orders | TheBakerz",
        description: "Manage and track your bakery orders",
        robots: {
            index: false,
            follow: false
        }
    };
}

export default async function Page() {

    return UnderConstruction();
}