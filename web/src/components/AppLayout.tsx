import { useLayoutEffect } from "react";
import { Outlet } from "react-router";
import { useLiveUpdates } from "../lib/useLiveUpdates";
import { MobileHeader } from "./MobileHeader";
import { Sidebar } from "./Sidebar";
import { TabBar } from "./TabBar";
import styles from "./AppLayout.module.css";

function tintSafariBottomBarLikeTheTabBar(): () => void {
    document.body.style.backgroundColor = "var(--surface)";

    return () => {
        document.body.style.backgroundColor = "";
    };
}

export function AppLayout() {
    useLiveUpdates();
    useLayoutEffect(tintSafariBottomBarLikeTheTabBar, []);

    return (
        <div className={styles.layout}>
            <Sidebar />
            <div className={styles.column}>
                <MobileHeader />
                <main className={styles.main}>
                    <Outlet />
                </main>
            </div>
            <TabBar />
            <div className={styles.safariTopBarTint} aria-hidden="true" />
        </div>
    );
}
