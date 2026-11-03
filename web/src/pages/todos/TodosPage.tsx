import { useCallback, useState } from "react";
import { Button } from "../../components/Button";
import { CheckRow } from "../../components/CheckRow";
import { DeleteButton } from "../../components/DeleteButton";
import { Chip } from "../../components/Chip";
import { ChipRow } from "../../components/ChipRow";
import { EmptyState } from "../../components/EmptyState";
import { PlusIcon } from "../../components/icons/Icons";
import { ListSection } from "../../components/ListSection";
import { Notice } from "../../components/Notice";
import { PageHeader } from "../../components/PageHeader";
import { Sheet } from "../../components/Sheet";
import { Toast } from "../../components/Toast";
import { formatShortDate, todayIsoDate } from "../../lib/dates";
import { useAddTodoList, useClearDoneTodos, useDeleteTodoList, useMe, useTodoLists, useTodos, useUpdateTodo, useUsers } from "../../lib/queries";
import type { Todo, TodoList } from "../../lib/types";
import { AddTodoForm } from "./AddTodoForm";
import { NewListForm } from "./NewListForm";
import { TodoForm } from "./TodoForm";
import { TodoMeta } from "./TodoMeta";
import { countOpenTodos, getListNames, groupTodos, matchesFilter, type TodoFilter } from "./todoGroups";
import { useTranslation, type Translate } from "../../lib/i18n";
import styles from "../Page.module.css";

type SheetState = { mode: "closed" } | { mode: "newList" } | { mode: "edit"; todoId: number };

interface RepeatToast {
    todoId: number;
    title: string;
    previousDueDate: string;
    nextDueDate: string;
}

function describeListDeletion(todoCount: number, t: Translate): string {
    if (todoCount === 0) {
        return t("common.tapAgainToDelete");
    }

    return t("todos.deleteListWithTodos", { count: todoCount });
}

function getSummary(todos: Todo[], today: string, t: Translate): string | undefined {
    if (todos.length === 0) {
        return undefined;
    }

    const openCount = countOpenTodos(todos, today);
    if (openCount === 0) {
        return t("todos.allDone");
    }

    return t("todos.stillToDo", { count: openCount });
}

