import { addDays, formatShortDate, parseIsoDate } from "../../lib/dates";
import type { TranslationKey, Translator } from "../../lib/i18n";
import type { RepeatUnit, TodoRepeat } from "../../lib/types";

export const repeatUnits: RepeatUnit[] = ["day", "week", "month", "year"];

const everyWeekdayKeys: TranslationKey[] = [
    "repeat.everySunday",
    "repeat.everyMonday",
    "repeat.everyTuesday",
    "repeat.everyWednesday",
    "repeat.everyThursday",
    "repeat.everyFriday",
    "repeat.everySaturday"
];

const onWeekdayKeys: TranslationKey[] = [
    "repeat.onSunday",
    "repeat.onMonday",
    "repeat.onTuesday",
    "repeat.onWednesday",
    "repeat.onThursday",
    "repeat.onFriday",
    "repeat.onSaturday"
];

export function describeUnit(unit: RepeatUnit, every: number, { t }: Translator): string {
    return t(`repeat.unit.${unit}`, { count: every });
}

export function describeInterval(repeat: TodoRepeat, translator: Translator): string {
    if (repeat.every === 1) {
        return translator.t(`repeat.every.${repeat.unit}`);
    }

    return translator.t("repeat.everyCount", { count: repeat.every, unit: describeUnit(repeat.unit, repeat.every, translator) });
}

export function describeRepeat(repeat: TodoRepeat, dueDate: string | null, translator: Translator): string {
    if (repeat.unit !== "week" || dueDate === null) {
        return describeInterval(repeat, translator);
    }

    const weekday = parseIsoDate(dueDate).getDay();
    if (repeat.every === 1) {
        return translator.t(everyWeekdayKeys[weekday]);
    }

    return translator.t("repeat.intervalOnDay", { interval: describeInterval(repeat, translator), day: translator.t(onWeekdayKeys[weekday]) });
}

export function describeDueDate(dueDate: string, today: string, { t, locale }: Translator): string {
    if (dueDate === today) {
        return t("due.today");
    }

    if (dueDate === addDays(today, 1)) {
        return t("due.tomorrow");
    }

    if (dueDate === addDays(today, -1)) {
        return t("due.sinceYesterday");
    }

    if (dueDate < today) {
        return t("due.since", { date: formatShortDate(dueDate, locale) });
    }

    return formatShortDate(dueDate, locale);
}

export function describeSchedule(repeat: TodoRepeat | null, dueDate: string, translator: Translator): string {
    if (repeat !== null && dueDate) {
        return translator.t("schedule.repeating", { repeat: describeRepeat(repeat, dueDate, translator) });
    }

    if (dueDate) {
        return translator.t("schedule.dated", { date: formatShortDate(dueDate, translator.locale) });
    }

    return translator.t("schedule.undated");
}
