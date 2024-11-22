'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import React from "react";
import { Search as IconSearch } from "lucide-react";

export default function Search({ placeholder }: { placeholder: string }) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const handleSearch = useDebouncedCallback((term) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', '1');
        if (term) {
            params.set('query', term);
        } else {
            params.delete('query');
        }
        replace(`${pathname}?${params.toString()}`);
    }, 300);
    return (
        <div className="relative flex flex-1 items-center flex-shrink-0 w-full rounded-md border outline-2">
            <label htmlFor="search" className="sr-only">
                Search
            </label>
            <IconSearch className="ml-4 mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
                className="peer block w-full border-gray-200 py-[9px] outline-none text-sm placeholder:text-gray-500"
                placeholder={placeholder}
                onChange={(e) => {
                    handleSearch(e.target.value);
                }}
                defaultValue={searchParams.get('query')?.toString()}
            />
        </div>
    );
}
