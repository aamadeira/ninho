const locale = "en-GB";

function padNumber(value: number): string {
    return String(value).padStart(2, "0");
}

export function toIsoDate(date: Date): string {
    return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}`;
}

export function todayIsoDate(): string {
    return toIsoDate(new Date());
}

export function addDays(isoDate: string, amount: number): string {
    const date = parseIsoDate(isoDate);
    return toIsoDate(new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount));
}

export function parseIsoDate(isoDate: string): Date {
    const [year, month, day] = isoDate.split("-").map(Number);
    return new Date(year, month - 1, day);
}

export function getMonthStart(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(monthStart: Date, amount: number): Date {
    return new Date(monthStart.getFullYear(), monthStart.getMonth() + amount, 1);
}

export function formatMonth(monthStart: Date): string {
    return monthStart.toLocaleDateString(locale, { month: "long", year: "numeric" });
}

export function formatLongDate(isoDate: string): string {
    return parseIsoDate(isoDate).toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" });
}

export function formatShortDate(isoDate: string): string {
    return parseIsoDate(isoDate).toLocaleDateString(locale, { weekday: "short", day: "numeric", month: "short" });
}

export function formatWeekday(isoDate: string): string {
    return parseIsoDate(isoDate).toLocaleDateString(locale, { weekday: "long" });
}

export function formatTimeRange(startTime: string | null, endTime: string | null): string {
    if (!startTime) {
        return "All day";
    }

    if (!endTime) {
        return startTime;
    }

    return `${startTime}–${endTime}`;
}

export function getMonthDays(monthStart: Date): string[] {
    const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();

    const days: string[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
        days.push(toIsoDate(new Date(monthStart.getFullYear(), monthStart.getMonth(), day)));
    }

    return days;
}

export function getLeadingBlankDays(monthStart: Date): number {
    const sundayBasedWeekday = monthStart.getDay();
    return (sundayBasedWeekday + 6) % 7;
}

export const weekdayInitials = ["M", "T", "W", "T", "F", "S", "S"];
