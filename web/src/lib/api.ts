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
        const description = payload?.description ?? "Something went wrong. Please try again.";
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

export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }

    return "Something went wrong. Please try again.";
}
