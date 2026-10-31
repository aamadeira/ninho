import { Navigate } from "react-router";
import { Logo } from "../../components/Logo";
import { Notice } from "../../components/Notice";
import { useMe, useSetupStatus } from "../../lib/queries";
import { SetupForm } from "./SetupForm";
import { SignInForm } from "./SignInForm";
import styles from "./LoginPage.module.css";

export function LoginPage() {
    const me = useMe();
    const setupStatus = useSetupStatus();

    if (me.data) {
        return <Navigate to="/" replace />;
    }

    return (
        <main className={styles.page}>
            <div className={styles.card}>
                <Logo size="lg" />
                {setupStatus.data === true && (
                    <>
                        <h1 className={styles.welcome}>Welcome home</h1>
                        <p className={styles.tagline}>Create the first account. You'll look after this Ninho and can invite the rest of your household.</p>
                        <SetupForm />
                    </>
                )}
                {setupStatus.data === false && (
                    <>
                        <p className={styles.tagline}>Lists, recipes and plans for your home.</p>
                        <SignInForm />
                    </>
                )}
                {setupStatus.isError && <Notice>Couldn't reach Ninho. Check that you're on the home network or Tailscale.</Notice>}
            </div>
        </main>
    );
}
