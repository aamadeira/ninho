import express from "express";
import { Generic } from "../../utils/generic";
import { ShoppingUtils } from "../../utils/shopping/utils";
import { LiveUtils } from "../../utils/live/utils";

const expressRouter = express.Router({ mergeParams: true });

expressRouter.get("/", async (request, response) => {
    try {
        const items = await ShoppingUtils.getList();
        return Generic.handleSuccessMessage(Generic.generateSuccessfulRequestResponseDetailsMessage(200, { items }), response);
    } catch (e: any) {
        return Generic.handleExceptionMessage(e.message, response);
    }
});

expressRouter.post("/", async (request, response) => {
    try {
        const item = await ShoppingUtils.add(request.body);
        LiveUtils.broadcast("shopping");
        return Generic.handleSuccessMessage(Generic.generateSuccessfulRequestResponseDetailsMessage(201, { item }), response);
    } catch (e: any) {
        return Generic.handleExceptionMessage(e.message, response);
    }
});

expressRouter.post("/checkout", async (request, response) => {
    try {
        await ShoppingUtils.checkout();
        LiveUtils.broadcast("shopping");
        return Generic.handleSuccessMessage(Generic.generateSuccessfulRequestResponseDetailsMessage(200, {}), response);
    } catch (e: any) {
        return Generic.handleExceptionMessage(e.message, response);
    }
});

expressRouter.patch("/:id", async (request, response) => {
    try {
        const id = Generic.parseIdParameter(request.params.id, "shopping item id");
        const item = await ShoppingUtils.update(id, request.body);
        LiveUtils.broadcast("shopping");
        return Generic.handleSuccessMessage(Generic.generateSuccessfulRequestResponseDetailsMessage(200, { item }), response);
    } catch (e: any) {
        return Generic.handleExceptionMessage(e.message, response);
    }
});

expressRouter.delete("/:id", async (request, response) => {
    try {
        const id = Generic.parseIdParameter(request.params.id, "shopping item id");
        await ShoppingUtils.delete(id);
        LiveUtils.broadcast("shopping");
        return Generic.handleSuccessMessage(Generic.generateResourceDeletedRequestResponseDetailsMessage("shopping item"), response);
    } catch (e: any) {
        return Generic.handleExceptionMessage(e.message, response);
    }
});

export const router = expressRouter;
