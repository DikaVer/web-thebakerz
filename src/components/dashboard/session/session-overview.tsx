"use client";
import React from 'react';


import {Session} from "@/lib/actions/session";

const SessionDetails: React.FC<{ session: Session | null}> = ({ session }) => {
    if (!session)
        return <div>Session is not found</div>;


    return (
        <div className="mx-auto mt-8 p-6 ">

        </div>
    );
};

export default SessionDetails;