import { compareText } from "../../lib/sorting";
import { collectTags } from "../../lib/tags";
import type { Recipe } from "../../lib/types";

export function sortIngredients(ingredients: string[]): string[] {
    return [...ingredients].sort(compareText);
}

export function getAllTags(recipes: Recipe[]): string[] {
    return collectTags(recipes.map((recipe) => recipe.tags));
}

export function filterRecipes(recipes: Recipe[], search: string, selectedTags: string[]): Recipe[] {
    const normalizedSearch = search.trim().toLowerCase();

    return recipes.filter((recipe) => {
        const hasAllTags = selectedTags.every((tag) => recipe.tags.includes(tag));
        if (!hasAllTags) {
            return false;
        }

        if (!normalizedSearch) {
            return true;
        }

        const searchableText = `${recipe.title} ${recipe.ingredients} ${recipe.tags.join(" ")}`.toLowerCase();
        return searchableText.includes(normalizedSearch);
    });
}
