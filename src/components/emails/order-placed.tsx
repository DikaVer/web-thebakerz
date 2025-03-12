import {
    Body,
    Container,
    Head,
    Html,
    Img,
    Text,
    Section,
    Row,
    Column,
    Link,
    Hr
} from "@react-email/components";

import * as React from "react";
import {formatCurrency} from "@/lib/utils";
import {OrderProduct} from "@/lib/actions/order";
// SVG Icons
const PHONE_ICON = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48IS0tIFVwbG9hZGVkIHRvOiBTVkcgUmVwbywgd3d3LnN2Z3JlcG8uY29tLCBHZW5lcmF0b3I6IFNWRyBSZXBvIE1peGVyIFRvb2xzIC0tPg0KPHN2ZyB3aWR0aD0iODAwcHgiIGhlaWdodD0iODAwcHgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCjxwYXRoIGQ9Ik0zIDUuNUMzIDE0LjA2MDQgOS45Mzk1OSAyMSAxOC41IDIxQzE4Ljg4NjIgMjEgMTkuMjY5MSAyMC45ODU5IDE5LjY0ODMgMjAuOTU4MUMyMC4wODM0IDIwLjkyNjIgMjAuMzAwOSAyMC45MTAzIDIwLjQ5OSAyMC43OTYzQzIwLjY2MyAyMC43MDE5IDIwLjgxODUgMjAuNTM0NSAyMC45MDA3IDIwLjM2NEMyMSAyMC4xNTgyIDIxIDE5LjkxODEgMjEgMTkuNDM4VjE2LjYyMDdDMjEgMTYuMjE2OSAyMSAxNi4wMTUgMjAuOTMzNSAxNS44NDJDMjAuODc0OSAxNS42ODkxIDIwLjc3OTUgMTUuNTUzIDIwLjY1NTkgMTUuNDQ1NkMyMC41MTYgMTUuMzI0IDIwLjMyNjIgMTUuMjU1IDE5Ljk0NjggMTUuMTE3TDE2Ljc0IDEzLjk1MDlDMTYuMjk4NSAxMy43OTA0IDE2LjA3NzcgMTMuNzEwMSAxNS44NjgzIDEzLjcyMzdDMTUuNjgzNiAxMy43MzU3IDE1LjUwNTkgMTMuNzk4OCAxNS4zNTQ5IDEzLjkwNThDMTUuMTgzNyAxNC4wMjcxIDE1LjA2MjkgMTQuMjI4NSAxNC44MjEyIDE0LjYzMTRMMTQgMTZDMTEuMzUwMSAxNC43OTk5IDkuMjAxOSAxMi42NDg5IDggMTBMOS4zNjg2MyA5LjE3ODgyQzkuNzcxNDUgOC45MzcxMyA5Ljk3Mjg2IDguODE2MjggMTAuMDk0MiA4LjY0NTA2QzEwLjIwMTIgOC40OTQwOCAxMC4yNjQzIDguMzE2MzcgMTAuMjc2MyA4LjEzMTdDMTAuMjg5OSA3LjkyMjI3IDEwLjIwOTYgNy43MDE1MyAxMC4wNDkxIDcuMjYwMDVMOC44ODI5OSA0LjA1MzIxQzguNzQ1IDMuNjczNzYgOC42NzYwMSAzLjQ4NDAzIDguNTU0NDIgMy4zNDQxQzguNDQ3MDEgMy4yMjA0OSA4LjMxMDg5IDMuMTI1MTUgOC4xNTgwMiAzLjA2NjQ1QzcuOTg0OTYgMyA3Ljc4MzA4IDMgNy4zNzkzMiAzSDQuNTYyMDFDNC4wODE4OCAzIDMuODQxODEgMyAzLjYzNTk4IDMuMDk5MjVDMy40NjU1IDMuMTgxNDYgMy4yOTgxNCAzLjMzNzAxIDMuMjAzNyAzLjUwMTAzQzMuMDg5NjggMy42OTkwNyAzLjA3Mzc1IDMuOTE2NjIgMy4wNDE4OSA0LjM1MTczQzMuMDE0MTMgNC43MzA4NiAzIDUuMTEzNzggMyA1LjVaIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+DQo8L3N2Zz4=";

