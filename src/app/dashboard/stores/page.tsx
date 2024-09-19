import Search from "@/components/dashboard/search";
import Pagination from "@/components/dashboard/pagination";
import StoresTable from "@/components/dashboard/store/table";
import CreateStore from "@/components/dashboard/store/create-button";
import {fetchStoresPages} from "@/lib/dashboard/store-dashboard";

export default async function Page({
                                       searchParams,
                                   }: {
    searchParams?: {
        query?: string;
        page?: string;
    };
}) {
    const query = searchParams?.query || '';
    const currentPage = Number(searchParams?.page) || 1;

    const totalPages = await fetchStoresPages(query);

    return (
        <div className="w-full">
            <div className="flex w-full items-start justify-between">
                <h1 className={`text-2xl`}>Stores</h1>
                <CreateStore />
            </div>
            <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
                <Search placeholder="Search users..." />
            </div>
            <StoresTable query={query} currentPage={currentPage} />
            <div className="mt-5 flex w-full justify-center">
                <Pagination totalPages={totalPages} />
            </div>
        </div>
    );
}