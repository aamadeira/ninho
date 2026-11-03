import { Link } from "react-router";
import { ChevronRightIcon } from "../../components/icons/Icons";
import { TagList } from "../../components/TagList";
import type { Recipe } from "../../lib/types";
import { splitLines } from "../../lib/entries";
import { useTranslation, type Translate } from "../../lib/i18n";
import styles from "./RecipeCard.module.css";

interface RecipeCardProps {
    recipe: Recipe;
}

function describeIngredients(ingredients: string, t: Translate): string {
    const count = splitLines(ingredients).length;
    if (count === 0) {
        return t("recipes.noIngredientsYet");
    }

    return t("recipes.ingredientCount", { count });
}

export function RecipeCard({ recipe }: RecipeCardProps) {
    const { t } = useTranslation();

    return (
        <li>
            <Link to={`/recipes/${recipe.id}`} className={styles.card}>
                <span className={styles.cover}>
                    {recipe.image && <img src={recipe.image.thumbnailUrl} alt="" width={80} height={80} loading="lazy" decoding="async" />}
                    {!recipe.image && <span aria-hidden="true">{recipe.title.charAt(0)}</span>}
                </span>
                <span className={styles.body}>
                    <span className={styles.title}>{recipe.title}</span>
                    <span className={styles.meta}>{describeIngredients(recipe.ingredients, t)}</span>
                    <TagList tags={recipe.tags} />
                </span>
                <ChevronRightIcon size={18} />
            </Link>
        </li>
    );
}
