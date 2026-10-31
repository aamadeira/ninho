import express from "express";
import { Generic } from "../utils/generic";
import { router as usersRouter } from "./users/_index";
import { router as todosRouter } from "./todos/_index";
import { router as todoListsRouter } from "./todoLists/_index";
import { router as shoppingRouter } from "./shopping/_index";
import { router as recipesRouter } from "./recipes/_index";
import { router as eventsRouter } from "./events/_index";
import { router as liveRouter } from "./live/_index";
import { router as imagesRouter } from "./images/_index";

const expressRouter = express.Router();

expressRouter.use(Generic.requireAuth);
expressRouter.use(express.json({ limit: "8mb" }));

expressRouter.use("/users", usersRouter);
expressRouter.use("/todos", todosRouter);
expressRouter.use("/todo-lists", todoListsRouter);
expressRouter.use("/shopping", shoppingRouter);
expressRouter.use("/recipes", recipesRouter);
expressRouter.use("/events", eventsRouter);
expressRouter.use("/live", liveRouter);
expressRouter.use("/images", imagesRouter);

expressRouter.use((request, response) => Generic.handleExceptionMessage(Generic.generateNotFoundRequestResponseDetailsMessage(), response));

export const router = expressRouter;
