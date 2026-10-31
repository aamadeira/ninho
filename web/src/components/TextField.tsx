import { useId, type InputHTMLAttributes } from "react";
import styles from "./TextField.module.css";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    hint?: string;
    isLabelHidden?: boolean;
}

export function TextField({ label, hint, isLabelHidden = false, id, className, ...rest }: TextFieldProps) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const hintId = `${inputId}-hint`;

    return (
        <div className={[styles.field, className].filter(Boolean).join(" ")}>
            <label htmlFor={inputId} className={isLabelHidden ? "visually-hidden" : styles.label}>
                {label}
            </label>
            <input id={inputId} className={styles.input} aria-describedby={hint ? hintId : undefined} {...rest} />
            {hint && (
                <p id={hintId} className={styles.hint}>
                    {hint}
                </p>
            )}
        </div>
    );
}
