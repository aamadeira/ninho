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
import formStyles from "../Form.module.css";

interface RecipeFormProps {
    recipe?: Recipe;
    knownTags: string[];
    onSaved: (recipe: Recipe) => void;
    onCancel: () => void;
}

const maxTags = 20;

export function RecipeForm({ recipe, knownTags, onSaved, onCancel }: RecipeFormProps) {
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
            <TextField label="Name" autoComplete="off" data-autofocus={recipe ? undefined : true} value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} required />
            <ImageField label="Photo" hint="The dish, or the page from the cookbook." currentImage={recipe?.image ?? null} value={image} onChange={setImage} />

            <TagsField label="Tags" hint="Like quick or vegetarian. Enter or a comma adds one." tags={tags} suggestions={knownTags} maxTags={maxTags} onChange={setTags} />

            <TextField label="Link" hint="Where the recipe came from, if anywhere." type="url" placeholder="https://" value={link} onChange={(event) => setLink(event.target.value)} />
            <EntryListField label="Ingredients" itemLabel="Ingredient" addLabel="Add an ingredient" placeholder="2 eggs" isOrdered={false} entries={ingredients} onChange={setIngredients} />
            <EntryListField label="Steps" itemLabel="Step" addLabel="Add a step" placeholder="What happens next…" isOrdered entries={steps} onChange={setSteps} />

            {saveRecipe.isError && <Notice>{getErrorMessage(saveRecipe.error)}</Notice>}

            <div className={formStyles.actions}>
                <Button variant="ghost" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={saveRecipe.isPending}>
                    {saveRecipe.isPending ? "Saving…" : "Save recipe"}
                </Button>
            </div>
        </form>
    );
}
