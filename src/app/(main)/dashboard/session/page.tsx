
import {getCurrentSession} from "@/lib/actions/session";

const SessionOverviewPage = async () => {
    const session = await getCurrentSession();


    return null;
};

export default SessionOverviewPage;