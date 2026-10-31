import { Generic } from "../generic";
import { DB } from "../database/db";

export interface TodoList {
    id: number;
    name: string;
    createdAt: string;
}

export class TodoListsUtils {
    public static async getList(): Promise<TodoList[]> {
        const query = `
        SELECT
            tl.id AS tl_id,
            tl.name AS tl_name,
            tl.created_at AS tl_created_at
        FROM
            todo_lists tl
        ORDER BY
            tl.name ASC
        `;

        const rows = await new DB().fetch(query);

        const list: TodoList[] = [];
        for (const row of rows) {
            list.push(TodoListsUtils.toTodoList(row));
        }

        return list;
    }

    public static async add(body: any): Promise<TodoList> {
        const name = Generic.parseRequiredText(body?.name, "list name", 40);

        const existingRows = await new DB().fetch("SELECT tl.id AS tl_id FROM todo_lists tl WHERE tl.name = ?", [name]);
        if (existingRows.length > 0) {
            Generic.throwException("LIST-EXISTS", `There's already a list called ${name}.`, {}, 409);
        }

        const rows = await new DB().fetch("INSERT INTO todo_lists (name) VALUES (?) RETURNING id, name, created_at", [name]);
        return { id: rows[0].id, name: rows[0].name, createdAt: rows[0].created_at };
    }

    public static async delete(id: number): Promise<void> {
        const rows = await new DB().fetch("SELECT tl.name AS tl_name FROM todo_lists tl WHERE tl.id = ?", [id]);
        if (rows.length === 0) {
            throw Generic.buildNotFoundException("todo list", { id });
        }

        await new DB().fetch("DELETE FROM todos WHERE list_name = ? COLLATE NOCASE", [rows[0].tl_name]);
        await new DB().fetch("DELETE FROM todo_lists WHERE id = ?", [id]);
    }

    public static async getOrCreateName(name: string): Promise<string> {
        const rows = await new DB().fetch("SELECT tl.name AS tl_name FROM todo_lists tl WHERE tl.name = ?", [name]);
        if (rows.length > 0) {
            return rows[0].tl_name;
        }

        await new DB().fetch("INSERT INTO todo_lists (name) VALUES (?)", [name]);
        return name;
    }

    private static toTodoList(row: any): TodoList {
        return {
            id: row.tl_id,
            name: row.tl_name,
            createdAt: row.tl_created_at
        };
    }
}
