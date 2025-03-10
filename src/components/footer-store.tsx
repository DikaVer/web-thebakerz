// "use client";
//
// import type {IconProps} from "@iconify/react";
//
// import React from "react";
// import {Divider, Image, Link} from "@heroui/react";
// import {Icon} from "@iconify/react";
// import {pacifico} from "@/components/fonts";
// import {useStore} from "@/components/providers/store-provider";
// import {renderCalendarContent} from "@/components/store/store-header/subheader/working-hours";
// import {IconLocation} from "@/components/ui/icons";
// import {useTheme} from "next-themes";
//
//
// type SocialIconProps = Omit<IconProps, "icon">;
//
// const footerNavigation = {
//     overview: [
//         {name: "TheBakerz", href: "/"},
//         {name: "About TheBakerz", href: "/about-us"},
//         {name: "Join TheBakerz", href: "/#join-thebakerz"},
//         // {name: "Market Research", href: "#"},
//     ],
//     supportOptions: [
//         {name: "Get Help", href: "/support"},
//         // {name: "User Guides", href: "#"},
//         // {name: "Tutorials", href: "#"},
//         // {name: "Service Status", href: "#"},
//     ],
//     legal: [
//         {name: "Privacy Policy", href: "/policies/privacy-policy"},
//         {name: "Terms of use", href: "/policies/terms-of-use"},
//         {name: "Refund Policy", href: "/policies/refund-policy"},
//         // {name: "User Agreement", href: "#"},
//     ],
//     social: [
//         {
//             name: "LinkedIn",
//             href: "https://www.linkedin.com/company/thebakerz",
//             icon: (props: SocialIconProps) => <Icon {...props} icon="fontisto:linkedin" />,
//         },
//         {
//             name: "Instagram",
//             href: "https://www.instagram.com/thebakerz.official",
//             icon: (props: SocialIconProps) => <Icon {...props} icon="fontisto:instagram" />,
//         },
//         {
//             name: "Twitter",
//             href: "https://x.com/the_bakerz",
//             icon: (props: SocialIconProps) => <Icon {...props} icon="fontisto:twitter" />,
//         }
//     ],
// };
//
// export function FooterStore() {
//
//     const { store } = useStore();
//     const { theme } = useTheme();
//
//     const [latitude, longitude] = [50.853356, 5.669382];
//
//     const location = store?.location.route ? `${store.location.route}` : "Address Placeholder";
//     const subLocation = store?.location.route ? `${store.location.city}, ${store.location.zipCode}, ${store.location.country}` : "Location Placeholder";
//
//     const renderList = React.useCallback(
//         ({title, items}: {title: string; items: {name: string; href: string}[]}) => (
//             <div>
//                 <h3 className="text-small font-semibold text-default-600">{title}</h3>
//                 <ul className="mt-6 space-y-4">
//                     {items.map((item) => (
//                         <li key={item.name}>
//                             <Link className="text-grayText" href={item.href} size="sm">
//                                 {item.name}
//                             </Link>
//                         </li>
//                     ))}
//                 </ul>
//             </div>
//         ),
//         [],
//     );
//
//     const phone = {
//         name: "Phone",
//         href: `tel:${store?.phone}`,
//         icon: (props: SocialIconProps) => <Icon {...props} icon="line-md:phone-call" strokeWidth={1.5} width={20} className={'text-default-600'}/>,
//     };
//
//     return (
//         <footer className="flex w-full flex-col bg-gradient-card rounded-xl drop-shadow">
//             <div className="py-8 md:py-16 container mx-auto">
//                 <div className="flex flex-col gap-y-6 items-start justify-between">
//                     <div className="flex flex-col gap-y-6 gap-x-20 w-full md:flex-row md:items-start">
//                         <div className={'grid gap-y-6 md:my-0 w-full md:w-[60%]'}>
//                             <p className={'font-medium text-default-600'}>Contact Us</p>
//                             <Link
//                                 href={`https://www.google.com/maps?q=${latitude},${longitude}`}
//                                 className={'flex flex-row justify-between'}
//                             >
//                                 <div className={'flex gap-x-2 items-center'}>
//                                     <IconLocation size={20}
//                                                   primaryColor={`${theme === 'light' ? '#5d5d5b' : '#d4d4d8'}`}
//                                                   secondaryColor={`${theme === 'light' ? '#5d5d5b' : '#d4d4d8'}`}
//                                                   strokeWidth={2}
//                                     />
//                                     <div className={'flex flex-col gap-y-0'}>
//                                         <p className={"text-sm  text-default-500"}>
//                                             {location}
//                                         </p>
//                                         <p className={"text-xs font-light text-default-500"}>
//                                             {subLocation}
//                                         </p>
//                                     </div>
//                                 </div>
//                             </Link>
//                             <Link key={"Phone"} isExternal className="text-default-500 justify-between"
//                                   href={phone.href}>
//                                 <div className={'flex gap-x-2'}>
//                                     <phone.icon aria-hidden="true"/>
//                                     <p className={'text-sm'}>
//                                         {store.phone}
//                                     </p>
//                                     <span className="sr-only">{phone.name}</span>
//                                 </div>
//                             </Link>
//                         </div>
//                         <div className={'grid justify-start gap-y-6 my-6 md:my-0 w-full md:w-[55%]'}>
//                             <p className={'font-medium text-default-600'}>Working Hours</p>
//                             {renderCalendarContent()}
//                         </div>
//                         <div className={`grid gap-8 grid-cols-2 md:grid-cols-1 w-full md:w-[45%]`}>
//                             {/*<div>{renderList({title: "Services", items: footerNavigation.services})}</div>*/}
//                             {renderList({title: "Legal", items: footerNavigation.legal})}
//                             {renderList({title: "Support", items: footerNavigation.supportOptions})}
//                         </div>
//                     </div>
//                     <Divider/>
//                     <div className={'w-full flex justify-between items-center'}>
//                         <p className="text-small text-grayText">
//                             © {new Date().getFullYear()} TheBakerz. All rights reserved.
//                         </p>
//                         <a
//                             className="flex items-end justify-end w-[80%] md:w-fit"
//                             href="/"
//                         >
//                             <Image
//                                 src={`/images/TheBakerzLogo.svg`}
//                                 width={32}
//                                 height={32}
//                             />
//                             <span className={`text-2xl ml-2 ${pacifico.className}`}>TheBakerz</span>
//                         </a>
//                     </div>
//                 </div>
//             </div>
//         </footer>
//     );
// }








