import { useRef } from "react";
import { Link } from "react-router";
import { ninhoPath } from "../lib/navigation";
import { useMe, useSignOut } from "../lib/queries";
import { HouseIcon, SignOutIcon } from "./icons/Icons";
import { Logo } from "./Logo";
import { useTranslation } from "../lib/i18n";
import styles from "./MobileHeader.module.css";

const accountMenuId = "account-menu";

export function MobileHeader() {
    const { t } = useTranslation();
    const me = useMe();
    const signOut = useSignOut();
    const menuRef = useRef<HTMLDivElement>(null);

    return (
        <header className={styles.header}>
            <Logo />
            <button type="button" className={styles.avatar} popoverTarget={accountMenuId} aria-label={t("navigation.account")}>
                {me.data?.name.charAt(0)}
            </button>
            <div ref={menuRef} id={accountMenuId} popover="auto" className={styles.menu}>
                <p className={styles.name}>{me.data?.name}</p>
                <p className={styles.role}>{me.data?.isAdmin ? t("navigation.admin") : t("navigation.member")}</p>
                <Link to={ninhoPath} className={styles.menuItem} onClick={() => menuRef.current?.hidePopover()}>
                    <HouseIcon size={18} />
                    {t("navigation.ninho")}
                </Link>
                <button type="button" className={styles.menuItem} onClick={() => signOut.mutate()}>
                    <SignOutIcon size={18} />
                    {t("navigation.signOut")}
                </button>
            </div>
        </header>
    );
}
