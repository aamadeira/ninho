import { TagList } from "../../components/TagList";
import type { ShoppingItem } from "../../lib/types";
import styles from "./ShoppingPage.module.css";

interface ShoppingItemDetailProps {
    item: ShoppingItem;
}

export function ShoppingItemDetail({ item }: ShoppingItemDetailProps) {
    let store: string | null = null;
    if (item.status !== "needed") {
        store = item.store;
    }

    if (store === null && !item.buyOnce && item.tags.length === 0) {
        return null;
    }

    return (
        <span className={styles.detail}>
            {store && <span>{store}</span>}
            {item.buyOnce && <span>Just once</span>}
            <TagList tags={item.tags} />
        </span>
    );
}
