import express, { Response } from "express";
import { Generic } from "../../utils/generic";
import { ImagesUtils, ImageSize } from "../../utils/images/utils";

const expressRouter = express.Router({ mergeParams: true });

async function sendImage(idParameter: any, size: ImageSize, response: Response) {
    const id = Generic.parseIdParameter(idParameter, "image id");
    const bytes = await ImagesUtils.getOrThrow(id, size);
    response.set("Content-Type", "image/jpeg");
    response.set("Cache-Control", "private, max-age=31536000, immutable");
    response.set("X-Content-Type-Options", "nosniff");
    return response.send(bytes);
}

expressRouter.get("/:id", async (request, response) => {
    try {
        return await sendImage(request.params.id, "full", response);
    } catch (e: any) {
        return Generic.handleExceptionMessage(e.message, response);
    }
});

expressRouter.get("/:id/thumbnail", async (request, response) => {
    try {
        return await sendImage(request.params.id, "thumbnail", response);
    } catch (e: any) {
        return Generic.handleExceptionMessage(e.message, response);
    }
});

export const router = expressRouter;
