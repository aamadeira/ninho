import { useMutation, useQuery, useQueryClient, type QueryClient, type QueryKey } from "@tanstack/react-query";
import { apiRequest, isApiError } from "./api";
import type { CalendarEvent, CalendarEventInput, Feature, Recipe, RecipeInput, ShoppingItem, ShoppingItemChanges, ShoppingItemInput, Todo, TodoChanges, TodoList, User } from "./types";

export const queryKeys = {
    me: ["me"],
    setup: ["setup"],
    features: ["features"],
    users: ["users"],
    todos: ["todos"],
    todoLists: ["todos", "lists"],
    shopping: ["shopping"],
    recipes: ["recipes"],
    events: ["events"]
};

interface OptimisticContext<T> {
    previous?: T[];
}

async function updateCachedList<T>(queryClient: QueryClient, queryKey: QueryKey, update: (items: T[]) => T[]): Promise<OptimisticContext<T>> {
    await queryClient.cancelQueries({ queryKey });
    const previous = queryClient.getQueryData<T[]>(queryKey);
    if (previous) {
        queryClient.setQueryData<T[]>(queryKey, update(previous));
    }
    return { previous };
}

let lastTemporaryId = 0;

function getTemporaryId(): number {
    lastTemporaryId--;
    return lastTemporaryId;
}

function putOnShoppingList(items: ShoppingItem[], input: ShoppingItemInput): ShoppingItem[] {
    const store = input.store || null;
    const existingItem = items.find((item) => item.name.toLowerCase() === input.name.toLowerCase());

    if (!existingItem) {
        return [...items, { id: getTemporaryId(), name: input.name, store, tags: input.tags, status: "needed", buyOnce: input.buyOnce ?? false, image: null, notes: input.notes || null }];
    }

    const mergedTags = [...existingItem.tags];
    for (const tag of input.tags) {
        if (!mergedTags.includes(tag)) {
            mergedTags.push(tag);
        }
    }

    return items.map((item) => (item === existingItem ? { ...item, status: "needed", store: store ?? item.store, tags: mergedTags } : item));
}

function applyShoppingEdit(item: ShoppingItem, input: ShoppingItemInput): ShoppingItem {
    const editedItem = { ...item, name: input.name, store: input.store || null, tags: input.tags, buyOnce: input.buyOnce ?? item.buyOnce };
    if (input.image === null) {
        editedItem.image = null;
    }

    if (input.notes !== undefined) {
        editedItem.notes = input.notes.trim() || null;
    }

    return editedItem;
}

function checkOut(items: ShoppingItem[]): ShoppingItem[] {
    const keptItems = items.filter((item) => item.status !== "cart" || !item.buyOnce);
    return keptItems.map((item) => (item.status === "cart" ? { ...item, status: "bought" } : item));
}

function restoreCachedList<T>(queryClient: QueryClient, queryKey: QueryKey, context?: OptimisticContext<T>) {
    if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
    }
}

export function useMe() {
    return useQuery({
        queryKey: queryKeys.me,
        queryFn: async (): Promise<User | null> => {
            try {
                const response = await apiRequest<{ user: User }>("/api/users/me");
                return response.user;
            } catch (error) {
                if (isApiError(error, 401)) {
                    return null;
                }
                throw error;
            }
        },
        staleTime: Infinity
    });
}

export function useSignIn() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (credentials: { name: string; password: string }) => {
            const response = await apiRequest<{ user: User }>("/auth/login", { method: "POST", body: credentials });
            return response.user;
        },
        onSuccess: (user) => queryClient.setQueryData(queryKeys.me, user)
    });
}

export function useSetupStatus() {
    return useQuery({
        queryKey: queryKeys.setup,
        queryFn: async () => {
            const response = await apiRequest<{ needsSetup: boolean }>("/auth/setup");
            return response.needsSetup;
        }
    });
}

export function useSetUp() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (account: { name: string; password: string }) => {
            const response = await apiRequest<{ user: User }>("/auth/setup", { method: "POST", body: account });
            return response.user;
        },
        onSuccess: (user) => {
            queryClient.setQueryData(queryKeys.setup, false);
            queryClient.setQueryData(queryKeys.me, user);
        },
        onError: () => queryClient.invalidateQueries({ queryKey: queryKeys.setup })
    });
}

export function useSignOut() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => apiRequest<object>("/auth/logout", { method: "POST" }),
        onSuccess: () => {
            queryClient.setQueryData(queryKeys.me, null);
            queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== queryKeys.me[0] });
        }
    });
}

export function useFeatures() {
    return useQuery({
        queryKey: queryKeys.features,
        queryFn: async () => {
            const response = await apiRequest<{ features: Feature[] }>("/auth/features");
            return response.features;
        },
        staleTime: Infinity
    });
}

