import { useState } from "react";
import { Button } from "../../components/Button";
import { PlusIcon } from "../../components/icons/Icons";
import { Notice } from "../../components/Notice";
import { PageHeader } from "../../components/PageHeader";
import { Sheet } from "../../components/Sheet";
import { formatLongDate, getMonthStart, parseIsoDate, todayIsoDate } from "../../lib/dates";
import { useEvents } from "../../lib/queries";
import type { CalendarEvent } from "../../lib/types";
import { EventDetails } from "./EventDetails";
import { EventForm } from "./EventForm";
import { EventList } from "./EventList";
import { MonthGrid } from "./MonthGrid";
import pageStyles from "../Page.module.css";
import styles from "./CalendarPage.module.css";

type SheetState = { mode: "closed" } | { mode: "details"; eventId: number } | { mode: "form"; event?: CalendarEvent; date: string };

const upcomingEventsLimit = 6;

function getSheetTitle(sheet: SheetState, detailsEvent?: CalendarEvent): string {
    if (sheet.mode === "details") {
        return detailsEvent?.title ?? "";
    }

    if (sheet.mode === "form" && sheet.event) {
        return "Edit event";
    }

    return "New event";
}

export function CalendarPage() {
    const eventsQuery = useEvents();
    const [visibleMonth, setVisibleMonth] = useState(() => getMonthStart(new Date()));
    const [selectedDate, setSelectedDate] = useState(todayIsoDate);
    const [sheet, setSheet] = useState<SheetState>({ mode: "closed" });

    const today = todayIsoDate();
    const events = eventsQuery.data ?? [];
    const datesWithEvents = new Set(events.map((event) => event.date));
    const selectedDayEvents = events.filter((event) => event.date === selectedDate);
    const upcomingEvents = events.filter((event) => event.date >= today && event.date !== selectedDate).slice(0, upcomingEventsLimit);

    let detailsEvent: CalendarEvent | undefined;
    if (sheet.mode === "details") {
        detailsEvent = events.find((event) => event.id === sheet.eventId);
    }

    function closeSheet() {
        setSheet({ mode: "closed" });
    }

    function showSavedEvent(savedEvent: CalendarEvent) {
        setSelectedDate(savedEvent.date);
        setVisibleMonth(getMonthStart(parseIsoDate(savedEvent.date)));
        setSheet({ mode: "details", eventId: savedEvent.id });
    }

    const newEventButton = (
        <Button onClick={() => setSheet({ mode: "form", date: selectedDate })}>
            <PlusIcon size={18} />
            New event
        </Button>
    );

    return (
        <>
            <PageHeader title="Calendar" action={newEventButton} />

            {eventsQuery.isError && <Notice>Couldn't load the calendar.</Notice>}

            <MonthGrid month={visibleMonth} selectedDate={selectedDate} datesWithEvents={datesWithEvents} onSelectDate={setSelectedDate} onChangeMonth={setVisibleMonth} />

            <section>
                <h2 className={pageStyles.sectionTitle}>{selectedDate === today ? `Today, ${formatLongDate(selectedDate)}` : formatLongDate(selectedDate)}</h2>
                {selectedDayEvents.length > 0 && <EventList events={selectedDayEvents} onOpen={(event) => setSheet({ mode: "details", eventId: event.id })} />}
                {selectedDayEvents.length === 0 && (
                    <div className={styles.freeDay}>
                        <p className={pageStyles.muted}>Nothing planned.</p>
                        <Button variant="secondary" onClick={() => setSheet({ mode: "form", date: selectedDate })}>
                            <PlusIcon size={18} />
                            Add to this day
                        </Button>
                    </div>
                )}
            </section>

            {upcomingEvents.length > 0 && (
                <section>
                    <h2 className={pageStyles.sectionTitle}>Coming up</h2>
                    <EventList events={upcomingEvents} showDates onOpen={(event) => setSheet({ mode: "details", eventId: event.id })} />
                </section>
            )}

            <Sheet title={getSheetTitle(sheet, detailsEvent)} isOpen={sheet.mode !== "closed"} onClose={closeSheet}>
                {sheet.mode === "details" && detailsEvent && (
                    <EventDetails event={detailsEvent} onEdit={() => setSheet({ mode: "form", event: detailsEvent, date: detailsEvent.date })} onDeleted={closeSheet} />
                )}
                {sheet.mode === "form" && <EventForm key={sheet.event?.id ?? sheet.date} event={sheet.event} initialDate={sheet.date} onSaved={showSavedEvent} onCancel={closeSheet} />}
            </Sheet>
        </>
    );
}
