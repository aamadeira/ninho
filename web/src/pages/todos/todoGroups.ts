import type { Translate } from "../../lib/i18n";
import { compareText } from "../../lib/sorting";
import type { Todo, TodoList } from "../../lib/types";

export type TodoFilter = { kind: "all" } | { kind: "mine" } | { kind: "list"; listName: string };

export interface TodoGroup {
    title: string;
    todos: Todo[];
    mixesLists: boolean;
}

export function getListNames(lists: TodoList[], todos: Todo[]): string[] {
    const listNames = lists.map((list) => list.name);

    for (const todo of todos) {
        if (!listNames.includes(todo.listName)) {
            listNames.push(todo.listName);
        }
    }

    return listNames.sort(compareText);
}

export function matchesFilter(todo: Todo, filter: TodoFilter, myUserId: number | null): boolean {
    if (filter.kind === "mine") {
        return todo.assigneeId !== null && todo.assigneeId === myUserId;
    }

    if (filter.kind === "list") {
        return todo.listName === filter.listName;
    }

    return true;
}

export function isComingUp(todo: Todo, today: string): boolean {
    return !todo.done && todo.dueDate !== null && todo.dueDate > today;
}

function isInTheListNow(todo: Todo, today: string): boolean {
    const isRepeatingAndJustTicked = todo.done && todo.repeat !== null;
    return (!todo.done || isRepeatingAndJustTicked) && !isComingUp(todo, today);
}

function compareTitles(first: Todo, second: Todo): number {
    return compareText(first.title, second.title);
}

function compareDueDates(first: Todo, second: Todo): number {
    const byDate = (first.dueDate ?? "").localeCompare(second.dueDate ?? "");
    if (byDate !== 0) {
        return byDate;
    }

    return compareTitles(first, second);
}

export function groupTodos(todos: Todo[], listNames: string[], today: string, t: Translate): TodoGroup[] {
    const groups: TodoGroup[] = [];

    for (const listName of listNames) {
        const listTodos = todos.filter((todo) => todo.listName === listName && isInTheListNow(todo, today)).sort(compareTitles);
        if (listTodos.length > 0) {
            groups.push({ title: listName, todos: listTodos, mixesLists: false });
        }
    }

    const comingUpTodos = todos.filter((todo) => isComingUp(todo, today)).sort(compareDueDates);
    if (comingUpTodos.length > 0) {
        groups.push({ title: t("todos.comingUp"), todos: comingUpTodos, mixesLists: true });
    }

    const doneTodos = todos.filter((todo) => todo.done && todo.repeat === null).sort(compareTitles);
    if (doneTodos.length > 0) {
        groups.push({ title: t("todos.done"), todos: doneTodos, mixesLists: true });
    }

    return groups;
}

export function countOpenTodos(todos: Todo[], today: string): number {
    return todos.filter((todo) => !todo.done && !isComingUp(todo, today)).length;
}
