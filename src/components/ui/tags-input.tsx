/**
 * @fileoverview Tag input components for allergens and dietary restrictions.
 *
 * Exports four variants: TagsInput (free-text tags added with Enter or
 * comma), TagsAutoInput (allergen autocomplete from the allergy icon map),
 * TagsSelectInput (multi-select of allergens), and DietarySelectInput
 * (multi-select of dietary options such as vegan or gluten-free). Tags render
 * as removable pills with allergen or dietary icons and translated labels.
 */
'use client';
import React, {useState, useRef, useEffect, useMemo} from 'react';
import {Autocomplete, AutocompleteItem, Button, cn, Input, Select, SelectItem} from "@heroui/react";
import {AllergenIcon, iconAllergyMap} from "@/components/store/product/components/allergy-icons";
import {DietaryIcon, iconSuperMap} from "@/components/store/product/components/super-icons";
import {useTranslations} from "next-intl";
import { Icon } from '@iconify/react/dist/iconify.js';

interface TagsInputProps {
    tags: string[];
    setTags: React.Dispatch<React.SetStateAction<string[]>>;
    editTag?: boolean;
    placeholder?: string;
    type?: 'default' | 'warning';
    isLoading?: boolean;
}

export const TagsInput: React.FC<TagsInputProps> = ({
    isLoading,
                                                        tags,
                                                        setTags,
                                                        editTag = false,
                                                        placeholder = 'Add tag...',
                                                        type = 'default',
                                                    }) => {
    const [input, setInput] = useState('');
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const editInputRef = useRef<HTMLInputElement>(null);

    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const trimmedInput = input.trim();

        if ((e.key === 'Enter' || e.key === ',') && trimmedInput) {
            e.preventDefault();
            if (editingIndex !== null) {
                const updatedTags = [...tags];
                updatedTags[editingIndex] = trimmedInput;
                setTags(updatedTags);
                setEditingIndex(null);
            } else if (!tags.includes(trimmedInput)) {
                setTags([...tags, trimmedInput]);
            }
            setInput('');
        }
    };

    const handleRemoveTag = (tag: string) => {
        setTags(tags.filter((t) => t !== tag));
        if (editingIndex !== null) {
            setEditingIndex(null);
        }
    };

    const handleEditTag = (index: number) => {
        if (editTag) {
            setInput(tags[index]);
            setEditingIndex(index);
            setTimeout(() => editInputRef.current?.focus(), 0); // Focus on edit input
        }
    };

    const handleBlur = () => {
        if (editingIndex !== null) {
            const updatedTags = [...tags];
            const trimmedInput = input.trim();
            if (trimmedInput) {
                updatedTags[editingIndex] = trimmedInput;
            } else {
                updatedTags.splice(editingIndex, 1);
            }
            setTags(updatedTags);
            setEditingIndex(null);
        }
        setInput('');
    };

    useEffect(() => {
        // Resize the input width based on text content
        if (editInputRef.current) {
            editInputRef.current.style.width = `${input.length + 1}ch`;
        }
    }, [input]);

    return (
        <div className='flex flex-wrap items-center gap-2 py-2 rounded-md'>
            {tags.map((tag, index) => (
                <div key={tag} className='relative'>
                    <button
                        disabled={isLoading}
                        onClick={() => {
                            handleRemoveTag(tag)
                        }}
                        className={cn("flex items-center gap-1 px-2 pl-2 py-1 text-sm font-medium rounded-full cursor-pointer", {
                            "bg-default-300 hover:bg-default-400": type === "default",
                            "bg-warning-300 hover:bg-warning-400": type === "warning",
                            "opacity-50": isLoading
                        })}
                    >
                        <AllergenIcon allergen={tag} />
                        <span>{tag}</span>
                        <span>&times;</span>
                    </button>
                </div>
            ))}
            <Input
                type='text'
                variant={'underlined'}
                isDisabled={isLoading}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleAddTag}
                className={`flex-grow py-1 text-sm border-none outline-none rounded-md ${
                    editingIndex !== null ? 'opacity-0' : 'opacity-100'
                }`}
                placeholder={placeholder}
            />
        </div>
    );
};

