import { useCallback, useState } from "react";
import { Button } from "../../components/Button";
import { PlusIcon } from "../../components/icons/Icons";
import { Notice } from "../../components/Notice";
import { PageHeader } from "../../components/PageHeader";
import { Sheet } from "../../components/Sheet";
import { Toast } from "../../components/Toast";
import { useMe, useUsers } from "../../lib/queries";
import type { User } from "../../lib/types";
import { AddPersonForm } from "./AddPersonForm";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { PersonForm } from "./PersonForm";
import pageStyles from "../Page.module.css";
import styles from "./NinhoPage.module.css";

type SheetState = { mode: "closed" } | { mode: "add" } | { mode: "person"; userId: number } | { mode: "password" };

function describePerson(person: User, myUserId: number | undefined): string {
    const parts: string[] = [];
    if (person.id === myUserId) {
        parts.push("You");
    }

    if (person.isAdmin) {
        parts.push("Looks after this Ninho");
    }

    return parts.join(" · ");
}

export function NinhoPage() {
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
            Add someone
        </Button>
    );

    return (
        <>
            <PageHeader title="Ninho" subtitle="Everyone who can sign in to this Ninho." action={isAdmin ? addButton : undefined} />

            {usersQuery.isPending && <p className={pageStyles.status}>Loading…</p>}
            {usersQuery.isError && <Notice>Couldn't load who's in this Ninho.</Notice>}

            <ul className={styles.people}>
                {users.map((person) => (
                    <li key={person.id} className={styles.person}>
                        <span className={styles.avatar} aria-hidden="true">
                            {person.name.charAt(0)}
                        </span>
                        <span className={styles.details}>
                            <span className={styles.name}>{person.name}</span>
                            <span className={styles.role}>{describePerson(person, me.data?.id)}</span>
                        </span>
                        {isAdmin && person.id !== me.data?.id && (
                            <Button variant="secondary" onClick={() => setSheet({ mode: "person", userId: person.id })} aria-label={`Manage ${person.name}`}>
                                Manage
                            </Button>
                        )}
                    </li>
                ))}
            </ul>

            {!isAdmin && admins.length > 0 && <p className={styles.note}>Ask {admins[0].name} to add someone or to reset a forgotten password.</p>}
            {isAdmin && users.length === 1 && <p className={styles.note}>It's just you for now. Add the people you live with so you can share lists and split the chores.</p>}

            <h2 className={pageStyles.sectionTitle}>Your account</h2>
            <div className={styles.account}>
                <p className={pageStyles.muted}>You're signed in as {me.data?.name}.</p>
                <Button variant="secondary" onClick={() => setSheet({ mode: "password" })}>
                    Change password
                </Button>
            </div>

            <Sheet title="Add someone" isOpen={sheet.mode === "add"} onClose={closeSheet}>
                <AddPersonForm onAdded={(name) => finish(`${name} can sign in now.`)} />
            </Sheet>

            <Sheet title={selectedPerson?.name ?? ""} isOpen={sheet.mode === "person" && selectedPerson !== undefined} onClose={closeSheet}>
                {selectedPerson && <PersonForm key={selectedPerson.id} person={selectedPerson} onDone={finish} />}
            </Sheet>

            <Sheet title="Change password" isOpen={sheet.mode === "password"} onClose={closeSheet}>
                <ChangePasswordForm onChanged={() => finish("Password changed.")} />
            </Sheet>

            {message && <Toast message={message} onDismiss={dismissMessage} />}
        </>
    );
}
