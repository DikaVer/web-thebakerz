'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
const links = [
    { name: 'Home', href: '/dashboard', icon: null },
    {
        name: 'Users',
        href: '/dashboard/users',
        icon: null,
    },
    { name: 'Stores', href: '/dashboard/stores', icon: null },
    { name: 'Applications', href: '/dashboard/applications', icon: null },
    { name: 'Orders', href: '/dashboard/orders', icon: null },
    { name: 'Session Overview', href: '/dashboard/session', icon: null },
    { name: 'Settings', href: '/dashboard/settings', icon: null },
];

export default function NavLinks() {
    const pathname = usePathname();
    return (
        <>
            {links.map((link) => {
                return (
                    <Link
                        key={link.name}
                        href={link.href}
                        className={clsx(
                            'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-secondary hover:text-black md:flex-none md:justify-start md:p-2 md:px-3',
                            {
                                'bg-secondary text-black': pathname === link.href,
                            },
                        )}          >
                        <p className="hidden md:block">{link.name}</p>
                    </Link>
                );
            })}
        </>
    );
}
