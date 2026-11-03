import { useState, type FormEvent } from "react";
import { Button } from "../../components/Button";
import { Notice } from "../../components/Notice";
import { TextField } from "../../components/TextField";
import { getErrorMessage } from "../../lib/api";
import { useChangeOwnPassword } from "../../lib/queries";
import { useTranslation } from "../../lib/i18n";
import styles from "../Form.module.css";

interface ChangePasswordFormProps {
    onChanged: () => void;
}

export function ChangePasswordForm({ onChanged }: ChangePasswordFormProps) {
    const { t } = useTranslation();
    const changeOwnPassword = useChangeOwnPassword();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        changeOwnPassword.mutate({ currentPassword, newPassword }, { onSuccess: onChanged });
    }

    return (
        <form className={styles.form} onSubmit={submit}>
            <TextField label={t("ninho.currentPassword")} type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} data-autofocus required />
            <TextField
                label={t("ninho.newPassword")}
                hint={t("ninho.newPasswordHint")}
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
            />
            {changeOwnPassword.isError && <Notice>{getErrorMessage(changeOwnPassword.error, t)}</Notice>}
            <div className={styles.actions}>
                <Button type="submit" disabled={changeOwnPassword.isPending}>
                    {changeOwnPassword.isPending ? t("common.saving") : t("ninho.changePassword")}
                </Button>
            </div>
        </form>
    );
}
