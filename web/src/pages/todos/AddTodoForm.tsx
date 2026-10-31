import { useState, type FormEvent } from "react";
import { Button } from "../../components/Button";
import { PlusIcon } from "../../components/icons/Icons";
import { Notice } from "../../components/Notice";
import { TextField } from "../../components/TextField";
import { getErrorMessage } from "../../lib/api";
import { useAddTodo } from "../../lib/queries";
import styles from "../AddForm.module.css";

interface AddTodoFormProps {
    listName: string;
}

export function AddTodoForm({ listName }: AddTodoFormProps) {
    const addTodo = useAddTodo();
    const [title, setTitle] = useState("");

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const trimmedTitle = title.trim();
        if (!trimmedTitle) {
            return;
        }

        setTitle("");
        addTodo.mutate({ title: trimmedTitle, listName }, { onError: () => setTitle(trimmedTitle) });
    }

    const fieldLabel = `Add to ${listName}`;

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
                <Button type="submit" size="icon" aria-label="Add to-do">
                    <PlusIcon />
                </Button>
            </div>
            {addTodo.isError && <Notice>{getErrorMessage(addTodo.error)}</Notice>}
        </form>
    );
}
