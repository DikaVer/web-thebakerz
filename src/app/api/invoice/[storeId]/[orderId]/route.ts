import { NextRequest, NextResponse } from "next/server";
import { generatePdf } from "@/lib/utils/pdf/generate-invoice-pdf";
import { renderPdf} from "@/lib/utils/pdf/render-pdf";
import { globalLargeRateLimit } from "@/lib/utils/helper/requests";
import { OrderData } from "@/lib/actions/order";
import {
    getBusinessStoreAPI,
    getStoreByUserIdAndStoreIdAPI
} from "@/lib/api/GET/store-api";
import {getCurrentSession} from "@/lib/actions/session";
import {getTranslations} from "next-intl/server";
import { getOrderAPI } from "@/lib/api/GET/order-api";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ orderId: string; storeId: string }> }
): Promise<Response> {
    const t = await getTranslations("app/api/invoice/storeId/orderId");

    if (!await globalLargeRateLimit()) {
        return NextResponse.json({ error: t("tooManyRequests") }, { status: 429 });
    }

    try {
        // 1. Fetch Order & Store
        const { orderId, storeId } = await params;
        const { customer_email } = await req.json();

        const { user } = await getCurrentSession();

        if (!user) {
            return NextResponse.json({ error: t("notAuthenticated") }, { status: 404 });
        }

        const { store: storeData } = await getStoreByUserIdAndStoreIdAPI(user.id, storeId);

        if (!storeData && user) {
            if (customer_email !== user.email) {
                return NextResponse.json({ error: t("restrictedAccess") }, { status: 404 });
            }
        } else if (storeData && user) {
            if (storeData.user_id !== user.id) {
                return NextResponse.json({ error: t("restrictedAccess") }, { status: 404 });
            }
        }

        const storeBusinessData = await getBusinessStoreAPI(storeId);
        // Fixed duplicate condition
        if (!storeBusinessData) {
            return NextResponse.json({ error: t("storeNotFound") }, { status: 404 });
        }

        const order: OrderData = await getOrderAPI(storeId, orderId, customer_email);

        if (!order) {
            return NextResponse.json({ error: t("orderNotFound") }, { status: 404 });
        }

        const htmlContent = await renderPdf(storeBusinessData, order);
        const pdfBuffer = await generatePdf(htmlContent);

        return new Response(pdfBuffer, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename=${45}-${5}.pdf`,
            },
        });
    } catch (error) {
        console.error(error);
        return new Response(t("errorGeneratingPdf"), { status: 500 });
    }
}