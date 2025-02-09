// crop-easy.tsx
'use client';

import React, { useState } from 'react';
import Cropper from 'react-easy-crop';
import {Button, ModalBody, ModalFooter, Slider} from '@heroui/react'; // heroui/nextui components
import { Icon } from '@iconify/react';
import getCroppedImg from "@/components/image/crop/utils/crop-image";

interface Area {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface CropEasyProps {
    photoURL: string | undefined;
    setOpenCrop: (open: boolean) => void;
    setPhotoURL: (url: string) => void;
    setFile: (file: File) => void;
}

const CropEasy: React.FC<CropEasyProps> = ({
                                               photoURL,
                                               setOpenCrop,
                                               setPhotoURL,
                                               setFile,
                                           }) => {

    const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState<number>(1);
    const [rotation, setRotation] = useState<number>(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const cropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const cropImage = async () => {
        if (!croppedAreaPixels) return;

        try {
            const { file, url } = await getCroppedImg(photoURL, croppedAreaPixels, rotation);
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const result = e.target?.result;
                    if (typeof result === "string") {
                        setPhotoURL(result);
                    } else {
                        setPhotoURL("");
                    }
                };
                reader.readAsDataURL(file);
            }

            setFile(file); // update file state as an array
            setOpenCrop(false);
        } catch (error: any) {
            console.error(error);
        }
    };

    return (
        <>
            <ModalBody
                className="px-0"
            >
                {/* Crop area container */}
                <div
                    style={{
                        background: '#333',
                        position: 'relative',
                        height: 400,
                        width: 'auto',
                    }}
                >
                    <Cropper
                        image={photoURL}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={1}
                        classes={{
                            cropAreaClassName: 'rounded-full',
                        }}
                        onZoomChange={setZoom}
                        onRotationChange={setRotation}
                        onCropChange={setCrop}
                        onCropComplete={cropComplete}
                    />
                </div>
                {/* Controls */}
                <div className={'px-6'}>
                    <div >
                        <div>

                            <Slider
                                label="Zoom"
                                value={zoom / 1}
                                color={'secondary'}
                                radius={'md'}
                                formatOptions={{style: "percent"}}
                                minValue={1}
                                step={0.1}
                                maxValue={10}
                                onChange={(value) => setZoom(value as number)}
                            />
                        </div>
                        <div>
                            <Slider
                                label="Rotation"
                                value={rotation / 360}
                                color={'secondary'}
                                radius={'md'}
                                formatOptions={{style: "percent"}}
                                step={0.01}
                                minValue={0}
                                maxValue={1}
                                onChange={(value) => setRotation(value as number * 360)}
                            />
                        </div>
                    </div>
                </div>
            </ModalBody>
            <ModalFooter>
                {/*<Button color="danger" variant="light" onPress={() => setOpenCrop(false)}>*/}
                {/*    Close*/}
                {/*</Button>*/}
                <Button
                    color="secondary"
                    onPress={cropImage}
                    className="text-black shadow"
                    type="submit"
                    startContent={<Icon icon="solar:gallery-edit-broken" width={24} />}
                >
                    Update Avatar
                </Button>
            </ModalFooter>
        </>
    );
};

const zoomPercent = (value: number): number => {
    return Math.round(value / 100);
};

const rotationPercent = (value: number): number => {
    return Math.round(value / 360);
};

export default CropEasy;