export const TagsAutoInput: React.FC<TagsInputProps> = ({
    isLoading,
                                                        tags,
                                                        setTags,
                                                        editTag = false,
                                                        placeholder = 'Add tag...',
                                                        type = 'default',
                                                    }) => {
    const [input, setInput] = useState('');
    const editInputRef = useRef<HTMLInputElement>(null);
    const allergy = useTranslations("Allergies");
    const handleAddTag = (key: string | number | null) => {
        // Check if key is a non-empty string
        if (key && typeof key === 'string' && key.trim() !== '') {
            if (!tags.includes(key)) {
                setTags([...tags, key]);
            }
            setInput('');
        }
    };

    const handleRemoveTag = (tag: string) => {
        setTags(tags.filter((t) => t !== tag));
    };


    useEffect(() => {
        // Resize the input width based on text content
        if (editInputRef.current) {
            editInputRef.current.style.width = `${input.length + 1}ch`;
        }
    }, [input]);

    return (
        <div className='flex flex-wrap items-center gap-2 py-2 rounded-md'>
            {tags.map((tag, index) => (
                <div key={tag} className='relative'>
                    <button
                        disabled={isLoading}
                        onClick={() => {
                            handleRemoveTag(tag)
                        }}
                        className={cn("flex items-center gap-1 px-2 pl-2 py-1 text-sm font-medium rounded-full cursor-pointer", {
                            "bg-default-300 hover:bg-default-400": type === "default",
                            "bg-warning-300 hover:bg-warning-400": type === "warning",
                            "opacity-50": isLoading
                        })}
                    >
                        <AllergenIcon allergen={tag} />
                        <span>{allergy(tag)}</span>
                        <span>&times;</span>
                    </button>
                </div>
            ))}
            <Autocomplete
                defaultItems={Object.keys(iconAllergyMap).map((key) => ({
                    key,
                    label: key,
                }))}
                isDisabled={isLoading}
                type='text'

                variant={'underlined'}
                inputValue={input}
                onInputChange={setInput}
                onSelectionChange={(key) => {
                    handleAddTag(key);

                }}
                onKeyDown={(e)=>{
                    if ((e.key === 'Enter' || e.key === ',') ) {
                        e.preventDefault();

                        setInput('');
                    }
                }}
                className={`flex-grow py-1 text-sm border-none outline-none rounded-md`}
                placeholder={placeholder}
            >
                {(item) => {
                    const IconComponent = iconAllergyMap[item.label];
                    return (<AutocompleteItem startContent={<IconComponent size={24}/> }  key={item.key}>{item.label}</AutocompleteItem>);
                }}
            </Autocomplete>
        </div>
    );
};


export const TagsSelectInput: React.FC<TagsInputProps> = ({
                                                              isLoading,
                                                              tags,
                                                              setTags,
                                                              placeholder = 'Select allergies...',
                                                              type = 'default',
                                                          }) => {
    const allergy = useTranslations("Allergies");

    // Convert current tags to a Set of keys for the Select's selectedKeys
    const selectedKeys = useMemo(() => {
        return new Set(tags);
    }, [tags]);

    const handleSelectionChange = (keys: "all" | Set<React.Key>) => {
        if (keys === "all") {
            // Handle "all" selection if needed
            setTags(Object.keys(iconAllergyMap));
        } else {
            // Convert Set to array of strings
            setTags(Array.from(keys).map(key => String(key)));
        }
    };

    // Handle remove tag
    const handleRemoveTag = (tag: string) => {
        setTags(tags.filter((t) => t !== tag));
    };

    return (
        <div className='flex flex-wrap items-center gap-2 py-2 rounded-md'>
            {/* Render existing tags */}
            {tags.map((tag) => (
                <div key={tag} className='relative'>
                    <button
                        disabled={isLoading}
                        onClick={() => {
                            handleRemoveTag(tag)
                        }}
                        className={cn("flex items-center gap-1 px-2 pl-2 py-1 text-sm font-medium rounded-full cursor-pointer", {
                            "bg-default-300 hover:bg-default-400": type === "default",
                            "bg-warning-300 hover:bg-warning-400": type === "warning",
                            "opacity-50": isLoading
                        })}
                    >
                        <AllergenIcon allergen={tag} />
                        <span>{allergy(tag)}</span>
                        <span>&times;</span>
                    </button>
                </div>
            ))}

            {/* Add button and Select */}

                <Select
                    selectionMode="multiple"
                    color={'warning'}
                    selectedKeys={selectedKeys}
                    onSelectionChange={handleSelectionChange}
                    placeholder={placeholder}
                    disableSelectorIconRotation
                    selectorIcon={
                        <div>
                            {allergy("Add Allergy")}
                            <Icon icon="material-symbols:add-rounded" width={16}/>
                        </div>
                    }
                    classNames={{
                        mainWrapper: 'items-end mt-8',
                        innerWrapper: 'hidden',
                        selectorIcon: 'w-fit flex end-0 gap-1 items-center static text-warning-600 font-medium',
                        trigger: 'rounded-full w-fit text-sm min-h-8 h-8 gap-1',
                        popoverContent: 'min-w-[200px]',
                    }}
                    isDisabled={isLoading}
                >
                    {Object.keys(iconAllergyMap).map((key) => {
                        const IconComponent = iconAllergyMap[key];
                        return (
                            <SelectItem
                                key={key}
                                startContent={<IconComponent size={24}/>}
                            >
                                {allergy(key)}
                            </SelectItem>
                        );
                    })}
                </Select>
        </div>
    );
};

