import type { ReactNode } from "react";
import styles from "./ChipRow.module.css";

interface ChipRowProps {
    label: string;
    children: ReactNode;
}

export function ChipRow({ label, children }: ChipRowProps) {
    return (
        <div className={styles.row} role="group" aria-label={label}>
            {children}
        </div>
    );
}
