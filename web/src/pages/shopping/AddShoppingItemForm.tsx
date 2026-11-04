import { useState, type FormEvent } from "react";
import { Button } from "../../components/Button";
import { PlusIcon } from "../../components/icons/Icons";
import { Notice } from "../../components/Notice";
import { Suggestions } from "../../components/Suggestions";
import { TextField } from "../../components/TextField";
import { getErrorMessage } from "../../lib/api";
import { useAddShoppingItem } from "../../lib/queries";
import { filterSuggestions } from "../../lib/tags";
import { useTranslation } from "../../lib/i18n";
import styles from "../AddForm.module.css";

interface AddShoppingItemFormProps {
    defaultStore: string | null;
    storeNames: string[];
    tags: string[];
    onAdded: (name: string, savedId: Promise<number>) => void;
}

export function AddShoppingItemForm({ defaultStore, storeNames, tags, onAdded }: AddShoppingItemFormProps) {
    const { t } = useTranslation();
    const addShoppingItem = useAddShoppingItem();
    const [name, setName] = useState("");
    const [store, setStore] = useState(defaultStore ?? "");

    let storeSuggestions: string[] = [];
    if (store.trim()) {
        storeSuggestions = filterSuggestions(storeNames, store, [store.trim()]);
    }

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const trimmedName = name.trim();
        if (!trimmedName) {
            return;
        }

        setName("");
        const savedId = addShoppingItem.mutateAsync({ name: trimmedName, store: store.trim(), tags }).then((response) => response.item.id);
        savedId.catch(() => setName(trimmedName));
        onAdded(trimmedName, savedId);
    }

    return (
        <form className={styles.form} onSubmit={submit}>
            <div className={styles.fields}>
                <TextField
                    label={t("shopping.item")}
                    isLabelHidden
                    className={styles.mainField}
                    placeholder={t("shopping.addPlaceholder")}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    autoComplete="off"
                    enterKeyHint="done"
                />
                <TextField label={t("shopping.store")} isLabelHidden className={styles.sideField} placeholder={t("shopping.anyStorePlaceholder")} value={store} onChange={(event) => setStore(event.target.value)} autoComplete="off" />
                <Button type="submit" size="icon" aria-label={t("shopping.addItem")}>
                    <PlusIcon />
                </Button>
            </div>
            <Suggestions label={t("shopping.storesOnList")} options={storeSuggestions} onPick={setStore} />
            {addShoppingItem.isError && <Notice>{getErrorMessage(addShoppingItem.error, t)}</Notice>}
        </form>
    );
}
