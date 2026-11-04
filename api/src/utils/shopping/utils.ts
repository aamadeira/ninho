import { Generic } from "../generic";
import { DB } from "../database/db";
import { ImagesUtils, StoredImage } from "../images/utils";

export type ShoppingStatus = "needed" | "cart" | "bought";

export interface ShoppingItem {
    id: number;
    name: string;
    store: string | null;
    tags: string[];
    status: ShoppingStatus;
    buyOnce: boolean;
    image: StoredImage | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
}

export class ShoppingUtils {
    private static readonly maxTags = 10;
    private static readonly statuses: ShoppingStatus[] = ["needed", "cart", "bought"];

    public static async getList(): Promise<ShoppingItem[]> {
        const query = `
        SELECT
            si.id AS si_id,
            si.name AS si_name,
            si.store AS si_store,
            si.tags AS si_tags,
            si.status AS si_status,
            si.buy_once AS si_buy_once,
            si.image_id AS si_image_id,
            si.notes AS si_notes,
            si.created_at AS si_created_at,
            si.updated_at AS si_updated_at
        FROM
            shopping_items si
        ORDER BY
            si.id ASC
        `;

        const rows = await new DB().fetch(query);

        const list: ShoppingItem[] = [];
        for (const row of rows) {
            list.push(ShoppingUtils.toShoppingItem(row));
        }

        return list;
    }

    public static async getByIdOrThrow(id: number): Promise<ShoppingItem> {
        const query = `
        SELECT
            si.id AS si_id,
            si.name AS si_name,
            si.store AS si_store,
            si.tags AS si_tags,
            si.status AS si_status,
            si.buy_once AS si_buy_once,
            si.image_id AS si_image_id,
            si.notes AS si_notes,
            si.created_at AS si_created_at,
            si.updated_at AS si_updated_at
        FROM
            shopping_items si
        WHERE
            si.id = ?
        `;

        const rows = await new DB().fetch(query, [id]);
        if (rows.length === 0) {
            throw Generic.buildNotFoundException("shopping item", { id });
        }

        return ShoppingUtils.toShoppingItem(rows[0]);
    }

    public static async add(body: any): Promise<ShoppingItem> {
        const name = Generic.parseRequiredText(body?.name, "name", 120);
        const store = Generic.parseOptionalText(body?.store, "store", 40);
        const tags = Generic.parseTags(body?.tags, ShoppingUtils.maxTags);
        const notes = Generic.parseOptionalText(body?.notes, "notes", 5000);
        let buyOnce = false;
        if (body?.buyOnce !== undefined) {
            buyOnce = Generic.parseBoolean(body.buyOnce, "buy once");
        }

        const existingRows = await new DB().fetch("SELECT si.id AS si_id FROM shopping_items si WHERE si.name = ? COLLATE NOCASE", [name]);
        if (existingRows.length > 0) {
            return ShoppingUtils.putBackOnList(existingRows[0].si_id, store, tags, notes);
        }

        const imageId = await ImagesUtils.save(ImagesUtils.parseUpload(body?.image) ?? null);

        const query = "INSERT INTO shopping_items (name, store, tags, buy_once, image_id, notes) VALUES (?, ?, ?, ?, ?, ?) RETURNING id";
        const rows = await new DB().fetch(query, [name, store, JSON.stringify(tags), buyOnce ? 1 : 0, imageId, notes]);
        return ShoppingUtils.getByIdOrThrow(rows[0].id);
    }

    public static async update(id: number, body: any): Promise<ShoppingItem> {
        const sets: string[] = [];
        const parameters: any[] = [];

        if (body?.name !== undefined) {
            sets.push("name = ?");
            parameters.push(Generic.parseRequiredText(body.name, "name", 120));
        }

        if (body?.store !== undefined) {
            sets.push("store = ?");
            parameters.push(Generic.parseOptionalText(body.store, "store", 40));
        }

        if (body?.tags !== undefined) {
            sets.push("tags = ?");
            parameters.push(JSON.stringify(Generic.parseTags(body.tags, ShoppingUtils.maxTags)));
        }

        if (body?.status !== undefined) {
            sets.push("status = ?");
            parameters.push(ShoppingUtils.parseStatus(body.status));
        }

        if (body?.buyOnce !== undefined) {
            sets.push("buy_once = ?");
            parameters.push(Generic.parseBoolean(body.buyOnce, "buy once") ? 1 : 0);
        }

        if (body?.notes !== undefined) {
            sets.push("notes = ?");
            parameters.push(Generic.parseOptionalText(body.notes, "notes", 5000));
        }

        const image = ImagesUtils.parseUpload(body?.image);
        if (image !== undefined) {
            sets.push("image_id = ?");
            parameters.push(await ImagesUtils.save(image));
        }

        if (sets.length === 0) {
            Generic.throwInvalidParameterException("body");
        }

        sets.push(`updated_at = ${DB.now}`);
        parameters.push(id);

        const rows = await new DB().fetch(`UPDATE shopping_items SET ${sets.join(", ")} WHERE id = ? RETURNING id`, parameters);
        if (rows.length === 0) {
            throw Generic.buildNotFoundException("shopping item", { id });
        }

        if (image !== undefined) {
            await ImagesUtils.deleteUnused();
        }

        return ShoppingUtils.getByIdOrThrow(id);
    }

    public static async delete(id: number): Promise<void> {
        const rows = await new DB().fetch("DELETE FROM shopping_items WHERE id = ? RETURNING id", [id]);
        if (rows.length === 0) {
            throw Generic.buildNotFoundException("shopping item", { id });
        }

        await ImagesUtils.deleteUnused();
    }

    public static async checkout(): Promise<void> {
        await new DB().fetch("DELETE FROM shopping_items WHERE status = 'cart' AND buy_once = 1");
        await new DB().fetch(`UPDATE shopping_items SET status = 'bought', updated_at = ${DB.now} WHERE status = 'cart'`);
        await ImagesUtils.deleteUnused();
    }

    private static parseStatus(value: any): ShoppingStatus {
        if (!ShoppingUtils.statuses.includes(value)) {
            Generic.throwInvalidParameterException("status");
        }

        return value;
    }

    private static async putBackOnList(id: number, store: string | null, tags: string[], notes: string | null): Promise<ShoppingItem> {
        const item = await ShoppingUtils.getByIdOrThrow(id);

        const mergedTags = [...item.tags];
        for (const tag of tags) {
            if (!mergedTags.includes(tag) && mergedTags.length < ShoppingUtils.maxTags) {
                mergedTags.push(tag);
            }
        }

        return ShoppingUtils.update(id, { status: "needed", store: store ?? item.store, tags: mergedTags, notes: notes ?? item.notes });
    }

    private static toShoppingItem(row: any): ShoppingItem {
        return {
            id: row.si_id,
            name: row.si_name,
            store: row.si_store,
            tags: JSON.parse(row.si_tags),
            status: row.si_status,
            buyOnce: row.si_buy_once === 1,
            image: ImagesUtils.toStoredImage(row.si_image_id),
            notes: row.si_notes,
            createdAt: row.si_created_at,
            updatedAt: row.si_updated_at
        };
    }
}
