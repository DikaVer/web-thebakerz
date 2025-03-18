import { NextRequest, NextResponse } from "next/server";
import PdfPrinter from "pdfmake";
import { getCurrentOrder, OrderData } from "@/lib/actions/order";
import { getCurrentStore, StoreData } from "@/lib/actions/store";
import { getCurrentSession } from "@/lib/actions/session";
import {generatePdf} from "@/lib/pdf/generateInvoicePdf";
import {renderPdf} from "@/lib/pdf/renderPdf";

export async function POST(
    req: NextRequest,
    { params }: { params: { orderId: string; storeId: string } }
) {
    try {
        // 1. Fetch Order & Store
        const orderId = params.orderId;
        const storeId = params.storeId;
        const { customer_email } = await req.json();

        const { user, store } = await getCurrentSession();

        if (!store && user) {
            if (customer_email !== user.email) {
                return new NextResponse("Restricted Access", { status: 404 });
            }
        } else if (store && user) {
            if (store.id !== storeId) {
                return new NextResponse("Restricted Access", { status: 404 });
            }
        }

        if (!user) {
            return new NextResponse("Not Authenticated", { status: 404 });
        }


        const storeData = await getCurrentStore(storeId);
        if (!storeData) {
            return new NextResponse("Store is Not Found", { status: 404 });
        }


        const order: OrderData = await getCurrentOrder(storeId, orderId, customer_email);
        console.log(storeData)

        const htmlContent = await renderPdf(storeData, order);
        const pdfBuffer = await generatePdf(htmlContent, orderId, true);

        return new Response(pdfBuffer, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename=document-${orderId}.pdf`,
            },
        });
    } catch (error) {
        console.error(error);
        return new Response("Error generating PDF", { status: 500 });
    }
}
