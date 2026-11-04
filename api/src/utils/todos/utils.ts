import { Generic } from "../generic";
import { DB } from "../database/db";
import { UsersUtils } from "../users/utils";
import { TodoListsUtils } from "../todoLists/utils";

export type RepeatUnit = "day" | "week" | "month" | "year";

export interface TodoRepeat {
    every: number;
    unit: RepeatUnit;
}

export interface Todo {
    id: number;
    title: string;
    listName: string;
    done: boolean;
    assigneeId: number | null;
    dueDate: string | null;
    repeat: TodoRepeat | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
}

interface TodoFields {
    title: string;
    listName: string;
    done: boolean;
    assigneeId: number | null;
    dueDate: string | null;
    repeat: TodoRepeat | null;
    notes: string | null;
}

export class TodosUtils {
    private static readonly repeatUnits: RepeatUnit[] = ["day", "week", "month", "year"];
    private static readonly maxRepeatEvery = 365;

    public static async getList(): Promise<Todo[]> {
        const query = `
        SELECT
            t.id AS t_id,
            t.title AS t_title,
            t.list_name AS t_list_name,
            t.done AS t_done,
            t.assignee_id AS t_assignee_id,
            t.due_date AS t_due_date,
            t.repeat_every AS t_repeat_every,
            t.repeat_unit AS t_repeat_unit,
            t.notes AS t_notes,
            t.created_at AS t_created_at,
            t.updated_at AS t_updated_at
        FROM
            todos t
        ORDER BY
            t.id ASC
        `;

        const rows = await new DB().fetch(query);

        const list: Todo[] = [];
        for (const row of rows) {
            list.push(TodosUtils.toTodo(row));
        }

        return list;
    }

    public static async getByIdOrThrow(id: number): Promise<Todo> {
        const query = `
        SELECT
            t.id AS t_id,
            t.title AS t_title,
            t.list_name AS t_list_name,
            t.done AS t_done,
            t.assignee_id AS t_assignee_id,
            t.due_date AS t_due_date,
            t.repeat_every AS t_repeat_every,
            t.repeat_unit AS t_repeat_unit,
            t.notes AS t_notes,
            t.created_at AS t_created_at,
            t.updated_at AS t_updated_at
        FROM
            todos t
        WHERE
            t.id = ?
        `;

        const rows = await new DB().fetch(query, [id]);
        if (rows.length === 0) {
            throw Generic.buildNotFoundException("todo", { id });
        }

        return TodosUtils.toTodo(rows[0]);
    }

    public static async add(body: any): Promise<Todo> {
        const newTodo: TodoFields = {
            title: Generic.parseRequiredText(body?.title, "title", 200),
            listName: await TodoListsUtils.getOrCreateName(Generic.parseRequiredText(body?.listName, "list name", 40)),
            done: false,
            assigneeId: null,
            dueDate: null,
            repeat: null,
            notes: null
        };

        const fields = await TodosUtils.applyChanges(newTodo, { assigneeId: body?.assigneeId, dueDate: body?.dueDate, repeat: body?.repeat, notes: body?.notes });

        const query = `
        INSERT INTO todos (title, list_name, done, assignee_id, due_date, repeat_every, repeat_unit, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING id
        `;

        const rows = await new DB().fetch(query, TodosUtils.toColumnValues(fields));
        return TodosUtils.getByIdOrThrow(rows[0].id);
    }

    public static async update(id: number, body: any): Promise<Todo> {
        if (Generic.isEmpty(body)) {
            Generic.throwInvalidParameterException("body");
        }

        const todo = await TodosUtils.getByIdOrThrow(id);
        const fields = await TodosUtils.applyChanges(todo, body);

        const query = `
        UPDATE todos SET
            title = ?,
            list_name = ?,
            done = ?,
            assignee_id = ?,
            due_date = ?,
            repeat_every = ?,
            repeat_unit = ?,
            notes = ?,
            updated_at = ${DB.now}
        WHERE
            id = ?
        RETURNING id
        `;

        const rows = await new DB().fetch(query, [...TodosUtils.toColumnValues(fields), id]);
        if (rows.length === 0) {
            throw Generic.buildNotFoundException("todo", { id });
        }

        return TodosUtils.getByIdOrThrow(id);
    }

    public static async delete(id: number): Promise<void> {
        const rows = await new DB().fetch("DELETE FROM todos WHERE id = ? RETURNING id", [id]);
        if (rows.length === 0) {
            throw Generic.buildNotFoundException("todo", { id });
        }
    }

    public static async deleteDone(): Promise<void> {
        await new DB().fetch("DELETE FROM todos WHERE done = 1");
    }

