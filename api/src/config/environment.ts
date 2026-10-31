import path from "path";

export default {
    serviceName: process.env.SERVICE_NAME || "Ninho",
    production: process.env.NODE_ENV === "production",
    port: parseInt(process.env.PORT || "3000"),
    webDistPath: process.env.WEB_DIST_PATH || path.resolve(__dirname, "../../../web/dist")
};
