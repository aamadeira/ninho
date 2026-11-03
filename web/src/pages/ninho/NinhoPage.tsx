import { useCallback, useState } from "react";
import { Button } from "../../components/Button";
import { PlusIcon } from "../../components/icons/Icons";
import { Notice } from "../../components/Notice";
import { PageHeader } from "../../components/PageHeader";
import { SelectField } from "../../components/SelectField";
import { Sheet } from "../../components/Sheet";
import { Toast } from "../../components/Toast";
import { useMe, useUsers } from "../../lib/queries";
import type { User } from "../../lib/types";
import { AddPersonForm } from "./AddPersonForm";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { PersonForm } from "./PersonForm";
import { languageNames, languages, useTranslation, type LanguageChoice, type Translate } from "../../lib/i18n";
import pageStyles from "../Page.module.css";
import styles from "./NinhoPage.module.css";

type SheetState = { mode: "closed" } | { mode: "add" } | { mode: "person"; userId: number } | { mode: "password" };

function describePerson(person: User, myUserId: number | undefined, t: Translate): string {
    const parts: string[] = [];
    if (person.id === myUserId) {
        parts.push(t("ninho.you"));
    }

    if (person.isAdmin) {
        parts.push(t("navigation.admin"));
    }

    return parts.join(" · ");
}

export function NinhoPage() {
    const { t, choice, changeChoice } = useTranslation();
    const me = useMe();
    const usersQuery = useUsers();
    const [sheet, setSheet] = useState<SheetState>({ mode: "closed" });
    const [message, setMessage] = useState<string | null>(null);
    const dismissMessage = useCallback(() => setMessage(null), []);

    const users = usersQuery.data ?? [];
    const isAdmin = me.data?.isAdmin === true;
    const admins = users.filter((user) => user.isAdmin);

    let selectedPerson: User | undefined;
    if (sheet.mode === "person") {
        selectedPerson = users.find((user) => user.id === sheet.userId);
    }

    function closeSheet() {
        setSheet({ mode: "closed" });
    }

    function finish(doneMessage: string) {
        closeSheet();
        setMessage(doneMessage);
    }

    const addButton = (
        <Button onClick={() => setSheet({ mode: "add" })}>
            <PlusIcon size={18} />
            {t("ninho.addSomeone")}
        </Button>
    );

    return (
        <>
            <PageHeader title={t("ninho.title")} subtitle={t("ninho.subtitle")} action={isAdmin ? addButton : undefined} />

            {usersQuery.isPending && <p className={pageStyles.status}>{t("common.loading")}</p>}
            {usersQuery.isError && <Notice>{t("ninho.loadError")}</Notice>}

            <ul className={styles.people}>
                {users.map((person) => (
                    <li key={person.id} className={styles.person}>
                        <span className={styles.avatar} aria-hidden="true">
                            {person.name.charAt(0)}
                        </span>
                        <span className={styles.details}>
                            <span className={styles.name}>{person.name}</span>
                            <span className={styles.role}>{describePerson(person, me.data?.id, t)}</span>
                        </span>
                        {isAdmin && person.id !== me.data?.id && (
                            <Button variant="secondary" onClick={() => setSheet({ mode: "person", userId: person.id })} aria-label={t("ninho.managePerson", { name: person.name })}>
                                {t("ninho.manage")}
                            </Button>
                        )}
                    </li>
                ))}
            </ul>

            {!isAdmin && admins.length > 0 && <p className={styles.note}>{t("ninho.askAdmin", { name: admins[0].name })}</p>}
            {isAdmin && users.length === 1 && <p className={styles.note}>{t("ninho.justYou")}</p>}

            <h2 className={pageStyles.sectionTitle}>{t("ninho.yourAccount")}</h2>
            <div className={styles.account}>
                <p className={pageStyles.muted}>{t("ninho.signedInAs", { name: me.data?.name ?? "" })}</p>
                <Button variant="secondary" onClick={() => setSheet({ mode: "password" })}>
                    {t("ninho.changePassword")}
                </Button>
            </div>
            <div className={styles.language}>
                <SelectField label={t("ninho.language")} value={choice} onChange={(event) => changeChoice(event.target.value as LanguageChoice)}>
                    <option value="auto">{t("ninho.languageAuto")}</option>
                    {languages.map((language) => (
                        <option key={language} value={language} lang={language}>
                            {languageNames[language]}
                        </option>
                    ))}
                </SelectField>
            </div>

            <Sheet title={t("ninho.addSomeone")} isOpen={sheet.mode === "add"} onClose={closeSheet}>
                <AddPersonForm onAdded={(name) => finish(t("ninho.canSignIn", { name }))} />
            </Sheet>

            <Sheet title={selectedPerson?.name ?? ""} isOpen={sheet.mode === "person" && selectedPerson !== undefined} onClose={closeSheet}>
                {selectedPerson && <PersonForm key={selectedPerson.id} person={selectedPerson} onDone={finish} />}
            </Sheet>

            <Sheet title={t("ninho.changePassword")} isOpen={sheet.mode === "password"} onClose={closeSheet}>
                <ChangePasswordForm onChanged={() => finish(t("ninho.passwordChanged"))} />
            </Sheet>

            {message && <Toast message={message} onDismiss={dismissMessage} />}
        </>
    );
}
