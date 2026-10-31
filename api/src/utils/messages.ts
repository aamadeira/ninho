export class Messages {
    public static getInvalidParametersErrorMessage(parameter?: string): string {
        if (parameter) {
            return `Invalid ${parameter}.`;
        }

        return "Invalid parameters.";
    }

    public static getResourceNotFoundMessage(resource: string): string {
        return `${resource.trim()} not found.`;
    }

    public static getResourceDeletedMessage(resource: string): string {
        return `${resource} deleted.`;
    }
}
