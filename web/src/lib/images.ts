import type { ImageUpload } from "./types";

const fullImageLongestSide = 1600;
const thumbnailShortestSide = 320;
const jpegQuality = 0.82;

function drawJpeg(bitmap: ImageBitmap, scale: number): string {
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));

    const context = canvas.getContext("2d");
    if (!context) {
        throw new Error("Couldn't read that photo. Try another one.");
    }

    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingQuality = "high";
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL("image/jpeg", jpegQuality);
}

export async function prepareImage(file: File): Promise<ImageUpload> {
    let bitmap: ImageBitmap;
    try {
        bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
        throw new Error("Couldn't read that photo. Try a JPEG or PNG.");
    }

    try {
        const fullScale = Math.min(1, fullImageLongestSide / Math.max(bitmap.width, bitmap.height));
        const thumbnailScale = Math.min(1, thumbnailShortestSide / Math.min(bitmap.width, bitmap.height));
        return { data: drawJpeg(bitmap, fullScale), thumbnail: drawJpeg(bitmap, thumbnailScale) };
    } finally {
        bitmap.close();
    }
}
