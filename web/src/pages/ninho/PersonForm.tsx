import { useState, type FormEvent } from "react";
import { Button } from "../../components/Button";
import { DeleteButton } from "../../components/DeleteButton";
import { Notice } from "../../components/Notice";
import { TextField } from "../../components/TextField";
import { getErrorMessage } from "../../lib/api";
import { useRemoveUser, useResetPassword } from "../../lib/queries";
import type { User } from "../../lib/types";
import formStyles from "../Form.module.css";
import styles from "./NinhoPage.module.css";

interface PersonFormProps {
    person: User;
    onDone: (message: string) => void;
}

export function PersonForm({ person, onDone }: PersonFormProps) {
    const resetPassword = useResetPassword();
    const removeUser = useRemoveUser();
    const [password, setPassword] = useState("");

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        resetPassword.mutate({ id: person.id, password }, { onSuccess: () => onDone(`${person.name} has a new password.`) });
    }

    function remove() {
        removeUser.mutate(person.id, { onSuccess: () => onDone(`${person.name} can't sign in anymore.`) });
    }

    return (
        <div className={styles.personForm}>
            <form className={formStyles.form} onSubmit={submit}>
                <TextField
                    label="New password"
                    hint="For when they've forgotten theirs. It signs them out everywhere."
                    autoComplete="off"
                    spellCheck={false}
                    minLength={8}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                />
                {resetPassword.isError && <Notice>{getErrorMessage(resetPassword.error)}</Notice>}
                <div className={formStyles.actions}>
                    <Button type="submit" variant="secondary" disabled={resetPassword.isPending}>
                        {resetPassword.isPending ? "Saving…" : "Set password"}
                    </Button>
                </div>
            </form>

            <section className={styles.dangerZone}>
                <p className={styles.dangerText}>Removing {person.name} stops them signing in. Their to-dos stay, just without a name on them.</p>
                {removeUser.isError && <Notice>{getErrorMessage(removeUser.error)}</Notice>}
                <DeleteButton label={`Remove ${person.name}`} confirmLabel="Tap again to remove" isPending={removeUser.isPending} onConfirm={remove} />
            </section>
        </div>
    );
}
