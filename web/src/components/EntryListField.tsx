import { useEffect, useRef, type ClipboardEvent, type KeyboardEvent, type ReactNode } from "react";
import { createEntry, splitLines, type Entry } from "../lib/entries";
import { ChevronDownIcon, ChevronUpIcon, CloseIcon, PlusIcon, TrashIcon } from "./icons/Icons";
import { useTranslation } from "../lib/i18n";
import textFieldStyles from "./TextField.module.css";
import styles from "./EntryListField.module.css";

type EntryField = HTMLInputElement | HTMLTextAreaElement;

interface EntryListFieldProps {
    label: string;
    itemLabel: string;
    addLabel: string;
    placeholder: string;
    isOrdered: boolean;
    entries: Entry[];
    onChange: (entries: Entry[]) => void;
}

function fitToContent(field: EntryField) {
    if (field instanceof HTMLTextAreaElement) {
        field.style.height = "auto";
        field.style.height = `${field.scrollHeight}px`;
    }
}

export function EntryListField({ label, itemLabel, addLabel, placeholder, isOrdered, entries, onChange }: EntryListFieldProps) {
    const { t } = useTranslation();
    const fields = useRef(new Map<number, EntryField>());
    const addButtonRef = useRef<HTMLButtonElement>(null);
    const entryIdToFocus = useRef<number | null>(null);

    useEffect(() => {
        if (entryIdToFocus.current === null) {
            return;
        }

        const field = fields.current.get(entryIdToFocus.current);
        entryIdToFocus.current = null;
        if (field) {
            field.focus();
            field.setSelectionRange(field.value.length, field.value.length);
        }
    });

    function changeText(field: EntryField, id: number) {
        fitToContent(field);
        onChange(entries.map((entry) => (entry.id === id ? { ...entry, text: field.value } : entry)));
    }

    function insertAfter(baseEntries: Entry[], index: number, texts: string[]) {
        const newEntries = texts.map((text) => createEntry(text));
        entryIdToFocus.current = newEntries[newEntries.length - 1].id;
        onChange([...baseEntries.slice(0, index + 1), ...newEntries, ...baseEntries.slice(index + 1)]);
    }

    function remove(index: number) {
        const remainingEntries = entries.filter((_entry, entryIndex) => entryIndex !== index);
        const neighbour = remainingEntries[Math.max(0, index - 1)];
        if (neighbour) {
            entryIdToFocus.current = neighbour.id;
        } else {
            addButtonRef.current?.focus();
        }

        onChange(remainingEntries);
    }

    function move(index: number, targetIndex: number) {
        const nextEntries = [...entries];
        const movedEntry = nextEntries[index];
        nextEntries[index] = nextEntries[targetIndex];
        nextEntries[targetIndex] = movedEntry;
        onChange(nextEntries);
    }

    function handleKeyDown(event: KeyboardEvent<EntryField>, index: number) {
        if (event.key === "Enter" && !event.nativeEvent.isComposing) {
            event.preventDefault();
            insertAfter(entries, index, [""]);
            return;
        }

        if (event.key === "Backspace" && entries[index].text === "") {
            event.preventDefault();
            remove(index);
        }
    }

    function handlePaste(event: ClipboardEvent<EntryField>, index: number) {
        const lines = splitLines(event.clipboardData.getData("text"));
        if (lines.length < 2) {
            return;
        }

        event.preventDefault();
        if (entries[index].text.trim() !== "") {
            insertAfter(entries, index, lines);
            return;
        }

        const filledEntries = entries.map((entry, entryIndex) => (entryIndex === index ? { ...entry, text: lines[0] } : entry));
        insertAfter(filledEntries, index, lines.slice(1));
    }

    function rememberField(id: number, field: EntryField | null) {
        if (!field) {
            fields.current.delete(id);
            return;
        }

        fields.current.set(id, field);
        fitToContent(field);
    }

    function renderEntry(entry: Entry, index: number): ReactNode {
        const entryName = t("entries.name", { item: itemLabel, number: index + 1 });
        const entryLabel = entryName.toLowerCase();
        const sharedProps = {
            value: entry.text,
            placeholder,
            "aria-label": entryName,
            enterKeyHint: "next" as const,
            onKeyDown: (event: KeyboardEvent<EntryField>) => handleKeyDown(event, index),
            onPaste: (event: ClipboardEvent<EntryField>) => handlePaste(event, index)
        };

        return (
            <li key={entry.id} className={styles.entry} data-sheet-reveal>
                <div className={styles.line}>
                    {isOrdered && (
                        <span className={styles.number} aria-hidden="true">
                            {index + 1}
                        </span>
                    )}
                    {!isOrdered && <span className={styles.bullet} aria-hidden="true" />}
                    {isOrdered && (
                        <textarea
                            ref={(field) => rememberField(entry.id, field)}
                            rows={1}
                            className={[styles.field, styles.stepField].join(" ")}
                            onChange={(event) => changeText(event.target, entry.id)}
                            {...sharedProps}
                        />
                    )}
                    {!isOrdered && (
                        <>
                            <input
                                ref={(field) => rememberField(entry.id, field)}
                                className={styles.field}
                                autoComplete="off"
                                onChange={(event) => changeText(event.target, entry.id)}
                                {...sharedProps}
                            />
                            <button type="button" className={styles.removeIcon} aria-label={t("entries.removeLabel", { entry: entryLabel })} onClick={() => remove(index)}>
                                <CloseIcon size={18} />
                            </button>
                        </>
                    )}
                </div>
                {isOrdered && (
                    <div className={styles.toolbar}>
                        <button type="button" className={styles.tool} aria-label={t("entries.moveUpLabel", { entry: entryLabel })} disabled={index === 0} onClick={() => move(index, index - 1)}>
                            <ChevronUpIcon size={16} />
                            {t("entries.up")}
                        </button>
                        <button type="button" className={styles.tool} aria-label={t("entries.moveDownLabel", { entry: entryLabel })} disabled={index === entries.length - 1} onClick={() => move(index, index + 1)}>
                            <ChevronDownIcon size={16} />
                            {t("entries.down")}
                        </button>
                        <button type="button" className={[styles.tool, styles.removeTool].join(" ")} aria-label={t("entries.removeLabel", { entry: entryLabel })} onClick={() => remove(index)}>
                            <TrashIcon size={16} />
                            {t("entries.remove")}
                        </button>
                    </div>
                )}
            </li>
        );
    }

    const renderedEntries = entries.map(renderEntry);

    return (
        <fieldset className={styles.group}>
            <legend className={[textFieldStyles.label, styles.legend].join(" ")}>{label}</legend>
            <div className={styles.card}>
                {isOrdered && entries.length > 0 && <ol className={styles.entries}>{renderedEntries}</ol>}
                {!isOrdered && entries.length > 0 && <ul className={styles.entries}>{renderedEntries}</ul>}
                <button ref={addButtonRef} type="button" className={styles.addRow} onClick={() => insertAfter(entries, entries.length - 1, [""])}>
                    <span className={styles.addIcon} aria-hidden="true">
                        <PlusIcon size={16} />
                    </span>
                    {addLabel}
                </button>
            </div>
        </fieldset>
    );
}
