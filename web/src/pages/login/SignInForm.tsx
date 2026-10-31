import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { Button } from "../../components/Button";
import { Notice } from "../../components/Notice";
import { TextField } from "../../components/TextField";
import { getErrorMessage } from "../../lib/api";
import { useSignIn } from "../../lib/queries";
import styles from "./LoginPage.module.css";

export function SignInForm() {
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
            <TextField label="Name" autoComplete="username" autoCapitalize="words" value={name} onChange={(event) => setName(event.target.value)} required />
            <TextField label="Password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            {signIn.isError && <Notice>{getErrorMessage(signIn.error)}</Notice>}
            <Button type="submit" size="lg" disabled={signIn.isPending}>
                {signIn.isPending ? "Signing in…" : "Sign in"}
            </Button>
        </form>
    );
}
