
export default async function Page({
                                       searchParams,
                                   }: {
    searchParams?: {
        query?: string;
        page?: string;
    };
}) {


    return (
        <div className="w-full flex flex-col">
            {process.env.AUTH_SECRET}
        </div>
    );
}