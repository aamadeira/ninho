export interface Entry {
    id: number;
    text: string;
}

const listMarkerPattern = /^(\d+[.)]|[-*•])\s+/;

let lastEntryId = 0;

export function splitLines(text: string): string[] {
    const lines: string[] = [];

    for (const line of text.split("\n")) {
        const cleanLine = line.trim().replace(listMarkerPattern, "");
        if (cleanLine) {
            lines.push(cleanLine);
        }
    }

    return lines;
}

export function createEntry(text: string): Entry {
    lastEntryId++;
    return { id: lastEntryId, text };
}

export function toEntries(lines: string[]): Entry[] {
    return lines.map((line) => createEntry(line));
}

export function toLines(entries: Entry[]): string[] {
    const lines: string[] = [];

    for (const entry of entries) {
        const text = entry.text.trim();
        if (text) {
            lines.push(text);
        }
    }

    return lines;
}
