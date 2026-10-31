import { ChevronLeftIcon, ChevronRightIcon } from "../../components/icons/Icons";
import { addMonths, formatLongDate, formatMonth, getLeadingBlankDays, getMonthDays, getMonthStart, todayIsoDate, weekdayInitials } from "../../lib/dates";
import styles from "./MonthGrid.module.css";

interface MonthGridProps {
    month: Date;
    selectedDate: string;
    datesWithEvents: Set<string>;
    onSelectDate: (date: string) => void;
    onChangeMonth: (month: Date) => void;
}

export function MonthGrid({ month, selectedDate, datesWithEvents, onSelectDate, onChangeMonth }: MonthGridProps) {
    const today = todayIsoDate();
    const leadingBlankDays = Array.from({ length: getLeadingBlankDays(month) }, (_, index) => index);

    function goToToday() {
        onChangeMonth(getMonthStart(new Date()));
        onSelectDate(today);
    }

    function getDayClassName(date: string): string {
        const classNames = [styles.day];
        if (date === today) {
            classNames.push(styles.today);
        }
        if (date === selectedDate) {
            classNames.push(styles.selected);
        }
        return classNames.join(" ");
    }

    return (
        <section className={styles.calendar} aria-label="Month">
            <header className={styles.header}>
                <h2 className={styles.month} aria-live="polite">
                    {formatMonth(month)}
                </h2>
                <button type="button" className={styles.todayButton} onClick={goToToday}>
                    Today
                </button>
                <button type="button" className={styles.navButton} aria-label="Previous month" onClick={() => onChangeMonth(addMonths(month, -1))}>
                    <ChevronLeftIcon />
                </button>
                <button type="button" className={styles.navButton} aria-label="Next month" onClick={() => onChangeMonth(addMonths(month, 1))}>
                    <ChevronRightIcon />
                </button>
            </header>

            <div className={styles.grid}>
                {weekdayInitials.map((initial, index) => (
                    <span key={index} className={styles.weekday} aria-hidden="true">
                        {initial}
                    </span>
                ))}
                {leadingBlankDays.map((blankDay) => (
                    <span key={`blank-${blankDay}`} />
                ))}
                {getMonthDays(month).map((date) => {
                    const hasEvents = datesWithEvents.has(date);
                    return (
                        <button
                            key={date}
                            type="button"
                            className={getDayClassName(date)}
                            aria-pressed={date === selectedDate}
                            aria-current={date === today ? "date" : undefined}
                            aria-label={hasEvents ? `${formatLongDate(date)}, has events` : formatLongDate(date)}
                            onClick={() => onSelectDate(date)}
                        >
                            {Number(date.slice(8))}
                            {hasEvents && <span className={styles.dot} aria-hidden="true" />}
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
