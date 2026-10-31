import { Generic } from "../generic";
import { CalendarEvent } from "../events/utils";

interface CalendarDateRange {
    start: string;
    end: string;
    isAllDay: boolean;
}

export class CalendarExportUtils {
    private static readonly defaultDurationInMilliseconds = 60 * 60 * 1000;
    private static readonly maxIcsLineLength = 74;

    public static getGoogleCalendarUrl(event: CalendarEvent): string {
        const range = CalendarExportUtils.getDateRange(event);
        const parameters = new URLSearchParams({
            action: "TEMPLATE",
            text: event.title,
            dates: `${range.start}/${range.end}`
        });

        if (event.location) {
            parameters.set("location", event.location);
        }

        if (event.notes) {
            parameters.set("details", event.notes);
        }

        return `https://calendar.google.com/calendar/render?${parameters.toString()}`;
    }

    public static getIcs(event: CalendarEvent, now: Date = new Date()): string {
        const range = CalendarExportUtils.getDateRange(event);
        const valueType = range.isAllDay ? ";VALUE=DATE" : "";

        const lines: string[] = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//Ninho//Calendar//EN",
            "BEGIN:VEVENT",
            `UID:event-${event.id}@ninho`,
            `DTSTAMP:${CalendarExportUtils.formatDateTime(now)}Z`,
            `DTSTART${valueType}:${range.start}`,
            `DTEND${valueType}:${range.end}`,
            `SUMMARY:${CalendarExportUtils.escapeText(event.title)}`
        ];

        if (event.location) {
            lines.push(`LOCATION:${CalendarExportUtils.escapeText(event.location)}`);
        }

        if (event.notes) {
            lines.push(`DESCRIPTION:${CalendarExportUtils.escapeText(event.notes)}`);
        }

        lines.push("END:VEVENT", "END:VCALENDAR");

        return `${lines.map((line) => CalendarExportUtils.foldLine(line)).join("\r\n")}\r\n`;
    }

    public static getDateRange(event: CalendarEvent): CalendarDateRange {
        if (!event.startTime) {
            const [year, month, day] = event.date.split("-").map(Number);
            const nextDay = new Date(Date.UTC(year, month - 1, day + 1));
            return {
                start: event.date.split("-").join(""),
                end: CalendarExportUtils.formatDate(nextDay),
                isAllDay: true
            };
        }

        const start = CalendarExportUtils.toFloatingDate(event.date, event.startTime);
        let end = new Date(start.getTime() + CalendarExportUtils.defaultDurationInMilliseconds);
        if (event.endTime) {
            end = CalendarExportUtils.toFloatingDate(event.date, event.endTime);
        }

        return {
            start: CalendarExportUtils.formatDateTime(start),
            end: CalendarExportUtils.formatDateTime(end),
            isAllDay: false
        };
    }

    private static toFloatingDate(date: string, time: string): Date {
        const [year, month, day] = date.split("-").map(Number);
        const [hours, minutes] = time.split(":").map(Number);
        return new Date(Date.UTC(year, month - 1, day, hours, minutes));
    }

    private static formatDate(date: Date): string {
        const year = String(date.getUTCFullYear());
        const month = String(date.getUTCMonth() + 1).padStart(2, "0");
        const day = String(date.getUTCDate()).padStart(2, "0");
        return `${year}${month}${day}`;
    }

    private static formatDateTime(date: Date): string {
        const hours = String(date.getUTCHours()).padStart(2, "0");
        const minutes = String(date.getUTCMinutes()).padStart(2, "0");
        const seconds = String(date.getUTCSeconds()).padStart(2, "0");
        return `${CalendarExportUtils.formatDate(date)}T${hours}${minutes}${seconds}`;
    }

    private static escapeText(text: string): string {
        return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
    }

    private static foldLine(line: string): string {
        const chunks: string[] = [];
        let remaining = line;

        while (remaining.length > CalendarExportUtils.maxIcsLineLength) {
            chunks.push(remaining.slice(0, CalendarExportUtils.maxIcsLineLength));
            remaining = remaining.slice(CalendarExportUtils.maxIcsLineLength);
        }

        chunks.push(remaining);
        return chunks.join("\r\n ");
    }
}
