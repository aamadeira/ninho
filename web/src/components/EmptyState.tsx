import type { ReactNode } from "react";
import { NestMark } from "./Logo";
import styles from "./EmptyState.module.css";

interface EmptyStateProps {
    title: string;
    text: string;
    action?: ReactNode;
}

export function EmptyState({ title, text, action }: EmptyStateProps) {
    return (
        <div className={styles.empty}>
            <NestMark size={44} />
            <p className={styles.title}>{title}</p>
            <p className={styles.text}>{text}</p>
            {action}
        </div>
    );
}
