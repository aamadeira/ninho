import { Generic } from "../generic";
import { DB } from "../database/db";

export interface CalendarEvent {
    id: number;
    title: string;
    date: string;
    startTime: string | null;
    endTime: string | null;
    location: string | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
}

interface CalendarEventFields {
    title: string;
    date: string;
    startTime: string | null;
    endTime: string | null;
    location: string | null;
    notes: string | null;
}

export class EventsUtils {
    private static readonly timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

    public static async getList(): Promise<CalendarEvent[]> {
        const query = `
        SELECT
            e.id AS e_id,
            e.title AS e_title,
            e.date AS e_date,
            e.start_time AS e_start_time,
            e.end_time AS e_end_time,
            e.location AS e_location,
            e.notes AS e_notes,
            e.created_at AS e_created_at,
            e.updated_at AS e_updated_at
        FROM
            events e
        ORDER BY
            e.date ASC,
            e.start_time ASC
        `;

        const rows = await new DB().fetch(query);

        const list: CalendarEvent[] = [];
        for (const row of rows) {
            list.push(EventsUtils.toCalendarEvent(row));
        }

        return list;
    }

    public static async getByIdOrThrow(id: number): Promise<CalendarEvent> {
        const query = `
        SELECT
            e.id AS e_id,
            e.title AS e_title,
            e.date AS e_date,
            e.start_time AS e_start_time,
            e.end_time AS e_end_time,
            e.location AS e_location,
            e.notes AS e_notes,
            e.created_at AS e_created_at,
            e.updated_at AS e_updated_at
        FROM
            events e
        WHERE
            e.id = ?
        `;

        const rows = await new DB().fetch(query, [id]);
        if (rows.length === 0) {
            throw Generic.buildNotFoundException("event", { id });
        }

        return EventsUtils.toCalendarEvent(rows[0]);
    }

    public static async add(body: any): Promise<CalendarEvent> {
        const fields = EventsUtils.parseFields(body);

        const query = `
        INSERT INTO events (title, date, start_time, end_time, location, notes)
        VALUES (?, ?, ?, ?, ?, ?)
        RETURNING id
        `;

        const rows = await new DB().fetch(query, [fields.title, fields.date, fields.startTime, fields.endTime, fields.location, fields.notes]);
        return EventsUtils.getByIdOrThrow(rows[0].id);
    }

    public static async update(id: number, body: any): Promise<CalendarEvent> {
        const fields = EventsUtils.parseFields(body);

        const query = `
        UPDATE events SET
            title = ?,
            date = ?,
            start_time = ?,
            end_time = ?,
            location = ?,
            notes = ?,
            updated_at = ${DB.now}
        WHERE
            id = ?
        RETURNING id
        `;

        const rows = await new DB().fetch(query, [fields.title, fields.date, fields.startTime, fields.endTime, fields.location, fields.notes, id]);
        if (rows.length === 0) {
            throw Generic.buildNotFoundException("event", { id });
        }

        return EventsUtils.getByIdOrThrow(id);
    }

    public static async delete(id: number): Promise<void> {
        const rows = await new DB().fetch("DELETE FROM events WHERE id = ? RETURNING id", [id]);
        if (rows.length === 0) {
            throw Generic.buildNotFoundException("event", { id });
        }
    }

    private static parseFields(body: any): CalendarEventFields {
        const startTime = EventsUtils.parseTime(body?.startTime, "start time");
        const endTime = EventsUtils.parseTime(body?.endTime, "end time");

        if (endTime !== null && (startTime === null || endTime <= startTime)) {
            Generic.throwInvalidParameterException("end time");
        }

        return {
            title: Generic.parseRequiredText(body?.title, "title", 120),
            date: Generic.parseDate(body?.date, "date"),
            startTime,
            endTime,
            location: Generic.parseOptionalText(body?.location, "location", 200),
            notes: Generic.parseOptionalText(body?.notes, "notes", 5000)
        };
    }

    private static parseTime(value: any, name: string): string | null {
        if (value === undefined || value === null || value === "") {
            return null;
        }

        if (typeof value !== "string" || !EventsUtils.timePattern.test(value)) {
            Generic.throwInvalidParameterException(name);
        }

        return value;
    }

    private static toCalendarEvent(row: any): CalendarEvent {
        return {
            id: row.e_id,
            title: row.e_title,
            date: row.e_date,
            startTime: row.e_start_time,
            endTime: row.e_end_time,
            location: row.e_location,
            notes: row.e_notes,
            createdAt: row.e_created_at,
            updatedAt: row.e_updated_at
        };
    }
}
