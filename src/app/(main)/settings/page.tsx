
import SettingsComponent from "@/components/settings/setting-comp";
import {getCurrentSession} from "@/lib/actions/session";
import {notFound} from "next/navigation";
import {getProfileData} from "@/lib/actions/user";

export default async function Page() {

    const {session, user} = await getCurrentSession();

    if (!session || !user) {
        return notFound();
    }


    const profile = await getProfileData(user.id);

    return <SettingsComponent
                profileData={profile}
            />;
}