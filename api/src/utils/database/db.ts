import fs from "fs";
import path from "path";
import { DatabaseSync } from "node:sqlite";
import databaseConfig from "../../config/database";
import { Generic } from "../generic";

export class DB {
    public static readonly now: string = "strftime('%Y-%m-%dT%H:%M:%fZ', 'now')";
    private static sharedConnection: DatabaseSync | null = null;
    private readonly connection: DatabaseSync;

    constructor() {
        if (DB.sharedConnection === null) {
            fs.mkdirSync(path.dirname(databaseConfig.path), { recursive: true });
            DB.sharedConnection = new DatabaseSync(databaseConfig.path);
            DB.sharedConnection.exec("PRAGMA journal_mode = WAL");
            DB.sharedConnection.exec("PRAGMA foreign_keys = ON");
        }

        this.connection = DB.sharedConnection;
    }

    public async fetch(query: string, parameters: any[] = []): Promise<any[]> {
        try {
            return this.connection.prepare(query).all(...parameters);
        } catch (e: any) {
            Generic.sendLogToConsole(`DB_QUERY_ERROR ${e.message}, query: ${query.replace(/\s+/g, " ").trim()}`);
            return Generic.throwUnexpectedErrorException();
        }
    }

    public runInTransaction(script: string, afterScript: () => void): void {
        this.connection.exec("BEGIN");
        try {
            this.connection.exec(script);
            afterScript();
            this.connection.exec("COMMIT");
        } catch (e) {
            this.connection.exec("ROLLBACK");
            throw e;
        }
    }

    public runSync(query: string, parameters: any[] = []): any[] {
        return this.connection.prepare(query).all(...parameters);
    }

    public static close(): void {
        if (DB.sharedConnection === null) {
            return;
        }

        DB.sharedConnection.close();
        DB.sharedConnection = null;
    }
}
