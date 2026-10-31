import { Link } from "react-router";
import { ChevronRightIcon } from "../../components/icons/Icons";
import { TagList } from "../../components/TagList";
import type { Recipe } from "../../lib/types";
import { splitLines } from "../../lib/entries";
import styles from "./RecipeCard.module.css";

interface RecipeCardProps {
    recipe: Recipe;
}

function describeIngredients(ingredients: string): string {
    const count = splitLines(ingredients).length;
    if (count === 0) {
        return "No ingredients yet";
    }

    if (count === 1) {
        return "1 ingredient";
    }

    return `${count} ingredients`;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
    return (
        <li>
            <Link to={`/recipes/${recipe.id}`} className={styles.card}>
                <span className={styles.cover}>
                    {recipe.image && <img src={recipe.image.thumbnailUrl} alt="" width={80} height={80} loading="lazy" decoding="async" />}
                    {!recipe.image && <span aria-hidden="true">{recipe.title.charAt(0)}</span>}
                </span>
                <span className={styles.body}>
                    <span className={styles.title}>{recipe.title}</span>
                    <span className={styles.meta}>{describeIngredients(recipe.ingredients)}</span>
                    <TagList tags={recipe.tags} />
                </span>
                <ChevronRightIcon size={18} />
            </Link>
        </li>
    );
}
