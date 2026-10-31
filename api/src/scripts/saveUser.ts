import { MigrationsUtils } from "../utils/database/migrations";
import { UsersUtils } from "../utils/users/utils";

async function saveUser() {
    const [name, password] = process.argv.slice(2);
    if (!name || !password) {
        console.log("Usage: saveUser <name> <password>");
        console.log("Adds the user, or sets a new password if someone with that name already exists.");
        process.exit(1);
    }

    MigrationsUtils.run();
    const user = await UsersUtils.save(name, password);
    console.log(`Saved ${user.name}${user.isAdmin ? " (admin)" : ""}`);
}

saveUser().catch((error) => {
    console.log(error.message);
    process.exit(1);
});
