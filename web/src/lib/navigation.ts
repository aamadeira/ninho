import type { ComponentType } from "react";
import { BasketIcon, BookIcon, CalendarIcon, ChecklistIcon, type IconProps } from "../components/icons/Icons";
import { useFeatures } from "./queries";
import type { Feature } from "./types";

interface NavigationItem {
    feature: Feature;
    label: string;
    path: string;
    Icon: ComponentType<IconProps>;
}

export const ninhoPath = "/ninho";

const navigationItems: NavigationItem[] = [
    { feature: "todos", label: "To-do", path: "/todos", Icon: ChecklistIcon },
    { feature: "shopping", label: "Shopping", path: "/shopping", Icon: BasketIcon },
    { feature: "recipes", label: "Recipes", path: "/recipes", Icon: BookIcon },
    { feature: "calendar", label: "Calendar", path: "/calendar", Icon: CalendarIcon }
];

export function useNavigationItems(): NavigationItem[] {
    const features = useFeatures();
    const enabledFeatures = features.data ?? [];
    return navigationItems.filter((item) => enabledFeatures.includes(item.feature));
}
