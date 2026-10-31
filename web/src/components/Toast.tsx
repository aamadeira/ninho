import { useEffect } from "react";
import styles from "./Toast.module.css";

interface ToastProps {
    message: string;
    actionLabel?: string;
    onAction?: () => void;
    onDismiss: () => void;
}

const visibleForMilliseconds = 6000;

export function Toast({ message, actionLabel, onAction, onDismiss }: ToastProps) {
    useEffect(() => {
        const timeout = setTimeout(onDismiss, visibleForMilliseconds);
        return () => clearTimeout(timeout);
    }, [message, onDismiss]);

    function runAction() {
        onAction?.();
        onDismiss();
    }

    return (
        <div className={styles.toast} role="status">
            <p className={styles.message}>{message}</p>
            {actionLabel && (
                <button type="button" className={styles.action} onClick={runAction}>
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
