import { useState, type FormEvent } from "react";
import { Button } from "../../components/Button";
import { CheckboxField } from "../../components/CheckboxField";
import { DeleteButton } from "../../components/DeleteButton";
import { ImageField } from "../../components/ImageField";
import { Notice } from "../../components/Notice";
import { Suggestions } from "../../components/Suggestions";
import { TagsField } from "../../components/TagsField";
import { TextField } from "../../components/TextField";
import { getErrorMessage } from "../../lib/api";
import { useDeleteShoppingItem, useEditShoppingItem } from "../../lib/queries";
import { filterSuggestions } from "../../lib/tags";
import type { ImageUpload, ShoppingItem } from "../../lib/types";
import styles from "../Form.module.css";

interface ShoppingItemFormProps {
    item: ShoppingItem;
    storeNames: string[];
    knownTags: string[];
    onDone: () => void;
}

const maxTags = 10;

export function ShoppingItemForm({ item, storeNames, knownTags, onDone }: ShoppingItemFormProps) {
    const editShoppingItem = useEditShoppingItem();
    const deleteShoppingItem = useDeleteShoppingItem();
    const [name, setName] = useState(item.name);
    const [store, setStore] = useState(item.store ?? "");
    const [tags, setTags] = useState(item.tags);
    const [buyOnce, setBuyOnce] = useState(item.buyOnce);
    const [image, setImage] = useState<ImageUpload | null | undefined>(undefined);

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const changes = { id: item.id, item: { name: name.trim(), store: store.trim(), tags, buyOnce, image } };
        if (image === undefined) {
            editShoppingItem.mutate(changes);
            onDone();
            return;
        }

        editShoppingItem.mutate(changes, { onSuccess: onDone });
    }

    function remove() {
        deleteShoppingItem.mutate(item.id);
        onDone();
    }

    return (
        <form className={styles.form} onSubmit={submit}>
            <TextField label="Item" autoComplete="off" value={name} onChange={(event) => setName(event.target.value)} maxLength={120} required />
            <div className={styles.fieldWithSuggestions}>
                <TextField label="Store" hint="Leave it empty if any store has it." value={store} onChange={(event) => setStore(event.target.value)} maxLength={40} autoComplete="off" />
                <Suggestions label="Stores on the list" options={filterSuggestions(storeNames, store, [store.trim()])} onPick={setStore} />
            </div>
            <TagsField label="Tags" hint="Aisle, priority, anything you filter by. Enter or a comma adds one." tags={tags} suggestions={knownTags} maxTags={maxTags} onChange={setTags} />
            <CheckboxField label="Only buying this once" hint="After shopping it's removed instead of kept in Inventory." isChecked={buyOnce} onChange={setBuyOnce} />
            <ImageField label="Photo" hint="Handy for the exact brand or size." currentImage={item.image} value={image} onChange={setImage} />

            {editShoppingItem.isError && <Notice>{getErrorMessage(editShoppingItem.error)}</Notice>}

            <div className={[styles.actions, styles.spread].join(" ")}>
                <DeleteButton isPending={deleteShoppingItem.isPending} onConfirm={remove} />
                <Button type="submit" disabled={editShoppingItem.isPending}>
                    {editShoppingItem.isPending ? "Saving…" : "Save"}
                </Button>
            </div>
        </form>
    );
}
