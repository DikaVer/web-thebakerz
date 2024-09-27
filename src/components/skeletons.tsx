// StoresTableSkeleton.tsx

import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export function MiniCalendarSkeleton() {
    return (
        <div className="mt-4">
            <Skeleton height={200} />
        </div>
    );
}

export default function ProfileHeaderSkeleton() {
    return (
        <div className="h-60 relative cm:h-72 rounded-lg overflow-hidden flex flex-col justify-center">
            {/* Background Skeleton */}
            <div className="absolute inset-0">
                <Skeleton height="100%" />
            </div>
        </div>
    );
}
// {/* Avatar Skeleton */}
// <div className="ml-2 mt-8 cm:ml-4 cm:mt-8 absolute">
//     <div className="rounded-full relative h-28 w-28 cm:h-32 cm:w-32 overflow-hidden">
//         <Skeleton circle height="100%" width="100%" />
//     </div>
//     <p className="text-sm cm:text-base mt-2 underline font-light text-gray-600 text-center">
//         <Skeleton width={80} />
//     </p>
// </div>
//
// {/* Profile Info Skeleton */}
// <div className="ml-36 mt-14 cm:ml-40 cm:mt-12 absolute space-y-2">
//     <Label className="text-xl cm:text-2xl font-bold text-black">
//         <Skeleton width={150} />
//     </Label>
//     <Label className="flex items-center space-x-2">
//         <IconStar className={"w-5 h-5 cm:w-6 cm:h-6"} color={"primary"} />
//         <Skeleton width={50} />
//         <p className="text-sm cm:text-base underline font-light text-gray-600">
//             <Skeleton width={60} />
//         </p>
//     </Label>
//     <Label className="flex items-center space-x-2">
//         <IconLocation className={"w-5 h-5 cm:w-6 cm:h-6"} color={"primary"} />
//         <Skeleton width={100} />
//     </Label>
//     <div className="flex pt-2 space-x-2 cm:space-x-3 left-0">
//         <Button
//             className="cm:text-lg w-dynamic-button h-10 cm:w-auto cm:h-auto"
//             disabled
//         >
//             <Skeleton width={150} height={40} />
//         </Button>
//         <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//                 <Button
//                     className="bg-white px-1 cm:px-1.5 opacity-80"
//                     variant="outline"
//                     disabled
//                 >
//                     <Skeleton width={30} height={30} />
//                 </Button>
//             </DropdownMenuTrigger>
//         </DropdownMenu>
//     </div>
// </div>
//
// {/* Mini Calendar Skeleton */}
// <MiniCalendarSkeleton />

export function StoresTableSkeleton() {
    return (
        <div className="mt-6 flow-root">
            <div className="inline-block min-w-full align-middle">
                <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
                    <table className="min-w-full text-gray-900 table">
                        <thead className="rounded-lg text-left text-sm font-normal">
                        <tr>
                            <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                                Nickname
                            </th>
                            <th scope="col" className="px-3 py-5 font-medium">
                                ID
                            </th>
                            <th scope="col" className="px-3 py-5 font-medium">
                                User ID
                            </th>
                            <th scope="col" className="px-3 py-5 font-medium">
                                Create Date
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <tr
                                key={index}
                                className="w-full border-b py-3 text-sm last-of-type:border-none"
                            >
                                <td className="whitespace-nowrap py-3 pl-6">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                                </td>
                                <td className="whitespace-nowrap px-3 py-3">
                                    <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                                </td>
                                <td className="whitespace-nowrap px-3 py-3">
                                    <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                                </td>
                                <td className="whitespace-nowrap px-3 py-3">
                                    <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                                </td>
                                <td className="flex justify-center whitespace-nowrap py-3">
                                    <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
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
