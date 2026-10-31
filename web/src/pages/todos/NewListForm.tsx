import { useState, type FormEvent } from "react";
import { Button } from "../../components/Button";
import { TextField } from "../../components/TextField";
import styles from "../Form.module.css";

interface NewListFormProps {
    onCreate: (listName: string) => void;
}

export function NewListForm({ onCreate }: NewListFormProps) {
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
            <TextField label="List name" placeholder="Garden, Moving, Gifts…" maxLength={40} autoComplete="off" value={listName} onChange={(event) => setListName(event.target.value)} data-autofocus required />
            <div className={styles.actions}>
                <Button type="submit">Create list</Button>
            </div>
        </form>
    );
}
