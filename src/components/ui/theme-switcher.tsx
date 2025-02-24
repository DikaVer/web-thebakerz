'use client';

import {useTheme} from "next-themes";
import {Switch} from "@heroui/react";

import {Icon} from "@iconify/react";

export const ThemeSwitcher = () => {
    const { theme, setTheme } = useTheme()

    return (
        <div className={'flex items-start ml-2 py-2'}>
            <Switch
                isSelected={theme !== 'dark'}
                size="md"
                color="secondary"
                classNames={{
                    base: "",
                    wrapper: "border",
                    // thumb: "bg-gradient-item",
                }}
                startContent={<Icon icon={"solar:sun-2-broken"}/>}
                endContent={<Icon icon={"solar:moon-stars-broken"} />}

                onValueChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
                {/*{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}*/}
            </Switch>
        </div>
    )
};