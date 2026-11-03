import type { ComponentType } from "react";
import { BasketIcon, BookIcon, CalendarIcon, ChecklistIcon, type IconProps } from "../components/icons/Icons";
import { useFeatures } from "./queries";
import type { Feature } from "./types";
import type { TranslationKey } from "./i18n";

interface NavigationItem {
    feature: Feature;
    labelKey: TranslationKey;
    path: string;
    Icon: ComponentType<IconProps>;
}

export const ninhoPath = "/ninho";

const navigationItems: NavigationItem[] = [
    { feature: "todos", labelKey: "navigation.todos", path: "/todos", Icon: ChecklistIcon },
    { feature: "shopping", labelKey: "navigation.shopping", path: "/shopping", Icon: BasketIcon },
    { feature: "recipes", labelKey: "navigation.recipes", path: "/recipes", Icon: BookIcon },
    { feature: "calendar", labelKey: "navigation.calendar", path: "/calendar", Icon: CalendarIcon }
];

export function useNavigationItems(): NavigationItem[] {
    const features = useFeatures();
    const enabledFeatures = features.data ?? [];
    return navigationItems.filter((item) => enabledFeatures.includes(item.feature));
}
