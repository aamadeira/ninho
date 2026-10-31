import { test } from "node:test";
import assert from "node:assert/strict";
import { TodosUtils } from "./utils";

test("done on time moves a chore one interval ahead and keeps its weekday", () => {
    assert.equal(TodosUtils.getNextDueDate("2026-11-01", { every: 2, unit: "week" }, "2026-11-01"), "2026-11-15");
    assert.equal(TodosUtils.getNextDueDate("2026-11-01", { every: 1, unit: "day" }, "2026-11-01"), "2026-11-02");
});

test("done late skips the missed dates and stays on schedule", () => {
    assert.equal(TodosUtils.getNextDueDate("2026-11-01", { every: 2, unit: "week" }, "2026-11-20"), "2026-11-29");
    assert.equal(TodosUtils.getNextDueDate("2026-11-01", { every: 1, unit: "week" }, "2026-11-08"), "2026-11-15");
});

test("done early moves to the next date after the current one", () => {
    assert.equal(TodosUtils.getNextDueDate("2026-11-15", { every: 2, unit: "week" }, "2026-11-10"), "2026-11-29");
});

test("months keep the day and clamp to shorter months, also across years and DST", () => {
    assert.equal(TodosUtils.getNextDueDate("2026-01-31", { every: 1, unit: "month" }, "2026-01-31"), "2026-02-28");
    assert.equal(TodosUtils.getNextDueDate("2026-01-31", { every: 1, unit: "month" }, "2026-03-01"), "2026-03-31");
    assert.equal(TodosUtils.getNextDueDate("2026-11-15", { every: 3, unit: "month" }, "2026-11-15"), "2027-02-15");
    assert.equal(TodosUtils.getNextDueDate("2026-03-28", { every: 1, unit: "day" }, "2026-03-28"), "2026-03-29");
});

test("years move the same date and clamp leap days", () => {
    assert.equal(TodosUtils.getNextDueDate("2026-11-15", { every: 1, unit: "year" }, "2026-11-15"), "2027-11-15");
    assert.equal(TodosUtils.getNextDueDate("2028-02-29", { every: 1, unit: "year" }, "2028-02-29"), "2029-02-28");
});
