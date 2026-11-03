import { NavLink } from "react-router";
import { ninhoPath, useNavigationItems } from "../lib/navigation";
import { useMe, useSignOut } from "../lib/queries";
import { HouseIcon, SignOutIcon } from "./icons/Icons";
import { Logo } from "./Logo";
import { useTranslation } from "../lib/i18n";
import styles from "./Sidebar.module.css";

function getLinkClassName({ isActive }: { isActive: boolean }): string {
    return [styles.link, isActive ? styles.active : ""].filter(Boolean).join(" ");
}

export function Sidebar() {
    const { t } = useTranslation();
    const me = useMe();
    const signOut = useSignOut();
    const navigationItems = useNavigationItems();

    return (
        <aside className={styles.sidebar}>
            <Logo />
            <nav className={styles.nav} aria-label={t("navigation.main")}>
                {navigationItems.map(({ labelKey, path, Icon }) => (
                    <NavLink key={path} to={path} className={getLinkClassName}>
                        <Icon size={22} />
                        {t(labelKey)}
                    </NavLink>
                ))}
            </nav>
            <NavLink to={ninhoPath} className={getLinkClassName}>
                <HouseIcon size={22} />
                {t("navigation.ninho")}
            </NavLink>
            <div className={styles.account}>
                <span className={styles.avatar} aria-hidden="true">
                    {me.data?.name.charAt(0)}
                </span>
                <span className={styles.name}>{me.data?.name}</span>
                <button type="button" className={styles.signOut} aria-label={t("navigation.signOut")} title={t("navigation.signOut")} onClick={() => signOut.mutate()}>
                    <SignOutIcon size={18} />
                </button>
            </div>
        </aside>
    );
}
