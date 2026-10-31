import { Generic } from "../generic";
import { DB } from "../database/db";

export interface StoredImage {
    url: string;
    thumbnailUrl: string;
}

export interface ImageUpload {
    data: Buffer;
    thumbnail: Buffer;
}

export type ImageSize = "full" | "thumbnail";

export class ImagesUtils {
    private static readonly jpegDataUrlPrefix = "data:image/jpeg;base64,";
    private static readonly maxImageSizeInBytes = 4 * 1024 * 1024;
    private static readonly maxThumbnailSizeInBytes = 512 * 1024;

    public static toStoredImage(imageId: number | null): StoredImage | null {
        if (imageId === null) {
            return null;
        }

        return {
            url: `/api/images/${imageId}`,
            thumbnailUrl: `/api/images/${imageId}/thumbnail`
        };
    }

    public static parseUpload(value: any): ImageUpload | null | undefined {
        if (value === undefined || value === null) {
            return value;
        }

        return {
            data: ImagesUtils.parseJpegDataUrl(value?.data, "image", ImagesUtils.maxImageSizeInBytes),
            thumbnail: ImagesUtils.parseJpegDataUrl(value?.thumbnail, "image thumbnail", ImagesUtils.maxThumbnailSizeInBytes)
        };
    }

    public static async save(upload: ImageUpload | null): Promise<number | null> {
        if (upload === null) {
            return null;
        }

        const rows = await new DB().fetch("INSERT INTO images (data, thumbnail) VALUES (?, ?) RETURNING id", [upload.data, upload.thumbnail]);
        return rows[0].id;
    }

    public static async getOrThrow(id: number, size: ImageSize): Promise<Buffer> {
        let query = "SELECT i.data AS i_bytes FROM images i WHERE i.id = ?";
        if (size === "thumbnail") {
            query = "SELECT i.thumbnail AS i_bytes FROM images i WHERE i.id = ?";
        }

        const rows = await new DB().fetch(query, [id]);
        if (rows.length === 0) {
            throw Generic.buildNotFoundException("image", { id });
        }

        return Buffer.from(rows[0].i_bytes);
    }

    public static async deleteUnused(): Promise<void> {
        const query = `
        DELETE FROM images
        WHERE
            created_at < strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-1 minute')
            AND id NOT IN (SELECT si.image_id FROM shopping_items si WHERE si.image_id IS NOT NULL)
            AND id NOT IN (SELECT r.image_id FROM recipes r WHERE r.image_id IS NOT NULL)
        `;

        await new DB().fetch(query);
    }

    private static parseJpegDataUrl(value: any, name: string, maxSizeInBytes: number): Buffer {
        if (typeof value !== "string" || !value.startsWith(ImagesUtils.jpegDataUrlPrefix)) {
            Generic.throwInvalidParameterException(name);
        }

        const bytes = Buffer.from(value.slice(ImagesUtils.jpegDataUrlPrefix.length), "base64");
        if (bytes.length > maxSizeInBytes) {
            Generic.throwException("IMAGE-TOO-LARGE", "That photo is too big.", {}, 413);
        }

        const isJpeg = bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
        if (!isJpeg) {
            Generic.throwInvalidParameterException(name);
        }

        return bytes;
    }
}
