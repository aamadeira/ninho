import styles from "./Logo.module.css";

interface LogoProps {
    size?: "sm" | "lg";
}

export function NestMark({ size = 32 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" className={styles.mark}>
            <ellipse className={styles.egg} cx="18.5" cy="21" rx="6.5" ry="8" transform="rotate(-12 18.5 21)" />
            <ellipse className={styles.egg} cx="29.5" cy="20" rx="6.5" ry="8" transform="rotate(10 29.5 20)" />
            <path className={styles.nest} d="M5 24.5c0 9.6 8.5 16.5 19 16.5s19-6.9 19-16.5H5Z" />
            <path className={styles.twig} d="M8.5 29c5 2.4 26 2.4 31 0M11.5 34.5c4.5 1.8 20.5 1.8 25 0M15 24.5l-3.5 4M33 24.5l3.5 4.2" />
        </svg>
    );
}

export function Logo({ size = "sm" }: LogoProps) {
    return (
        <span className={[styles.logo, styles[size]].join(" ")}>
            <NestMark size={size === "lg" ? 56 : 32} />
            <span className={styles.wordmark}>ninho</span>
        </span>
    );
}
