import { Navigate } from "react-router";
import { ninhoPath, useNavigationItems } from "../lib/navigation";

export function HomeRedirect() {
    const navigationItems = useNavigationItems();

    if (navigationItems.length === 0) {
        return <Navigate to={ninhoPath} replace />;
    }

    return <Navigate to={navigationItems[0].path} replace />;
}
