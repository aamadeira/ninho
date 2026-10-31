import { useId, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { filterSuggestions, normalizeTag } from "../lib/tags";
import { CloseIcon } from "./icons/Icons";
import { Suggestions } from "./Suggestions";
import textFieldStyles from "./TextField.module.css";
import styles from "./TagsField.module.css";

interface TagsFieldProps {
    label: string;
    hint?: string;
    tags: string[];
    suggestions: string[];
    maxTags: number;
    onChange: (tags: string[]) => void;
}

const maxTagLength = 30;

export function TagsField({ label, hint, tags, suggestions, maxTags, onChange }: TagsFieldProps) {
    const inputId = useId();
    const hintId = `${inputId}-hint`;
    const inputRef = useRef<HTMLInputElement>(null);
    const [draft, setDraft] = useState("");

    const isFull = tags.length >= maxTags;
    let visibleSuggestions = filterSuggestions(suggestions, draft, tags);
    if (isFull) {
        visibleSuggestions = [];
    }

    function addTags(texts: string[]) {
        const nextTags = [...tags];
        for (const text of texts) {
            const tag = normalizeTag(text).slice(0, maxTagLength);
            if (tag && !nextTags.includes(tag) && nextTags.length < maxTags) {
                nextTags.push(tag);
            }
        }

        onChange(nextTags);
    }

    function changeDraft(value: string) {
        if (!value.includes(",")) {
            setDraft(value);
            return;
        }

        const parts = value.split(",");
        const unfinishedPart = parts.pop() ?? "";
        addTags(parts);
        setDraft(unfinishedPart);
    }

    function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === "Enter") {
            event.preventDefault();
            addTags([draft]);
            setDraft("");
            return;
        }

        if (event.key === "Backspace" && draft === "" && tags.length > 0) {
            onChange(tags.slice(0, -1));
        }
    }

    function commitDraft() {
        if (draft.trim()) {
            addTags([draft]);
            setDraft("");
        }
    }

    function pickSuggestion(tag: string) {
        addTags([tag]);
        setDraft("");
    }

    function focusInput(event: MouseEvent<HTMLDivElement>) {
        if (event.target === event.currentTarget) {
            inputRef.current?.focus();
        }
    }

    let placeholder = "";
    if (tags.length === 0) {
        placeholder = "Type a tag…";
    }

    return (
        <div className={styles.field}>
            <div className={textFieldStyles.field}>
                <label htmlFor={inputId} className={textFieldStyles.label}>
                    {label}
                </label>
                <div className={styles.box} onClick={focusInput}>
                    {tags.map((tag) => (
                        <button key={tag} type="button" className={styles.pill} aria-label={`Remove ${tag}`} onClick={() => onChange(tags.filter((otherTag) => otherTag !== tag))}>
                            {tag}
                            <CloseIcon size={14} />
                        </button>
                    ))}
                    <input
                        ref={inputRef}
                        id={inputId}
                        className={styles.input}
                        value={draft}
                        placeholder={placeholder}
                        maxLength={maxTagLength}
                        disabled={isFull}
                        autoComplete="off"
                        autoCapitalize="none"
                        enterKeyHint="enter"
                        aria-describedby={hint ? hintId : undefined}
                        onChange={(event) => changeDraft(event.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={commitDraft}
                    />
                </div>
                {hint && (
                    <p id={hintId} className={textFieldStyles.hint}>
                        {hint}
                    </p>
                )}
            </div>
            <Suggestions label={`${label} used before`} options={visibleSuggestions} onPick={pickSuggestion} />
        </div>
    );
}
