import { useState, type FormEvent } from "react";
import { Button } from "../../components/Button";
import { Notice } from "../../components/Notice";
import { TextField } from "../../components/TextField";
import { getErrorMessage } from "../../lib/api";
import { useAddUser } from "../../lib/queries";
import styles from "../Form.module.css";

interface AddPersonFormProps {
    onAdded: (name: string) => void;
}

export function AddPersonForm({ onAdded }: AddPersonFormProps) {
    const addUser = useAddUser();
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        addUser.mutate({ name: name.trim(), password }, { onSuccess: (response) => onAdded(response.user.name) });
    }

    return (
        <form className={styles.form} onSubmit={submit}>
            <TextField label="Name" hint="It's what they'll sign in with." autoComplete="off" autoCapitalize="words" maxLength={60} value={name} onChange={(event) => setName(event.target.value)} data-autofocus required />
            <TextField
                label="First password"
                hint="At least 8 characters. Tell them in person; they can change it once they're in."
                autoComplete="off"
                spellCheck={false}
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
            />
            {addUser.isError && <Notice>{getErrorMessage(addUser.error)}</Notice>}
            <div className={styles.actions}>
                <Button type="submit" disabled={addUser.isPending}>
                    {addUser.isPending ? "Adding…" : "Add to this Ninho"}
                </Button>
            </div>
        </form>
    );
}
