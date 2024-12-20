// "use client";
// import { useForm} from 'react-hook-form';
// import { zodResolver } from "@hookform/resolvers/zod";
// import {storeCreateSchema} from "@/lib/schemas";
// import { z } from "zod";
// import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
// import {Button} from "@/components/ui/button";
// import {Input} from "@/components/ui/input";
// import * as React from "react";
// import {useEffect, useState, useTransition} from "react";
// import {FormError} from "@/components/authentication/form-error";
// import {createStore} from "@/lib/actions/store/store-actions";
// import {ScrollArea} from "@/components/ui/scroll-area";
// // import {AddressSelection} from "@/components/store/maintaince/address-selection";
// import { AddressDataStoreField} from "@/lib/definitions";
// import {IconEdit, IconLocation} from "@/components/ui/icons";
// import {FormSuccess} from "@/components/authentication/form-success";
// import {formatAddress} from "@/lib/utils";
// import {useRouter} from "next/navigation";
// import {
//     AlertDialog,
//     AlertDialogAction,
//     AlertDialogCancel,
//     AlertDialogContent,
//     AlertDialogDescription,
//     AlertDialogFooter,
//     AlertDialogHeader,
//     AlertDialogTitle,
//     AlertDialogTrigger,
// } from "@/components/ui/alert-dialog"


