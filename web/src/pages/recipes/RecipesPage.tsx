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
import { useTranslation } from "../../lib/i18n";
import pageStyles from "../Page.module.css";
import styles from "./RecipesPage.module.css";

export function RecipesPage() {
    const { t } = useTranslation();
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
            {t("recipes.new")}
        </Button>
    );

    return (
        <>
            <PageHeader title={t("recipes.title")} action={newRecipeButton} />

            {recipes.length > 0 && (
                <>
                    <TextField
                        label={t("recipes.search")}
                        isLabelHidden
                        type="search"
                        className={styles.search}
                        placeholder={t("recipes.searchPlaceholder")}
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                    {tags.length > 0 && (
                        <ChipRow label={t("recipes.filterByTag")}>
                            {tags.map((tag) => (
                                <Chip key={tag} label={tag} isSelected={activeTags.includes(tag)} onClick={() => setSelectedTags(toggleTag(activeTags, tag))} />
                            ))}
                        </ChipRow>
                    )}
                </>
            )}

            {recipesQuery.isPending && <p className={pageStyles.status}>{t("common.loading")}</p>}
            {recipesQuery.isError && <Notice>{t("recipes.loadError")}</Notice>}
            {recipesQuery.isSuccess && recipes.length === 0 && (
                <EmptyState title={t("recipes.emptyTitle")} text={t("recipes.emptyText")} />
            )}
            {recipes.length > 0 && visibleRecipes.length === 0 && <p className={pageStyles.status}>{t("recipes.noMatch")}</p>}

            <ul className={styles.list}>
                {visibleRecipes.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
            </ul>

            <Sheet title={t("recipes.new")} isOpen={isAdding} onClose={() => setIsAdding(false)}>
                <RecipeForm knownTags={tags} onSaved={(recipe) => navigate(`/recipes/${recipe.id}`)} onCancel={() => setIsAdding(false)} />
            </Sheet>
        </>
    );
}
