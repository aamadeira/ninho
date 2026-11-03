import { NavLink } from "react-router";
import { useNavigationItems } from "../lib/navigation";
import { useTranslation } from "../lib/i18n";
import styles from "./TabBar.module.css";

export function TabBar() {
    const { t } = useTranslation();
    const navigationItems = useNavigationItems();

    if (navigationItems.length < 2) {
        return null;
    }

    return (
        <nav className={styles.tabBar} aria-label={t("navigation.main")}>
            {navigationItems.map(({ labelKey, path, Icon }) => (
                <NavLink key={path} to={path} className={({ isActive }) => [styles.tab, isActive ? styles.active : ""].filter(Boolean).join(" ")}>
                    <span className={styles.icon}>
                        <Icon size={22} />
                    </span>
                    <span className={styles.label}>{t(labelKey)}</span>
                </NavLink>
            ))}
        </nav>
    );
}
