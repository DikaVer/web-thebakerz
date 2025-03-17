// crop-image.ts
export const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous'); // needed to avoid cross-origin issues
        image.src = url;
    });

export function getRadianAngle(degreeValue: number): number {
    return (degreeValue * Math.PI) / 180;
}

/**
 * Returns the new bounding area of a rotated rectangle.
 */
export function rotateSize(
    width: number,
    height: number,
    rotation: number
): { width: number; height: number } {
    const rotRad = getRadianAngle(rotation);
    return {
        width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
        height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
    };
}

interface PixelCrop {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface CroppedImgResult {
    file: File;
    url: string;
}

export default async function getCroppedImg(
    imageSrc: string | undefined,
    pixelCrop: PixelCrop,
    rotation: number = 0,
    flip: { horizontal: boolean; vertical: boolean } = { horizontal: false, vertical: false }
): Promise<CroppedImgResult> {
    const image = await createImage(imageSrc || '');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('Could not get canvas context');
    }

    const rotRad = getRadianAngle(rotation);
    const { width: bBoxWidth, height: bBoxHeight } = rotateSize(image.width, image.height, rotation);

    // Set canvas size to match the bounding box of the rotated image.
    canvas.width = bBoxWidth;
    canvas.height = bBoxHeight;

    // Translate canvas context to center to allow rotating/flipping around the center.
    ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
    ctx.rotate(rotRad);
    ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
    ctx.translate(-image.width / 2, -image.height / 2);

    // Draw the rotated image.
    ctx.drawImage(image, 0, 0);

    // Extract the cropped image data.
    const data = ctx.getImageData(
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height
    );

    // Set canvas to final crop size (clearing previous drawing) and paste cropped data.
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    ctx.putImageData(data, 0, 0);

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                return reject(new Error('Canvas is empty'));
            }
            // Create a File from the blob.
            const file = new File([blob], 'cropped.jpeg', { type: 'image/jpeg' });
            resolve({ file, url: URL.createObjectURL(file) });
        }, 'image/jpeg');
    });
}