const LOCATION_ICON = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48IS0tIFVwbG9hZGVkIHRvOiBTVkcgUmVwbywgd3d3LnN2Z3JlcG8uY29tLCBHZW5lcmF0b3I6IFNWRyBSZXBvIE1peGVyIFRvb2xzIC0tPg0KPHN2ZyB3aWR0aD0iODAwcHgiIGhlaWdodD0iODAwcHgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCjxwYXRoIGQ9Ik0xMiAyMUMxNS41IDE3LjQgMTkgMTQuMTc2NCAxOSAxMC4yQzE5IDYuMjIzNTUgMTUuODY2IDMgMTIgM0M4LjEzNDAxIDMgNSA2LjIyMzU1IDUgMTAuMkM1IDE0LjE3NjQgOC41IDE3LjQgMTIgMjFaIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+DQo8cGF0aCBkPSJNMTIgMTJDMTMuMTA0NiAxMiAxNCAxMS4xMDQ2IDE0IDEwQzE0IDguODk1NDMgMTMuMTA0NiA4IDEyIDhDMTAuODk1NCA4IDEwIDguODk1NDMgMTAgMTBDMTAgMTEuMTA0NiAxMC44OTU0IDEyIDEyIDEyWiIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPg0KPC9zdmc+";

const CALENDAR_ICON = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48IS0tIFVwbG9hZGVkIHRvOiBTVkcgUmVwbywgd3d3LnN2Z3JlcG8uY29tLCBHZW5lcmF0b3I6IFNWRyBSZXBvIE1peGVyIFRvb2xzIC0tPg0KPHN2ZyB3aWR0aD0iODAwcHgiIGhlaWdodD0iODAwcHgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCjxwYXRoIGQ9Ik0yMCAxMFY3QzIwIDUuODk1NDMgMTkuMTA0NiA1IDE4IDVINkM0Ljg5NTQzIDUgNCA1Ljg5NTQzIDQgN1YxME0yMCAxMFYxOUMyMCAyMC4xMDQ2IDE5LjEwNDYgMjEgMTggMjFINkM0Ljg5NTQzIDIxIDQgMjAuMTA0NiA0IDE5VjEwTTIwIDEwSDRNOCAzVjdNMTYgM1Y3IiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+DQo8cmVjdCB4PSI2IiB5PSIxMiIgd2lkdGg9IjMiIGhlaWdodD0iMyIgcng9IjAuNSIgZmlsbD0iIzAwMDAwMCIvPg0KPHJlY3QgeD0iMTAuNSIgeT0iMTIiIHdpZHRoPSIzIiBoZWlnaHQ9IjMiIHJ4PSIwLjUiIGZpbGw9IiMwMDAwMDAiLz4NCjxyZWN0IHg9IjE1IiB5PSIxMiIgd2lkdGg9IjMiIGhlaWdodD0iMyIgcng9IjAuNSIgZmlsbD0iIzAwMDAwMCIvPg0KPC9zdmc+";

export interface OrderPlacedEmailProps {
    orderId: string;
    storeName: string;
    pickUpTime: string;
    storePhone: string;
    location: {
        address: string;
        longitude: number;
        latitude: number;
    }
    products: OrderProduct;
    subtotal_amount: number;
    total_amount: number;
    vat: number;
}
// Helper functions for date formatting
function formatDateForCalendar(dateString: string): string {
    const date = new Date(dateString);
    const endDate = new Date(date.getTime() + 30 * 60000); // Adding 30 minutes for pickup window

    // Format: YYYYMMDDTHHMMSS/YYYYMMDDTHHMMSS
    return `${formatCalendarDate(date)}/${formatCalendarDate(endDate)}`;
}

function formatCalendarDate(date: Date): string {
    return date.getFullYear() +
        padZero(date.getMonth() + 1) +
        padZero(date.getDate()) +
        'T' +
        padZero(date.getHours()) +
        padZero(date.getMinutes()) +
        '00';
}

function padZero(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
}

function formatDisplayDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleString('en-US', options);
}

