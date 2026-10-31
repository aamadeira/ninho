import { compareText } from "../../lib/sorting";
import { collectTags } from "../../lib/tags";
import type { ShoppingItem } from "../../lib/types";

export interface ShoppingGroup {
    title: string;
    items: ShoppingItem[];
    isCart: boolean;
}

export function getStoreNames(items: ShoppingItem[]): string[] {
    const storeNames: string[] = [];

    for (const item of items) {
        if (item.store !== null && !storeNames.includes(item.store)) {
            storeNames.push(item.store);
        }
    }

    return storeNames.sort(compareText);
}

export function filterByStore(items: ShoppingItem[], storeName: string | null): ShoppingItem[] {
    if (storeName === null) {
        return items;
    }

    return items.filter((item) => item.store === storeName || item.store === null);
}

export function getShoppingTags(items: ShoppingItem[]): string[] {
    return collectTags(items.map((item) => item.tags));
}

export function filterByTags(items: ShoppingItem[], selectedTags: string[]): ShoppingItem[] {
    return items.filter((item) => selectedTags.every((tag) => item.tags.includes(tag)));
}

export function groupShoppingItems(items: ShoppingItem[], storeNames: string[]): ShoppingGroup[] {
    const groups: ShoppingGroup[] = [];
    const sortedItems = [...items].sort((first, second) => compareText(first.name, second.name));
    const neededItems = sortedItems.filter((item) => item.status === "needed");

    for (const storeName of storeNames) {
        const storeItems = neededItems.filter((item) => item.store === storeName);
        if (storeItems.length > 0) {
            groups.push({ title: storeName, items: storeItems, isCart: false });
        }
    }

    const anyStoreItems = neededItems.filter((item) => item.store === null);
    if (anyStoreItems.length > 0) {
        groups.push({ title: "Any store", items: anyStoreItems, isCart: false });
    }

    const cartItems = sortedItems.filter((item) => item.status === "cart");
    if (cartItems.length > 0) {
        groups.push({ title: "In the cart", items: cartItems, isCart: true });
    }

    const boughtItems = sortedItems.filter((item) => item.status === "bought");
    if (boughtItems.length > 0) {
        groups.push({ title: "Inventory", items: boughtItems, isCart: false });
    }

    return groups;
}

export function countNeededItems(items: ShoppingItem[]): number {
    return items.filter((item) => item.status === "needed").length;
}

export function countOpenItems(items: ShoppingItem[], storeName: string): number {
    return items.filter((item) => item.status === "needed" && item.store === storeName).length;
}

export function describeCheckout(items: ShoppingItem[]): string {
    const cartItems = items.filter((item) => item.status === "cart");
    const justOnceCount = cartItems.filter((item) => item.buyOnce).length;
    const keptCount = cartItems.length - justOnceCount;

    const parts: string[] = [];
    if (keptCount > 0) {
        parts.push(`${keptCount} moved to Inventory`);
    }

    if (justOnceCount === 1) {
        parts.push("1 just once item removed");
    }

    if (justOnceCount > 1) {
        parts.push(`${justOnceCount} just once items removed`);
    }

    return `${parts.join(", ")}.`;
}
