/**
 * @fileoverview Renders invoice React components to HTML strings for PDF generation.
 *
 * Exports renderPdf, which renders the InvoiceBakerz component with store
 * business data and an order via react-dom/server renderToString, and
 * renderDumpPdf, which renders the placeholder InvoiceBakerzDump component.
 * The resulting HTML is fed to the Chromium-based PDF generator.
 */
import React from "react";
import {StoreBusinessData, StoreData} from "@/lib/actions/store";
import { OrderData } from "@/lib/actions/order";
import {InvoiceBakerz, InvoiceBakerzDump} from "@/components/store/orders/invoice/invoice-bakerz";

const { renderToString } = await import("react-dom/server");

export const renderPdf = async (store: StoreBusinessData, order: OrderData) => {
    const element = React.createElement(InvoiceBakerz, { store, order });
    return renderToString(element);
};


export const renderDumpPdf = async () => {
    const element = React.createElement(InvoiceBakerzDump);
    return renderToString(element);
};