"use client";

import type {IconProps} from "@iconify/react";

import React from "react";
import {Divider, Image, Link} from "@heroui/react";
import {Icon} from "@iconify/react";
import {pacifico} from "@/components/fonts";
import {useStore} from "@/components/providers/store-provider";
import {renderCalendarContent} from "@/components/store/store-header/subheader/working-hours";
import {IconLocation} from "@/components/ui/icons";
import {useTheme} from "next-themes";


type SocialIconProps = Omit<IconProps, "icon">;

const footerNavigation = {
    overview: [
        {name: "TheBakerz", href: "/"},
        {name: "About TheBakerz", href: "/about-us"},
        {name: "Join TheBakerz", href: "/#join-thebakerz"},
    ],
    supportOptions: [
        {name: "Get Help", href: "/support"},
    ],
    legal: [
        {name: "Privacy Policy", href: "/policies/privacy-policy"},
        {name: "Terms of use", href: "/policies/terms-of-use"},
        {name: "Refund Policy", href: "/policies/refund-policy"},
    ],
    social: [
        {
            name: "LinkedIn",
            href: "https://www.linkedin.com/company/thebakerz",
            icon: (props: SocialIconProps) => <Icon {...props} icon="fontisto:linkedin" />,
        },
        {
            name: "Instagram",
            href: "https://www.instagram.com/thebakerz.official",
            icon: (props: SocialIconProps) => <Icon {...props} icon="fontisto:instagram" />,
        },
        {
            name: "Twitter",
            href: "https://x.com/the_bakerz",
            icon: (props: SocialIconProps) => <Icon {...props} icon="fontisto:twitter" />,
        }
    ],
};

