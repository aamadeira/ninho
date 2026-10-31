import { useId, type TextareaHTMLAttributes } from "react";
import styles from "./TextField.module.css";

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    hint?: string;
}

export function TextAreaField({ label, hint, id, ...rest }: TextAreaFieldProps) {
    const generatedId = useId();
    const textAreaId = id ?? generatedId;
    const hintId = `${textAreaId}-hint`;

    return (
        <div className={styles.field}>
            <label htmlFor={textAreaId} className={styles.label}>
                {label}
            </label>
            <textarea id={textAreaId} className={[styles.input, styles.textArea].join(" ")} aria-describedby={hint ? hintId : undefined} {...rest} />
            {hint && (
                <p id={hintId} className={styles.hint}>
                    {hint}
                </p>
            )}
        </div>
    );
}
