import express from "express";
import { Generic } from "../../utils/generic";
import { TodosUtils } from "../../utils/todos/utils";
import { LiveUtils } from "../../utils/live/utils";

const expressRouter = express.Router({ mergeParams: true });

expressRouter.get("/", async (request, response) => {
    try {
        const todos = await TodosUtils.getList();
        return Generic.handleSuccessMessage(Generic.generateSuccessfulRequestResponseDetailsMessage(200, { todos }), response);
    } catch (e: any) {
        return Generic.handleExceptionMessage(e.message, response);
    }
});

expressRouter.post("/", async (request, response) => {
    try {
        const todo = await TodosUtils.add(request.body);
        LiveUtils.broadcast("todos");
        return Generic.handleSuccessMessage(Generic.generateSuccessfulRequestResponseDetailsMessage(201, { todo }), response);
    } catch (e: any) {
        return Generic.handleExceptionMessage(e.message, response);
    }
});

expressRouter.delete("/done", async (request, response) => {
    try {
        await TodosUtils.deleteDone();
        LiveUtils.broadcast("todos");
        return Generic.handleSuccessMessage(Generic.generateResourceDeletedRequestResponseDetailsMessage("done todos"), response);
    } catch (e: any) {
        return Generic.handleExceptionMessage(e.message, response);
    }
});

expressRouter.patch("/:id", async (request, response) => {
    try {
        const id = Generic.parseIdParameter(request.params.id, "todo id");
        const todo = await TodosUtils.update(id, request.body);
        LiveUtils.broadcast("todos");
        return Generic.handleSuccessMessage(Generic.generateSuccessfulRequestResponseDetailsMessage(200, { todo }), response);
    } catch (e: any) {
        return Generic.handleExceptionMessage(e.message, response);
    }
});

expressRouter.delete("/:id", async (request, response) => {
    try {
        const id = Generic.parseIdParameter(request.params.id, "todo id");
        await TodosUtils.delete(id);
        LiveUtils.broadcast("todos");
        return Generic.handleSuccessMessage(Generic.generateResourceDeletedRequestResponseDetailsMessage("todo"), response);
    } catch (e: any) {
        return Generic.handleExceptionMessage(e.message, response);
    }
});

export const router = expressRouter;
