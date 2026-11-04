import { useState, type FormEvent } from "react";
import { Button } from "../../components/Button";
import { PlusIcon } from "../../components/icons/Icons";
import { Notice } from "../../components/Notice";
import { TextField } from "../../components/TextField";
import { getErrorMessage } from "../../lib/api";
import { useAddTodo } from "../../lib/queries";
import { useTranslation } from "../../lib/i18n";
import styles from "../AddForm.module.css";

interface AddTodoFormProps {
    listName: string;
    onAdded: (title: string, savedId: Promise<number>) => void;
}

export function AddTodoForm({ listName, onAdded }: AddTodoFormProps) {
    const { t } = useTranslation();
    const addTodo = useAddTodo();
    const [title, setTitle] = useState("");

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const trimmedTitle = title.trim();
        if (!trimmedTitle) {
            return;
        }

        setTitle("");
        const savedId = addTodo.mutateAsync({ title: trimmedTitle, listName }).then((response) => response.todo.id);
        savedId.catch(() => setTitle(trimmedTitle));
        onAdded(trimmedTitle, savedId);
    }

    const fieldLabel = t("todos.addTo", { list: listName });

    return (
        <form className={styles.form} onSubmit={submit}>
            <div className={styles.fields}>
                <TextField
                    label={fieldLabel}
                    isLabelHidden
                    className={styles.mainField}
                    placeholder={`${fieldLabel}…`}
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    autoComplete="off"
                    enterKeyHint="done"
                />
                <Button type="submit" size="icon" aria-label={t("todos.add")}>
                    <PlusIcon />
                </Button>
            </div>
            {addTodo.isError && <Notice>{getErrorMessage(addTodo.error, t)}</Notice>}
        </form>
    );
}
