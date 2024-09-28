import Image from 'next/image';
import { fetchFilteredUsers} from "@/lib/actions-server-only/user-actions";
import {IconAvatar} from "@/components/ui/icons";
import { revalidatePath } from 'next/cache'
import ViewUser from "@/components/dashboard/user/view-user";

export default async function UsersTable({
                                                query,
                                                currentPage,
                                            }: {
    query: string;
    currentPage: number;
}) {
    const users = await fetchFilteredUsers(query, currentPage);

    return (
        <div className="mt-6 flow-root">
            <div className="inline-block min-w-full align-middle">
                <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
                    {/*<div className="md:hidden">*/}
                    {/*    {users?.map((user) => (*/}
                    {/*        <div*/}
                    {/*            key={user.id}*/}
                    {/*            className="mb-2 w-full rounded-md bg-white p-4"*/}
                    {/*        >*/}
                    {/*            <div className="flex items-center justify-between border-b pb-4">*/}
                    {/*                <div>*/}
                    {/*                    <div className="mb-2 flex items-center">*/}
                    {/*                        {user.image ? (*/}
                    {/*                            <Image*/}
                    {/*                                src={user.image}*/}
                    {/*                                className="rounded-full"*/}
                    {/*                                width={28}*/}
                    {/*                                height={28}*/}
                    {/*                                alt={`${user.name}'s profile picture`}*/}
                    {/*                            />*/}
                    {/*                        ) : (*/}
                    {/*                            <IconAvatar className="h-7 w-7" />*/}
                    {/*                        )}*/}
                    {/*                        <p>{user.name}</p>*/}
                    {/*                    </div>*/}
                    {/*                    <p className="text-sm text-gray-500">{user.email}</p>*/}
                    {/*                </div>*/}
                    {/*            </div>*/}
                    {/*        </div>*/}
                    {/*    ))}*/}
                    {/*</div>*/}
                    <table className=" min-w-full text-gray-900 table">
                        <thead className="rounded-lg text-left text-sm font-normal">
                        <tr>
                            <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                                User
                            </th>
                            <th scope="col" className="px-3 py-5 font-medium ">
                                ID
                            </th>
                            <th scope="col" className="px-3 py-5 font-medium">
                                Email
                            </th>
                            <th scope="col" className="px-3 py-5 font-medium">
                                Role
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white">
                        {users?.map((user) => (
                            <tr
                                key={user.id}
                                className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                            >
                                <td className="whitespace-nowrap py-3 pl-6 ">
                                    <div className="flex items-center gap-3">
                                        {user.image ? (
                                            <Image
                                                src={user.image}
                                                className="rounded-full"
                                                width={48}
                                                height={48}
                                                alt={`${user.name}'s profile picture`}
                                            />
                                        ) : (
                                            <IconAvatar className="w-12"/>
                                        )}
                                        <p>{user.name}</p>
                                    </div>
                                </td>
                                <td className=" whitespace-nowrap px-3 py-3">
                                    {user.id}
                                </td>
                                <td className="whitespace-nowrap px-3 py-3">
                                    {user.email}
                                </td>
                                <td className="whitespace-nowrap px-3 py-3 capitalize">
                                    {user.role}
                                </td>
                                <td className="flex justify-center whitespace-nowrap py-3">
                                    <ViewUser user_id={user.id}/>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
