import { useCallback, useState } from "react";
import { Button } from "../../components/Button";
import { CheckRow } from "../../components/CheckRow";
import { Chip } from "../../components/Chip";
import { ChipRow } from "../../components/ChipRow";
import { EmptyState } from "../../components/EmptyState";
import { TagIcon } from "../../components/icons/Icons";
import { ListSection } from "../../components/ListSection";
import { Notice } from "../../components/Notice";
import { PageHeader } from "../../components/PageHeader";
import { Sheet } from "../../components/Sheet";
import { Toast } from "../../components/Toast";
import { useCheckOut, useShoppingItems, useUpdateShoppingItem } from "../../lib/queries";
import { toggleTag } from "../../lib/tags";
import type { ShoppingItem } from "../../lib/types";
import { AddShoppingItemForm } from "./AddShoppingItemForm";
import { ShoppingItemDetail } from "./ShoppingItemDetail";
import { ShoppingItemForm } from "./ShoppingItemForm";
import { countNeededItems, countOpenItems, describeCheckout, filterByStore, filterByTags, getShoppingTags, getStoreNames, groupShoppingItems } from "./shoppingGroups";
import pageStyles from "../Page.module.css";
import styles from "./ShoppingPage.module.css";

type SheetState = { mode: "closed" } | { mode: "edit"; itemId: number } | { mode: "photo"; itemId: number };

function getSummary(items: ShoppingItem[]): string | undefined {
    const openCount = countNeededItems(items);
    if (openCount === 0) {
        return undefined;
    }

    if (openCount === 1) {
        return "1 thing to buy";
    }

    return `${openCount} things to buy`;
}

export function ShoppingPage() {
    const shoppingQuery = useShoppingItems();
    const updateShoppingItem = useUpdateShoppingItem();
    const checkOut = useCheckOut();
    const [selectedStore, setSelectedStore] = useState<string | null>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [sheet, setSheet] = useState<SheetState>({ mode: "closed" });
    const [message, setMessage] = useState<string | null>(null);
    const dismissMessage = useCallback(() => setMessage(null), []);

    const items = shoppingQuery.data ?? [];
    const storeNames = getStoreNames(items);
    const tags = getShoppingTags(items);
    const activeTags = selectedTags.filter((tag) => tags.includes(tag));
    const visibleItems = filterByTags(filterByStore(items, selectedStore), activeTags);
    const groups = groupShoppingItems(visibleItems, storeNames);

    let sheetItem: ShoppingItem | undefined;
    if (sheet.mode !== "closed") {
        sheetItem = items.find((item) => item.id === sheet.itemId);
    }

    function closeSheet() {
        setSheet({ mode: "closed" });
    }

    function finishShopping() {
        setMessage(describeCheckout(items));
        checkOut.mutate();
    }

    return (
        <>
            <PageHeader title="Shopping" subtitle={getSummary(items)} />

            {storeNames.length > 0 && (
                <ChipRow label="Stores">
                    <Chip label="All stores" isSelected={selectedStore === null} onClick={() => setSelectedStore(null)} />
                    {storeNames.map((storeName) => (
                        <Chip key={storeName} label={storeName} count={countOpenItems(items, storeName)} isSelected={selectedStore === storeName} onClick={() => setSelectedStore(storeName)} />
                    ))}
                </ChipRow>
            )}

            {tags.length > 0 && (
                <ChipRow label="Tags">
                    {tags.map((tag) => (
                        <Chip key={tag} label={tag} icon={<TagIcon size={14} />} isSelected={activeTags.includes(tag)} onClick={() => setSelectedTags(toggleTag(activeTags, tag))} />
                    ))}
                </ChipRow>
            )}

            <AddShoppingItemForm key={selectedStore ?? "all-stores"} defaultStore={selectedStore} storeNames={storeNames} tags={activeTags} />

            {shoppingQuery.isPending && <p className={pageStyles.status}>Loading…</p>}
            {shoppingQuery.isError && <Notice>Couldn't load the shopping list.</Notice>}
            {shoppingQuery.isSuccess && items.length === 0 && (
                <EmptyState title="The list is empty" text="Add what you need. Pick a store if it has to come from a specific supermarket." />
            )}
            {items.length > 0 && groups.length === 0 && <p className={pageStyles.status}>Nothing with those tags here. Try fewer tags.</p>}

            {groups.map((group) => (
                <div key={group.title} className={styles.group}>
                    <ListSection title={group.title}>
                        {group.items.map((item) => (
                            <CheckRow
                                key={item.id}
                                label={item.name}
                                detail={<ShoppingItemDetail item={item} />}
                                isDone={item.status !== "needed"}
                                thumbnailUrl={item.image?.thumbnailUrl}
                                onToggle={(isTicked) => updateShoppingItem.mutate({ id: item.id, changes: { status: isTicked ? "cart" : "needed" } })}
                                onEdit={() => setSheet({ mode: "edit", itemId: item.id })}
                                onOpenImage={() => setSheet({ mode: "photo", itemId: item.id })}
                            />
                        ))}
                    </ListSection>
                    {group.isCart && (
                        <div className={styles.checkout}>
                            <Button onClick={finishShopping}>Done shopping</Button>
                            <p className={styles.checkoutHint}>Moves the cart to Inventory, so you can untick things when they run out. Just once items are removed.</p>
                        </div>
                    )}
                </div>
            ))}

            {message && <Toast message={message} onDismiss={dismissMessage} />}

            <Sheet title="Edit item" isOpen={sheet.mode === "edit" && sheetItem !== undefined} onClose={closeSheet}>
                {sheet.mode === "edit" && sheetItem && <ShoppingItemForm key={sheetItem.id} item={sheetItem} storeNames={storeNames} knownTags={tags} onDone={closeSheet} />}
            </Sheet>

            <Sheet title={sheetItem?.name ?? ""} isOpen={sheet.mode === "photo" && Boolean(sheetItem?.image)} onClose={closeSheet}>
                {sheet.mode === "photo" && sheetItem?.image && <img src={sheetItem.image.url} alt={sheetItem.name} className={styles.photo} />}
            </Sheet>
        </>
    );
}