export function FooterStore() {

    const { store } = useStore();
    const { theme } = useTheme();

    const [latitude, longitude] = [50.853356, 5.669382];

    const location = store?.location.route ? `${store.location.route}` : "Address Placeholder";
    const subLocation = store?.location.route ? `${store.location.city}, ${store.location.zipCode}, ${store.location.country}` : "Location Placeholder";

    const renderList = React.useCallback(
        ({title, items}: {title: string; items: {name: string; href: string}[]}) => (
            <div>
                <h3 className="text-small md:text-medium font-semibold text-default-600">{title}</h3>
                <ul className="mt-4 space-y-3">
                    {items.map((item) => (
                        <li key={item.name}>
                            <Link className="text-grayText hover:text-default-500 transition-colors" href={item.href} size="sm">
                                {item.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        ),
        [],
    );

    const phone = {
        name: "Phone",
        href: `tel:${store?.phone}`,
        icon: (props: SocialIconProps) => <Icon {...props} icon="line-md:phone-call" strokeWidth={1.5} width={20} className={'text-default-600'}/>,
    };

    return (
        <footer className="flex w-full flex-col bg-gradient-card rounded-xl drop-shadow">
            <div className="py-8 md:py-12 container mx-auto">
                <div className="flex flex-col gap-y-8 items-start justify-between">
                    <div className="flex flex-col gap-y-8 gap-x-12 w-full md:flex-row md:items-start">
                        <div className="grid gap-y-4 md:my-0 w-full md:w-[40%]">
                            <h3 className="md:small text-medium font-semibold text-default-600">Contact Us</h3>
                            <Link
                                href={`https://www.google.com/maps?q=${latitude},${longitude}`}
                                className="flex flex-row hover:text-default-500 transition-colors"
                            >
                                <div className="flex gap-x-2 items-center">
                                    <IconLocation size={20}
                                                  primaryColor={`${theme === 'light' ? '#5d5d5b' : '#d4d4d8'}`}
                                                  secondaryColor={`${theme === 'light' ? '#5d5d5b' : '#d4d4d8'}`}
                                                  strokeWidth={2}
                                    />
                                    <div className="flex flex-col gap-y-0">
                                        <p className="text-sm text-default-500">
                                            {location}
                                        </p>
                                        <p className="text-xs font-light text-default-500">
                                            {subLocation}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                            <Link key="Phone" isExternal className="text-default-500 hover:text-default-400 transition-colors flex items-center"
                                  href={phone.href}>
                                <div className="flex gap-x-2 items-center">
                                    <phone.icon aria-hidden="true"/>
                                    <p className="text-sm">
                                        {store.phone}
                                    </p>
                                    <span className="sr-only">{phone.name}</span>
                                </div>
                            </Link>
                        </div>
                        <div className="grid justify-start gap-y-4 my-0 w-full md:w-[30%]">
                            <div>
                                <h3 className="md:small text-medium font-semibold text-default-600">Working Hours</h3>
                                <div className="mt-4">
                                    {renderCalendarContent()}
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-8 w-full md:w-[30%]">
                            <div>
                                {renderList({title: "Legal", items: footerNavigation.legal})}
                            </div>
                            <div>
                                {renderList({title: "Support", items: footerNavigation.supportOptions})}
                            </div>
                        </div>
                    </div>
                    <Divider/>
                    <div className="w-full flex flex-col md:flex-row justify-between items-center gap-y-4">
                        <div className="flex items-center gap-x-4">
                            {footerNavigation.social.map((item) => (
                                <Link key={item.name} href={item.href} isExternal className="text-default-500 hover:text-default-400 transition-colors">
                                    <span className="sr-only">{item.name}</span>
                                    <item.icon aria-hidden="true" width={20} height={20} />
                                </Link>
                            ))}
                        </div>
                        <p className="text-small text-grayText order-3 md:order-2">
                            © {new Date().getFullYear()} TheBakerz. All rights reserved.
                        </p>
                        <a
                            className="flex items-center justify-end order-1 md:order-3"
                            href="/"
                        >
                            <Image
                                src="/images/TheBakerzLogo.svg"
                                width={32}
                                height={32}
                                alt="TheBakerz Logo"
                            />
                            <span className={`text-2xl ml-2 ${pacifico.className}`}>TheBakerz</span>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

