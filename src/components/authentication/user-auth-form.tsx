// 'use client';
//
// import * as React from "react"
// import * as z from "zod"
// import Image from "next/image";
//
// import { useForm} from "react-hook-form";
// import { zodResolver} from "@hookform/resolvers/zod";
//
// import {LoginSchema} from "@/lib/schemas";
// import {Form, FormControl, FormField, FormItem, FormLabel,} from "@/components/ui/form";
// import {login, loginWithProvider} from "@/lib/actions/auth-actions";
// import {useEffect, useRef, useState, useTransition} from "react";
// import { useSearchParams } from 'next/navigation';
// import {IconMail} from "@/components/ui/icons";
// import {Input} from "@heroui/react";
// import {Separator} from "@/components/ui/separator";
// import {Button} from "@/components/ui/button";
//
//
//
// export function UserAuthForm(){
//
//     const [error, setError] = useState<string | undefined>();
//     const [success, setSuccess] = useState<string | undefined>()
//     const [isPending, startTransition] = useTransition();
//     const nextParams = useSearchParams();
//     const next = nextParams.get('next') as string;
//
//
//     const form = useForm<z.infer<typeof  LoginSchema>>({
//         resolver: zodResolver(LoginSchema),
//         defaultValues: {
//             email: "",
//             redirectTo: next ? next : "/"
//         }
//     });
//
//     const onSubmit = (formData: z.infer<typeof LoginSchema>) => {
//         startTransition(() => {
//             localStorage.clear();
//             formData.redirectTo = next ? next : "/";
//             login(formData)
//                 .then((data) => {
//                     if (data && data.error) {
//                         setError(data.error);
//                     }
//                 })
//         });
//     }
//
//     const inputRef = useRef(null);
//
//     useEffect(() => {
//         // @ts-ignore
//         inputRef.current.focus(); // Focus the input on component mount
//     }, [])
//
//     return (
//         <div className={"grid gap-6"}>
//             <Form {...form}>
//                 <form
//                     onSubmit={form.handleSubmit(onSubmit)}
//                     className={"grid gap-2"}
//                 >
//                     <FormField
//                         control={form.control}
//                         name="email"
//                         render={({field}) => (
//                             <FormItem>
//                                 <FormLabel className={"sr-only"}>
//                                     Email
//                                 </FormLabel>
//                                 <FormControl>
//                                     <Input
//                                         {...field}
//                                         ref={inputRef}
//                                         endContent={
//                                             <IconMail className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
//                                         }
//                                         label="Email"
//                                         variant={"bordered"}
//                                         placeholder="you@thebakerz.com"
//                                         type="email"
//                                         errorMessage={error}
//                                         disabled={isPending}
//                                         required
//                                     />
//                         </FormControl>
//                     </FormItem>
//                 )}
//                 />
//                 <Button
//                     type="submit"
//                     variant={"default"}
//                     disabled={isPending}
//                     isLoading={isPending}
//                 >
//                     {isPending ? "Loading" : "Continue"}
//                 </Button>
//             </form>
//         </Form>
//             <div className="flex items-center gap-4">
//                 <Separator className="flex-1 bg-grayText"/>
//                 <span className="text-grayText">or continue with</span>
//                 <Separator className="flex-1 bg-grayText"/>
//             </div>
//             <div className="flex flex-row w-full justify-between items-center -my-1">
//                 <form
//                     action={async () => {
//                         await loginWithProvider("google", next ? next : "/");
//                 }}
//                 className={"w-full"}
//             >
//                 <Button
//                     type="submit"
//                     variant={"outline"}
//                     className={"w-full py-5"}
//                     disabled={isPending}
//                     isLoading={isPending}
//                 >
//                     {!isPending && (
//                         <Image
//                             style={{display: "block"}}
//                             src="/brandIcons/google.svg"
//                             height="30"
//                             width="30"
//                             alt={"Google"}
//                         />
//                     )}
//                 </Button>
//             </form>
//             {/*<form*/}
//
//             {/*>*/}
//             {/*    <button*/}
//             {/*        type="submit"*/}
//             {/*        className={""}*/}
//             {/*        disabled={isPending}*/}
//             {/*    >*/}
//             {/*        <Image*/}
//             {/*            style={{display: "block"}}*/}
//             {/*            src="https://authjs.dev/img/providers/instagram.svg"*/}
//             {/*            height="32"*/}
//             {/*            width="32"*/}
//             {/*            alt={"Instagram"}/>*/}
//             {/*    </button>*/}
//             {/*</form>*/}
//             {/*<form*/}
//             {/*    // action={async () => {*/}
//             {/*    //     "use server"*/}
//             {/*    //     await signIn("facebook")*/}
//             {/*    // }}*/}
//             {/*>*/}
//             {/*    <button*/}
//             {/*        type="submit"*/}
//             {/*        className={""}*/}
//             {/*        disabled={isPending}*/}
//             {/*    >*/}
//             {/*        <Image*/}
//             {/*            style={{display: "block"}}*/}
//             {/*            src="https://authjs.dev/img/providers/facebook.svg"*/}
//             {/*            height="32"*/}
//             {/*            width="32"*/}
//             {/*            alt={"Instagram"}/>*/}
//             {/*    </button>*/}
//             {/*</form>*/}
//         </div>
//     </div>
//   )
// }
