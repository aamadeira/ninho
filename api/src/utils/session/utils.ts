import { createHash, randomBytes } from "crypto";
import { CookieOptions, NextFunction, Request, Response } from "express";
import sessionConfig from "../../config/session";
import { Generic } from "../generic";
import { DB } from "../database/db";
import { User, UsersUtils } from "../users/utils";

export class SessionUtils {
    public static async start(response: Response, user: User): Promise<void> {
        const token = randomBytes(32).toString("base64url");
        const expiresAt = new Date(Date.now() + sessionConfig.durationInDays * 24 * 60 * 60 * 1000);

        await new DB().fetch("DELETE FROM sessions WHERE expires_at < ?", [new Date().toISOString()]);
        await new DB().fetch("INSERT INTO sessions (user_id, token_hash, expires_at) VALUES (?, ?, ?)", [user.id, SessionUtils.hashToken(token), expiresAt.toISOString()]);

        response.cookie(sessionConfig.cookieName, token, { ...SessionUtils.getCookieOptions(), expires: expiresAt });
    }

    public static async end(request: Request, response: Response): Promise<void> {
        const token = request.cookies?.[sessionConfig.cookieName];
        if (Generic.isNotEmpty(token)) {
            await new DB().fetch("DELETE FROM sessions WHERE token_hash = ?", [SessionUtils.hashToken(token)]);
        }

        response.clearCookie(sessionConfig.cookieName, SessionUtils.getCookieOptions());
    }

    public static async endAllForUser(userId: number): Promise<void> {
        await new DB().fetch("DELETE FROM sessions WHERE user_id = ?", [userId]);
    }

    public static async authenticate(request: Request, response: Response, next: NextFunction) {
        try {
            const token = request.cookies?.[sessionConfig.cookieName];
            if (Generic.isEmpty(token)) {
                return next();
            }

            const user = await SessionUtils.getUserByToken(token);
            if (user) {
                request.user = user;
            }

            next();
        } catch (e) {
            next(e);
        }
    }

    private static async getUserByToken(token: string): Promise<User | null> {
        const query = `
        SELECT
            s.user_id AS s_user_id
        FROM
            sessions s
        WHERE
            s.token_hash = ?
            AND s.expires_at > ?
        `;

        const rows = await new DB().fetch(query, [SessionUtils.hashToken(token), new Date().toISOString()]);
        if (rows.length === 0) {
            return null;
        }

        return UsersUtils.getById(rows[0].s_user_id);
    }

    private static hashToken(token: string): string {
        return createHash("sha256").update(token).digest("hex");
    }

    private static getCookieOptions(): CookieOptions {
        return {
            httpOnly: true,
            sameSite: "lax",
            secure: sessionConfig.secureCookie,
            path: "/"
        };
    }
}
