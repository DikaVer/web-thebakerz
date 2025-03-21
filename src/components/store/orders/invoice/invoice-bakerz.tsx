import { OrderData } from "@/lib/actions/order";
import {StoreBusinessData} from "@/lib/actions/store";
import React from "react";
import {calculateTax, formatCurrency, formatDisplayYearDate} from "@/lib/utils";
import {calculateTotals} from "@/lib/price/tax";

interface InvoiceProps {
    store: StoreBusinessData;
    order: OrderData;
}
export const InvoiceBakerzDump: React.FC = () => {

    return (
        <div style={styles.invoiceContainer}>
            Hello
        </div>
    );
};


/**
 * A component to render an invoice with the layout
 * as close as possible to your provided screenshot/PDF.
 */
export const InvoiceBakerz: React.FC<InvoiceProps> = ({ store, order }) => {

    // Compute totals
    const totalNet = order.sub_amount
    const totalTax = order.tax_amount
    const grandTotal = order.amount

    // Build line items
    const lineItems = (order.productsData ?? []).map((p) => {
        const amount = p.price * p.qty; // net = price * quantity
        const { subtotal, vat, total } = calculateTotals(amount, totalTax > 0);
        return {
            id: p.id,
            name: p.name,
            qty: p.qty,
            taxRate: 9,
            subtotal: subtotal,
            vat: vat,
            total: total,
        };
    });


    return (
        <div style={styles.invoiceContainer}>
            {/* Header: Store (left) + Customer (right) */}
            <div style={styles.header}>
                {/* Store info */}
                <div>
                    <svg width="100" max-width="300" height="86" viewBox="0 0 86 86" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="myGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#6a0e6c" />
                                <stop offset="100%" stopColor="#A2119D" />
                            </linearGradient>
                        </defs>
                        <path
                            d="M71.5413 30.5336C71.6237 29.9101 71.6667 29.2866 71.6667 28.6667C71.6667 20.1419 63.9876 13.3014 55.4664 14.4588C52.9832 10.0405 48.2532 7.16669 43 7.16669C37.7468 7.16669 33.0168 10.0405 30.5336 14.4588C21.9945 13.3014 14.3333 20.1419 14.3333 28.6667C14.3333 29.2866 14.3763 29.9101 14.4588 30.5336C10.0405 33.0204 7.16667 37.7504 7.16667 43C7.16667 48.2496 10.0405 52.9796 14.4588 55.4664C14.3761 56.0853 14.3342 56.709 14.3333 57.3334C14.3333 65.8581 21.9945 72.6808 30.5336 71.5413C33.0168 75.9595 37.7468 78.8334 43 78.8334C48.2532 78.8334 52.9832 75.9595 55.4664 71.5413C63.9876 72.6808 71.6667 65.8581 71.6667 57.3334C71.6667 56.7134 71.6237 56.0899 71.5413 55.4664C75.9595 52.9796 78.8333 48.2496 78.8333 43C78.8333 37.7504 75.9595 33.0204 71.5413 30.5336ZM39.2554 58.824L26.1153 45.5155L31.218 40.4845L39.3056 48.676L54.8107 33.2892L59.856 38.3775L39.2554 58.824Z"
                            fill="url(#myGradient)" />
                    </svg>

                </div>

                {/* Customer info */}
                <div>
                    <div style={{ fontSize: 24}}><strong>Invoice</strong> # {order.store_id}-{order.store_order_id}</div>
                    <div style={{ marginTop: "8px", marginBottom: "8px" }}><strong>PAID</strong></div>

                    {/*<div style={{ marginTop: "8px" }}><strong>PAID BY:</strong> {order.customer.payment_method ? order.customer.payment_method[0] : 'Card'}</div>*/}
                    <div><strong>Created:</strong> {formatDisplayYearDate(new Date(order.createdAt), 'nl-NL')}</div>
                    <div><strong>Due:</strong> {formatDisplayYearDate(new Date(order.createdAt), 'nl-NL')}</div>
                </div>
            </div>
            <div style={styles.subheader}>
                {/* Store info */}
                <div style={{...styles.headerLeft, borderTop: "2px solid #000"}}>
                    <div style={{ fontWeight: "bold" }}>{store.name}</div>
                    <div style={{ fontSize: "12px" }}>{store.location.route}, {store.location.city}, {store.location.zip_code}</div>
                    <div style={{ fontSize: "12px" }}>{store.location.country}</div>
                    <div style={{ fontSize: "12px" }}>VAT ID: {store.vat}</div>
                </div>

                {/* Customer info */}
                <div style={{...styles.headerRight, borderTop: "2px solid #000"}}>
                    <div style={{ fontWeight: "bold" }}>{order.customer.name_customer}</div>
                    {order.customer.address?.line1 && <div style={{ fontSize: "12px" }}>{order.customer.address.line1}</div>}
                    {order.customer.address?.postal_code && order.customer.address?.city && (
                        <div style={{ fontSize: "12px" }}>
                            {order.customer.address.postal_code} {order.customer.address.city}
                        </div>
                    )}
                    {order.customer.address?.country && <div style={{ fontSize: "12px" }}>{order.customer.address.country}</div>}
                    {/* If the customer is a business with a VAT number */}
                    {order.customer.tax_id && <div style={{ fontSize: "12px" }}>VAT ID: {order.customer.tax_id}</div>}
                </div>
            </div>

            {/* Table */}
            <table style={styles.table}>
                <thead>
                <tr>
                    <th style={{...styles.th, width: "50%", textAlign: "left"}}>Items</th>
                    <th style={{...styles.th, textAlign: "right"}}>Quantity</th>
                    <th style={{...styles.th, textAlign: "right"}}>{totalTax > 0 && 'Tax'}</th>
                    <th style={{...styles.th, textAlign: "right"}}>Price</th>
                    <th style={{...styles.th, textAlign: "right"}}>Total</th>
                </tr>
                </thead>
                <tbody>
                {lineItems.map((item) => (
                    <tr style={{...styles.td, fontSize: "14px"}} key={item.id}>
                        <td style={{...styles.td, textAlign: "left"}}>{item.name}</td>
                        <td style={{...styles.td, textAlign: "right"}}>{item.qty}</td>
                        <td style={{...styles.td, textAlign: "right"}}>{totalTax > 0 && "9%"}</td>
                        <td style={{...styles.td, textAlign: "right"}}>{formatCurrency(item.subtotal)}</td>
                        <td style={{...styles.td, textAlign: "right"}}>{formatCurrency(item.total)}</td>
                    </tr>
                ))}
                </tbody>
                <tfoot>
                <tr>
                    <td colSpan={5} style={{...styles.td, height: "10px", borderBottom: "none"}}></td>
                </tr>
                {/* Total */}
                <tr>
                    <td style={{...styles.td, textAlign: "left", borderBottom: "none"}}></td>
                    <td style={{...styles.td, textAlign: "left", borderBottom: "none"}}></td>
                    <td colSpan={2} style={{...styles.td, borderBottom: "none", textAlign: "left", fontSize: "12px"}}><strong>Total:</strong></td>
                    <td style={{...styles.td, borderBottom: "none", textAlign: "right", fontSize: "12px"}}>{formatCurrency(totalNet)}</td>
                </tr>
                {/* Tax */}
                {totalTax > 0 &&
                    <tr>
                        <td style={{...styles.td, textAlign: "left", borderBottom: "none", marginBottom: "8px"}}></td>
                        <td style={{...styles.td, textAlign: "left", borderBottom: "none"}}></td>
                        <td colSpan={2} style={{...styles.td, borderBottom: "none", textAlign: "left", fontSize: "12px"}}>
                            <strong>Tax 9%:</strong></td>
                        <td style={{
                            ...styles.td,
                            textAlign: "right",
                            borderBottom: "none",
                            fontSize: "12px"
                        }}>{formatCurrency(totalTax)}</td>
                    </tr>
                }
                {/* Divider */}
                <tr>
                    <td style={{...styles.td, textAlign: "left", borderBottom: "none"}}></td>
                    <td style={{...styles.td, textAlign: "left", borderBottom: "none"}}></td>
                    <td colSpan={2} style={{...styles.td, borderBottom: "2px solid #000"}}></td>
                    <td style={{...styles.td, textAlign: "right", borderBottom: "2px solid #000"}}></td>
                </tr>
                {/* Grand total */}
                <tr>
                    <td ></td>
                    <td></td>
                    <td colSpan={2}></td>
                    <td style={{...styles.td, textAlign: "left", borderBottom: "none"}}></td>
                </tr>
                <tr>
                    <td style={{...styles.td, textAlign: "left", borderBottom: "none"}}></td>
                    <td style={{...styles.td, textAlign: "right", borderBottom: "none"}}></td>
                    <td colSpan={2} style={{...styles.td, textAlign: "left", borderBottom: "none", fontWeight: "bold", fontSize: "12px", padding: "8px 4px"}}>
                        Grand total:
                    </td>
                    <td style={{...styles.td, textAlign: "right", borderBottom: "none", fontWeight: "bold", fontSize: "12px", padding: "8px 4px"}}>{formatCurrency(grandTotal)}</td>
                </tr>
                {/* Divider */}
                <tr>
                    <td style={{...styles.td, textAlign: "left", borderBottom: "none"}}></td>
                    <td style={{...styles.td, textAlign: "right", borderBottom: "none"}}></td>
                    <td colSpan={2} style={{...styles.td, borderBottom: "2px solid #000"}}></td>
                    <td style={{...styles.td, textAlign: "right", borderBottom: "2px solid #000"}}></td>
                </tr>
                <tr>
                    <td ></td>
                    <td></td>
                    <td colSpan={2}></td>
                    <td style={{...styles.td, textAlign: "left", borderBottom: "none"}}></td>
                </tr>
                {/* Payment method */}
                <tr>
                    <td style={{...styles.td, textAlign: "left", borderBottom: "none"}}></td>
                    <td style={{...styles.td, textAlign: "left", borderBottom: "none"}}></td>
                    <td colSpan={2} style={{...styles.td, borderBottom: "none",  textAlign: "left", fontSize: "12px"}}>Paid using</td>
                    <td style={{...styles.td, textAlign: "right", borderBottom: "none", fontSize: "12px"}}>{order.customer.payment_method ? order.customer.payment_method[0] : 'Cash'}</td>
                </tr>
                <tr>
                    <td ></td>
                    <td></td>
                    <td colSpan={2}></td>
                    <td style={{...styles.td, textAlign: "left", borderBottom: "none"}}></td>
                </tr>
                <tr>
                    <td style={{...styles.td, textAlign: "left", borderBottom: "none"}}></td>
                    <td style={{...styles.td, textAlign: "left", borderBottom: "none"}}></td>
                    <td colSpan={2} style={{...styles.td, borderBottom: "none",  textAlign: "left", fontSize: "12px"}}></td>
                    <td style={{...styles.td, textAlign: "right", borderBottom: "none", fontSize: "12px"}}>{store.name}</td>
                </tr>
                </tfoot>
            </table>

            {/* Footer */}
            <div style={styles.footer}>
                <hr style={{borderBottom: "1px solid #000"}}/>
                <div style={{textAlign: "center", fontSize: "10px"}}>
                    {/* Example text matching screenshot style */}
                    {store.name}, {store.location.route}, {store.location.city}, {store.location.zip_code}, {store.location.country}, VAT ID: {store.vat}, KVK: {store.kvk}
                </div>
            </div>
        </div>
    );
};

