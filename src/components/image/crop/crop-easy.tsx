import React, { useState } from "react";
import Cropper from "react-easy-crop";
import { Button, ModalBody, ModalFooter, Slider } from "@heroui/react";
import { Icon } from "@iconify/react";
import getCroppedImg from "@/components/image/crop/utils/crop-image";
import showErrorMessage from "@/components/toast/toast-error";
import showSuccessMessage from "@/components/toast/toast-succes";
import { useSession } from "@/components/providers/session-provider";
import { SessionValidationResult } from "@/lib/actions/session";
import { User } from "@/lib/actions/user";
import { useTranslations } from "next-intl";

interface Area {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface CropEasyProps {
    type: "square" | "circle";
    photoURL: string | undefined;
    setOpenCrop: (open: boolean) => void;
    container: string;
    setImageURL?: (file: File, url: string) => void;
}

const CropEasy: React.FC<CropEasyProps> = ({
                                               type,
                                               photoURL,
                                               setOpenCrop,
                                               container,
                                               setImageURL,
                                           }) => {
    const { session, setSession } = useSession();
    const t = useTranslations("CropEasy");

    const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState<number>(1);
    const [rotation, setRotation] = useState<number>(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isPending, setIsPending] = useState<boolean>(false);

    const cropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const cropImage = async () => {
        if (!croppedAreaPixels) return;

        try {
            const { file, url } = await getCroppedImg(photoURL, croppedAreaPixels, rotation);
            if (file) {
                setIsPending(true);

                if (container === "avatars" && session) {
                    const formData = new FormData();
                    formData.append("file", file, "image.webp");
                    formData.append("container", container);

                    const response = await fetch("/api/upload-image", {
                        method: "POST",
                        body: formData,
                    });

                    if (!response.ok) {
                        if (response.status === 500) {
                            showErrorMessage({ error: t("Failed to upload image") });
                        } else {
                            const { error } = await response.json();
                            showErrorMessage({ error: error });
                        }
                        setOpenCrop(false);
                        setIsPending(false);
                        return;
                    }

                    const { success, url: uploadedUrl } = await response.json();
                    showSuccessMessage({ success: success });

                    setSession((prevSession): SessionValidationResult => {
                        if (!session) return prevSession;
                        if (prevSession.user) {
                            return {
                                ...prevSession,
                                user: {
                                    ...prevSession.user,
                                    picture: uploadedUrl,
                                } as User,
                            };
                        }
                        return prevSession;
                    });
                } else {
                    setImageURL && setImageURL(file, url);
                }
                setOpenCrop(false);
            } else {
                showErrorMessage({ error: t("Failed to upload image") });
                setOpenCrop(false);
            }
            setIsPending(false);
        } catch (error: any) {
            console.error(error);
        }
    };

    return (
        <>
            <ModalBody className="px-0">
                <div
                    style={{
                        background: "#333",
                        position: "relative",
                        height: 400,
                        width: "auto",
                    }}
                >
                    <Cropper
                        image={photoURL}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={1}
                        classes={{
                            cropAreaClassName: `${type === "circle" && "rounded-full"}`,
                        }}
                        onZoomChange={setZoom}
                        onRotationChange={setRotation}
                        onCropChange={setCrop}
                        onCropComplete={cropComplete}
                    />
                </div>
                <div className="px-6">
                    <div>
                        <Slider
                            label={t("Zoom")}
                            value={zoom}
                            color="secondary"
                            radius="md"
                            formatOptions={{ style: "percent" }}
                            minValue={1}
                            step={0.1}
                            maxValue={10}
                            onChange={(value) => setZoom(value as number)}
                            isDisabled={isPending}
                        />
                    </div>
                    <div>
                        <Slider
                            label={t("Rotation")}
                            value={rotation / 360}
                            color="secondary"
                            radius="md"
                            formatOptions={{ style: "percent" }}
                            step={0.01}
                            minValue={0}
                            maxValue={1}
                            onChange={(value) => setRotation((value as number) * 360)}
                            isDisabled={isPending}
                        />
                    </div>
                </div>
            </ModalBody>
            <ModalFooter>
                <Button
                    color="secondary"
                    onPress={cropImage}
                    className="text-black shadow"
                    type="submit"
                    startContent={
                        !isPending && <Icon icon="solar:gallery-edit-broken" width={24} />
                    }
                    isLoading={isPending}
                >
                    {isPending ? t("Uploading") : t("Upload Image")}
                </Button>
            </ModalFooter>
        </>
    );
};

export default CropEasy;