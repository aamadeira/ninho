import { addDays, formatShortDate, formatWeekday } from "../../lib/dates";
import type { RepeatUnit, TodoRepeat } from "../../lib/types";

export const repeatUnits: RepeatUnit[] = ["day", "week", "month", "year"];

export function describeUnit(unit: RepeatUnit, every: number): string {
    if (every === 1) {
        return unit;
    }

    return `${unit}s`;
}

export function describeInterval(repeat: TodoRepeat): string {
    if (repeat.every === 1) {
        return `Every ${repeat.unit}`;
    }

    return `Every ${repeat.every} ${describeUnit(repeat.unit, repeat.every)}`;
}

export function describeRepeat(repeat: TodoRepeat, dueDate: string | null): string {
    if (repeat.unit !== "week" || dueDate === null) {
        return describeInterval(repeat);
    }

    const weekday = formatWeekday(dueDate);
    if (repeat.every === 1) {
        return `Every ${weekday}`;
    }

    return `${describeInterval(repeat)} on ${weekday}`;
}

export function describeDueDate(dueDate: string, today: string): string {
    if (dueDate === today) {
        return "Today";
    }

    if (dueDate === addDays(today, 1)) {
        return "Tomorrow";
    }

    if (dueDate === addDays(today, -1)) {
        return "Since yesterday";
    }

    if (dueDate < today) {
        return `Since ${formatShortDate(dueDate)}`;
    }

    return formatShortDate(dueDate);
}

export function describeSchedule(repeat: TodoRepeat | null, dueDate: string): string {
    if (repeat !== null && dueDate) {
        return `${describeRepeat(repeat, dueDate)}. Ticking it off moves it to the next time.`;
    }

    if (dueDate) {
        return `It shows up in the list on ${formatShortDate(dueDate)}.`;
    }

    return "Without a date it stays in the list until it's done.";
}
