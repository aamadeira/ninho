import type { ReactNode } from "react";
import styles from "./Chip.module.css";

interface ChipProps {
    label: string;
    isSelected?: boolean;
    count?: number;
    icon?: ReactNode;
    isDashed?: boolean;
    onClick: () => void;
}

export function Chip({ label, isSelected = false, count, icon, isDashed = false, onClick }: ChipProps) {
    const classNames = [styles.chip, isSelected ? styles.selected : "", isDashed ? styles.dashed : ""].filter(Boolean).join(" ");

    return (
        <button type="button" className={classNames} aria-pressed={isDashed ? undefined : isSelected} onClick={onClick}>
            {icon}
            <span>{label}</span>
            {count !== undefined && count > 0 && <span className={styles.count}>{count}</span>}
        </button>
    );
}
