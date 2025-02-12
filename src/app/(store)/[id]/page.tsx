"use server";
import React from "react";
import {StoreHeader} from "@/components/store/store-header/store-header";
import {FirstView} from "@/components/landing/first-view";
import {StoreSubHeader} from "@/components/store/store-header/store-subheader";
import {Spacer} from "@heroui/react";
import {getOrderTime} from "@/app/(store)/[id]/actions";


interface StorePageProps {
    params: Promise<{
        id: string
    }>,
    searchParams?: Promise<{
        tab?: string;
    }>;
}

export default async function Page(props: StorePageProps) {
    const searchParams = await props.searchParams;
    const params = await props.params;

    const id = params.id;

    const {date, time} = await getOrderTime()

    return (
        <div className="flex flex-col min-h-screen relative z-10 items-center">
            <div className="flex flex-col container mx-auto items-center justify-center">
                <StoreHeader/>
                <StoreSubHeader
                    dateParam={date}
                    timeParam={time}
                />
                {/*<Suspense fallback={<StoreSkeleton/>}>*/}
                {/*    <>*/}
                {/*    </>*/}
                {/*<div*/}
                {/*    aria-hidden="true"*/}
                {/*    className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"*/}
                {/*>*/}
                {/*    <div*/}
                {/*        style={{*/}
                {/*            clipPath:*/}
                {/*                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',*/}
                {/*        }}*/}
                {/*        className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"*/}
                {/*    />*/}
                {/*</div>*/}
                {/*<StoreTransit*/}
                {/*    id={params.id}*/}
                {/*    userId={user?.id}*/}
                {/*    // @ts-ignore*/}
                {/*    role={session?.user?.role}*/}
                {/*    isDashboard={false}*/}
                {/*    tab={searchParams?.tab}*/}
                {/*/>*/}
                {/*<div*/}
                {/*    aria-hidden="true"*/}
                {/*    className="absolute inset-x-0 top-[calc(60%-43rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(65%-55rem)]"*/}
                {/*>*/}
                {/*    <div*/}
                {/*        style={{*/}
                {/*            clipPath:*/}
                {/*                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',*/}
                {/*        }}*/}
                {/*        className="relative left-[calc(50%)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-11rem)]  sm:w-[73rem]"*/}
                {/*    />*/}
                {/*</div>*/}

                {/*<div*/}
                {/*    aria-hidden="true"*/}
                {/*    className="absolute inset-x-0 top-[calc(60%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(65%+5rem)]"*/}
                {/*>*/}
                {/*    <div*/}
                {/*        style={{*/}
                {/*            clipPath:*/}
                {/*                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',*/}
                {/*        }}*/}
                {/*        className="relative left-[calc(50%rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-11rem)]  sm:w-[73rem]"*/}
                {/*    />*/}
                {/*</div>*/}


                {/*<div*/}
                {/*    aria-hidden="true"*/}
                {/*    className="absolute inset-x-0 top-[calc(60%+20rem)] -z-10 transform-gpu overflow-hidden sm:hidden blur-3xl sm:top-[calc(65%-55rem)]"*/}
                {/*>*/}
                {/*    <div*/}
                {/*        style={{*/}
                {/*            clipPath:*/}
                {/*                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',*/}
                {/*        }}*/}
                {/*        className="relative left-[calc(50%)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-11rem)]  sm:w-[73rem]"*/}
                {/*    />*/}
                {/*</div>*/}

                {/*<div*/}
                {/*    aria-hidden="true"*/}
                {/*    className="absolute inset-x-0 top-[calc(100%-23rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-45rem)]"*/}
                {/*>*/}
                {/*    <div*/}
                {/*        style={{*/}
                {/*            clipPath:*/}
                {/*                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',*/}
                {/*        }}*/}
                {/*        className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"*/}
                {/*    />*/}
                {/*</div>*/}
                {/*</Suspense>*/}
            </div>
        </div>
    );
}