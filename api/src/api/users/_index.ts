import express from "express";
import { Generic } from "../../utils/generic";
import { UsersUtils } from "../../utils/users/utils";
import { SessionUtils } from "../../utils/session/utils";
import { LiveUtils } from "../../utils/live/utils";

const expressRouter = express.Router({ mergeParams: true });

expressRouter.get("/", async (request, response) => {
    try {
        const users = await UsersUtils.getList();
        return Generic.handleSuccessMessage(Generic.generateSuccessfulRequestResponseDetailsMessage(200, { users }), response);
    } catch (e: any) {
        return Generic.handleExceptionMessage(e.message, response);
    }
});

expressRouter.post("/", async (request, response) => {
    try {
        UsersUtils.getAdminUserOrThrow(request);
        const user = await UsersUtils.add(request.body);
        LiveUtils.broadcast("users");
        return Generic.handleSuccessMessage(Generic.generateSuccessfulRequestResponseDetailsMessage(201, { user }), response);
    } catch (e: any) {
        return Generic.handleExceptionMessage(e.message, response);
    }
});

expressRouter.get("/me", async (request, response) => {
    try {
        const user = UsersUtils.getAuthenticatedUserOrThrow(request);
        return Generic.handleSuccessMessage(Generic.generateSuccessfulRequestResponseDetailsMessage(200, { user }), response);
    } catch (e: any) {
        return Generic.handleExceptionMessage(e.message, response);
    }
});

expressRouter.put("/me/password", async (request, response) => {
    try {
        const user = UsersUtils.getAuthenticatedUserOrThrow(request);
        await UsersUtils.changeOwnPassword(user, request.body);
        await SessionUtils.endAllForUser(user.id);
        await SessionUtils.start(response, user);
        return Generic.handleSuccessMessage(Generic.generateSuccessfulRequestResponseDetailsMessage(200, {}), response);
    } catch (e: any) {
        return Generic.handleExceptionMessage(e.message, response);
    }
});

expressRouter.put("/:id/password", async (request, response) => {
    try {
        const admin = UsersUtils.getAdminUserOrThrow(request);
        const id = Generic.parseIdParameter(request.params.id, "user id");
        if (id === admin.id) {
            Generic.throwInvalidParameterException("user id");
        }

        await UsersUtils.setPassword(id, request.body?.password);
        await SessionUtils.endAllForUser(id);
        return Generic.handleSuccessMessage(Generic.generateSuccessfulRequestResponseDetailsMessage(200, {}), response);
    } catch (e: any) {
        return Generic.handleExceptionMessage(e.message, response);
    }
});

expressRouter.delete("/:id", async (request, response) => {
    try {
        const admin = UsersUtils.getAdminUserOrThrow(request);
        const id = Generic.parseIdParameter(request.params.id, "user id");
        if (id === admin.id) {
            Generic.throwInvalidParameterException("user id");
        }

        await UsersUtils.delete(id);
        LiveUtils.broadcast("users");
        LiveUtils.broadcast("todos");
        return Generic.handleSuccessMessage(Generic.generateResourceDeletedRequestResponseDetailsMessage("user"), response);
    } catch (e: any) {
        return Generic.handleExceptionMessage(e.message, response);
    }
});

export const router = expressRouter;
