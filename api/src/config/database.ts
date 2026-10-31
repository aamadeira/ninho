import path from "path";

export default {
    path: process.env.DATABASE_PATH || path.resolve(__dirname, "../../data/ninho.db"),
    migrationsPath: path.resolve(__dirname, "../../migrations")
};
