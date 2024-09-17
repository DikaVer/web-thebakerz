import Image from 'next/image';
import { fetchFilteredUsers} from "@/lib/dashboard/user-dashboard";
import {IconAvatar} from "@/components/ui/icons";
import {Button} from "@/components/ui/button";
import { revalidatePath } from 'next/cache'
import ViewUser from "@/components/dashboard/user/view-user";
import {fetchFilteredStores} from "@/lib/dashboard/store-dashboard";
import ViewStore from "@/components/dashboard/store/view-stores";

export default async function StoresTable({
                                             query,
                                             currentPage,
                                         }: {
    query: string;
    currentPage: number;
}) {
    const stores = await fetchFilteredStores(query, currentPage);
    revalidatePath('/dashboard/stores');

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
                                Store Name
                            </th>
                            <th scope="col" className="px-3 py-5 font-medium ">
                                ID
                            </th>
                            <th scope="col" className="px-3 py-5 font-medium">
                                Owner ID
                            </th>
                            <th scope="col" className="px-3 py-5 font-medium">
                                Create Date
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white">
                        {stores?.map((store) => (
                            <tr
                                key={store.id}
                                className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                            >
                                <td className="whitespace-nowrap py-3 pl-6 ">
                                    {store.name}
                                </td>
                                <td className=" whitespace-nowrap px-3 py-3">
                                    {store.id}
                                </td>
                                <td className="whitespace-nowrap px-3 py-3">
                                    {store.ownerId}
                                </td>
                                <td className="whitespace-nowrap px-3 py-3 capitalize">
                                    {store.createDate}
                                </td>
                                <td className="flex justify-center whitespace-nowrap py-3">
                                    <ViewStore store_id={store.id}/>
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
