// StoresTableSkeleton.tsx

import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function StoreSkeleton() {
    return (
        <div className="flex flex-col min-h-screen">
            <div className="z-10 flex-grow container mx-auto pt-2">
                {/* Banner Skeleton */}
                <div className="h-60 relative cm:h-72 rounded-lg overflow-hidden flex flex-col justify-center">
                    {/* Background Skeleton */}
                    <div className="absolute inset-0">
                        <Skeleton height="100%"/>
                    </div>
                </div>

                {/* Search Bar Skeleton */}
                <div className="my-4">
                    <div className="flex flex-row w-full justify-center">
                        <div className="flex flex-row items-center w-80 border-b border-1 px-3 rounded-lg">
                        <Skeleton width={20} height={20}/>
                            <Skeleton height={40} width="80%"/>
                        </div>
                    </div>

                    {/* Products Sections Skeleton */}
                    <div className="mt-2">
                        {/* Cookies Section Skeleton */}
                        <span className="text-xl font-bold">
                            <Skeleton height={30} width={180}/> {/* Adjustable size */}
                        </span>
                        <ul className="grid gap-4 grid-cols-1 store-sm:grid-cols-2 py-3">
                            {[1, 2, 3].map((item) => (
                                <li key={item}>
                                    <div
                                        className="rounded-lg border-2 border-grayBg flex flex-row w-full transition duration-500 hover:bg-grayBg cursor-pointer">
                                        <div className="flex flex-col justify-between p-1 w-full">
                                            <Skeleton height={20} width={`60%`}/>
                                            <Skeleton height={15} width={`40%`} style={{marginTop: 8}}/>
                                            <Skeleton height={20} width={`30%`} style={{marginTop: 8}}/>
                                        </div>
                                        <div className="p-2">
                                            <Skeleton height={80} width={80}/>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        {/* Macarons Section Skeleton */}
                        <span className="text-xl font-bold">
                            <Skeleton height={28} width={100}/> {/* Adjustable size */}
                        </span>
                        <ul className="grid gap-4 grid-cols-1 store-sm:grid-cols-2 py-3">
                            {[1, 2].map((item) => (
                                <li key={item}>
                                    <div
                                        className="rounded-lg border-2 border-grayBg flex flex-row w-full transition duration-500 hover:bg-grayBg cursor-pointer">
                                        <div className="flex flex-col justify-between p-1 w-full">
                                            <Skeleton height={20} width={`60%`}/>
                                            <Skeleton height={15} width={`40%`} style={{marginTop: 8}}/>
                                            <Skeleton height={20} width={`30%`} style={{marginTop: 8}}/>
                                        </div>
                                        <div className="p-2">
                                            <Skeleton height={80} width={80}/>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        {/* Pastries Section Skeleton */}
                        <span className="text-xl font-bold">
                            <Skeleton height={28} width={150}/> {/* Adjust size manually */}
                        </span>
                        <ul className="grid gap-4 grid-cols-1 store-sm:grid-cols-2 py-3">
                            {[1].map((item) => (
                                <li key={item}>
                                    <div
                                        className="rounded-lg border-2 border-grayBg flex flex-row w-full transition duration-500 hover:bg-grayBg cursor-pointer">
                                        <div className="flex flex-col justify-between p-1 w-full">
                                            <Skeleton height={20} width={`60%`}/>
                                            <Skeleton height={15} width={`40%`} style={{marginTop: 8}}/>
                                            <Skeleton height={20} width={`30%`} style={{marginTop: 8}}/>
                                        </div>
                                        <div className="p-2">
                                            <Skeleton height={80} width={80}/>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}