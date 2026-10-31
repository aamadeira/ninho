import express from "express";
import { Generic } from "../../utils/generic";
import { TodoListsUtils } from "../../utils/todoLists/utils";
import { LiveUtils } from "../../utils/live/utils";

const expressRouter = express.Router({ mergeParams: true });

expressRouter.get("/", async (request, response) => {
    try {
        const lists = await TodoListsUtils.getList();
        return Generic.handleSuccessMessage(Generic.generateSuccessfulRequestResponseDetailsMessage(200, { lists }), response);
    } catch (e: any) {
        return Generic.handleExceptionMessage(e.message, response);
    }
});

expressRouter.post("/", async (request, response) => {
    try {
        const list = await TodoListsUtils.add(request.body);
        LiveUtils.broadcast("todos");
        return Generic.handleSuccessMessage(Generic.generateSuccessfulRequestResponseDetailsMessage(201, { list }), response);
    } catch (e: any) {
        return Generic.handleExceptionMessage(e.message, response);
    }
});

expressRouter.delete("/:id", async (request, response) => {
    try {
        const id = Generic.parseIdParameter(request.params.id, "todo list id");
        await TodoListsUtils.delete(id);
        LiveUtils.broadcast("todos");
        return Generic.handleSuccessMessage(Generic.generateResourceDeletedRequestResponseDetailsMessage("todo list"), response);
    } catch (e: any) {
        return Generic.handleExceptionMessage(e.message, response);
    }
});

export const router = expressRouter;
