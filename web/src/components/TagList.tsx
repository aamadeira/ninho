import styles from "./TagList.module.css";

interface TagListProps {
    tags: string[];
}

export function TagList({ tags }: TagListProps) {
    if (tags.length === 0) {
        return null;
    }

    return (
        <span className={styles.tags}>
            {tags.map((tag) => (
                <span key={tag} className={styles.tag}>
                    {tag}
                </span>
            ))}
        </span>
    );
}
