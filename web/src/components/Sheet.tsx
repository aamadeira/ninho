import { useEffect, useId, useRef, type MouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { CloseIcon } from "./icons/Icons";
import { useTranslation } from "../lib/i18n";
import styles from "./Sheet.module.css";

interface SheetProps {
    title: string;
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
}

const keyboardAnimationInMilliseconds = 700;
const dragThresholdInPixels = 10;
const dismissDistanceFraction = 0.3;
const dismissSpeedInPixelsPerMillisecond = 0.6;
const dimAnimationInMilliseconds = 200;
const typingInputTypes = ["text", "search", "email", "url", "tel", "password", "number"];

function isTyping(panel: HTMLElement): boolean {
    const focusedElement = document.activeElement;
    if (!focusedElement || !panel.contains(focusedElement)) {
        return false;
    }

    if (focusedElement instanceof HTMLTextAreaElement) {
        return true;
    }

    return focusedElement instanceof HTMLInputElement && typingInputTypes.includes(focusedElement.type);
}

function canDiscard(hasChanges: boolean, question: string): boolean {
    return !hasChanges || window.confirm(question);
}

export function Sheet({ title, isOpen, onClose, children }: SheetProps) {
    const { t } = useTranslation();
    const discardQuestion = t("common.discardChanges");
    const discardQuestionRef = useRef(discardQuestion);
    const sheetRef = useRef<HTMLDivElement>(null);
    const dimRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const hasChangesRef = useRef(false);
    const onCloseRef = useRef(onClose);
    const titleId = useId();

    useEffect(() => {
        onCloseRef.current = onClose;
        discardQuestionRef.current = discardQuestion;
    });

    function dismiss() {
        if (canDiscard(hasChangesRef.current, discardQuestion)) {
            onClose();
        }
    }

    useEffect(() => {
        const panel = panelRef.current;
        if (!isOpen || !panel) {
            return;
        }

        const previouslyFocusedElement = document.activeElement;
        const appRoot = document.getElementById("root");

        appRoot?.setAttribute("inert", "");
        document.documentElement.style.overflow = "hidden";

        const fieldToFocus = panel.querySelector<HTMLElement>("[data-autofocus]");
        if (fieldToFocus) {
            fieldToFocus.focus();
        } else {
            panel.focus();
        }

        return () => {
            appRoot?.removeAttribute("inert");
            document.documentElement.style.overflow = "";
            if (previouslyFocusedElement instanceof HTMLElement) {
                previouslyFocusedElement.focus({ preventScroll: true });
            }
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape" && canDiscard(hasChangesRef.current, discardQuestionRef.current)) {
                onClose();
            }
        };

        document.addEventListener("keydown", closeOnEscape);
        return () => document.removeEventListener("keydown", closeOnEscape);
    }, [isOpen, onClose]);

    useEffect(() => {
        const sheet = sheetRef.current;
        const panel = panelRef.current;
        const dim = dimRef.current;
        if (!isOpen || !sheet || !panel || !dim) {
            return;
        }

        const viewport = window.visualViewport;
        let followFrame = 0;
        let followUntil = 0;

        const fitAboveKeyboard = () => {
            if (!viewport || !isTyping(panel)) {
                sheet.style.removeProperty("--keyboard-inset");
                sheet.style.removeProperty("--visible-height");
                return;
            }

            const layoutViewportHeight = dim.getBoundingClientRect().height;
            const keyboardInset = Math.max(0, layoutViewportHeight - viewport.offsetTop - viewport.height);
            sheet.style.setProperty("--keyboard-inset", `${keyboardInset}px`);
            sheet.style.setProperty("--visible-height", `${viewport.height}px`);
        };

        const followKeyboard = () => {
            fitAboveKeyboard();
            if (performance.now() < followUntil) {
                followFrame = requestAnimationFrame(followKeyboard);
            }
        };

        const startFollowingKeyboard = () => {
            followUntil = performance.now() + keyboardAnimationInMilliseconds;
            cancelAnimationFrame(followFrame);
            followKeyboard();
        };

        const revealFocusedField = () => {
            startFollowingKeyboard();
            const focusedElement = document.activeElement;
            if (isTyping(panel) && focusedElement instanceof HTMLElement) {
                const areaToReveal = focusedElement.closest<HTMLElement>("[data-sheet-reveal]") ?? focusedElement;
                areaToReveal.scrollIntoView({ block: "nearest" });
            }
        };

        panel.addEventListener("focusin", revealFocusedField);
        panel.addEventListener("focusout", startFollowingKeyboard);
        viewport?.addEventListener("scroll", startFollowingKeyboard);
        viewport?.addEventListener("resize", revealFocusedField);
        startFollowingKeyboard();

        return () => {
            cancelAnimationFrame(followFrame);
            panel.removeEventListener("focusin", revealFocusedField);
            panel.removeEventListener("focusout", startFollowingKeyboard);
            viewport?.removeEventListener("scroll", startFollowingKeyboard);
            viewport?.removeEventListener("resize", revealFocusedField);
        };
    }, [isOpen]);

    useEffect(() => {
        const panel = panelRef.current;
        if (!isOpen || !panel) {
            return;
        }

        hasChangesRef.current = false;
        const rememberChange = () => {
            hasChangesRef.current = true;
        };
        const forgetSavedChanges = () => {
            hasChangesRef.current = false;
        };

        panel.addEventListener("input", rememberChange);
        panel.addEventListener("submit", forgetSavedChanges);
        return () => {
            panel.removeEventListener("input", rememberChange);
            panel.removeEventListener("submit", forgetSavedChanges);
        };
    }, [isOpen]);

    useEffect(() => {
        const sheet = sheetRef.current;
        const panel = panelRef.current;
        if (!isOpen || !sheet || !panel) {
            return;
        }

        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        let dimLevel = 0;
        let dimFrame = 0;
        let dimSafetyTimer = 0;
        let topBarTint: HTMLDivElement | null = null;
        let startY = 0;
        let lastY = 0;
        let lastTime = 0;
        let speed = 0;
        let distance = 0;
        let isTracking = false;
        let isDragging = false;

        const replaceTopBarTint = (level: number) => {
            const freshTint = document.createElement("div");
            freshTint.className = styles.topBarTint;
            freshTint.style.setProperty("--dim-level", String(level));
            document.body.append(freshTint);
            topBarTint?.remove();
            topBarTint = freshTint;
        };

        const setDimLevel = (level: number) => {
            dimLevel = level;
            sheet.style.setProperty("--dim-level", String(level));
            replaceTopBarTint(level);
        };

        const stopDimAnimation = () => {
            cancelAnimationFrame(dimFrame);
            window.clearTimeout(dimSafetyTimer);
        };

        const animateDimLevel = (targetLevel: number, onFinished?: () => void) => {
            stopDimAnimation();

            const finish = () => {
                stopDimAnimation();
                setDimLevel(targetLevel);
                onFinished?.();
            };

            if (prefersReducedMotion) {
                finish();
                return;
            }

            const startLevel = dimLevel;
            const startTime = performance.now();
            const step = () => {
                const progress = (performance.now() - startTime) / dimAnimationInMilliseconds;
                if (progress >= 1) {
                    finish();
                    return;
                }

                const easedProgress = 1 - (1 - progress) ** 3;
                setDimLevel(startLevel + (targetLevel - startLevel) * easedProgress);
                dimFrame = requestAnimationFrame(step);
            };

            dimFrame = requestAnimationFrame(step);
            dimSafetyTimer = window.setTimeout(finish, dimAnimationInMilliseconds * 2);
        };

        const showOffset = (offset: number) => {
            panel.style.transform = `translateY(${offset}px)`;
            stopDimAnimation();
            setDimLevel(1 - Math.min(1, offset / panel.offsetHeight));
        };

        const startTracking = (event: TouchEvent) => {
            const startedOnField = event.target instanceof Element && event.target.closest("input, textarea, select") !== null;
            isTracking = event.touches.length === 1 && panel.scrollTop <= 0 && !startedOnField;
            isDragging = false;
            startY = event.touches[0].clientY;
            lastY = startY;
            lastTime = event.timeStamp;
            speed = 0;
            distance = 0;
        };

        const followFinger = (event: TouchEvent) => {
            if (!isTracking) {
                return;
            }

            const y = event.touches[0].clientY;
            const travelled = y - startY;
            if (!isDragging) {
                if (travelled < 0) {
                    isTracking = false;
                    return;
                }

                if (travelled < dragThresholdInPixels) {
                    return;
                }

                isDragging = true;
                panel.style.transition = "none";
            }

            event.preventDefault();
            const elapsed = event.timeStamp - lastTime;
            if (elapsed > 0) {
                speed = (y - lastY) / elapsed;
            }

            lastY = y;
            lastTime = event.timeStamp;
            distance = Math.max(0, travelled - dragThresholdInPixels);
            showOffset(distance);
        };

        const release = () => {
            isTracking = false;
            if (!isDragging) {
                return;
            }

            isDragging = false;
            panel.style.transition = "transform var(--duration-base) var(--ease-out)";

            const isFarEnough = distance > panel.offsetHeight * dismissDistanceFraction;
            const isFastEnough = speed > dismissSpeedInPixelsPerMillisecond;
            if ((isFarEnough || isFastEnough) && canDiscard(hasChangesRef.current, discardQuestionRef.current)) {
                panel.style.transform = `translateY(${panel.offsetHeight}px)`;
                animateDimLevel(0, () => onCloseRef.current());
                return;
            }

            panel.style.transform = "";
            animateDimLevel(1);
        };

        setDimLevel(0);
        animateDimLevel(1);
        panel.addEventListener("touchstart", startTracking, { passive: true });
        panel.addEventListener("touchmove", followFinger, { passive: false });
        panel.addEventListener("touchend", release);
        panel.addEventListener("touchcancel", release);

        return () => {
            stopDimAnimation();
            topBarTint?.remove();
            panel.removeEventListener("touchstart", startTracking);
            panel.removeEventListener("touchmove", followFinger);
            panel.removeEventListener("touchend", release);
            panel.removeEventListener("touchcancel", release);
        };
    }, [isOpen]);

    function keepTypingWhileTapping(event: MouseEvent<HTMLDivElement>) {
        const panel = panelRef.current;
        if (!panel || !isTyping(panel) || !(event.target instanceof Element)) {
            return;
        }

        const isControl = event.target.closest("button, a, label") !== null;
        const isField = event.target.closest("input, select, textarea") !== null;
        if (isControl && !isField) {
            event.preventDefault();
        }
    }

    if (!isOpen) {
        return null;
    }

    return createPortal(
        <div ref={sheetRef}>
            <div ref={dimRef} className={styles.dim} onClick={dismiss} />
            <div ref={panelRef} className={styles.panel} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} onMouseDown={keepTypingWhileTapping}>
                <div className={styles.grabber} aria-hidden="true" />
                <header className={styles.header}>
                    <h2 id={titleId} className={styles.title}>
                        {title}
                    </h2>
                    <button type="button" className={styles.close} aria-label={t("common.close")} onClick={dismiss}>
                        <CloseIcon />
                    </button>
                </header>
                {children}
            </div>
            <div className={styles.keyboardGap} />
        </div>,
        document.body
    );
}
