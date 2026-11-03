import type { Translate } from "./i18n";

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

function capitalizeFirstLetter(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatMonth(monthStart: Date, locale: string): string {
    const monthName = monthStart.toLocaleDateString(locale, { month: "long" });
    return `${capitalizeFirstLetter(monthName)} ${monthStart.getFullYear()}`;
}

export function formatLongDate(isoDate: string, locale: string): string {
    return parseIsoDate(isoDate).toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" });
}

export function formatShortDate(isoDate: string, locale: string): string {
    return parseIsoDate(isoDate).toLocaleDateString(locale, { weekday: "short", day: "numeric", month: "short" });
}

export function formatTimeRange(startTime: string | null, endTime: string | null, t: Translate): string {
    if (!startTime) {
        return t("calendar.allDay");
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

export function getWeekdayInitials(locale: string): string[] {
    const firstMonday = new Date(2026, 0, 5);
    const initials: string[] = [];
    for (let day = 0; day < 7; day++) {
        const weekday = new Date(firstMonday.getFullYear(), firstMonday.getMonth(), firstMonday.getDate() + day);
        initials.push(weekday.toLocaleDateString(locale, { weekday: "narrow" }));
    }

    return initials;
}
