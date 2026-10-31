export type Feature = "todos" | "shopping" | "recipes" | "calendar";

export interface User {
    id: number;
    name: string;
    isAdmin: boolean;
}

export interface StoredImage {
    url: string;
    thumbnailUrl: string;
}

export interface ImageUpload {
    data: string;
    thumbnail: string;
}

export type RepeatUnit = "day" | "week" | "month" | "year";

export interface TodoRepeat {
    every: number;
    unit: RepeatUnit;
}

export interface TodoList {
    id: number;
    name: string;
}

export interface Todo {
    id: number;
    title: string;
    listName: string;
    done: boolean;
    assigneeId: number | null;
    dueDate: string | null;
    repeat: TodoRepeat | null;
}

export interface TodoChanges {
    title?: string;
    listName?: string;
    done?: boolean;
    assigneeId?: number | null;
    dueDate?: string | null;
    repeat?: TodoRepeat | null;
}

export type ShoppingStatus = "needed" | "cart" | "bought";

export interface ShoppingItem {
    id: number;
    name: string;
    store: string | null;
    tags: string[];
    status: ShoppingStatus;
    buyOnce: boolean;
    image: StoredImage | null;
}

export interface ShoppingItemChanges {
    status?: ShoppingStatus;
}

export interface ShoppingItemInput {
    name: string;
    store: string;
    tags: string[];
    buyOnce?: boolean;
    image?: ImageUpload | null;
}

export interface Recipe {
    id: number;
    title: string;
    tags: string[];
    link: string | null;
    ingredients: string;
    steps: string;
    image: StoredImage | null;
}

export interface RecipeInput {
    title: string;
    tags: string[];
    link: string;
    ingredients: string;
    steps: string;
    image?: ImageUpload | null;
}

export interface CalendarEvent {
    id: number;
    title: string;
    date: string;
    startTime: string | null;
    endTime: string | null;
    location: string | null;
    notes: string | null;
}

export interface CalendarEventInput {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    notes: string;
}
