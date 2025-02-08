import {fetchFilteredUsers, fetchUsersPages} from "@/lib/actions-server-only/user-actions";
import UserTable from "@/components/dashboard/user/table-user";

export const revalidate = 0;

export default async function Page(
    props: {
        searchParams?: Promise<{
            query?: string;
            page?: string;
        }>;
    }
) {
    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';
    const currentPage = Number(searchParams?.page) || 1;

    const totalPages = await fetchUsersPages(query);

    const users = await fetchFilteredUsers(query, currentPage);

    return (

        <div className="w-screen desktop:w-[79vw] flex py-8 items-start justify-center">
            <UserTable
                currentPage={currentPage}
                totalPage={totalPages}
                users={users}
            />
        </div>
    );
}