import { useState, type FormEvent } from "react";
import { Button } from "../../components/Button";
import { TextField } from "../../components/TextField";
import { useTranslation } from "../../lib/i18n";
import styles from "../Form.module.css";

interface NewListFormProps {
    onCreate: (listName: string) => void;
}

export function NewListForm({ onCreate }: NewListFormProps) {
    const { t } = useTranslation();
    const [listName, setListName] = useState("");

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const trimmedListName = listName.trim();
        if (trimmedListName) {
            onCreate(trimmedListName);
        }
    }

    return (
        <form className={styles.form} onSubmit={submit}>
            <TextField label={t("todos.listName")} placeholder={t("todos.listNamePlaceholder")} maxLength={40} autoComplete="off" value={listName} onChange={(event) => setListName(event.target.value)} data-autofocus required />
            <div className={styles.actions}>
                <Button type="submit">{t("todos.createList")}</Button>
            </div>
        </form>
    );
}
