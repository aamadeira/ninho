import { useState, type FormEvent } from "react";
import { Button } from "../../components/Button";
import { PlusIcon } from "../../components/icons/Icons";
import { Notice } from "../../components/Notice";
import { Suggestions } from "../../components/Suggestions";
import { TextField } from "../../components/TextField";
import { getErrorMessage } from "../../lib/api";
import { useAddShoppingItem } from "../../lib/queries";
import { filterSuggestions } from "../../lib/tags";
import styles from "../AddForm.module.css";

interface AddShoppingItemFormProps {
    defaultStore: string | null;
    storeNames: string[];
    tags: string[];
}

export function AddShoppingItemForm({ defaultStore, storeNames, tags }: AddShoppingItemFormProps) {
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
        addShoppingItem.mutate({ name: trimmedName, store: store.trim(), tags }, { onError: () => setName(trimmedName) });
    }

    return (
        <form className={styles.form} onSubmit={submit}>
            <div className={styles.fields}>
                <TextField
                    label="Item"
                    isLabelHidden
                    className={styles.mainField}
                    placeholder="Add an item…"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    autoComplete="off"
                    enterKeyHint="done"
                />
                <TextField label="Store" isLabelHidden className={styles.sideField} placeholder="Any store" value={store} onChange={(event) => setStore(event.target.value)} autoComplete="off" />
                <Button type="submit" size="icon" aria-label="Add item">
                    <PlusIcon />
                </Button>
            </div>
            <Suggestions label="Stores on the list" options={storeSuggestions} onPick={setStore} />
            {addShoppingItem.isError && <Notice>{getErrorMessage(addShoppingItem.error)}</Notice>}
        </form>
    );
}
