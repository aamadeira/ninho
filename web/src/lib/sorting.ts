export function compareText(first: string, second: string): number {
    return first.localeCompare(second, undefined, { sensitivity: "base", numeric: true });
}
