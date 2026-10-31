import { NavLink } from "react-router";
import { ninhoPath, useNavigationItems } from "../lib/navigation";
import { useMe, useSignOut } from "../lib/queries";
import { HouseIcon, SignOutIcon } from "./icons/Icons";
import { Logo } from "./Logo";
import styles from "./Sidebar.module.css";

function getLinkClassName({ isActive }: { isActive: boolean }): string {
    return [styles.link, isActive ? styles.active : ""].filter(Boolean).join(" ");
}

export function Sidebar() {
    const me = useMe();
    const signOut = useSignOut();
    const navigationItems = useNavigationItems();

    return (
        <aside className={styles.sidebar}>
            <Logo />
            <nav className={styles.nav} aria-label="Main">
                {navigationItems.map(({ label, path, Icon }) => (
                    <NavLink key={path} to={path} className={getLinkClassName}>
                        <Icon size={22} />
                        {label}
                    </NavLink>
                ))}
            </nav>
            <NavLink to={ninhoPath} className={getLinkClassName}>
                <HouseIcon size={22} />
                Ninho
            </NavLink>
            <div className={styles.account}>
                <span className={styles.avatar} aria-hidden="true">
                    {me.data?.name.charAt(0)}
                </span>
                <span className={styles.name}>{me.data?.name}</span>
                <button type="button" className={styles.signOut} aria-label="Sign out" title="Sign out" onClick={() => signOut.mutate()}>
                    <SignOutIcon size={18} />
                </button>
            </div>
        </aside>
    );
}
