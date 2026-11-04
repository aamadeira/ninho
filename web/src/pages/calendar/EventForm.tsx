import { useState, type FormEvent } from "react";
import { Button } from "../../components/Button";
import { Notice } from "../../components/Notice";
import { TextAreaField } from "../../components/TextAreaField";
import { TextField } from "../../components/TextField";
import { getErrorMessage } from "../../lib/api";
import { useSaveEvent } from "../../lib/queries";
import type { CalendarEvent } from "../../lib/types";
import { useTranslation } from "../../lib/i18n";
import styles from "../Form.module.css";

interface EventFormProps {
    event?: CalendarEvent;
    initialDate: string;
    onSaved: (event: CalendarEvent) => void;
    onCancel: () => void;
}

export function EventForm({ event, initialDate, onSaved, onCancel }: EventFormProps) {
    const { t } = useTranslation();
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
            <TextField label={t("common.what")} placeholder={t("calendar.whatPlaceholder")} value={title} onChange={(changeEvent) => setTitle(changeEvent.target.value)} maxLength={120} required data-autofocus={event ? undefined : true} />
            <TextField label={t("calendar.day")} type="date" value={date} onChange={(changeEvent) => setDate(changeEvent.target.value)} required />
            <div className={styles.row}>
                <TextField label={t("calendar.starts")} type="time" value={startTime} onChange={(changeEvent) => changeStartTime(changeEvent.target.value)} />
                <TextField label={t("calendar.ends")} type="time" value={endTime} onChange={(changeEvent) => setEndTime(changeEvent.target.value)} disabled={!startTime} />
            </div>
            <p className={styles.hint}>{t("calendar.timesHint")}</p>
            <TextField label={t("calendar.where")} placeholder={t("common.optional")} value={location} onChange={(changeEvent) => setLocation(changeEvent.target.value)} maxLength={200} />
            <TextAreaField label={t("common.notes")} placeholder={t("common.optional")} rows={3} value={notes} onChange={(changeEvent) => setNotes(changeEvent.target.value)} />

            {saveEvent.isError && <Notice>{getErrorMessage(saveEvent.error, t)}</Notice>}

            <div className={styles.actions}>
                <Button variant="ghost" onClick={onCancel}>
                    {t("common.cancel")}
                </Button>
                <Button type="submit" disabled={saveEvent.isPending}>
                    {saveEvent.isPending ? t("common.saving") : t("calendar.save")}
                </Button>
            </div>
        </form>
    );
}
