import { Navigate } from "react-router";
import { Logo } from "../../components/Logo";
import { Notice } from "../../components/Notice";
import { useMe, useSetupStatus } from "../../lib/queries";
import { SetupForm } from "./SetupForm";
import { SignInForm } from "./SignInForm";
import { useTranslation } from "../../lib/i18n";
import styles from "./LoginPage.module.css";

export function LoginPage() {
    const { t } = useTranslation();
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
                        <h1 className={styles.welcome}>{t("login.welcome")}</h1>
                        <p className={styles.tagline}>{t("login.setupText")}</p>
                        <SetupForm />
                    </>
                )}
                {setupStatus.data === false && (
                    <>
                        <p className={styles.tagline}>{t("login.tagline")}</p>
                        <SignInForm />
                    </>
                )}
                {setupStatus.isError && <Notice>{t("common.unreachable")}</Notice>}
            </div>
        </main>
    );
}
