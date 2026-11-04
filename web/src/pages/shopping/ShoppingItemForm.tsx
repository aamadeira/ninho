import { useState, type FormEvent } from "react";
import { Button } from "../../components/Button";
import { CheckboxField } from "../../components/CheckboxField";
import { DeleteButton } from "../../components/DeleteButton";
import { ImageField } from "../../components/ImageField";
import { Notice } from "../../components/Notice";
import { Suggestions } from "../../components/Suggestions";
import { TagsField } from "../../components/TagsField";
import { TextAreaField } from "../../components/TextAreaField";
import { TextField } from "../../components/TextField";
import { getErrorMessage } from "../../lib/api";
import { useDeleteShoppingItem, useEditShoppingItem } from "../../lib/queries";
import { filterSuggestions } from "../../lib/tags";
import type { ImageUpload, ShoppingItem } from "../../lib/types";
import { useTranslation } from "../../lib/i18n";
import styles from "../Form.module.css";

interface ShoppingItemFormProps {
    item: ShoppingItem;
    storeNames: string[];
    knownTags: string[];
    onDone: () => void;
}

const maxTags = 10;

export function ShoppingItemForm({ item, storeNames, knownTags, onDone }: ShoppingItemFormProps) {
    const { t } = useTranslation();
    const editShoppingItem = useEditShoppingItem();
    const deleteShoppingItem = useDeleteShoppingItem();
    const [name, setName] = useState(item.name);
    const [store, setStore] = useState(item.store ?? "");
    const [tags, setTags] = useState(item.tags);
    const [buyOnce, setBuyOnce] = useState(item.buyOnce);
    const [notes, setNotes] = useState(item.notes ?? "");
    const [image, setImage] = useState<ImageUpload | null | undefined>(undefined);

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const changes = { id: item.id, item: { name: name.trim(), store: store.trim(), tags, buyOnce, image, notes: notes.trim() } };
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
            <TextField label={t("shopping.item")} autoComplete="off" value={name} onChange={(event) => setName(event.target.value)} maxLength={120} required />
            <div className={styles.fieldWithSuggestions}>
                <TextField label={t("shopping.store")} hint={t("shopping.storeHint")} value={store} onChange={(event) => setStore(event.target.value)} maxLength={40} autoComplete="off" />
                <Suggestions label={t("shopping.storesOnList")} options={filterSuggestions(storeNames, store, [store.trim()])} onPick={setStore} />
            </div>
            <TagsField label={t("common.tags")} hint={t("shopping.tagsHint")} tags={tags} suggestions={knownTags} maxTags={maxTags} onChange={setTags} />
            <TextAreaField label={t("common.notes")} placeholder={t("common.optional")} rows={3} maxLength={5000} value={notes} onChange={(event) => setNotes(event.target.value)} />
            <CheckboxField label={t("shopping.buyOnce")} hint={t("shopping.buyOnceHint")} isChecked={buyOnce} onChange={setBuyOnce} />
            <ImageField label={t("common.photo")} hint={t("shopping.photoHint")} currentImage={item.image} value={image} onChange={setImage} />

            {editShoppingItem.isError && <Notice>{getErrorMessage(editShoppingItem.error, t)}</Notice>}

            <div className={[styles.actions, styles.spread].join(" ")}>
                <DeleteButton isPending={deleteShoppingItem.isPending} onConfirm={remove} />
                <Button type="submit" disabled={editShoppingItem.isPending}>
                    {editShoppingItem.isPending ? t("common.saving") : t("common.save")}
                </Button>
            </div>
        </form>
    );
}
