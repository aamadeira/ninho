import { useState, type FormEvent } from "react";
import { Button } from "../../components/Button";
import { DeleteButton } from "../../components/DeleteButton";
import { Notice } from "../../components/Notice";
import { TextField } from "../../components/TextField";
import { getErrorMessage } from "../../lib/api";
import { useRemoveUser, useResetPassword } from "../../lib/queries";
import type { User } from "../../lib/types";
import { useTranslation } from "../../lib/i18n";
import formStyles from "../Form.module.css";
import styles from "./NinhoPage.module.css";

interface PersonFormProps {
    person: User;
    onDone: (message: string) => void;
}

export function PersonForm({ person, onDone }: PersonFormProps) {
    const { t } = useTranslation();
    const resetPassword = useResetPassword();
    const removeUser = useRemoveUser();
    const [password, setPassword] = useState("");

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        resetPassword.mutate({ id: person.id, password }, { onSuccess: () => onDone(t("ninho.hasNewPassword", { name: person.name })) });
    }

    function remove() {
        removeUser.mutate(person.id, { onSuccess: () => onDone(t("ninho.removed", { name: person.name })) });
    }

    return (
        <div className={styles.personForm}>
            <form className={formStyles.form} onSubmit={submit}>
                <TextField
                    label={t("ninho.newPassword")}
                    hint={t("ninho.resetPasswordHint")}
                    autoComplete="off"
                    spellCheck={false}
                    minLength={8}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                />
                {resetPassword.isError && <Notice>{getErrorMessage(resetPassword.error, t)}</Notice>}
                <div className={formStyles.actions}>
                    <Button type="submit" variant="secondary" disabled={resetPassword.isPending}>
                        {resetPassword.isPending ? t("common.saving") : t("ninho.setPassword")}
                    </Button>
                </div>
            </form>

            <section className={styles.dangerZone}>
                <p className={styles.dangerText}>{t("ninho.removeText", { name: person.name })}</p>
                {removeUser.isError && <Notice>{getErrorMessage(removeUser.error, t)}</Notice>}
                <DeleteButton label={t("ninho.removePerson", { name: person.name })} confirmLabel={t("ninho.tapAgainToRemove")} isPending={removeUser.isPending} onConfirm={remove} />
            </section>
        </div>
    );
}
