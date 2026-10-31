import path from "path";
import express from "express";
import cookieParser from "cookie-parser";
import environment from "./config/environment";
import featuresConfig from "./config/features";
import { Generic } from "./utils/generic";
import { DB } from "./utils/database/db";
import { MigrationsUtils } from "./utils/database/migrations";
import { SessionUtils } from "./utils/session/utils";
import { router as authRouter } from "./auth";
import { router as apiRouter } from "./api/_index";

MigrationsUtils.run();

const app = express();

app.disable("x-powered-by");
app.use(cookieParser());
app.use(SessionUtils.authenticate);

app.use("/auth", authRouter);
app.use("/api", apiRouter);

app.use("/assets", express.static(path.join(environment.webDistPath, "assets"), { immutable: true, maxAge: "1y" }));
app.use(express.static(environment.webDistPath));
app.get("/{*path}", (request, response) => {
    response.sendFile(path.join(environment.webDistPath, "index.html"));
});

app.use((error, request, response, next) => {
    if (error?.type === "entity.parse.failed") {
        return Generic.handleExceptionMessage(Generic.generateInvalidParameterRequestResponseDetailsMessage("request body"), response);
    }

    if (error?.type === "entity.too.large") {
        return Generic.handleExceptionMessage(Generic.generateRequestResponseDetailsMessage(413, "TOO-LARGE", "That's too big to save."), response);
    }

    Generic.sendLogToConsole(`UNEXPECTED-ERROR ${error?.stack ?? error}`);
    return Generic.handleExceptionMessage(Generic.generateUnexpectedErrorRequestResponseDetailsMessage(), response);
});

app.listen(environment.port, () => {
    Generic.sendLogToConsole(`${environment.serviceName} listening on port ${environment.port}!`);
    Generic.sendLogToConsole(`Features: ${featuresConfig.enabled.join(", ")}`);
});

process.on("SIGTERM", () => {
    DB.close();
    process.exit(0);
});

process.on("SIGINT", () => {
    DB.close();
    process.exit(0);
});
