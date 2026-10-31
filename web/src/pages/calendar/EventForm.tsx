import { useState, type FormEvent } from "react";
import { Button } from "../../components/Button";
import { Notice } from "../../components/Notice";
import { TextAreaField } from "../../components/TextAreaField";
import { TextField } from "../../components/TextField";
import { getErrorMessage } from "../../lib/api";
import { useSaveEvent } from "../../lib/queries";
import type { CalendarEvent } from "../../lib/types";
import styles from "../Form.module.css";

interface EventFormProps {
    event?: CalendarEvent;
    initialDate: string;
    onSaved: (event: CalendarEvent) => void;
    onCancel: () => void;
}

export function EventForm({ event, initialDate, onSaved, onCancel }: EventFormProps) {
    const saveEvent = useSaveEvent();
    const [title, setTitle] = useState(event?.title ?? "");
    const [date, setDate] = useState(event?.date ?? initialDate);
    const [startTime, setStartTime] = useState(event?.startTime ?? "");
    const [endTime, setEndTime] = useState(event?.endTime ?? "");
    const [location, setLocation] = useState(event?.location ?? "");
    const [notes, setNotes] = useState(event?.notes ?? "");

    function changeStartTime(value: string) {
        setStartTime(value);
        if (!value) {
            setEndTime("");
        }
    }

    function submit(formEvent: FormEvent<HTMLFormElement>) {
        formEvent.preventDefault();
        saveEvent.mutate({ id: event?.id, event: { title, date, startTime, endTime, location, notes } }, { onSuccess: onSaved });
    }

    return (
        <form className={styles.form} onSubmit={submit}>
            <TextField label="What" placeholder="Dinner at your parents'" value={title} onChange={(changeEvent) => setTitle(changeEvent.target.value)} maxLength={120} required data-autofocus={event ? undefined : true} />
            <TextField label="Day" type="date" value={date} onChange={(changeEvent) => setDate(changeEvent.target.value)} required />
            <div className={styles.row}>
                <TextField label="Starts" type="time" value={startTime} onChange={(changeEvent) => changeStartTime(changeEvent.target.value)} />
                <TextField label="Ends" type="time" value={endTime} onChange={(changeEvent) => setEndTime(changeEvent.target.value)} disabled={!startTime} />
            </div>
            <p className={styles.hint}>Leave the times empty for an all-day event.</p>
            <TextField label="Where" placeholder="Optional" value={location} onChange={(changeEvent) => setLocation(changeEvent.target.value)} maxLength={200} />
            <TextAreaField label="Notes" placeholder="Optional" rows={3} value={notes} onChange={(changeEvent) => setNotes(changeEvent.target.value)} />

            {saveEvent.isError && <Notice>{getErrorMessage(saveEvent.error)}</Notice>}

            <div className={styles.actions}>
                <Button variant="ghost" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={saveEvent.isPending}>
                    {saveEvent.isPending ? "Saving…" : "Save event"}
                </Button>
            </div>
        </form>
    );
}
