import express from "express";
import featuresConfig from "./config/features";
import { Generic } from "./utils/generic";
import { UsersUtils } from "./utils/users/utils";
import { SessionUtils } from "./utils/session/utils";

const expressRouter = express.Router();

expressRouter.use(express.json({ limit: "16kb" }));

expressRouter.post("/login", async (request, response) => {
    try {
        const user = await UsersUtils.getByCredentials(request.body?.name, request.body?.password);
        if (!user) {
            Generic.throwException("INVALID-CREDENTIALS", "Wrong name or password.", {}, 401);
        }

        await SessionUtils.start(response, user);
        return Generic.handleSuccessMessage(Generic.generateSuccessfulRequestResponseDetailsMessage(200, { user }), response);
    } catch (e: any) {
        return Generic.handleExceptionMessage(e.message, response);
    }
});

expressRouter.post("/logout", async (request, response) => {
    try {
        await SessionUtils.end(request, response);
        return Generic.handleSuccessMessage(Generic.generateSuccessfulRequestResponseDetailsMessage(200, {}), response);
    } catch (e: any) {
        return Generic.handleExceptionMessage(e.message, response);
    }
});

expressRouter.get("/features", async (request, response) => {
    try {
        return Generic.handleSuccessMessage(Generic.generateSuccessfulRequestResponseDetailsMessage(200, { features: featuresConfig.enabled }), response);
    } catch (e: any) {
        return Generic.handleExceptionMessage(e.message, response);
    }
});

expressRouter.get("/setup", async (request, response) => {
    try {
        const needsSetup = await UsersUtils.needsSetup();
        return Generic.handleSuccessMessage(Generic.generateSuccessfulRequestResponseDetailsMessage(200, { needsSetup }), response);
    } catch (e: any) {
        return Generic.handleExceptionMessage(e.message, response);
    }
});

expressRouter.post("/setup", async (request, response) => {
    try {
        const user = await UsersUtils.setUp(request.body);
        await SessionUtils.start(response, user);
        return Generic.handleSuccessMessage(Generic.generateSuccessfulRequestResponseDetailsMessage(201, { user }), response);
    } catch (e: any) {
        return Generic.handleExceptionMessage(e.message, response);
    }
});

export const router = expressRouter;
