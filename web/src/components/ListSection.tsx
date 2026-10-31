import type { ReactNode } from "react";
import styles from "./ListSection.module.css";

interface ListSectionProps {
    title: string;
    children: ReactNode;
}

export function ListSection({ title, children }: ListSectionProps) {
    return (
        <section className={styles.section}>
            <h2 className={styles.title}>{title}</h2>
            <ul className={styles.list}>{children}</ul>
        </section>
    );
}
