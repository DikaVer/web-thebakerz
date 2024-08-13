'use client';
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import React from "react";

interface ICommandProps {
    commands: { value: string; label: string }[];
    placeholder?: string;
}

export function Search({ commands, placeholder = "Search" }: ICommandProps) {
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState("");
    const handleValueChange = (value: string) => {
        setInputValue(value);
        setOpen(!!value);
    };

    const filteredCommands = Array.isArray(commands)
        ? commands.filter((command) =>
            command.label.toLowerCase().includes(inputValue.toLowerCase())
        )
        : [];

    return (
        <Command className=" rounded-lg border shadow-sm my-5 overflow-hidden">
            <CommandInput
                placeholder={placeholder}
                onValueChange={handleValueChange}
            />
            <CommandList className={"absolute"}>
                {/*<CommandEmpty>*/}
                {/*    <p className="text-center text-gray-500">No results found</p>*/}
                {/*</CommandEmpty>*/}
                {/*{open && filteredCommands.length > 0 && filteredCommands.map((command) => (*/}
                {/*    <CommandItem key={command.value} value={command.value}>*/}
                {/*        {command.label}*/}
                {/*    </CommandItem>*/}
                {/*))}*/}
            </CommandList>
        </Command>
    );
}