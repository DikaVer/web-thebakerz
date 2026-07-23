/**
 * @fileoverview API route handling GET /api/store/[storeId]/schedule/pickup, which returns a store's pickup schedule.
 *
 * Loads the store's work-hours schedule via getScheduleById and returns it as JSON, or
 * undefined when no schedule exists. Accepts GET requests with a Bearer token in the
 * Authorization header and is rate limited via globalGETRateLimit.
 */
import { NextResponse } from 'next/server';
import {getStoreDataByStoreNameOrId} from "@/lib/actions/store";
import { getTranslations } from "next-intl/server";
import { globalGETRateLimit } from '@/lib/utils/helper/requests';
import { checkBearerToken } from '@/lib/utils/helper/bearerChecker';
import { getScheduleById, WorkHours } from '@/lib/actions/calendar-actions';

export async function GET(request: Request, { params }: { params: Promise<{ storeId: string }> }) {
    const t = await getTranslations("app/api/store");

    const { storeId } = await params;

    if (!(await globalGETRateLimit())) {
        return NextResponse.json(
            { error: "Too many requests" },
            { status: 429 }
        );
    }

     // Check bearer token authentication
     const authError = await checkBearerToken(request);
     if (authError) {
         return authError;
     }

    try {

        let schedule: WorkHours | undefined = undefined;

        await getScheduleById(storeId, storeId)
            .then((item) => {
                if(item?.schedule){
                    schedule = item.schedule;
                }
            })
            .catch((error) => console.error("Error reading item:", error));

        return NextResponse.json(schedule, { status: 200 });
    } catch (error) {
        console.error('Error validating session:', error);
        return NextResponse.json(
            { error: t("internalError") },
            { status: 500 }
        );
    }
}
