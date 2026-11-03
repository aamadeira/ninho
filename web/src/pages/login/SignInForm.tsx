import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { Button } from "../../components/Button";
import { Notice } from "../../components/Notice";
import { TextField } from "../../components/TextField";
import { getErrorMessage } from "../../lib/api";
import { useSignIn } from "../../lib/queries";
import { useTranslation } from "../../lib/i18n";
import styles from "./LoginPage.module.css";

export function SignInForm() {
    const { t } = useTranslation();
    const signIn = useSignIn();
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        signIn.mutate({ name: name.trim(), password }, { onSuccess: () => navigate("/", { replace: true }) });
    }

    return (
        <form className={styles.form} onSubmit={submit}>
            <TextField label={t("common.name")} autoComplete="username" autoCapitalize="words" value={name} onChange={(event) => setName(event.target.value)} required />
            <TextField label={t("login.password")} type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            {signIn.isError && <Notice>{getErrorMessage(signIn.error, t)}</Notice>}
            <Button type="submit" size="lg" disabled={signIn.isPending}>
                {signIn.isPending ? t("login.signingIn") : t("login.signIn")}
            </Button>
        </form>
    );
}