export function useUsers() {
    return useQuery({
        queryKey: queryKeys.users,
        queryFn: async () => {
            const response = await apiRequest<{ users: User[] }>("/api/users");
            return response.users;
        }
    });
}

export function useAddUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (user: { name: string; password: string }) => apiRequest<{ user: User }>("/api/users", { method: "POST", body: user }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.users })
    });
}

export function useResetPassword() {
    return useMutation({
        mutationFn: ({ id, password }: { id: number; password: string }) => apiRequest<object>(`/api/users/${id}/password`, { method: "PUT", body: { password } })
    });
}

export function useChangeOwnPassword() {
    return useMutation({
        mutationFn: (passwords: { currentPassword: string; newPassword: string }) => apiRequest<object>("/api/users/me/password", { method: "PUT", body: passwords })
    });
}

export function useRemoveUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => apiRequest<string>(`/api/users/${id}`, { method: "DELETE" }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users });
            queryClient.invalidateQueries({ queryKey: queryKeys.todos });
        }
    });
}

export function useTodos() {
    return useQuery({
        queryKey: queryKeys.todos,
        queryFn: async () => {
            const response = await apiRequest<{ todos: Todo[] }>("/api/todos");
            return response.todos;
        }
    });
}

export function useTodoLists() {
    return useQuery({
        queryKey: queryKeys.todoLists,
        queryFn: async () => {
            const response = await apiRequest<{ lists: TodoList[] }>("/api/todo-lists");
            return response.lists;
        }
    });
}

export function useAddTodoList() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (name: string) => apiRequest<{ list: TodoList }>("/api/todo-lists", { method: "POST", body: { name } }),
        onMutate: (name) => updateCachedList<TodoList>(queryClient, queryKeys.todoLists, (lists) => [...lists, { id: getTemporaryId(), name }]),
        onError: (_error, _variables, context) => restoreCachedList(queryClient, queryKeys.todoLists, context),
        onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.todoLists })
    });
}

export function useDeleteTodoList() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (list: TodoList) => apiRequest<string>(`/api/todo-lists/${list.id}`, { method: "DELETE" }),
        onMutate: async (list) => {
            const todosContext = await updateCachedList<Todo>(queryClient, queryKeys.todos, (todos) => todos.filter((todo) => todo.listName !== list.name));
            const listsContext = await updateCachedList<TodoList>(queryClient, queryKeys.todoLists, (lists) => lists.filter((cached) => cached.id !== list.id));
            return { todosContext, listsContext };
        },
        onError: (_error, _variables, context) => {
            restoreCachedList(queryClient, queryKeys.todos, context?.todosContext);
            restoreCachedList(queryClient, queryKeys.todoLists, context?.listsContext);
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.todos })
    });
}

export function useAddTodo() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (todo: { title: string; listName: string }) => apiRequest<{ todo: Todo }>("/api/todos", { method: "POST", body: todo }),
        onMutate: async (todo) => {
            const newTodo: Todo = { id: getTemporaryId(), title: todo.title, listName: todo.listName, done: false, assigneeId: null, dueDate: null, repeat: null, notes: null };
            const context = await updateCachedList<Todo>(queryClient, queryKeys.todos, (todos) => [...todos, newTodo]);
            return { ...context, temporaryId: newTodo.id };
        },
        onSuccess: (response, _variables, context) => {
            queryClient.setQueryData<Todo[]>(queryKeys.todos, (todos) => todos?.map((todo) => (todo.id === context.temporaryId ? response.todo : todo)));
        },
        onError: (_error, _variables, context) => restoreCachedList(queryClient, queryKeys.todos, context),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.todos });
        }
    });
}

export function useUpdateTodo() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, changes }: { id: number; changes: TodoChanges }) => apiRequest<{ todo: Todo }>(`/api/todos/${id}`, { method: "PATCH", body: changes }),
        onMutate: ({ id, changes }) => updateCachedList<Todo>(queryClient, queryKeys.todos, (todos) => todos.map((todo) => (todo.id === id ? { ...todo, ...changes } : todo))),
        onError: (_error, _variables, context) => restoreCachedList(queryClient, queryKeys.todos, context),
        onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.todos })
    });
}

export function useDeleteTodo() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => apiRequest<string>(`/api/todos/${id}`, { method: "DELETE" }),
        onMutate: (id) => updateCachedList<Todo>(queryClient, queryKeys.todos, (todos) => todos.filter((todo) => todo.id !== id)),
        onError: (_error, _variables, context) => restoreCachedList(queryClient, queryKeys.todos, context),
        onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.todos })
    });
}

