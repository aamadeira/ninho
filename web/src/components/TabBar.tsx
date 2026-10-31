import { NavLink } from "react-router";
import { useNavigationItems } from "../lib/navigation";
import styles from "./TabBar.module.css";

export function TabBar() {
    const navigationItems = useNavigationItems();

    if (navigationItems.length < 2) {
        return null;
    }

    return (
        <nav className={styles.tabBar} aria-label="Main">
            {navigationItems.map(({ label, path, Icon }) => (
                <NavLink key={path} to={path} className={({ isActive }) => [styles.tab, isActive ? styles.active : ""].filter(Boolean).join(" ")}>
                    <span className={styles.icon}>
                        <Icon size={22} />
                    </span>
                    <span className={styles.label}>{label}</span>
                </NavLink>
            ))}
        </nav>
    );
}
