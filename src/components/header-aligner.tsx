// 'use client';
//
// import React, { ReactNode } from "react";
// import {useIsMobile} from "@/lib/hooks/use-mobile";
// import {MenuItems} from "@/components/menu/menu-items";
//
//
// interface HeaderAlignerProps {
//     children: ReactNode;
//     session: {
//         login: boolean;  // Specifies if the user is logged in
//         role: string | undefined;  // Role of the user (e.g., admin, user)
//         name: string | undefined | null;  // Name of the user
//         email: string | undefined | null;  // Email of the user
//     }
// }
// //
// export const HeaderAligner = ({ children, session }: HeaderAlignerProps) => {
//
//     const isMobile = useIsMobile();
//
//     return (
//         <div className={'flex flex-row'}>
//             {isMobile ? null : (
//                 <MenuItems
//                     session={session}
//                 />
//             )}
//             <div className={'w-full flex-1'}>
//                 {children}
//             </div>
//         </div>
//     );
// };