// Minimal inline style object
const styles: { [key: string]: React.CSSProperties } = {
    invoiceContainer: {
        width: "800px",
        height: "1146px",
        margin: "0 auto",
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
        fontSize: "14px",
        color: "#000", // changed to black text
        backgroundColor: "#fff", // if you need a white background
        padding: "20px",
        pageBreakInside: "avoid",
        printColorAdjust: "exact",
    },
    header: {
        display: "flex",
        justifyContent: "start",
        alignItems: "center",
        marginBottom: "20px",
    },

    subheader: {
        display: "flex",
        alignItems: "start",
        justifyContent: "space-between",
        marginBottom: "20px",
    },
    headerLeft: {
        lineHeight: "1.5",
    },
    headerRight: {
        textAlign: "right" as "right",
        lineHeight: "1.5",
    },
    invoiceTitle: {
        textAlign: "center" as "center",
        margin: "20px 0",
    },
    dateRow: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "20px",
    },
    table: {
        width: "100%",
        borderCollapse: "collapse" as "collapse",
        marginBottom: "20px",
    },
    th: {
        textAlign: "left" as "left",
        borderBottom: "1px solid #ddd",
        padding: "8px",
        fontSize: "12px",
        fontWeight: "normal",
    },
    td: {
        borderBottom: "1px solid #eee",
        padding: "8px",
    },
    footer: {
        marginTop: "40px",
        fontSize: "12px",
    },
};
