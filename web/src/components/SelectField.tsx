import { useId, type ReactNode, type SelectHTMLAttributes } from "react";
import { ChevronDownIcon } from "./icons/Icons";
import textFieldStyles from "./TextField.module.css";
import styles from "./SelectField.module.css";

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    hint?: string;
    isLabelHidden?: boolean;
    children: ReactNode;
}

export function SelectField({ label, hint, isLabelHidden = false, id, className, children, ...rest }: SelectFieldProps) {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const hintId = `${selectId}-hint`;

    return (
        <div className={[textFieldStyles.field, className].filter(Boolean).join(" ")}>
            <label htmlFor={selectId} className={isLabelHidden ? "visually-hidden" : textFieldStyles.label}>
                {label}
            </label>
            <div className={styles.control}>
                <select id={selectId} className={[textFieldStyles.input, styles.select].join(" ")} aria-describedby={hint ? hintId : undefined} {...rest}>
                    {children}
                </select>
                <span className={styles.chevron} aria-hidden="true">
                    <ChevronDownIcon size={18} />
                </span>
            </div>
            {hint && (
                <p id={hintId} className={textFieldStyles.hint}>
                    {hint}
                </p>
            )}
        </div>
    );
}
