import { useEffect, useState } from "react";
import { Button } from "./Button";
import { TrashIcon } from "./icons/Icons";

interface DeleteButtonProps {
    isPending: boolean;
    label?: string;
    confirmLabel?: string;
    onConfirm: () => void;
}

const confirmationWindowInMilliseconds = 4000;

export function DeleteButton({ isPending, label = "Delete", confirmLabel = "Tap again to delete", onConfirm }: DeleteButtonProps) {
    const [isConfirming, setIsConfirming] = useState(false);

    useEffect(() => {
        if (!isConfirming) {
            return;
        }

        const timeout = setTimeout(() => setIsConfirming(false), confirmationWindowInMilliseconds);
        return () => clearTimeout(timeout);
    }, [isConfirming]);

    if (isConfirming) {
        return (
            <Button variant="danger" onClick={onConfirm} disabled={isPending}>
                {confirmLabel}
            </Button>
        );
    }

    return (
        <Button variant="ghost" onClick={() => setIsConfirming(true)}>
            <TrashIcon size={18} />
            {label}
        </Button>
    );
}