export function useClearDoneTodos() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => apiRequest<string>("/api/todos/done", { method: "DELETE" }),
        onMutate: () => updateCachedList<Todo>(queryClient, queryKeys.todos, (todos) => todos.filter((todo) => !todo.done)),
        onError: (_error, _variables, context) => restoreCachedList(queryClient, queryKeys.todos, context),
        onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.todos })
    });
}

export function useShoppingItems() {
    return useQuery({
        queryKey: queryKeys.shopping,
        queryFn: async () => {
            const response = await apiRequest<{ items: ShoppingItem[] }>("/api/shopping");
            return response.items;
        }
    });
}

export function useAddShoppingItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (item: ShoppingItemInput) => apiRequest<{ item: ShoppingItem }>("/api/shopping", { method: "POST", body: item }),
        onMutate: (item) => updateCachedList<ShoppingItem>(queryClient, queryKeys.shopping, (items) => putOnShoppingList(items, item)),
        onSuccess: (response) => {
            const savedName = response.item.name.toLowerCase();
            queryClient.setQueryData<ShoppingItem[]>(queryKeys.shopping, (items) => items?.map((item) => (item.name.toLowerCase() === savedName ? response.item : item)));
        },
        onError: (_error, _variables, context) => restoreCachedList(queryClient, queryKeys.shopping, context),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.shopping });
        }
    });
}

export function useUpdateShoppingItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, changes }: { id: number; changes: ShoppingItemChanges }) => apiRequest<{ item: ShoppingItem }>(`/api/shopping/${id}`, { method: "PATCH", body: changes }),
        onMutate: ({ id, changes }) => updateCachedList<ShoppingItem>(queryClient, queryKeys.shopping, (items) => items.map((item) => (item.id === id ? { ...item, ...changes } : item))),
        onError: (_error, _variables, context) => restoreCachedList(queryClient, queryKeys.shopping, context),
        onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.shopping })
    });
}

export function useEditShoppingItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, item }: { id: number; item: ShoppingItemInput }) => apiRequest<{ item: ShoppingItem }>(`/api/shopping/${id}`, { method: "PATCH", body: item }),
        onMutate: ({ id, item }) => updateCachedList<ShoppingItem>(queryClient, queryKeys.shopping, (items) => items.map((cached) => (cached.id === id ? applyShoppingEdit(cached, item) : cached))),
        onError: (_error, _variables, context) => restoreCachedList(queryClient, queryKeys.shopping, context),
        onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.shopping })
    });
}

export function useDeleteShoppingItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => apiRequest<string>(`/api/shopping/${id}`, { method: "DELETE" }),
        onMutate: (id) => updateCachedList<ShoppingItem>(queryClient, queryKeys.shopping, (items) => items.filter((item) => item.id !== id)),
        onError: (_error, _variables, context) => restoreCachedList(queryClient, queryKeys.shopping, context),
        onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.shopping })
    });
}

export function useCheckOut() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => apiRequest<object>("/api/shopping/checkout", { method: "POST" }),
        onMutate: () => updateCachedList<ShoppingItem>(queryClient, queryKeys.shopping, checkOut),
        onError: (_error, _variables, context) => restoreCachedList(queryClient, queryKeys.shopping, context),
        onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.shopping })
    });
}

export function useRecipes() {
    return useQuery({
        queryKey: queryKeys.recipes,
        queryFn: async () => {
            const response = await apiRequest<{ recipes: Recipe[] }>("/api/recipes");
            return response.recipes;
        }
    });
}

export function useSaveRecipe() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, recipe }: { id?: number; recipe: RecipeInput }) => {
            if (id === undefined) {
                const response = await apiRequest<{ recipe: Recipe }>("/api/recipes", { method: "POST", body: recipe });
                return response.recipe;
            }

            const response = await apiRequest<{ recipe: Recipe }>(`/api/recipes/${id}`, { method: "PUT", body: recipe });
            return response.recipe;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.recipes })
    });
}

export function useDeleteRecipe() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => apiRequest<string>(`/api/recipes/${id}`, { method: "DELETE" }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.recipes })
    });
}

export function useEvents() {
    return useQuery({
        queryKey: queryKeys.events,
        queryFn: async () => {
            const response = await apiRequest<{ events: CalendarEvent[] }>("/api/events");
            return response.events;
        }
    });
}

export function useSaveEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, event }: { id?: number; event: CalendarEventInput }) => {
            if (id === undefined) {
                const response = await apiRequest<{ event: CalendarEvent }>("/api/events", { method: "POST", body: event });
                return response.event;
            }

            const response = await apiRequest<{ event: CalendarEvent }>(`/api/events/${id}`, { method: "PUT", body: event });
            return response.event;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.events })
    });
}

export function useDeleteEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => apiRequest<string>(`/api/events/${id}`, { method: "DELETE" }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.events })
    });
}
