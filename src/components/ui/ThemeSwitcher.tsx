'use client';

import {useTheme} from "next-themes";
import {Switch} from "@nextui-org/switch";
import {MoonIcon, SunIcon} from "@/components/ui/icons";

export const ThemeSwitcher = () => {
    const { theme, setTheme } = useTheme()

    return (
        <div className={'flex items-start ml-2 py-2'}>
            <Switch
                isSelected={theme !== 'dark'}
                size="md"
                color="primary"
                startContent={<SunIcon />}
                endContent={<MoonIcon />}

                onValueChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
                {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </Switch>
        </div>
    )
};