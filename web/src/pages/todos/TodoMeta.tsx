import { RepeatIcon } from "../../components/icons/Icons";
import type { Todo, User } from "../../lib/types";
import { describeDueDate, describeRepeat } from "./todoSchedule";
import styles from "./TodoMeta.module.css";

interface TodoMetaProps {
    todo: Todo;
    assignee?: User;
    listName?: string;
    today: string;
}

export function TodoMeta({ todo, assignee, listName, today }: TodoMetaProps) {
    const openDueDate = todo.done ? null : todo.dueDate;
    const isOverdue = openDueDate !== null && openDueDate < today;

    if (!listName && !assignee && !todo.repeat && openDueDate === null) {
        return null;
    }

    return (
        <span className={styles.meta}>
            {listName && <span>{listName}</span>}
            {assignee && (
                <span className={styles.item}>
                    <span className={styles.avatar} aria-hidden="true">
                        {assignee.name.charAt(0)}
                    </span>
                    {assignee.name}
                </span>
            )}
            {todo.repeat && (
                <span className={styles.item}>
                    <RepeatIcon size={14} />
                    {describeRepeat(todo.repeat, todo.dueDate)}
                </span>
            )}
            {openDueDate !== null && <span className={isOverdue ? styles.overdue : undefined}>{describeDueDate(openDueDate, today)}</span>}
        </span>
    );
}
