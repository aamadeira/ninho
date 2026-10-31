import type { ReactNode } from "react";
import styles from "./Notice.module.css";

interface NoticeProps {
    children: ReactNode;
}

export function Notice({ children }: NoticeProps) {
    return (
        <p className={styles.notice} role="alert">
            {children}
        </p>
    );
}