export default async function Page() {

    // const [error, setError] = useState<string | undefined>();
    //
    // const [success, setSuccess] = useState<string | undefined>();
    //
    // const [isPending, startTransition] = useTransition();
    //
    // const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
    //
    // const [address, setAddress] = useState<AddressDataStoreField | null>(null);
    //
    // const [isEditing, setIsEditing] = useState(false);
    //
    // const { refresh, push } = useRouter();
    //
    // const form = useForm<z.infer<typeof  storeCreateSchema>>({
    //     resolver: zodResolver(storeCreateSchema),
    //     defaultValues: {
    //         nickname: "",
    //         locationData: undefined
    //     }
    // });
    //
    // useEffect(() => {
    //     if (address) {
    //         form.setValue('locationData', address);
    //     }
    //     // Include form in dependencies to ensure it's up-to-date
    // }, [address]);
    //
    //
    //
    // const onSubmit = (formData: z.infer<typeof storeCreateSchema>) => {
    //     startTransition(() => {
    //         createStore(formData)
    //             .then((data) => {
    //             if (data && data.error) {
    //                 setError(data.error);
    //             } else if (data && data.success) {
    //                 setSuccess(data.success)
    //                 push(`/dashboard/stores`);
    //                 refresh();
    //             }
    //         })
    //     });
    // }
    //
    // const [isOpen, setIsOpen] = useState<boolean>(isAddressDialogOpen);
    //
    // const toggleClose = () => {
    //     setIsOpen(false);
    //     //Artificial delay to allow the animation to finish
    //     setTimeout(() => {
    //         setIsAddressDialogOpen(false);
    //     }, 400);
    // }

    return null;

    //     <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center rounded-lg">
    //         {/*{isAddressDialogOpen && (*/}
    //         {/*    <>*/}
    //         {/*        <div*/}
    //         {/*            data-state={isOpen ? 'open' : 'closed'}*/}
    //         {/*            className="fixed inset-0 z-30 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"*/}
    //         {/*            onClick={(e) => {*/}
    //         {/*                toggleClose();*/}
    //         {/*            }}/>*/}
    //         {/*        <div*/}
    //         {/*            data-state={isOpen ? 'open' : 'closed'}*/}
    //         {/*            className={"fixed left-[50%] top-[50%] z-40 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 bg-background shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-lg"}*/}
    //         {/*        >*/}
    //         {/*            <ScrollArea className={"max-h-[75vh]"}>*/}
    //         {/*                <AddressSelection*/}
    //         {/*                    initialInput={address}*/}
    //         {/*                    setAddress={setAddress}*/}
    //         {/*                    setAddressDialogClose={toggleClose}*/}
    //         {/*                    isEditing={isEditing}/>*/}
    //         {/*            </ScrollArea>*/}
    //         {/*        </div>*/}
    //         {/*    </>*/}
    //         {/*)}*/}
    //         <div className="bg-white p-8 w-full max-w-lg rounded-lg shadow-md">
    //             <h2 className="text-3xl font-semibold mb-8 text-center">Create a Store</h2>
    //             <Form {...form}>
    //                 <form
    //                     onSubmit={form.handleSubmit(onSubmit)}
    //                     className="space-y-6">
    //                     {/* Store Name */}
    //                     <FormField
    //                         control={form.control}
    //                         name="nickname"
    //                         render={({field}) => (
    //                             <FormItem>
    //                                 <FormLabel
    //                                     className="block text-sm font-medium text-gray-700">
    //                                     Store Name
    //                                 </FormLabel>
    //                                 <FormControl>
    //                                     <Input
    //                                         {...field}
    //                                         disabled={isPending}
    //                                         placeholder="mrs.bombochka"
    //                                         required
    //                                         type={"text"}
    //                                         onChange={(e) => field.onChange(e.target.value.toLowerCase())}
    //                                     />
    //                                 </FormControl>
    //                                 <FormMessage/>
    //                             </FormItem>
    //                         )}
    //                     />
    //
    //                     <FormField
    //                         control={form.control}
    //                         name="locationData"
    //                         render={({field, fieldState}) => {
    //
    //                             return (
    //                                 <FormItem>
    //                                     <FormLabel
    //                                         className="block text-sm font-medium text-gray-700">
    //                                         Location
    //                                     </FormLabel>
    //                                     <FormControl>
    //                                         <>
    //                                             {address ? (
    //                                                 <div>
    //                                                     <div
    //                                                         className={`flex flex-row justify-between items-center space-x-2 pr-2 py-1 transition duration-300 cursor-pointer rounded-lg`}
    //                                                     >
    //                                                         <IconLocation
    //                                                             className={"w-9 h-9 text-primary"}
    //                                                             color={"primary"}
    //                                                         />
    //                                                         <div className={"flex w-full"}>
    //                                                             <p className=" text-lg">
    //                                                                 {formatAddress(address)}
    //                                                             </p>
    //                                                         </div>
    //                                                         <div
    //                                                             className={`transition duration-500 hover:scale-115`}
    //                                                             onClick={() => {
    //                                                                 setIsEditing(true);
    //                                                                 setIsAddressDialogOpen(true);
    //                                                             }}
    //                                                         >
    //                                                             <IconEdit className={"w-6 h-6 text-text"}/>
    //                                                         </div>
    //                                                     </div>
    //                                                 </div>
    //                                             ) : (
    //                                                 <Button
    //                                                     type={"button"}
    //                                                     onClick={() => setIsAddressDialogOpen(true)}
    //                                                     className="w-full"
    //                                                     variant={"secondary"}
    //                                                 >
    //                                                     Add Location
    //                                                 </Button>
    //                                             )}
    //                                         </>
    //                                     </FormControl>
    //                                     <FormMessage/>
    //                                 </FormItem>
    //                             )
    //                         }}
    //                     />
    //                     <FormError message={error}/>
    //                     <FormSuccess message={success}/>
    //                     {/* Submit Button */}
    //                     <div>
    //                         <AlertDialog>
    //                             <AlertDialogTrigger asChild>
    //                                 <Button
    //                                     type="button"
    //                                     className=" w-full"
    //                                     disabled={isPending}
    //                                 >
    //                                     Create Store
    //                                 </Button>
    //                             </AlertDialogTrigger>
    //                             <AlertDialogContent>
    //                                 <AlertDialogHeader>
    //                                     <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
    //                                     <AlertDialogDescription>
    //                                         This action cannot be undone. These changes will be seen to everyone.
    //                                     </AlertDialogDescription>
    //                                 </AlertDialogHeader>
    //                                 <AlertDialogFooter>
    //                                     <AlertDialogCancel>Cancel</AlertDialogCancel>
    //                                     <AlertDialogAction
    //                                         onClick={() => form.handleSubmit(onSubmit)()}
    //                                         disabled={isPending}
    //                                     >
    //                                         Apply
    //                                     </AlertDialogAction>
    //                                 </AlertDialogFooter>
    //                             </AlertDialogContent>
    //                         </AlertDialog>
    //                     </div>
    //                 </form>
    //             </Form>
    //         </div>
    //     </div>
    // );
}
