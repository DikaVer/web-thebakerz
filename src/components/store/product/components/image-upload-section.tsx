import React from "react";
import {Button, cn, Image, PressEvent} from "@heroui/react";
import {FormControl} from "@/components/ui/form";
import {Icon} from "@iconify/react";

type ImageUploadSectionProps = {
    isProductExisting: boolean;
    picture?: string;
    additionalImages: string[];
    isPending: boolean;
    isSmall: boolean;
    fileRef: React.RefObject<HTMLInputElement | null>;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onMainClick: () => void;
    onAdditionalClick: (index?: number) => void;
    onRemoveMain: (e: PressEvent) => void;
    onRemoveAdditional: (index: number, e: PressEvent) => void;
};

export function ImageUploadSection({
                                isProductExisting,
                                picture,
                                additionalImages,
                                isPending,
                                isSmall,
                                fileRef,
                                onFileChange,
                                onMainClick,
                                onAdditionalClick,
                                onRemoveMain,
                                onRemoveAdditional,
                            }: ImageUploadSectionProps) {
    return (
        <div className="md:pl-4">
            <FormControl>
                <div className={cn("flex w-full justify-center items-center", isProductExisting ? "cursor-default" : "cursor-pointer")}>
                    <input type="file" className="hidden" ref={fileRef} onChange={onFileChange} />
                    {picture ? (
                        <div
                            className={cn(
                                "relative flex flex-col justify-center items-center md:w-[258px] w-full max-w-[400px] aspect-square",
                                isSmall ? "rounded-none" : "rounded-xl"
                            )}
                            onClick={!isPending ? onMainClick : undefined}
                        >
                            {!isProductExisting && (
                                <Button
                                    aria-label="Remove main image"
                                    isIconOnly
                                    isDisabled={isPending}
                                    size="sm"
                                    color="danger"
                                    variant="flat"
                                    radius="full"
                                    className="absolute top-2 right-2 z-50 opacity-90"
                                    onPress={onRemoveMain}
                                >
                                    <Icon icon="solar:close-circle-bold" width={20} />
                                </Button>
                            )}
                            <Image
                                removeWrapper
                                alt="Main image"
                                className={cn("object-cover w-full", isSmall ? "rounded-none border-none" : "rounded-xl")}
                                src={picture}
                            />
                        </div>
                    ) : (
                        <div
                            className={cn(
                                "flex flex-col justify-center items-center w-full md:w-[258px] max-w-[400px] aspect-square md:shadow-small cursor-pointer",
                                isSmall ? "border-b-1 border-t-1 rounded-none" : "border-1 rounded-xl"
                            )}
                            onClick={!isPending ? onMainClick : undefined}
                        >
                            <Icon icon="solar:gallery-add-bold-duotone" className="text-default-500 w-full" width={64} />
                            <p className="text-default-500">Upload Item Image</p>
                        </div>
                    )}
                </div>
            </FormControl>

            {/* Additional Images Section */}
            {picture && (
                <div className="flex flex-row gap-2 mt-2 justify-start w-full px-4 md:px-0">
                    {additionalImages.map((img, index) => (
                        <div
                            key={index}
                            className={cn("relative flex justify-center items-center w-20 h-20 cursor-pointer border-1", "rounded-lg")}
                            onClick={() => onAdditionalClick(index)}
                        >
                            <Button
                                aria-label="Remove additional image"
                                isDisabled={isPending}
                                isIconOnly
                                size="sm"
                                color="danger"
                                variant="flat"
                                radius="full"
                                className="absolute top-0 right-0 z-50 scale-75 opacity-90"
                                onPress={(e) => onRemoveAdditional(index, e)}
                            >
                                <Icon icon="solar:close-circle-bold" width={18} />
                            </Button>
                            <Image
                                removeWrapper
                                alt={`Additional image ${index + 1}`}
                                className={cn("object-cover w-full h-full", "rounded-lg")}
                                src={img}
                            />
                        </div>
                    ))}
                    {additionalImages.length < 2 && (
                        <div
                            className={cn("flex justify-center items-center w-20 h-20 cursor-pointer border-1", "rounded-lg")}
                            onClick={() => onAdditionalClick()}
                        >
                            <Icon icon="solar:gallery-add-bold-duotone" className="text-default-500 w-full" width={24} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}