import { useId, useState, type ChangeEvent } from "react";
import { getErrorMessage } from "../lib/api";
import { prepareImage } from "../lib/images";
import type { ImageUpload, StoredImage } from "../lib/types";
import { Button } from "./Button";
import { CameraIcon } from "./icons/Icons";
import { Notice } from "./Notice";
import styles from "./ImageField.module.css";

interface ImageFieldProps {
    label: string;
    hint?: string;
    currentImage: StoredImage | null;
    value: ImageUpload | null | undefined;
    onChange: (value: ImageUpload | null | undefined) => void;
}

function getPreviewUrl(currentImage: StoredImage | null, value: ImageUpload | null | undefined): string | null {
    if (value) {
        return value.data;
    }

    if (value === null || currentImage === null) {
        return null;
    }

    return currentImage.url;
}

export function ImageField({ label, hint, currentImage, value, onChange }: ImageFieldProps) {
    const inputId = useId();
    const [isPreparing, setIsPreparing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const previewUrl = getPreviewUrl(currentImage, value);

    async function pickFile(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) {
            return;
        }

        setError(null);
        setIsPreparing(true);
        try {
            onChange(await prepareImage(file));
        } catch (pickError) {
            setError(getErrorMessage(pickError));
        } finally {
            setIsPreparing(false);
        }
    }

    function remove() {
        if (currentImage) {
            onChange(null);
            return;
        }

        onChange(undefined);
    }

    const fileInput = <input id={inputId} type="file" accept="image/*" className="visually-hidden" onChange={pickFile} disabled={isPreparing} />;

    return (
        <div className={styles.field}>
            <span className={styles.label}>{label}</span>

            {previewUrl === null && (
                <label htmlFor={inputId} className={styles.picker} aria-busy={isPreparing}>
                    {fileInput}
                    <CameraIcon size={26} />
                    <span className={styles.pickerText}>{isPreparing ? "Getting the photo ready…" : "Add a photo"}</span>
                    {hint && <span className={styles.hint}>{hint}</span>}
                </label>
            )}

            {previewUrl !== null && (
                <div className={styles.preview}>
                    <img src={previewUrl} alt="" className={styles.image} />
                    <div className={styles.actions}>
                        <label htmlFor={inputId} className={styles.replace} aria-busy={isPreparing}>
                            {fileInput}
                            <CameraIcon size={18} />
                            {isPreparing ? "Getting it ready…" : "Replace"}
                        </label>
                        <Button variant="ghost" onClick={remove}>
                            Remove
                        </Button>
                    </div>
                </div>
            )}

            {error && <Notice>{error}</Notice>}
        </div>
    );
}
