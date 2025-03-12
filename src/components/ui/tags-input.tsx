'use client';
import React, { useState, useRef, useEffect } from 'react';
import {Autocomplete, AutocompleteItem, Button, cn, Input} from "@heroui/react";
import {AllergenIcon, iconAllergyMap} from "@/components/store/product/components/allergy-icons";

interface TagsInputProps {
    tags: string[];
    setTags: React.Dispatch<React.SetStateAction<string[]>>;
    editTag?: boolean;
    placeholder?: string;
    type?: 'default' | 'warning';
}

export const TagsInput: React.FC<TagsInputProps> = ({
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
                    {editTag && editingIndex === index ? (
                        <Input
                            ref={editInputRef}
                            variant={'underlined'}
                            type='text'
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleAddTag}
                            onBlur={handleBlur}
                            className='px-2 py-1 text-sm border   rounded outline-none'
                            placeholder='Edit tag...'
                            style={{ width: `${input.length + 1 * 1.2}px` }}
                            autoFocus
                        />
                    ) : (
                        <div
                            onClick={() => handleRemoveTag(tag)}
                            className={cn("flex items-center gap-1 px-2 pl-2 py-1 text-sm font-medium rounded-full cursor-pointer", {
                                "bg-default-300 hover:bg-default-400": type === "default",
                                "bg-warning-300 hover:bg-warning-400": type === "warning"
                            })}
                        >
                            <AllergenIcon allergen={tag} />
                            <span>{tag}</span>
                            <span>&times;</span>
                        </div>
                    )}
                </div>
            ))}
            <Input
                type='text'
                variant={'underlined'}
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
                                                        tags,
                                                        setTags,
                                                        editTag = false,
                                                        placeholder = 'Add tag...',
                                                        type = 'default',
                                                    }) => {
    const [input, setInput] = useState('');
    const editInputRef = useRef<HTMLInputElement>(null);

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
                    <div
                        onClick={() => handleRemoveTag(tag)}
                        className={cn("flex items-center gap-1 px-2 pl-2 py-1 text-sm font-medium rounded-full cursor-pointer", {
                            "bg-default-300 hover:bg-default-400": type === "default",
                            "bg-warning-300 hover:bg-warning-400": type === "warning"
                        })}
                    >
                        <AllergenIcon allergen={tag} />
                        <span>{tag}</span>
                        <span>&times;</span>
                    </div>
                </div>
            ))}
            <Autocomplete
                defaultItems={Object.keys(iconAllergyMap).map((key) => ({
                    key,
                    label: key,
                }))}
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