    public static getNextDueDate(dueDate: string, repeat: TodoRepeat, today: string): string {
        let occurrence = 1;
        let nextDueDate = TodosUtils.shiftDate(dueDate, repeat.unit, repeat.every * occurrence);

        while (nextDueDate <= today) {
            occurrence++;
            nextDueDate = TodosUtils.shiftDate(dueDate, repeat.unit, repeat.every * occurrence);
        }

        return nextDueDate;
    }

    private static async applyChanges(current: TodoFields, body: any): Promise<TodoFields> {
        const fields: TodoFields = {
            title: current.title,
            listName: current.listName,
            done: current.done,
            assigneeId: current.assigneeId,
            dueDate: current.dueDate,
            repeat: current.repeat,
            notes: current.notes
        };

        if (body?.title !== undefined) {
            fields.title = Generic.parseRequiredText(body.title, "title", 200);
        }

        if (body?.listName !== undefined) {
            fields.listName = await TodoListsUtils.getOrCreateName(Generic.parseRequiredText(body.listName, "list name", 40));
        }

        if (body?.done !== undefined) {
            fields.done = Generic.parseBoolean(body.done, "done");
        }

        if (body?.assigneeId !== undefined) {
            fields.assigneeId = await TodosUtils.parseAssigneeId(body.assigneeId);
        }

        if (body?.dueDate !== undefined) {
            fields.dueDate = Generic.parseOptionalDate(body.dueDate, "due date");
        }

        if (body?.repeat !== undefined) {
            fields.repeat = TodosUtils.parseRepeat(body.repeat);
        }

        if (body?.notes !== undefined) {
            fields.notes = Generic.parseOptionalText(body.notes, "notes", 5000);
        }

        if (fields.repeat === null) {
            return fields;
        }

        if (fields.dueDate === null) {
            Generic.throwInvalidParameterException("due date");
        }

        if (fields.done) {
            fields.dueDate = TodosUtils.getNextDueDate(fields.dueDate, fields.repeat, TodosUtils.getToday());
            fields.done = false;
        }

        return fields;
    }

    private static async parseAssigneeId(value: any): Promise<number | null> {
        if (value === null) {
            return null;
        }

        if (!Number.isInteger(value) || (await UsersUtils.getById(value)) === null) {
            Generic.throwInvalidParameterException("assignee");
        }

        return value;
    }

    private static parseRepeat(value: any): TodoRepeat | null {
        if (value === null) {
            return null;
        }

        const every = value?.every;
        const unit = value?.unit;
        if (!Number.isInteger(every) || every < 1 || every > TodosUtils.maxRepeatEvery || !TodosUtils.repeatUnits.includes(unit)) {
            Generic.throwInvalidParameterException("repeat");
        }

        return { every, unit };
    }

    private static shiftDate(isoDate: string, unit: RepeatUnit, amount: number): string {
        if (unit === "year") {
            return TodosUtils.shiftDate(isoDate, "month", amount * 12);
        }

        const [year, month, day] = isoDate.split("-").map(Number);

        if (unit === "month") {
            const daysInTargetMonth = new Date(Date.UTC(year, month + amount, 0)).getUTCDate();
            return TodosUtils.toIsoDate(new Date(Date.UTC(year, month - 1 + amount, Math.min(day, daysInTargetMonth))));
        }

        let days = amount;
        if (unit === "week") {
            days = amount * 7;
        }

        return TodosUtils.toIsoDate(new Date(Date.UTC(year, month - 1, day + days)));
    }

    private static toIsoDate(utcDate: Date): string {
        return utcDate.toISOString().slice(0, 10);
    }

    private static getToday(): string {
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        return `${now.getFullYear()}-${month}-${day}`;
    }

    private static toColumnValues(fields: TodoFields): any[] {
        let repeatEvery: number | null = null;
        let repeatUnit: RepeatUnit | null = null;
        if (fields.repeat !== null) {
            repeatEvery = fields.repeat.every;
            repeatUnit = fields.repeat.unit;
        }

        return [fields.title, fields.listName, fields.done ? 1 : 0, fields.assigneeId, fields.dueDate, repeatEvery, repeatUnit, fields.notes];
    }

    private static toTodo(row: any): Todo {
        let repeat: TodoRepeat | null = null;
        if (row.t_repeat_every !== null) {
            repeat = { every: row.t_repeat_every, unit: row.t_repeat_unit };
        }

        return {
            id: row.t_id,
            title: row.t_title,
            listName: row.t_list_name,
            done: row.t_done === 1,
            assigneeId: row.t_assignee_id,
            dueDate: row.t_due_date,
            repeat,
            notes: row.t_notes,
            createdAt: row.t_created_at,
            updatedAt: row.t_updated_at
        };
    }
}
