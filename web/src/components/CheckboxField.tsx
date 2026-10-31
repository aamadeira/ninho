import { useId } from "react";
import { CheckIcon } from "./icons/Icons";
import styles from "./CheckboxField.module.css";

interface CheckboxFieldProps {
    label: string;
    hint?: string;
    isChecked: boolean;
    onChange: (isChecked: boolean) => void;
}

export function CheckboxField({ label, hint, isChecked, onChange }: CheckboxFieldProps) {
    const hintId = useId();

    return (
        <label className={styles.field}>
            <input type="checkbox" className={styles.input} checked={isChecked} aria-describedby={hint ? hintId : undefined} onChange={(event) => onChange(event.target.checked)} />
            <span className={styles.box} aria-hidden="true">
                <CheckIcon size={16} />
            </span>
            <span className={styles.text}>
                <span className={styles.label}>{label}</span>
                {hint && (
                    <span id={hintId} className={styles.hint}>
                        {hint}
                    </span>
                )}
            </span>
        </label>
    );
}
