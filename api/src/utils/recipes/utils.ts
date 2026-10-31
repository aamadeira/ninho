import { Generic } from "../generic";
import { DB } from "../database/db";
import { ImagesUtils, StoredImage } from "../images/utils";

export interface Recipe {
    id: number;
    title: string;
    tags: string[];
    link: string | null;
    ingredients: string;
    steps: string;
    image: StoredImage | null;
    createdAt: string;
    updatedAt: string;
}

interface RecipeFields {
    title: string;
    tags: string[];
    link: string | null;
    ingredients: string;
    steps: string;
}

export class RecipesUtils {
    private static readonly maxTags = 20;

    public static async getList(): Promise<Recipe[]> {
        const query = `
        SELECT
            r.id AS r_id,
            r.title AS r_title,
            r.tags AS r_tags,
            r.link AS r_link,
            r.ingredients AS r_ingredients,
            r.steps AS r_steps,
            r.image_id AS r_image_id,
            r.created_at AS r_created_at,
            r.updated_at AS r_updated_at
        FROM
            recipes r
        ORDER BY
            r.title COLLATE NOCASE ASC
        `;

        const rows = await new DB().fetch(query);

        const list: Recipe[] = [];
        for (const row of rows) {
            list.push(RecipesUtils.toRecipe(row));
        }

        return list;
    }

    public static async getByIdOrThrow(id: number): Promise<Recipe> {
        const query = `
        SELECT
            r.id AS r_id,
            r.title AS r_title,
            r.tags AS r_tags,
            r.link AS r_link,
            r.ingredients AS r_ingredients,
            r.steps AS r_steps,
            r.image_id AS r_image_id,
            r.created_at AS r_created_at,
            r.updated_at AS r_updated_at
        FROM
            recipes r
        WHERE
            r.id = ?
        `;

        const rows = await new DB().fetch(query, [id]);
        if (rows.length === 0) {
            throw Generic.buildNotFoundException("recipe", { id });
        }

        return RecipesUtils.toRecipe(rows[0]);
    }

    public static async add(body: any): Promise<Recipe> {
        const fields = RecipesUtils.parseFields(body);
        const imageId = await ImagesUtils.save(ImagesUtils.parseUpload(body?.image) ?? null);

        const query = `
        INSERT INTO recipes (title, tags, link, ingredients, steps, image_id)
        VALUES (?, ?, ?, ?, ?, ?)
        RETURNING id
        `;

        const rows = await new DB().fetch(query, [fields.title, JSON.stringify(fields.tags), fields.link, fields.ingredients, fields.steps, imageId]);
        return RecipesUtils.getByIdOrThrow(rows[0].id);
    }

    public static async update(id: number, body: any): Promise<Recipe> {
        const fields = RecipesUtils.parseFields(body);
        const image = ImagesUtils.parseUpload(body?.image);

        const query = `
        UPDATE recipes SET
            title = ?,
            tags = ?,
            link = ?,
            ingredients = ?,
            steps = ?,
            updated_at = ${DB.now}
        WHERE
            id = ?
        RETURNING id
        `;

        const rows = await new DB().fetch(query, [fields.title, JSON.stringify(fields.tags), fields.link, fields.ingredients, fields.steps, id]);
        if (rows.length === 0) {
            throw Generic.buildNotFoundException("recipe", { id });
        }

        if (image !== undefined) {
            const imageId = await ImagesUtils.save(image);
            await new DB().fetch("UPDATE recipes SET image_id = ? WHERE id = ?", [imageId, id]);
            await ImagesUtils.deleteUnused();
        }

        return RecipesUtils.getByIdOrThrow(id);
    }

    public static async delete(id: number): Promise<void> {
        const rows = await new DB().fetch("DELETE FROM recipes WHERE id = ? RETURNING id", [id]);
        if (rows.length === 0) {
            throw Generic.buildNotFoundException("recipe", { id });
        }

        await ImagesUtils.deleteUnused();
    }

    private static parseFields(body: any): RecipeFields {
        return {
            title: Generic.parseRequiredText(body?.title, "title", 120),
            tags: Generic.parseTags(body?.tags, RecipesUtils.maxTags),
            link: RecipesUtils.parseLink(body?.link),
            ingredients: Generic.parseOptionalText(body?.ingredients, "ingredients", 20000) ?? "",
            steps: Generic.parseOptionalText(body?.steps, "steps", 20000) ?? ""
        };
    }

    private static parseLink(value: any): string | null {
        const link = Generic.parseOptionalText(value, "link", 2000);
        if (link === null) {
            return null;
        }

        if (!URL.canParse(link) || !/^https?:\/\//i.test(link)) {
            Generic.throwInvalidParameterException("link");
        }

        return link;
    }

    private static toRecipe(row: any): Recipe {
        return {
            id: row.r_id,
            title: row.r_title,
            tags: JSON.parse(row.r_tags),
            link: row.r_link,
            ingredients: row.r_ingredients,
            steps: row.r_steps,
            image: ImagesUtils.toStoredImage(row.r_image_id),
            createdAt: row.r_created_at,
            updatedAt: row.r_updated_at
        };
    }
}
