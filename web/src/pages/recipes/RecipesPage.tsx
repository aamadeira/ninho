import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../../components/Button";
import { Chip } from "../../components/Chip";
import { ChipRow } from "../../components/ChipRow";
import { EmptyState } from "../../components/EmptyState";
import { PlusIcon } from "../../components/icons/Icons";
import { Notice } from "../../components/Notice";
import { PageHeader } from "../../components/PageHeader";
import { Sheet } from "../../components/Sheet";
import { TextField } from "../../components/TextField";
import { useRecipes } from "../../lib/queries";
import { toggleTag } from "../../lib/tags";
import { RecipeCard } from "./RecipeCard";
import { RecipeForm } from "./RecipeForm";
import { filterRecipes, getAllTags } from "./recipeText";
import pageStyles from "../Page.module.css";
import styles from "./RecipesPage.module.css";

export function RecipesPage() {
    const recipesQuery = useRecipes();
    const [search, setSearch] = useState("");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const navigate = useNavigate();

    const recipes = recipesQuery.data ?? [];
    const tags = getAllTags(recipes);
    const activeTags = selectedTags.filter((tag) => tags.includes(tag));
    const visibleRecipes = filterRecipes(recipes, search, activeTags);

    const newRecipeButton = (
        <Button onClick={() => setIsAdding(true)}>
            <PlusIcon size={18} />
            New recipe
        </Button>
    );

    return (
        <>
            <PageHeader title="Recipes" action={newRecipeButton} />

            {recipes.length > 0 && (
                <>
                    <TextField
                        label="Search recipes"
                        isLabelHidden
                        type="search"
                        className={styles.search}
                        placeholder="Search by name or ingredient…"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                    {tags.length > 0 && (
                        <ChipRow label="Filter by tag">
                            {tags.map((tag) => (
                                <Chip key={tag} label={tag} isSelected={activeTags.includes(tag)} onClick={() => setSelectedTags(toggleTag(activeTags, tag))} />
                            ))}
                        </ChipRow>
                    )}
                </>
            )}

            {recipesQuery.isPending && <p className={pageStyles.status}>Loading…</p>}
            {recipesQuery.isError && <Notice>Couldn't load the recipes.</Notice>}
            {recipesQuery.isSuccess && recipes.length === 0 && (
                <EmptyState title="No recipes yet" text="Save the dishes you make again and again, with tags like quick or vegetarian to find them later." />
            )}
            {recipes.length > 0 && visibleRecipes.length === 0 && <p className={pageStyles.status}>No recipe matches that. Try fewer tags.</p>}

            <ul className={styles.list}>
                {visibleRecipes.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
            </ul>

            <Sheet title="New recipe" isOpen={isAdding} onClose={() => setIsAdding(false)}>
                <RecipeForm knownTags={tags} onSaved={(recipe) => navigate(`/recipes/${recipe.id}`)} onCancel={() => setIsAdding(false)} />
            </Sheet>
        </>
    );
}
