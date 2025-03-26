import { NextRequest, NextResponse } from "next/server";
import { generatePdf } from "@/lib/pdf/generateInvoicePdf";
import {renderDumpPdf, renderPdf} from "@/lib/pdf/renderPdf";
import { globalLargeRateLimit } from "@/lib/actions/requests";
import {getCurrentOrder, OrderData } from "@/lib/actions/order";
import {getBusinessStoreData} from "@/lib/actions/store";
import {getCurrentSession} from "@/lib/actions/session";
import {getTranslations} from "next-intl/server";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ orderId: string; storeId: string }> }
): Promise<Response> {
    const t = await getTranslations("app/api/invoice/[storeId]/[orderId]");

    if (!await globalLargeRateLimit()) {
        return NextResponse.json({ error: t("tooManyRequests") }, { status: 429 });
    }

    try {
        // 1. Fetch Order & Store
        const { orderId, storeId } = await params;
        const { customer_email } = await req.json();

        const { user, store } = await getCurrentSession();

        if (!store && user) {
            if (customer_email !== user.email) {
                return NextResponse.json({ error: t("restrictedAccess") }, { status: 404 });
            }
        } else if (store && user) {
            if (store.id !== storeId) {
                return NextResponse.json({ error: t("restrictedAccess") }, { status: 404 });
            }
        }

        if (!user) {
            return NextResponse.json({ error: t("notAuthenticated") }, { status: 404 });
        }

        const storeData = await getBusinessStoreData(storeId);
        // Fixed duplicate condition
        if (!storeData) {
            return NextResponse.json({ error: t("storeNotFound") }, { status: 404 });
        }

        const order: OrderData = await getCurrentOrder(storeId, orderId, customer_email);

        if (!order) {
            return NextResponse.json({ error: t("orderNotFound") }, { status: 404 });
        }

        const htmlContent = await renderPdf(storeData, order);
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