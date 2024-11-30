'use client';

import 'react-image-crop/dist/ReactCrop.css';
import React, {useEffect, useMemo, useState} from "react";
import { UseFormReturn} from "react-hook-form";
import {Button} from "@/components/ui/button";
import {IconCross} from "@/components/ui/icons";
import {FormControl,FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {nameSchema} from "@/lib/schemas";


interface NameChangeDialogProps {
    form: UseFormReturn<any>;
    isDialogOpen: boolean;
    setDialogOpen: (open: boolean) => void;
    setGlobalData: (data: string) => void;
    originName: string;
}

export function NameChangeDialog({ form, isDialogOpen, setDialogOpen, setGlobalData, originName}: NameChangeDialogProps) {


    const isValid = useMemo(() => form.formState.isValid, [form.formState.isValid]);

    const [error, setError] = React.useState<string | undefined>();

    useEffect(() => {
        const valid = nameSchema.safeParse(form.getValues().name);
        if (!valid.success) {
            setError(valid.error.errors[0].message);
        } else {
            setError(undefined);
        }
    }, [isValid]);

    const [isOpen, setIsOpen] = useState<boolean>(isDialogOpen);

    const toggleClose = () => {
        setIsOpen(false);
        //Artificial delay to allow the animation to finish
        setTimeout(() => {
            setDialogOpen(false);
        }, 400);
    }

    return (
        <>
            <div
                data-state={isOpen ? 'open' : 'closed'}
                className="fixed inset-0 z-30 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
                onClick={(e) => {
                    toggleClose();
                }}/>
            <div
                data-state={isOpen ? 'open' : 'closed'}
                className={"fixed left-[50%] top-[50%] z-40 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 bg-background shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-lg"}
            >
                <div className={"grid gap-4 animate-in fade-in-0 zoom-in-95 slide-in-from-top-[5%] p-6"}>
                    <div className={`flex flex-row justify-between items-center`}>
                        <Button
                            className="flex p-1 items-center bg-white rounded-full transition duration-500 hover:bg-gray-200"
                            onClick={() => {
                                toggleClose();
                                form.setValue("name", originName);
                            }}
                        >
                            <IconCross className={"w-8 h-8 cursor-pointer text-text"}/>
                        </Button>
                        <p className={"text-xl"}>Name Editing</p>
                        <div className="w-8 h-8 flex "></div>
                    </div>
                    <hr className={"my-1"}></hr>
                    <FormField
                        control={form.control}
                        name="name"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel
                                    className="block text-sm font-medium text-gray-700">
                                    Name
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder={form.getValues().name}
                                        required
                                        type={"text"}
                                        onChange={(e) => field.onChange(e.target.value)}
                                    />
                                </FormControl>
                                <FormMessage>
                                    {error}
                                </FormMessage>
                            </FormItem>
                        )}
                    />
                    <Button
                        disabled={!isValid}
                        className={"w-full"}
                        type={"button"}
                        onClick={() => {
                            setDialogOpen(false);
                            setGlobalData(form.getValues().name);
                        }}
                    >
                        Save
                    </Button>
                </div>
            </div>
        </>
    );
}