export function TodosPage() {
    const { t, locale } = useTranslation();
    const me = useMe();
    const todosQuery = useTodos();
    const usersQuery = useUsers();
    const updateTodo = useUpdateTodo();
    const clearDoneTodos = useClearDoneTodos();
    const todoListsQuery = useTodoLists();
    const addTodoList = useAddTodoList();
    const deleteTodoList = useDeleteTodoList();
    const [filter, setFilter] = useState<TodoFilter>({ kind: "all" });
    const [sheet, setSheet] = useState<SheetState>({ mode: "closed" });
    const [toast, setToast] = useState<RepeatToast | null>(null);
    const dismissToast = useCallback(() => setToast(null), []);

    const today = todayIsoDate();
    const myUserId = me.data?.id ?? null;
    const todos = todosQuery.data ?? [];
    const users = usersQuery.data ?? [];
    const lists = todoListsQuery.data ?? [];
    const listNames = getListNames(lists, todos);
    const visibleTodos = todos.filter((todo) => matchesFilter(todo, filter, myUserId));
    const groups = groupTodos(visibleTodos, listNames, today, t);
    const doneCount = todos.filter((todo) => todo.done && todo.repeat === null).length;
    const myTodos = todos.filter((todo) => matchesFilter(todo, { kind: "mine" }, myUserId));

    let editingTodo: Todo | undefined;
    if (sheet.mode === "edit") {
        editingTodo = todos.find((todo) => todo.id === sheet.todoId);
    }

    const hasNoLists = todoListsQuery.isSuccess && listNames.length === 0;


    function countOpenInList(listName: string): number {
        const listTodos = todos.filter((todo) => todo.listName === listName);
        return countOpenTodos(listTodos, today);
    }

    function isListSelected(listName: string): boolean {
        return filter.kind === "list" && filter.listName === listName;
    }

    let selectedList: TodoList | undefined;
    if (filter.kind === "list") {
        selectedList = lists.find((list) => list.name === filter.listName);
    }

    const canDeleteSelectedList = selectedList !== undefined && selectedList.id > 0;

    function createList(listName: string) {
        const existingName = listNames.find((name) => name.toLowerCase() === listName.toLowerCase());
        if (existingName) {
            setFilter({ kind: "list", listName: existingName });
        } else {
            addTodoList.mutate(listName);
            setFilter({ kind: "list", listName });
        }

        setSheet({ mode: "closed" });
    }

    function deleteList(list: TodoList) {
        deleteTodoList.mutate(list);
        setFilter({ kind: "all" });
    }

    function toggleTodo(todo: Todo, done: boolean) {
        updateTodo.mutate(
            { id: todo.id, changes: { done } },
            {
                onSuccess: (response) => {
                    const nextDueDate = response.todo.dueDate;
                    if (done && todo.repeat !== null && todo.dueDate !== null && nextDueDate !== null) {
                        setToast({ todoId: todo.id, title: todo.title, previousDueDate: todo.dueDate, nextDueDate });
                    }
                }
            }
        );
    }

    function undoRepeat(repeatToast: RepeatToast) {
        updateTodo.mutate({ id: repeatToast.todoId, changes: { dueDate: repeatToast.previousDueDate } });
    }

    function getListNameToShow(todo: Todo, mixesLists: boolean): string | undefined {
        if (mixesLists && filter.kind !== "list") {
            return todo.listName;
        }

        return undefined;
    }

    return (
        <>
            <PageHeader title={t("todos.title")} subtitle={getSummary(todos, today, t)} />

            <ChipRow label={t("todos.lists")}>
                <Chip label={t("todos.all")} isSelected={filter.kind === "all"} onClick={() => setFilter({ kind: "all" })} />
                {users.length > 1 && <Chip label={t("todos.mine")} count={countOpenTodos(myTodos, today)} isSelected={filter.kind === "mine"} onClick={() => setFilter({ kind: "mine" })} />}
                {listNames.map((listName) => (
                    <Chip key={listName} label={listName} count={countOpenInList(listName)} isSelected={isListSelected(listName)} onClick={() => setFilter({ kind: "list", listName })} />
                ))}
                <Chip label={t("todos.newList")} icon={<PlusIcon size={16} />} isDashed onClick={() => setSheet({ mode: "newList" })} />
            </ChipRow>

            {filter.kind === "list" && <AddTodoForm key={filter.listName} listName={filter.listName} />}
            {filter.kind !== "list" && !hasNoLists && <p className={styles.addHint}>{t("todos.pickList")}</p>}

            {todosQuery.isPending && <p className={styles.status}>{t("common.loading")}</p>}
            {todosQuery.isError && <Notice>{t("todos.loadError")}</Notice>}
            {hasNoLists && (
                <EmptyState
                    title={t("todos.firstListTitle")}
                    text={t("todos.firstListText")}
                    action={
                        <Button onClick={() => setSheet({ mode: "newList" })}>
                            <PlusIcon size={18} />
                            {t("todos.newList")}
                        </Button>
                    }
                />
            )}
            {todosQuery.isSuccess && !hasNoLists && groups.length === 0 && filter.kind !== "mine" && (
                <EmptyState title={t("todos.emptyTitle")} text={t("todos.emptyText")} />
            )}
            {todosQuery.isSuccess && !hasNoLists && groups.length === 0 && filter.kind === "mine" && (
                <EmptyState title={t("todos.emptyMineTitle")} text={t("todos.emptyMineText")} />
            )}

            {groups.map((group) => (
                <ListSection key={group.title} title={group.title}>
                    {group.todos.map((todo) => (
                        <CheckRow
                            key={todo.id}
                            label={todo.title}
                            detail={<TodoMeta todo={todo} assignee={users.find((user) => user.id === todo.assigneeId)} listName={getListNameToShow(todo, group.mixesLists)} today={today} />}
                            isDone={todo.done}
                            onToggle={(done) => toggleTodo(todo, done)}
                            onEdit={() => setSheet({ mode: "edit", todoId: todo.id })}
                        />
                    ))}
                </ListSection>
            ))}

            {(doneCount > 0 || canDeleteSelectedList) && (
                <div className={styles.footerAction}>
                    {doneCount > 0 && (
                        <Button variant="ghost" onClick={() => clearDoneTodos.mutate()}>
                            {t("todos.clearDone", { count: doneCount })}
                        </Button>
                    )}
                    {canDeleteSelectedList && selectedList && (
                        <DeleteButton
                            label={t("todos.deleteList", { name: selectedList.name })}
                            confirmLabel={describeListDeletion(todos.filter((todo) => todo.listName === selectedList.name).length, t)}
                            isPending={deleteTodoList.isPending}
                            onConfirm={() => deleteList(selectedList)}
                        />
                    )}
                </div>
            )}

            <Sheet title={t("todos.newList")} isOpen={sheet.mode === "newList"} onClose={() => setSheet({ mode: "closed" })}>
                <NewListForm onCreate={createList} />
            </Sheet>

            <Sheet title={t("todos.editTitle")} isOpen={sheet.mode === "edit" && editingTodo !== undefined} onClose={() => setSheet({ mode: "closed" })}>
                {editingTodo && <TodoForm key={editingTodo.id} todo={editingTodo} listNames={listNames} users={users} onDone={() => setSheet({ mode: "closed" })} />}
            </Sheet>

            {toast && (
                <Toast
                    key={toast.todoId}
                    message={t("todos.nextTime", { title: toast.title, date: formatShortDate(toast.nextDueDate, locale) })}
                    actionLabel={t("common.undo")}
                    onAction={() => undoRepeat(toast)}
                    onDismiss={dismissToast}
                />
            )}
        </>
    );
}
