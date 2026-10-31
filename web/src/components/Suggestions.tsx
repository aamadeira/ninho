import { PlusIcon } from "./icons/Icons";
import chipStyles from "./Chip.module.css";
import styles from "./Suggestions.module.css";

interface SuggestionsProps {
    label: string;
    options: string[];
    onPick: (option: string) => void;
}

export function Suggestions({ label, options, onPick }: SuggestionsProps) {
    if (options.length === 0) {
        return null;
    }

    return (
        <div className={styles.suggestions} role="group" aria-label={label}>
            {options.map((option) => (
                <button key={option} type="button" className={[chipStyles.chip, chipStyles.dashed].join(" ")} onMouseDown={(event) => event.preventDefault()} onClick={() => onPick(option)}>
                    <PlusIcon size={14} />
                    <span>{option}</span>
                </button>
            ))}
        </div>
    );
}
