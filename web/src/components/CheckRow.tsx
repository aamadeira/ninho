import type { ReactNode } from "react";
import { CheckIcon } from "./icons/Icons";
import { useTranslation } from "../lib/i18n";
import styles from "./CheckRow.module.css";

interface CheckRowProps {
    label: string;
    detail?: ReactNode;
    notes?: string | null;
    isDone: boolean;
    thumbnailUrl?: string | null;
    onToggle: (done: boolean) => void;
    onEdit: () => void;
    onOpenImage?: () => void;
}

export function CheckRow({ label, detail, notes, isDone, thumbnailUrl, onToggle, onEdit, onOpenImage }: CheckRowProps) {
    const { t } = useTranslation();

    return (
        <li className={[styles.row, isDone ? styles.done : ""].filter(Boolean).join(" ")}>
            <label className={styles.checkArea}>
                <input type="checkbox" className={styles.input} aria-label={label} checked={isDone} onChange={(event) => onToggle(event.target.checked)} />
                <span className={styles.box} aria-hidden="true">
                    <CheckIcon size={16} />
                </span>
            </label>
            <button type="button" className={styles.textButton} aria-label={t("rows.edit", { name: label })} onClick={onEdit}>
                <span className={styles.text}>
                    <span className={styles.title}>{label}</span>
                    {detail && <span className={styles.detail}>{detail}</span>}
                    {notes && <span className={styles.notes}>{notes}</span>}
                </span>
            </button>
            {thumbnailUrl && (
                <button type="button" className={styles.thumbnail} aria-label={t("rows.showPhoto", { name: label })} onClick={onOpenImage}>
                    <img src={thumbnailUrl} alt="" width={44} height={44} loading="lazy" decoding="async" />
                </button>
            )}
        </li>
    );
}