export default function OrderPlacedEmail({orderId, storeName, storePhone, pickUpTime, location, products, subtotal_amount, total_amount, vat}: OrderPlacedEmailProps) {
    return (
        <Html>
            <Head>
                <style>
                    {`
                        @import url('https://fonts.googleapis.com/css2?family=Lexend+Deca:wght@100;200;300;400;500;600;700;800;900&display=swap');
                        
                        @media only screen and (max-width: 600px) {
                            .container {
                                padding: 25px !important;
                            }
                            .detail-column {
                                padding: 10px !important;
                            }
                            .header-title {
                                font-size: 24px !important;
                            }
                        }
                    `}
                </style>
            </Head>
            <Body style={main}>
                <Container style={container} className="container">
                    {/* Header Section */}
                    <Section style={header}>
                        <Text style={brandTitle}>{storeName}</Text>
                        <Text style={headerTitle}>Your Order is Placed! 🎉</Text>
                    </Section>

                    <Hr style={purpleDivider} />


                    {/* Order Summary */}
                    <Section>
                        <Text style={summaryText}>
                            Hello,<br/>
                            Your order has been placed and you will receive the next email, when your order will be ready.
                        </Text>
                    </Section>

                    <Section style={detailsContainer}>
                        {/* Pick Up Time */}
                        <Row style={detailRow}>
                            <Column style={iconColumn}>
                                <Img
                                    src={CALENDAR_ICON}
                                    width="24"
                                    height="24"
                                    alt="Calendar"
                                    style={detailIcon}
                                />
                            </Column>
                            <Column style={textColumn}>
                                <Text style={detailHeading}>Pick Up Time</Text>
                                <Link
                                    href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(storeName + " Order Pickup")}&dates=${formatDateForCalendar(pickUpTime)}&location=${encodeURIComponent(location.address)}&details=${encodeURIComponent(`Your order #${orderId} is ready for pickup. Location: ${location.longitude},${location.latitude}`)}`}
                                    style={linkStyle}
                                >
                                    {formatDisplayDate(pickUpTime)}
                                </Link>
                            </Column>
                        </Row>

                        {/* Pick Up Address */}
                        <Row style={detailRow}>
                            <Column style={iconColumn}>
                                <Img
                                    src={LOCATION_ICON}
                                    width="24"
                                    height="24"
                                    alt="Location"
                                    style={detailIcon}
                                />
                            </Column>
                            <Column style={textColumn}>
                                <Text style={detailHeading}>Pick Up Address</Text>
                                <Link
                                    href={`https://maps.google.com/?q=${location.latitude},${location.longitude}`}
                                    style={linkStyle}
                                >
                                    {location.address}
                                </Link>
                            </Column>
                        </Row>

                        {/* Contact Us */}
                        <Row style={detailRow}>
                            <Column style={iconColumn}>
                                <Img
                                    src={PHONE_ICON}
                                    width="24"
                                    height="24"
                                    alt="Phone"
                                    style={detailIcon}
                                />
                            </Column>
                            <Column style={textColumn}>
                                <Text style={detailHeading}>Contact Us</Text>
                                <Link
                                    href={"tel:" + storePhone}
                                    style={linkStyle}
                                >
                                    {storePhone}
                                </Link>
                            </Column>
                        </Row>
                    </Section>

                    {/* Order Details */}
                    <Section style={orderSection}>
                        <Text style={sectionTitle}>Order Details</Text>
                        <Text style={orderIdText}>Order ID: #{orderId}</Text>

                        {/* Products Table */}
                        <table style={table}>
                            <thead>
                            <tr>
                                <th style={tableHeader} colSpan={2}>Product</th>
                                <th style={tableHeader}>Qty</th>
                                <th style={tableHeader}>Price</th>
                            </tr>
                            </thead>
                            <tbody>
                            {products.map((product, index) => (
                                <React.Fragment key={index}>
                                    <tr>
                                        <td style={productCell} colSpan={2}>
                                            <Text style={productName}>{product.name}</Text>
                                            {product.variants.map((variant, vIndex) => (
                                                <Text key={vIndex} style={productVariant}>Note: {variant}</Text>
                                            ))}
                                        </td>
                                        <td style={quantityCell}>{product.qty}</td>
                                        <td style={priceCell}>{formatCurrency(product.price)}</td>
                                    </tr>
                                    {index < products.length - 1 && <tr><td colSpan={4} style={rowDivider}></td></tr>}
                                </React.Fragment>
                            ))}
                            </tbody>
                        </table>

                        {/* Totals */}
                        <Section style={totalSection}>
                            <Row style={totalRow}>
                                <Column><Text style={totalLabel}>Subtotal</Text></Column>
                                <Column><Text style={totalValue}>{formatCurrency(subtotal_amount)}</Text></Column>
                            </Row>
                            <Row style={totalRow}>
                                <Column><Text style={totalLabel}>VAT(21% inclusive)</Text></Column>
                                <Column><Text style={totalValue}>{formatCurrency(vat)}</Text></Column>
                            </Row>
                            <Row style={totalTotalRow}>
                                <Column><Text style={totalTotalLabel}>Total</Text></Column>
                                <Column><Text style={totalTotalValue}>{formatCurrency(total_amount)}</Text></Column>
                            </Row>
                        </Section>
                    </Section>

                    {/* Footer */}
                    <Section style={footer}>
                        <Text style={thankYou}>Thank you for choosing {storeName}! 🧁</Text>
                        {/*<Text style={followUs}>Follow Our Journey</Text>*/}
                        {/*<Row style={socialRow}>*/}
                        {/*    {socialLinks.map((social, index) => (*/}
                        {/*        <Column key={index} style={socialColumn}>*/}
                        {/*            <Link href={social.url} style={socialLink}>*/}
                        {/*                <Img*/}
                        {/*                    src={social.icon}*/}
                        {/*                    width="24"*/}
                        {/*                    alt={social.name}*/}
                        {/*                    style={socialIcon}*/}
                        {/*                />*/}
                        {/*            </Link>*/}
                        {/*        </Column>*/}
                        {/*    ))}*/}
                        {/*</Row>*/}
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}

