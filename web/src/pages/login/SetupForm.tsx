import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { Button } from "../../components/Button";
import { Notice } from "../../components/Notice";
import { TextField } from "../../components/TextField";
import { getErrorMessage } from "../../lib/api";
import { useSetUp } from "../../lib/queries";
import { useTranslation } from "../../lib/i18n";
import styles from "./LoginPage.module.css";

export function SetupForm() {
    const { t } = useTranslation();
    const setUp = useSetUp();
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setUp.mutate({ name: name.trim(), password }, { onSuccess: () => navigate("/", { replace: true }) });
    }

    return (
        <form className={styles.form} onSubmit={submit}>
            <TextField label={t("login.yourName")} hint={t("login.yourNameHint")} autoComplete="username" autoCapitalize="words" maxLength={60} value={name} onChange={(event) => setName(event.target.value)} required />
            <TextField label={t("login.password")} hint={t("login.passwordHint")} type="password" autoComplete="new-password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required />
            {setUp.isError && <Notice>{getErrorMessage(setUp.error, t)}</Notice>}
            <Button type="submit" size="lg" disabled={setUp.isPending}>
                {setUp.isPending ? t("login.settingUp") : t("login.createAccount")}
            </Button>
        </form>
    );
}
