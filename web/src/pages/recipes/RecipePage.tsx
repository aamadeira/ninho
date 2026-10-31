import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Button } from "../../components/Button";
import { DeleteButton } from "../../components/DeleteButton";
import { ArrowLeftIcon, ExternalIcon, PencilIcon } from "../../components/icons/Icons";
import { Notice } from "../../components/Notice";
import { Sheet } from "../../components/Sheet";
import { useDeleteRecipe, useRecipes } from "../../lib/queries";
import { RecipeForm } from "./RecipeForm";
import { splitLines } from "../../lib/entries";
import { getAllTags, sortIngredients } from "./recipeText";
import pageStyles from "../Page.module.css";
import styles from "./RecipePage.module.css";

export function RecipePage() {
    const { recipeId } = useParams();
    const navigate = useNavigate();
    const recipesQuery = useRecipes();
    const deleteRecipe = useDeleteRecipe();
    const [isEditing, setIsEditing] = useState(false);

    const recipe = recipesQuery.data?.find((candidate) => String(candidate.id) === recipeId);

    if (recipesQuery.isPending) {
        return <p className={pageStyles.status}>Loading…</p>;
    }

    if (!recipe) {
        return <Notice>That recipe doesn't exist anymore.</Notice>;
    }

    const ingredients = sortIngredients(splitLines(recipe.ingredients));
    const steps = splitLines(recipe.steps);

    return (
        <article>
            <Link to="/recipes" className={styles.back}>
                <ArrowLeftIcon size={18} />
                Recipes
            </Link>

            {recipe.image && <img src={recipe.image.url} alt="" className={styles.hero} />}

            <h1 className={styles.title}>{recipe.title}</h1>

            {recipe.tags.length > 0 && (
                <ul className={styles.tags}>
                    {recipe.tags.map((tag) => (
                        <li key={tag} className={styles.tag}>
                            {tag}
                        </li>
                    ))}
                </ul>
            )}

            {recipe.link && (
                <a href={recipe.link} className={styles.source} target="_blank" rel="noopener noreferrer">
                    Open the original recipe
                    <ExternalIcon size={16} />
                </a>
            )}

            <div className={styles.columns}>
                <section className={styles.panel}>
                    <h2 className={styles.heading}>Ingredients</h2>
                    {ingredients.length === 0 && <p className={pageStyles.muted}>No ingredients written down.</p>}
                    <ul className={styles.ingredients}>
                        {ingredients.map((ingredient, index) => (
                            <li key={index}>{ingredient}</li>
                        ))}
                    </ul>
                </section>

                <section className={styles.panel}>
                    <h2 className={styles.heading}>Steps</h2>
                    {steps.length === 0 && <p className={pageStyles.muted}>No steps written down.</p>}
                    <ol className={styles.steps}>
                        {steps.map((step, index) => (
                            <li key={index}>{step}</li>
                        ))}
                    </ol>
                </section>
            </div>

            <div className={styles.actions}>
                <DeleteButton isPending={deleteRecipe.isPending} onConfirm={() => deleteRecipe.mutate(recipe.id, { onSuccess: () => navigate("/recipes") })} />
                <Button variant="secondary" onClick={() => setIsEditing(true)}>
                    <PencilIcon size={18} />
                    Edit
                </Button>
            </div>

            <Sheet title="Edit recipe" isOpen={isEditing} onClose={() => setIsEditing(false)}>
                <RecipeForm key={recipe.id} recipe={recipe} knownTags={getAllTags(recipesQuery.data ?? [])} onSaved={() => setIsEditing(false)} onCancel={() => setIsEditing(false)} />
            </Sheet>
        </article>
    );
}
