
import React from "react";
import SessionDetails from "@/components/dashboard/session/session-overview";
import {Session} from "@/lib/definitions";
import {getCurrentSession} from "@/lib/actions/session";

const SessionOverviewPage = async () => {
    const session = await getCurrentSession();


    return null;
};

export default SessionOverviewPage;