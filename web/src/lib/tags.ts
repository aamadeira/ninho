import { compareText } from "./sorting";

const maxSuggestions = 8;

export function normalizeTag(text: string): string {
    return text.trim().toLowerCase();
}

export function collectTags(tagLists: string[][]): string[] {
    const tags: string[] = [];

    for (const tagList of tagLists) {
        for (const tag of tagList) {
            if (!tags.includes(tag)) {
                tags.push(tag);
            }
        }
    }

    return tags.sort(compareText);
}

export function toggleTag(selectedTags: string[], tag: string): string[] {
    if (selectedTags.includes(tag)) {
        return selectedTags.filter((selectedTag) => selectedTag !== tag);
    }

    return [...selectedTags, tag];
}

export function filterSuggestions(options: string[], query: string, excluded: string[]): string[] {
    const normalizedQuery = normalizeTag(query);
    const matches = options.filter((option) => !excluded.includes(option) && option.toLowerCase().includes(normalizedQuery));
    return matches.slice(0, maxSuggestions);
}
