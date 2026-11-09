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
import { useTranslation, type Translate } from "../../lib/i18n";
import pageStyles from "../Page.module.css";
import styles from "./ShoppingPage.module.css";

type SheetState = { mode: "closed" } | { mode: "edit"; itemId: number } | { mode: "photo"; itemId: number };

interface PageToast {
    id: number;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
}

function getSummary(items: ShoppingItem[], t: Translate): string | undefined {
    const openCount = countNeededItems(items);
    if (openCount === 0) {
        return undefined;
    }

    return t("shopping.toBuy", { count: openCount });
}

export function ShoppingPage() {
    const { t } = useTranslation();
    const shoppingQuery = useShoppingItems();
    const updateShoppingItem = useUpdateShoppingItem();
    const checkOut = useCheckOut();
    const [selectedStore, setSelectedStore] = useState<string | null>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [sheet, setSheet] = useState<SheetState>({ mode: "closed" });
    const [toast, setToast] = useState<PageToast | null>(null);
    const dismissToast = useCallback(() => setToast(null), []);

    const items = shoppingQuery.data ?? [];
    const storeNames = getStoreNames(items);
    const tags = getShoppingTags(items);
    const activeTags = selectedTags.filter((tag) => tags.includes(tag));
    const visibleItems = filterByTags(filterByStore(items, selectedStore), activeTags);
    const groups = groupShoppingItems(visibleItems, storeNames, t);

    let sheetItem: ShoppingItem | undefined;
    if (sheet.mode !== "closed") {
        sheetItem = items.find((item) => item.id === sheet.itemId);
    }

    function closeSheet() {
        setSheet({ mode: "closed" });
    }

    function finishShopping() {
        setToast({ id: Date.now(), message: describeCheckout(items, t) });
        checkOut.mutate();
    }

    function toggleItem(item: ShoppingItem, isTicked: boolean) {
        const previousStatus = item.status;
        let message = t("shopping.backOnList", { name: item.name });
        if (isTicked) {
            message = t("shopping.putInCart", { name: item.name });
        }

        updateShoppingItem.mutate({ id: item.id, changes: { status: isTicked ? "cart" : "needed" } });
        setToast({
            id: Date.now(),
            message,
            actionLabel: t("common.undo"),
            onAction: () => updateShoppingItem.mutate({ id: item.id, changes: { status: previousStatus } })
        });
    }

    function showAdded(name: string, savedId: Promise<number>) {
        setToast({
            id: Date.now(),
            message: t("common.added", { name }),
            actionLabel: t("common.details"),
            onAction: () => savedId.then((itemId) => setSheet({ mode: "edit", itemId }), () => undefined)
        });
    }

    return (
        <>
            <PageHeader title={t("shopping.title")} subtitle={getSummary(items, t)} />

            {storeNames.length > 0 && (
                <ChipRow label={t("shopping.stores")}>
                    <Chip label={t("shopping.allStores")} isSelected={selectedStore === null} onClick={() => setSelectedStore(null)} />
                    {storeNames.map((storeName) => (
                        <Chip key={storeName} label={storeName} count={countOpenItems(items, storeName)} isSelected={selectedStore === storeName} onClick={() => setSelectedStore(storeName)} />
                    ))}
                </ChipRow>
            )}

            {tags.length > 0 && (
                <ChipRow label={t("common.tags")}>
                    {tags.map((tag) => (
                        <Chip key={tag} label={tag} icon={<TagIcon size={14} />} isSelected={activeTags.includes(tag)} onClick={() => setSelectedTags(toggleTag(activeTags, tag))} />
                    ))}
                </ChipRow>
            )}

            <AddShoppingItemForm key={selectedStore ?? "all-stores"} defaultStore={selectedStore} storeNames={storeNames} tags={activeTags} onAdded={showAdded} />

            {shoppingQuery.isPending && <p className={pageStyles.status}>{t("common.loading")}</p>}
            {shoppingQuery.isError && <Notice>{t("shopping.loadError")}</Notice>}
            {shoppingQuery.isSuccess && items.length === 0 && (
                <EmptyState title={t("shopping.emptyTitle")} text={t("shopping.emptyText")} />
            )}
            {items.length > 0 && groups.length === 0 && <p className={pageStyles.status}>{t("shopping.noTagMatch")}</p>}

            {groups.map((group) => (
                <div key={group.title} className={styles.group}>
                    <ListSection title={group.title}>
                        {group.items.map((item) => (
                            <CheckRow
                                key={item.id}
                                label={item.name}
                                detail={<ShoppingItemDetail item={item} />}
                                notes={item.notes}
                                isDone={item.status !== "needed"}
                                thumbnailUrl={item.image?.thumbnailUrl}
                                onToggle={(isTicked) => toggleItem(item, isTicked)}
                                onEdit={() => setSheet({ mode: "edit", itemId: item.id })}
                                onOpenImage={() => setSheet({ mode: "photo", itemId: item.id })}
                            />
                        ))}
                    </ListSection>
                    {group.isCart && (
                        <div className={styles.checkout}>
                            <Button onClick={finishShopping}>{t("shopping.doneShopping")}</Button>
                            <p className={styles.checkoutHint}>{t("shopping.checkoutHint")}</p>
                        </div>
                    )}
                </div>
            ))}

            {toast && <Toast key={toast.id} message={toast.message} actionLabel={toast.actionLabel} onAction={toast.onAction} onDismiss={dismissToast} />}

            <Sheet title={t("shopping.editTitle")} isOpen={sheet.mode === "edit" && sheetItem !== undefined} onClose={closeSheet}>
                {sheet.mode === "edit" && sheetItem && <ShoppingItemForm key={sheetItem.id} item={sheetItem} storeNames={storeNames} knownTags={tags} onDone={closeSheet} />}
            </Sheet>

            <Sheet title={sheetItem?.name ?? ""} isOpen={sheet.mode === "photo" && Boolean(sheetItem?.image)} onClose={closeSheet}>
                {sheet.mode === "photo" && sheetItem?.image && <img src={sheetItem.image.url} alt={sheetItem.name} className={styles.photo} />}
            </Sheet>
        </>
    );
}
