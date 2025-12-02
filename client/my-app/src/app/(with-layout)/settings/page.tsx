import SettingsMenu from "@/app/components/Settings/SettingsMenu";
import RegisterUserDialog from "@/app/components/Forms/CreateUser"
export default function Settings() {
    return (
        <div className="rounded-lg bg-[var(--color-white)] shadow-md p-6">
            <SettingsMenu />
            <RegisterUserDialog />
        </div>
    );
}