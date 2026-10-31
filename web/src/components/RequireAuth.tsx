import { Navigate, Outlet } from "react-router";
import { useFeatures, useMe } from "../lib/queries";
import { Button } from "./Button";
import { NestMark } from "./Logo";
import styles from "./RequireAuth.module.css";

export function RequireAuth() {
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
                <p>Couldn't reach Ninho. Check that you're on the home network or Tailscale.</p>
                <Button variant="secondary" onClick={() => retry()}>
                    Try again
                </Button>
            </div>
        );
    }

    if (!me.data) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
