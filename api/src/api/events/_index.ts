import express from "express";
import { Generic } from "../../utils/generic";
import { EventsUtils } from "../../utils/events/utils";
import { CalendarExportUtils } from "../../utils/calendarExport/utils";
import { LiveUtils } from "../../utils/live/utils";

const expressRouter = express.Router({ mergeParams: true });

expressRouter.get("/", async (request, response) => {
    try {
        const events = await EventsUtils.getList();
        return Generic.handleSuccessMessage(Generic.generateSuccessfulRequestResponseDetailsMessage(200, { events }), response);
    } catch (e: any) {
        return Generic.handleExceptionMessage(e.message, response);
    }
});

expressRouter.post("/", async (request, response) => {
    try {
        const event = await EventsUtils.add(request.body);
        LiveUtils.broadcast("events");
        return Generic.handleSuccessMessage(Generic.generateSuccessfulRequestResponseDetailsMessage(201, { event }), response);
    } catch (e: any) {
        return Generic.handleExceptionMessage(e.message, response);
    }
});

expressRouter.get("/:id/calendar.ics", async (request, response) => {
    try {
        const id = Generic.parseIdParameter(request.params.id, "event id");
        const event = await EventsUtils.getByIdOrThrow(id);
        response.set("Content-Type", "text/calendar; charset=utf-8");
        response.set("Content-Disposition", `inline; filename="ninho-event-${event.id}.ics"`);
        return response.send(CalendarExportUtils.getIcs(event));
    } catch (e: any) {
        return Generic.handleExceptionMessage(e.message, response);
    }
});

expressRouter.get("/:id/google-calendar", async (request, response) => {
    try {
        const id = Generic.parseIdParameter(request.params.id, "event id");
        const event = await EventsUtils.getByIdOrThrow(id);
        return response.redirect(CalendarExportUtils.getGoogleCalendarUrl(event));
    } catch (e: any) {
        return Generic.handleExceptionMessage(e.message, response);
    }
});

expressRouter.put("/:id", async (request, response) => {
    try {
        const id = Generic.parseIdParameter(request.params.id, "event id");
        const event = await EventsUtils.update(id, request.body);
        LiveUtils.broadcast("events");
        return Generic.handleSuccessMessage(Generic.generateSuccessfulRequestResponseDetailsMessage(200, { event }), response);
    } catch (e: any) {
        return Generic.handleExceptionMessage(e.message, response);
    }
});

expressRouter.delete("/:id", async (request, response) => {
    try {
        const id = Generic.parseIdParameter(request.params.id, "event id");
        await EventsUtils.delete(id);
        LiveUtils.broadcast("events");
        return Generic.handleSuccessMessage(Generic.generateResourceDeletedRequestResponseDetailsMessage("event"), response);
    } catch (e: any) {
        return Generic.handleExceptionMessage(e.message, response);
    }
});

export const router = expressRouter;
