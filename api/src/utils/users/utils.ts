import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { Request } from "express";
import { Generic } from "../generic";
import { DB } from "../database/db";

export interface User {
    id: number;
    name: string;
    isAdmin: boolean;
    createdAt: string;
    updatedAt: string;
}

type AuthenticatedUser = User;

declare global {
    namespace Express {
        interface Request {
            user?: AuthenticatedUser;
        }
    }
}

export class UsersUtils {
    private static readonly passwordKeyLength = 64;
    private static readonly minimumPasswordLength = 8;
    private static readonly maximumPasswordLength = 200;

    public static getAuthenticatedUserOrThrow(request: Request): User {
        if (!request.user) {
            throw Generic.buildNotAuthenticatedException();
        }

        return request.user;
    }

    public static getAdminUserOrThrow(request: Request): User {
        const user = UsersUtils.getAuthenticatedUserOrThrow(request);
        if (!user.isAdmin) {
            Generic.throwException("NOT-ADMIN", "Only the household admin can do that.", {}, 403);
        }

        return user;
    }

    public static async getList(): Promise<User[]> {
        const query = `
        SELECT
            u.id AS u_id,
            u.name AS u_name,
            u.is_admin AS u_is_admin,
            u.created_at AS u_created_at,
            u.updated_at AS u_updated_at
        FROM
            users u
        ORDER BY
            u.name ASC
        `;

        const rows = await new DB().fetch(query);

        const list: User[] = [];
        for (const row of rows) {
            list.push(UsersUtils.toUser(row));
        }

        return list;
    }

    public static async getById(id: number): Promise<User | null> {
        const query = `
        SELECT
            u.id AS u_id,
            u.name AS u_name,
            u.is_admin AS u_is_admin,
            u.created_at AS u_created_at,
            u.updated_at AS u_updated_at
        FROM
            users u
        WHERE
            u.id = ?
        `;

        const rows = await new DB().fetch(query, [id]);
        if (rows.length === 0) {
            return null;
        }

        return UsersUtils.toUser(rows[0]);
    }

    public static async getByIdOrThrow(id: number): Promise<User> {
        const user = await UsersUtils.getById(id);
        if (!user) {
            throw Generic.buildNotFoundException("user", { id });
        }

        return user;
    }

    public static async getByCredentials(name: any, password: any): Promise<User | null> {
        const userName = Generic.parseRequiredText(name, "name", 60);
        if (typeof password !== "string" || password.length === 0) {
            Generic.throwInvalidParameterException("password");
        }

        const query = `
        SELECT
            u.id AS u_id,
            u.name AS u_name,
            u.is_admin AS u_is_admin,
            u.password_hash AS u_password_hash,
            u.created_at AS u_created_at,
            u.updated_at AS u_updated_at
        FROM
            users u
        WHERE
            u.name = ?
        `;

        const rows = await new DB().fetch(query, [userName]);
        if (rows.length === 0) {
            return null;
        }

        if (!UsersUtils.isPasswordCorrect(password, rows[0].u_password_hash)) {
            return null;
        }

        return UsersUtils.toUser(rows[0]);
    }

    public static async needsSetup(): Promise<boolean> {
        const rows = await new DB().fetch("SELECT COUNT(u.id) AS u_count FROM users u");
        return rows[0].u_count === 0;
    }

    public static async setUp(body: any): Promise<User> {
        const name = Generic.parseRequiredText(body?.name, "name", 60);
        const passwordHash = UsersUtils.hashPassword(UsersUtils.parsePassword(body?.password));

        const query = `
        INSERT INTO users (name, password_hash, is_admin)
        SELECT ?, ?, 1
        WHERE NOT EXISTS (SELECT 1 FROM users)
        RETURNING id
        `;

        const rows = await new DB().fetch(query, [name, passwordHash]);
        if (rows.length === 0) {
            Generic.throwException("ALREADY-SET-UP", "This Ninho already has an admin. Sign in instead.", {}, 409);
        }

        return UsersUtils.getByIdOrThrow(rows[0].id);
    }

    public static async add(body: any): Promise<User> {
        const name = Generic.parseRequiredText(body?.name, "name", 60);
        const passwordHash = UsersUtils.hashPassword(UsersUtils.parsePassword(body?.password));

        const existingRows = await new DB().fetch("SELECT u.id AS u_id FROM users u WHERE u.name = ?", [name]);
        if (existingRows.length > 0) {
            Generic.throwException("NAME-TAKEN", `There's already someone called ${name}.`, {}, 409);
        }

        const rows = await new DB().fetch("INSERT INTO users (name, password_hash) VALUES (?, ?) RETURNING id", [name, passwordHash]);
        return UsersUtils.getByIdOrThrow(rows[0].id);
    }

    public static async setPassword(id: number, password: any): Promise<void> {
        const passwordHash = UsersUtils.hashPassword(UsersUtils.parsePassword(password));

        const rows = await new DB().fetch(`UPDATE users SET password_hash = ?, updated_at = ${DB.now} WHERE id = ? RETURNING id`, [passwordHash, id]);
        if (rows.length === 0) {
            throw Generic.buildNotFoundException("user", { id });
        }
    }

    public static async changeOwnPassword(user: User, body: any): Promise<void> {
        const confirmedUser = await UsersUtils.getByCredentials(user.name, body?.currentPassword);
        if (!confirmedUser || confirmedUser.id !== user.id) {
            Generic.throwException("WRONG-PASSWORD", "Your current password isn't right.", {}, 400);
        }

        await UsersUtils.setPassword(user.id, body?.newPassword);
    }

    public static async delete(id: number): Promise<void> {
        const rows = await new DB().fetch("DELETE FROM users WHERE id = ? RETURNING id", [id]);
        if (rows.length === 0) {
            throw Generic.buildNotFoundException("user", { id });
        }
    }

    public static async save(name: any, password: any): Promise<User> {
        const userName = Generic.parseRequiredText(name, "name", 60);
        const passwordHash = UsersUtils.hashPassword(UsersUtils.parsePassword(password));

        const query = `
        INSERT INTO users (name, password_hash, is_admin)
        VALUES (?, ?, NOT EXISTS (SELECT 1 FROM users))
        ON CONFLICT (name) DO UPDATE SET
            password_hash = excluded.password_hash,
            updated_at = ${DB.now}
        RETURNING id
        `;

        const rows = await new DB().fetch(query, [userName, passwordHash]);
        return UsersUtils.getByIdOrThrow(rows[0].id);
    }

    private static parsePassword(value: any): string {
        if (typeof value !== "string" || value.length < UsersUtils.minimumPasswordLength || value.length > UsersUtils.maximumPasswordLength) {
            Generic.throwException("INVALID-PASSWORD", `Passwords need at least ${UsersUtils.minimumPasswordLength} characters.`, {}, 400);
        }

        return value;
    }

    private static hashPassword(password: string): string {
        const salt = randomBytes(16).toString("hex");
        const hash = scryptSync(password, salt, UsersUtils.passwordKeyLength).toString("hex");
        return `${salt}:${hash}`;
    }

    private static isPasswordCorrect(password: string, passwordHash: string): boolean {
        const [salt, expectedHash] = passwordHash.split(":");
        const actualHash = scryptSync(password, salt, UsersUtils.passwordKeyLength);
        return timingSafeEqual(actualHash, Buffer.from(expectedHash, "hex"));
    }

    private static toUser(row: any): User {
        return {
            id: row.u_id,
            name: row.u_name,
            isAdmin: row.u_is_admin === 1,
            createdAt: row.u_created_at,
            updatedAt: row.u_updated_at
        };
    }
}
