import SettingsMenu from "@/components/features/settings/SettingsMenu";
import RegisterUserDialog from "@/components/forms/users/CreateUserForm"
export default function Settings() {
    return (
        <div className="rounded-lg bg-[var(--color-white)] shadow-md p-6">
            <SettingsMenu />
            <RegisterUserDialog />
        </div>
    );
}