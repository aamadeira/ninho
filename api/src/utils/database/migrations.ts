import fs from "fs";
import path from "path";
import databaseConfig from "../../config/database";
import { Generic } from "../generic";
import { DB } from "./db";

export class MigrationsUtils {
    public static run(): void {
        const db = new DB();

        db.runSync(`
        CREATE TABLE IF NOT EXISTS migrations (
            name TEXT PRIMARY KEY,
            applied_at TEXT NOT NULL DEFAULT (${DB.now})
        )
        `);

        const appliedNames: string[] = db.runSync("SELECT m.name AS m_name FROM migrations m").map((row) => row.m_name);

        db.runSync("PRAGMA foreign_keys = OFF");
        try {
            for (const fileName of MigrationsUtils.getMigrationFileNames()) {
                if (appliedNames.includes(fileName)) {
                    continue;
                }

                const script = fs.readFileSync(path.join(databaseConfig.migrationsPath, fileName), "utf8");
                db.runInTransaction(script, () => {
                    MigrationsUtils.assertForeignKeysAreIntact(db, fileName);
                    db.runSync("INSERT INTO migrations (name) VALUES (?)", [fileName]);
                });
                Generic.sendLogToConsole(`MIGRATIONS: applied ${fileName}`);
            }
        } finally {
            db.runSync("PRAGMA foreign_keys = ON");
        }
    }

    private static assertForeignKeysAreIntact(db: DB, fileName: string): void {
        const violations = db.runSync("PRAGMA foreign_key_check");
        if (violations.length > 0) {
            throw new Error(`MIGRATIONS: ${fileName} breaks foreign keys ${JSON.stringify(violations)}`);
        }
    }

    private static getMigrationFileNames(): string[] {
        return fs
            .readdirSync(databaseConfig.migrationsPath)
            .filter((fileName) => fileName.endsWith(".sql"))
            .sort();
    }
}
