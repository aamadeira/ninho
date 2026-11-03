import { useState, type FormEvent } from "react";
import { Button } from "../../components/Button";
import { Notice } from "../../components/Notice";
import { TextField } from "../../components/TextField";
import { getErrorMessage } from "../../lib/api";
import { useAddUser } from "../../lib/queries";
import { useTranslation } from "../../lib/i18n";
import styles from "../Form.module.css";

interface AddPersonFormProps {
    onAdded: (name: string) => void;
}

export function AddPersonForm({ onAdded }: AddPersonFormProps) {
    const { t } = useTranslation();
    const addUser = useAddUser();
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        addUser.mutate({ name: name.trim(), password }, { onSuccess: (response) => onAdded(response.user.name) });
    }

    return (
        <form className={styles.form} onSubmit={submit}>
            <TextField label={t("common.name")} hint={t("ninho.nameHint")} autoComplete="off" autoCapitalize="words" maxLength={60} value={name} onChange={(event) => setName(event.target.value)} data-autofocus required />
            <TextField
                label={t("ninho.firstPassword")}
                hint={t("ninho.firstPasswordHint")}
                autoComplete="off"
                spellCheck={false}
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
            />
            {addUser.isError && <Notice>{getErrorMessage(addUser.error, t)}</Notice>}
            <div className={styles.actions}>
                <Button type="submit" disabled={addUser.isPending}>
                    {addUser.isPending ? t("ninho.adding") : t("ninho.addToNinho")}
                </Button>
            </div>
        </form>
    );
}