// Add this constant after the imports
const DIETARY_OPTIONS: Record<string, string> = {
    'gluten-free': 'Gluten Free',
    'sugar-free': 'No Sugar',
    'lactose-free': 'Lactose Free',
    'halal': 'Halal',
    'vegan': 'Vegan',
} as const;

export const DietarySelectInput: React.FC<TagsInputProps> = ({
    isLoading,
    tags,
    setTags,
    placeholder = 'Select dietary restrictions...',
}) => {

    const t = useTranslations("Dietary");
    const selectedKeys = useMemo(() => {
        return new Set(tags);
    }, [tags]);

    const handleSelectionChange = (keys: "all" | Set<React.Key>) => {
        if (keys === "all") {
            setTags(Object.keys(DIETARY_OPTIONS));
        } else {
            setTags(Array.from(keys).map(key => String(key)));
        }
    };

    const handleRemoveTag = (tag: string) => {
        setTags(tags.filter((t) => t !== tag));
    };

    return (
        <div className='flex flex-wrap items-center gap-2 py-2 rounded-md'>
            {tags.map((tag) => (
                <div key={tag} className='relative'>
                    <button
                        disabled={isLoading}
                        onClick={() => {
                            handleRemoveTag(tag)
                        }}
                        className={cn("flex items-center gap-1 px-2 pl-2 py-1 text-sm font-medium rounded-full cursor-pointer", {
                            "bg-success-100 hover:bg-success-200 text-success-700": true,
                            "opacity-50": isLoading
                        })}
                    >
                        <DietaryIcon dietary={tag} size={32} />
                        <span>{t(tag)}</span>
                        <span>&times;</span>
                    </button>
                </div>
            ))}

            <Select
                selectionMode="multiple"
                color={'success'}
                selectedKeys={selectedKeys}
                onSelectionChange={handleSelectionChange}
                placeholder={placeholder}
                disableSelectorIconRotation
                selectorIcon={
                    <div>
                        {t("AddDietaryRestriction")}
                        <Icon icon="material-symbols:add-rounded" width={16}/>
                    </div>
                }
                classNames={{
                    mainWrapper: 'items-end mt-8',
                    innerWrapper: 'hidden',
                    selectorIcon: 'w-fit flex end-0 gap-1 items-center static text-success-600 font-medium',
                    trigger: 'rounded-full w-fit text-sm min-h-8 h-8 gap-1 bg-success-50',
                    popoverContent: 'min-w-[200px]',
                }}
                isDisabled={isLoading}
            >
                {Object.entries(DIETARY_OPTIONS).map(([key, label]) => (
                    <SelectItem
                        key={key}
                        startContent={<DietaryIcon dietary={key} size={32} />}
                    >
                        {t(key)}
                    </SelectItem>
                ))}
            </Select>
        </div>
    );
};