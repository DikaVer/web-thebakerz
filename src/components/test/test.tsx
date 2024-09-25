"use client";

import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {ImageUploader} from "@/components/upload-image";
import {Button} from "@/components/ui/button";
import React, {useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {storeEditSchema} from "@/lib/schemas";
import {zodResolver} from "@hookform/resolvers/zod";
import {FormError} from "@/components/authentication/form-error";
import {AvatarUploader} from "@/components/upload-avatar";

export function Test() {
    const form = useForm<z.infer<typeof  storeEditSchema>>({
        resolver: zodResolver(storeEditSchema),
    });

    const [isDialogOpen, setDialogOpen] = useState(false);
    const handleDialogOpen = () => {
        setDialogOpen(true);
    }
    const [error, setError] = useState<string | undefined>();


    return (
        <div>
            <Form {...form}>
                <FormField
                    control={form.control}
                    name="background"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel
                                className="block text-sm font-medium text-gray-700">
                                Background Image
                            </FormLabel>
                            <FormControl>
                                {isDialogOpen &&
                                    (<AvatarUploader
                                        form={form}
                                        field={field}
                                        name={"background"}
                                        isDialogOpen={isDialogOpen}
                                        setDialogOpen={setDialogOpen}
                                    />)}
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
            </Form>
            <FormError message={error}/>
            <Button
                onClick={handleDialogOpen}
            >
                OpenDialog
            </Button>
        </div>
    );
}