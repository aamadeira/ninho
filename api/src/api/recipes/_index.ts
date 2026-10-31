import express from "express";
import { Generic } from "../../utils/generic";
import { RecipesUtils } from "../../utils/recipes/utils";
import { LiveUtils } from "../../utils/live/utils";

const expressRouter = express.Router({ mergeParams: true });

expressRouter.get("/", async (request, response) => {
    try {
        const recipes = await RecipesUtils.getList();
        return Generic.handleSuccessMessage(Generic.generateSuccessfulRequestResponseDetailsMessage(200, { recipes }), response);
    } catch (e: any) {
        return Generic.handleExceptionMessage(e.message, response);
    }
});

expressRouter.post("/", async (request, response) => {
    try {
        const recipe = await RecipesUtils.add(request.body);
        LiveUtils.broadcast("recipes");
        return Generic.handleSuccessMessage(Generic.generateSuccessfulRequestResponseDetailsMessage(201, { recipe }), response);
    } catch (e: any) {
        return Generic.handleExceptionMessage(e.message, response);
    }
});

expressRouter.put("/:id", async (request, response) => {
    try {
        const id = Generic.parseIdParameter(request.params.id, "recipe id");
        const recipe = await RecipesUtils.update(id, request.body);
        LiveUtils.broadcast("recipes");
        return Generic.handleSuccessMessage(Generic.generateSuccessfulRequestResponseDetailsMessage(200, { recipe }), response);
    } catch (e: any) {
        return Generic.handleExceptionMessage(e.message, response);
    }
});

expressRouter.delete("/:id", async (request, response) => {
    try {
        const id = Generic.parseIdParameter(request.params.id, "recipe id");
        await RecipesUtils.delete(id);
        LiveUtils.broadcast("recipes");
        return Generic.handleSuccessMessage(Generic.generateResourceDeletedRequestResponseDetailsMessage("recipe"), response);
    } catch (e: any) {
        return Generic.handleExceptionMessage(e.message, response);
    }
});

export const router = expressRouter;
