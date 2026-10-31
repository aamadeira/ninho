import express from "express";
import { LiveUtils } from "../../utils/live/utils";

const expressRouter = express.Router({ mergeParams: true });

expressRouter.get("/", (request, response) => {
    LiveUtils.subscribe(request, response);
});

export const router = expressRouter;
