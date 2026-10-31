import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { Button } from "../../components/Button";
import { Notice } from "../../components/Notice";
import { TextField } from "../../components/TextField";
import { getErrorMessage } from "../../lib/api";
import { useSetUp } from "../../lib/queries";
import styles from "./LoginPage.module.css";

export function SetupForm() {
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
            <TextField label="Your name" hint="It's what you'll sign in with." autoComplete="username" autoCapitalize="words" maxLength={60} value={name} onChange={(event) => setName(event.target.value)} required />
            <TextField label="Password" hint="At least 8 characters." type="password" autoComplete="new-password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required />
            {setUp.isError && <Notice>{getErrorMessage(setUp.error)}</Notice>}
            <Button type="submit" size="lg" disabled={setUp.isPending}>
                {setUp.isPending ? "Setting up…" : "Create account"}
            </Button>
        </form>
    );
}
