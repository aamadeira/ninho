import type { Translate, TranslationKey } from "./i18n";

export class ApiError extends Error {
    status: number;
    code: string | null;

    constructor(status: number, code: string | null, message: string) {
        super(message);
        this.status = status;
        this.code = code;
    }
}

interface ApiRequestOptions {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: unknown;
}

async function readJson(response: Response): Promise<any> {
    const text = await response.text();
    if (!text) {
        return null;
    }

    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    const hasBody = options.body !== undefined;

    const response = await fetch(path, {
        method: options.method ?? "GET",
        credentials: "same-origin",
        headers: hasBody ? { "Content-Type": "application/json" } : undefined,
        body: hasBody ? JSON.stringify(options.body) : undefined
    });

    const payload = await readJson(response);

    if (!response.ok) {
        const code = payload?.internalErrorCode ?? null;
        const description = payload?.description ?? `Request failed with status ${response.status}`;
        throw new ApiError(response.status, code, description);
    }

    return payload as T;
}

export function isApiError(error: unknown, status?: number): error is ApiError {
    if (!(error instanceof ApiError)) {
        return false;
    }

    return status === undefined || error.status === status;
}

const errorKeysByCode: Record<string, TranslationKey> = {
    "INVALID-CREDENTIALS": "errors.wrongNameOrPassword",
    "NOT-ADMIN": "errors.notAdmin",
    "ALREADY-SET-UP": "errors.alreadySetUp",
    "NAME-TAKEN": "errors.nameTaken",
    "WRONG-PASSWORD": "errors.wrongCurrentPassword",
    "INVALID-PASSWORD": "errors.passwordTooShort",
    "LIST-EXISTS": "errors.listExists",
    "IMAGE-TOO-LARGE": "errors.tooLarge",
    "TOO-LARGE": "errors.tooLarge",
    "NOT-AUTHENTICATED": "errors.signedOut"
};

function getErrorKey(code: string | null): TranslationKey {
    if (code === null) {
        return "errors.generic";
    }

    const knownKey = errorKeysByCode[code];
    if (knownKey) {
        return knownKey;
    }

    if (code.endsWith("NOT-FOUND")) {
        return "errors.notFound";
    }

    if (code.startsWith("INVALID-")) {
        return "errors.invalid";
    }

    return "errors.generic";
}

export function getErrorMessage(error: unknown, t: Translate): string {
    if (error instanceof ApiError) {
        return t(getErrorKey(error.code));
    }

    return t("errors.generic");
}
