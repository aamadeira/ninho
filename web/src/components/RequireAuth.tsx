import { Navigate, Outlet } from "react-router";
import { useFeatures, useMe } from "../lib/queries";
import { Button } from "./Button";
import { NestMark } from "./Logo";
import { useTranslation } from "../lib/i18n";
import styles from "./RequireAuth.module.css";

export function RequireAuth() {
    const { t } = useTranslation();
    const me = useMe();
    const features = useFeatures();

    function retry() {
        me.refetch();
        features.refetch();
    }

    if (me.isPending || features.isPending) {
        return (
            <div className={styles.center} aria-busy="true">
                <NestMark size={56} />
            </div>
        );
    }

    if (me.isError || features.isError) {
        return (
            <div className={styles.center}>
                <NestMark size={56} />
                <p>{t("common.unreachable")}</p>
                <Button variant="secondary" onClick={() => retry()}>
                    {t("common.tryAgain")}
                </Button>
            </div>
        );
    }

    if (!me.data) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
