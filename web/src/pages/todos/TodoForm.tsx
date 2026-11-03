import { useState, type FormEvent } from "react";
import { Button } from "../../components/Button";
import { DeleteButton } from "../../components/DeleteButton";
import { SelectField } from "../../components/SelectField";
import { TextField } from "../../components/TextField";
import { todayIsoDate } from "../../lib/dates";
import { useDeleteTodo, useUpdateTodo } from "../../lib/queries";
import type { RepeatUnit, Todo, TodoRepeat, User } from "../../lib/types";
import { describeSchedule, describeUnit, repeatUnits } from "./todoSchedule";
import { useTranslation } from "../../lib/i18n";
import styles from "../Form.module.css";

interface TodoFormProps {
    todo: Todo;
    listNames: string[];
    users: User[];
    onDone: () => void;
}

function toAssigneeValue(assigneeId: number | null): string {
    if (assigneeId === null) {
        return "";
    }

    return String(assigneeId);
}

function fromAssigneeValue(value: string): number | null {
    if (!value) {
        return null;
    }

    return Number(value);
}

function toRepeat(unit: RepeatUnit | "", everyText: string): TodoRepeat | null {
    if (!unit) {
        return null;
    }

    const every = Number(everyText);
    if (!Number.isInteger(every) || every < 1) {
        return { every: 1, unit };
    }

    return { every, unit };
}

export function TodoForm({ todo, listNames, users, onDone }: TodoFormProps) {
    const translator = useTranslation();
    const { t } = translator;
    const updateTodo = useUpdateTodo();
    const deleteTodo = useDeleteTodo();
    const [title, setTitle] = useState(todo.title);
    const [listName, setListName] = useState(todo.listName);
    const [assigneeValue, setAssigneeValue] = useState(toAssigneeValue(todo.assigneeId));
    const [dueDate, setDueDate] = useState(todo.dueDate ?? "");
    const [repeatUnit, setRepeatUnit] = useState<RepeatUnit | "">(todo.repeat?.unit ?? "");
    const [repeatEvery, setRepeatEvery] = useState(String(todo.repeat?.every ?? 1));

    const repeat = toRepeat(repeatUnit, repeatEvery);

    function changeRepeatUnit(unit: RepeatUnit | "") {
        setRepeatUnit(unit);
        if (unit && !dueDate) {
            setDueDate(todayIsoDate());
        }
    }

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const changes = { title: title.trim(), listName, assigneeId: fromAssigneeValue(assigneeValue), dueDate: dueDate || null, repeat };
        updateTodo.mutate({ id: todo.id, changes });
        onDone();
    }

    function remove() {
        deleteTodo.mutate(todo.id);
        onDone();
    }

    return (
        <form className={styles.form} onSubmit={submit}>
            <TextField label={t("common.what")} autoComplete="off" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={200} required />

            <div className={styles.row}>
                <SelectField label={t("todos.list")} value={listName} onChange={(event) => setListName(event.target.value)}>
                    {listNames.map((name) => (
                        <option key={name} value={name}>
                            {name}
                        </option>
                    ))}
                </SelectField>
                <SelectField label={t("todos.assignee")} value={assigneeValue} onChange={(event) => setAssigneeValue(event.target.value)}>
                    <option value="">{t("todos.anyone")}</option>
                    {users.map((user) => (
                        <option key={user.id} value={String(user.id)}>
                            {user.name}
                        </option>
                    ))}
                </SelectField>
            </div>

            <TextField label={repeat ? t("todos.nextTimeField") : t("todos.when")} type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} required={repeat !== null} />

            <fieldset className={styles.fieldset}>
                <legend className={styles.legend}>{repeat ? t("todos.repeatEvery") : t("todos.repeats")}</legend>
                <div className={repeat ? styles.repeatFields : undefined}>
                    {repeat && (
                        <TextField
                            label={t("todos.howMany")}
                            isLabelHidden
                            type="number"
                            inputMode="numeric"
                            min={1}
                            max={365}
                            value={repeatEvery}
                            onChange={(event) => setRepeatEvery(event.target.value)}
                            required
                        />
                    )}
                    <SelectField label={t("todos.unit")} isLabelHidden value={repeatUnit} onChange={(event) => changeRepeatUnit(event.target.value as RepeatUnit | "")}>
                        <option value="">{t("todos.never")}</option>
                        {repeatUnits.map((unit) => (
                            <option key={unit} value={unit}>
                                {describeUnit(unit, repeat?.every ?? 1, translator)}
                            </option>
                        ))}
                    </SelectField>
                </div>
            </fieldset>
            <p className={styles.hint}>{describeSchedule(repeat, dueDate, translator)}</p>

            <div className={[styles.actions, styles.spread].join(" ")}>
                <DeleteButton isPending={deleteTodo.isPending} onConfirm={remove} />
                <Button type="submit">{t("common.save")}</Button>
            </div>
        </form>
    );
}
