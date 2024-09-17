import {auth} from "@/auth";
import React from "react";
import SessionDetails from "@/components/dashboard/session/session-overview";
import {Session} from "@/lib/definitions";

const SessionOverviewPage = async () => {
    const session = await auth();


    return <SessionDetails session={session as Session} />;
};

export default SessionOverviewPage;