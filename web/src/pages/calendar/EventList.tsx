import { formatShortDate, formatTimeRange } from "../../lib/dates";
import type { CalendarEvent } from "../../lib/types";
import { useTranslation } from "../../lib/i18n";
import styles from "./EventList.module.css";

interface EventListProps {
    events: CalendarEvent[];
    showDates?: boolean;
    onOpen: (event: CalendarEvent) => void;
}

export function EventList({ events, showDates = false, onOpen }: EventListProps) {
    const { t, locale } = useTranslation();

    return (
        <ul className={styles.list}>
            {events.map((event) => (
                <li key={event.id}>
                    <button type="button" className={styles.event} onClick={() => onOpen(event)}>
                        <span className={styles.when}>
                            {showDates && <span className={styles.date}>{formatShortDate(event.date, locale)}</span>}
                            <span className={styles.time}>{formatTimeRange(event.startTime, event.endTime, t)}</span>
                        </span>
                        <span className={styles.body}>
                            <span className={styles.title}>{event.title}</span>
                            {event.location && <span className={styles.location}>{event.location}</span>}
                        </span>
                    </button>
                </li>
            ))}
        </ul>
    );
}
