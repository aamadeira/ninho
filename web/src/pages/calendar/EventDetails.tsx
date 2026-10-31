import { Button, ButtonLink } from "../../components/Button";
import { DeleteButton } from "../../components/DeleteButton";
import { CalendarIcon, ClockIcon, ExternalIcon, PencilIcon, PinIcon } from "../../components/icons/Icons";
import { formatLongDate, formatTimeRange } from "../../lib/dates";
import { useDeleteEvent } from "../../lib/queries";
import type { CalendarEvent } from "../../lib/types";
import styles from "./EventDetails.module.css";

interface EventDetailsProps {
    event: CalendarEvent;
    onEdit: () => void;
    onDeleted: () => void;
}

export function EventDetails({ event, onEdit, onDeleted }: EventDetailsProps) {
    const deleteEvent = useDeleteEvent();

    return (
        <div className={styles.details}>
            <ul className={styles.facts}>
                <li>
                    <CalendarIcon size={18} />
                    {formatLongDate(event.date)}
                </li>
                <li>
                    <ClockIcon size={18} />
                    {formatTimeRange(event.startTime, event.endTime)}
                </li>
                {event.location && (
                    <li>
                        <PinIcon size={18} />
                        {event.location}
                    </li>
                )}
            </ul>

            {event.notes && <p className={styles.notes}>{event.notes}</p>}

            <div className={styles.exports}>
                <p className={styles.exportsLabel}>Put it in your own calendar</p>
                <ButtonLink variant="secondary" href={`/api/events/${event.id}/google-calendar`} external>
                    Google Calendar
                    <ExternalIcon size={16} />
                </ButtonLink>
                <ButtonLink variant="secondary" href={`/api/events/${event.id}/calendar.ics`}>
                    Apple Calendar
                    <ExternalIcon size={16} />
                </ButtonLink>
            </div>

            <div className={styles.actions}>
                <DeleteButton isPending={deleteEvent.isPending} onConfirm={() => deleteEvent.mutate(event.id, { onSuccess: onDeleted })} />
                <Button variant="secondary" onClick={onEdit}>
                    <PencilIcon size={18} />
                    Edit
                </Button>
            </div>
        </div>
    );
}
