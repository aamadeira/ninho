import { NextFunction, Request, Response } from "express";
import { Messages } from "./messages";

export interface RequestResponseDetails {
    httpStatusCode: number;
    internalErrorCode?: string;
    description?: string;
    data?: any;
}

export class Generic {
    public static isEmpty(value: any): boolean {
        if (value === null || value === undefined || value === "") {
            return true;
        }

        if (Array.isArray(value)) {
            return value.length === 0;
        }

        if (typeof value === "object") {
            return Object.keys(value).length === 0;
        }

        return false;
    }

    public static isNotEmpty(value: any): boolean {
        return !this.isEmpty(value);
    }

    public static isValidJson(text: string): boolean {
        try {
            JSON.parse(text);
            return true;
        } catch (e) {
            return false;
        }
    }

    public static capitalize(text: string): string {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }

    public static sendLogToConsole(log: any): void {
        console.log(`${this.isNotEmpty(log) && typeof log !== "string" ? JSON.stringify(log) : log}`);
    }

    public static parseIdParameter(value: any, name: string): number {
        if (typeof value !== "string" || !/^\d{1,10}$/.test(value)) {
            this.throwInvalidParameterException(name);
        }

        return Number(value);
    }

    public static parseRequiredText(value: any, name: string, maxLength: number): string {
        if (typeof value !== "string") {
            this.throwInvalidParameterException(name);
        }

        const text = value.trim();
        if (text === "" || text.length > maxLength) {
            this.throwInvalidParameterException(name);
        }

        return text;
    }

    public static parseOptionalText(value: any, name: string, maxLength: number): string | null {
        if (value === undefined || value === null) {
            return null;
        }

        if (typeof value === "string" && value.trim() === "") {
            return null;
        }

        return this.parseRequiredText(value, name, maxLength);
    }

    public static parseDate(value: any, name: string): string {
        if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            this.throwInvalidParameterException(name);
        }

        const [year, month, day] = value.split("-").map(Number);
        const date = new Date(Date.UTC(year, month - 1, day));
        if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
            this.throwInvalidParameterException(name);
        }

        return value;
    }

    public static parseOptionalDate(value: any, name: string): string | null {
        if (value === undefined || value === null || value === "") {
            return null;
        }

        return this.parseDate(value, name);
    }

    public static parseTags(value: any, maxTags: number): string[] {
        if (value === undefined || value === null) {
            return [];
        }

        if (!Array.isArray(value) || value.length > maxTags) {
            this.throwInvalidParameterException("tags");
        }

        const tags: string[] = [];
        for (const tag of value) {
            const normalizedTag = this.parseRequiredText(tag, "tag", 30).toLowerCase();
            if (!tags.includes(normalizedTag)) {
                tags.push(normalizedTag);
            }
        }

        return tags;
    }

    public static parseBoolean(value: any, name: string): boolean {
        if (typeof value !== "boolean") {
            this.throwInvalidParameterException(name);
        }

        return value;
    }

    public static generateRequestResponseDetails(httpStatusCode: number, internalErrorCode?: string, description?: string, data: any = {}): RequestResponseDetails {
        return {
            httpStatusCode,
            internalErrorCode,
            description,
            data
        };
    }

    public static generateRequestResponseDetailsMessage(httpStatusCode: number, internalErrorCode?: string, description?: string, data: any = {}): string {
        return JSON.stringify(this.generateRequestResponseDetails(httpStatusCode, internalErrorCode, description, data));
    }

    public static generateSuccessfulRequestResponseDetailsMessage(httpStatusCode: number, data: any = {}): string {
        return this.generateRequestResponseDetailsMessage(httpStatusCode, undefined, undefined, data);
    }

    public static generateResourceDeletedRequestResponseDetailsMessage(resource: string): string {
        return this.generateRequestResponseDetailsMessage(200, "DELETED", undefined, Messages.getResourceDeletedMessage(this.capitalize(resource)));
    }

    public static generateNotFoundRequestResponseDetailsMessage(): string {
        return this.generateRequestResponseDetailsMessage(404, "NOT-FOUND", "Not found.");
    }

    public static generateInvalidParameterRequestResponseDetailsMessage(parameter?: string): string {
        return this.generateRequestResponseDetailsMessage(400, "INVALID-PARAMETER", Messages.getInvalidParametersErrorMessage(parameter), parameter);
    }

    public static generateUnexpectedErrorRequestResponseDetailsMessage(): string {
        return this.generateRequestResponseDetailsMessage(500, "UNEXPECTED-ERROR", "An unexpected error has occurred.");
    }

    public static throwException(internalErrorCode: string, description: string, data: any = {}, httpStatusCode: number = 500): never {
        throw new Error(this.generateRequestResponseDetailsMessage(httpStatusCode, internalErrorCode, description, data));
    }

    public static throwInvalidParameterException(parameter: string): never {
        return this.throwException(`INVALID-${parameter.split(" ").join("-").toUpperCase()}`, `Invalid ${parameter}.`, {}, 400);
    }

    public static throwUnexpectedErrorException(): never {
        return this.throwException("UNEXPECTED-ERROR", "An unexpected error has occurred.");
    }

    public static buildNotFoundException(resource: string, identifiers: any = {}): Error {
        const identifiersMessages: string[] = [];
        for (const key of Object.keys(identifiers)) {
            identifiersMessages.push(`${key} ${identifiers[key]}`);
        }

        const identifiersMessage = identifiersMessages.length > 0 ? `with ${identifiersMessages.join(" and ")}` : "";

        return new Error(
            this.generateRequestResponseDetailsMessage(
                404,
                `${resource.split(" ").join("-").toUpperCase()}-NOT-FOUND`,
                Messages.getResourceNotFoundMessage(`${this.capitalize(resource)} ${identifiersMessage}`)
            )
        );
    }

    public static buildNotAuthenticatedException(): Error {
        return new Error(this.generateRequestResponseDetailsMessage(401, "NOT-AUTHENTICATED", "User is not authenticated."));
    }

    public static handleSuccessMessage(message: string, response: Response) {
        if (this.isValidJson(message)) {
            const parsedMessage: any = JSON.parse(message);
            response.status(parsedMessage.httpStatusCode).json(parsedMessage.data);
            return;
        }

        response.status(200).json(message);
    }

    public static handleExceptionMessage(message: string, response: Response) {
        Generic.sendLogToConsole(`Generic::handleExceptionMessage ${message}`);

        if (this.isValidJson(message)) {
            const parsedMessage: any = JSON.parse(message);
            response.status(parsedMessage.httpStatusCode).json(parsedMessage);
            return;
        }

        response.status(500).json(message);
    }

    public static requireAuth(request: Request, response: Response, next: NextFunction) {
        if (!request.user) {
            return response.status(401).json(Generic.generateRequestResponseDetails(401, "NOT-AUTHENTICATED", "User is not authenticated."));
        }

        next();
    }
}