// Styles
const main = {
    backgroundColor: "#f9f9f9",
    fontFamily: "'Lexend Deca', sans-serif",
};

const container = {
    backgroundColor: "#ffffff",
    maxWidth: "600px",
    margin: "0 auto",
    padding: "40px",
};

const header = {
    textAlign: "center" as const,
    marginBottom: "30px",
};

const brandTitle = {
    fontSize: "32px",
    fontWeight: "700",
    color: "#730c6f",
    marginBottom: "8px",
};

const headerTitle = {
    fontSize: "28px",
    color: "#333333",
    marginBottom: "15px",
};

const purpleDivider = {
    border: "0",
    height: "2px",
    backgroundColor: "#730c6f",
    margin: "25px 0",
};


const summaryText = {
    fontSize: "16px",
    color: "#555",
    lineHeight: "1.6",
    margin: '0px 0',
};

const detailsContainer = {
    backgroundColor: "#f8f3fb",
    borderRadius: "8px",
    padding: "20px",
    margin: "16px 0",
};

const detailRow = {
    marginBottom: "20px",
};

const iconColumn = {
    width: "40px",
    verticalAlign: "middle",
};

const textColumn = {
    verticalAlign: "middle",
};

const detailIcon = {
    margin: "0 auto 12px",
    display: "block",
    filter: "invert(23%) sepia(93%) saturate(999%) hue-rotate(271deg) brightness(90%) contrast(101%)",
};

const detailHeading = {
    fontSize: "16px",
    fontWeight: "600",
    color: "#730c6f",
    margin: "0 0 5px 0",
    textAlign: "left" as const,
};

const orderSection = {
    marginTop: "30px",
};

const sectionTitle = {
    fontSize: "20px",
    fontWeight: "600",
    color: "#333",
    marginBottom: "15px",
};

const orderIdText = {
    fontSize: "14px",
    color: "#666",
    marginBottom: "20px",
};

const table = {
    width: "100%",
    borderCollapse: "collapse" as const,
    marginBottom: "20px",
};

const tableHeader = {
    padding: "12px",
    borderBottom: "1px solid #ddd",
    textAlign: "left" as const,
    color: "#666",
    fontSize: "14px",
};

const productCell = {
    padding: "12px",
    verticalAlign: "top" as const,
};

const linkStyle = {
    fontSize: "14px",
    color: "#555",
    textDecoration: "underline",
    margin: "0",
    display: "block",
};

const productName = {
    fontSize: "14px",
    color: "#333",
    marginBottom: "4px",
};

const productVariant = {
    fontSize: "12px",
    color: "#666",
    margin: "2px 0",
};

const quantityCell = {
    padding: "12px",
    textAlign: "center" as const,
    color: "#666",
};

const priceCell = {
    padding: "12px",
    textAlign: "right" as const,
    color: "#666",
};

const rowDivider = {
    height: "1px",
    backgroundColor: "#eee",
    margin: "8px 0",
};

const totalSection = {
    marginTop: "20px",
};

const totalRow = {
    margin: "2px 0",
};

const totalLabel = {
    margin: '4px 0',
    fontSize: "14px",
    color: "#666",
};

const totalValue = {
    margin: '4px 0',
    fontSize: "14px",
    color: "#333",
    textAlign: "right" as const,
};

const totalTotalRow = {
    marginTop: "15px",
};

const totalTotalLabel = {
    fontSize: "16px",
    fontWeight: "600",
    color: "#333",
};

const totalTotalValue = {
    fontSize: "20px",
    fontWeight: "700",
    color: "#730c6f",
    textAlign: "right" as const,
};

const footer = {
    marginTop: "40px",
    textAlign: "center" as const,
};

const thankYou = {
    fontSize: "16px",
    color: "#333",
    marginBottom: "10px",
};
