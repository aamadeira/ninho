import { test } from "node:test";
import assert from "node:assert/strict";
import { CalendarExportUtils } from "./utils";
import { CalendarEvent } from "../events/utils";

function buildEvent(fields: Partial<CalendarEvent>): CalendarEvent {
    return {
        id: 7,
        title: "Dinner",
        date: "2026-11-05",
        startTime: null,
        endTime: null,
        location: null,
        notes: null,
        createdAt: "",
        updatedAt: "",
        ...fields
    };
}

test("all-day events end on the next day, also across years and DST changes", () => {
    assert.deepEqual(CalendarExportUtils.getDateRange(buildEvent({ date: "2026-12-31" })), { start: "20261231", end: "20270101", isAllDay: true });
    assert.deepEqual(CalendarExportUtils.getDateRange(buildEvent({ date: "2026-03-29" })), { start: "20260329", end: "20260330", isAllDay: true });
});

test("timed events default to one hour and can cross midnight", () => {
    assert.deepEqual(CalendarExportUtils.getDateRange(buildEvent({ startTime: "18:00" })), { start: "20261105T180000", end: "20261105T190000", isAllDay: false });
    assert.deepEqual(CalendarExportUtils.getDateRange(buildEvent({ startTime: "23:30" })), { start: "20261105T233000", end: "20261106T003000", isAllDay: false });
    assert.deepEqual(CalendarExportUtils.getDateRange(buildEvent({ startTime: "09:00", endTime: "10:30" })), { start: "20261105T090000", end: "20261105T103000", isAllDay: false });
});

test("ics escapes text, marks all-day dates and uses CRLF", () => {
    const ics = CalendarExportUtils.getIcs(buildEvent({ title: "Dinner at mom's, bring wine; dessert", notes: "Line 1\nLine 2" }), new Date(Date.UTC(2026, 9, 31, 12, 0, 0)));
    const lines = ics.split("\r\n");

    assert.ok(lines.includes("SUMMARY:Dinner at mom's\\, bring wine\\; dessert"));
    assert.ok(lines.includes("DESCRIPTION:Line 1\\nLine 2"));
    assert.ok(lines.includes("DTSTART;VALUE=DATE:20261105"));
    assert.ok(lines.includes("DTEND;VALUE=DATE:20261106"));
    assert.ok(lines.includes("DTSTAMP:20261031T120000Z"));
});

test("ics folds lines longer than 75 characters", () => {
    const ics = CalendarExportUtils.getIcs(buildEvent({ notes: "a".repeat(200) }));
    for (const line of ics.split("\r\n")) {
        assert.ok(line.length <= 75);
    }
});

test("google calendar link carries the floating dates and details", () => {
    const url = new URL(CalendarExportUtils.getGoogleCalendarUrl(buildEvent({ startTime: "19:30", location: "Porto" })));
    assert.equal(url.searchParams.get("dates"), "20261105T193000/20261105T203000");
    assert.equal(url.searchParams.get("text"), "Dinner");
    assert.equal(url.searchParams.get("location"), "Porto");
});
