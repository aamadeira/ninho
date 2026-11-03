import { useState, type FormEvent } from "react";
import { Button } from "../../components/Button";
import { EntryListField } from "../../components/EntryListField";
import { ImageField } from "../../components/ImageField";
import { Notice } from "../../components/Notice";
import { TagsField } from "../../components/TagsField";
import { TextField } from "../../components/TextField";
import { getErrorMessage } from "../../lib/api";
import { splitLines, toEntries, toLines } from "../../lib/entries";
import { useSaveRecipe } from "../../lib/queries";
import type { ImageUpload, Recipe } from "../../lib/types";
import { sortIngredients } from "./recipeText";
import { useTranslation } from "../../lib/i18n";
import formStyles from "../Form.module.css";

interface RecipeFormProps {
    recipe?: Recipe;
    knownTags: string[];
    onSaved: (recipe: Recipe) => void;
    onCancel: () => void;
}

const maxTags = 20;

export function RecipeForm({ recipe, knownTags, onSaved, onCancel }: RecipeFormProps) {
    const { t } = useTranslation();
    const saveRecipe = useSaveRecipe();
    const [title, setTitle] = useState(recipe?.title ?? "");
    const [tags, setTags] = useState(recipe?.tags ?? []);
    const [link, setLink] = useState(recipe?.link ?? "");
    const [ingredients, setIngredients] = useState(() => toEntries(sortIngredients(splitLines(recipe?.ingredients ?? ""))));
    const [steps, setSteps] = useState(() => toEntries(splitLines(recipe?.steps ?? "")));
    const [image, setImage] = useState<ImageUpload | null | undefined>(undefined);

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const ingredientsText = sortIngredients(toLines(ingredients)).join("\n");
        const stepsText = toLines(steps).join("\n");
        saveRecipe.mutate({ id: recipe?.id, recipe: { title, tags, link, ingredients: ingredientsText, steps: stepsText, image } }, { onSuccess: onSaved });
    }

    return (
        <form className={formStyles.form} onSubmit={submit}>
            <TextField label={t("common.name")} autoComplete="off" data-autofocus={recipe ? undefined : true} value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} required />
            <ImageField label={t("common.photo")} hint={t("recipes.photoHint")} currentImage={recipe?.image ?? null} value={image} onChange={setImage} />

            <TagsField label={t("common.tags")} hint={t("recipes.tagsHint")} tags={tags} suggestions={knownTags} maxTags={maxTags} onChange={setTags} />

            <TextField label={t("recipes.link")} hint={t("recipes.linkHint")} type="url" placeholder="https://" value={link} onChange={(event) => setLink(event.target.value)} />
            <EntryListField label={t("recipes.ingredients")} itemLabel={t("recipes.ingredient")} addLabel={t("recipes.addIngredient")} placeholder={t("recipes.ingredientPlaceholder")} isOrdered={false} entries={ingredients} onChange={setIngredients} />
            <EntryListField label={t("recipes.steps")} itemLabel={t("recipes.step")} addLabel={t("recipes.addStep")} placeholder={t("recipes.stepPlaceholder")} isOrdered entries={steps} onChange={setSteps} />

            {saveRecipe.isError && <Notice>{getErrorMessage(saveRecipe.error, t)}</Notice>}

            <div className={formStyles.actions}>
                <Button variant="ghost" onClick={onCancel}>
                    {t("common.cancel")}
                </Button>
                <Button type="submit" disabled={saveRecipe.isPending}>
                    {saveRecipe.isPending ? t("common.saving") : t("recipes.save")}
                </Button>
            </div>
        </form>
    );
}
