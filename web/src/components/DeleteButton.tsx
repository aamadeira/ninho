import { useEffect, useState } from "react";
import { Button } from "./Button";
import { TrashIcon } from "./icons/Icons";
import { useTranslation } from "../lib/i18n";

interface DeleteButtonProps {
    isPending: boolean;
    label?: string;
    confirmLabel?: string;
    onConfirm: () => void;
}

const confirmationWindowInMilliseconds = 4000;

export function DeleteButton({ isPending, label, confirmLabel, onConfirm }: DeleteButtonProps) {
    const { t } = useTranslation();
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
                {confirmLabel ?? t("common.tapAgainToDelete")}
            </Button>
        );
    }

    return (
        <Button variant="ghost" onClick={() => setIsConfirming(true)}>
            <TrashIcon size={18} />
            {label ?? t("common.delete")}
        </Button>
    );
}
