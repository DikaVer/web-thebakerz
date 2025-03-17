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
import {formatCurrency, formatDisplayDateTime} from "@/lib/utils";
import {OrderProducts} from "@/lib/actions/order";

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
    products: OrderProducts;
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
                            <Column
                                style={iconColumn}
                            >
                                🕒
                            </Column>
                            <Column style={textColumn}>
                                <Text style={detailHeading}>Pick Up Time</Text>
                                <Link
                                    href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(storeName + " Order Pickup")}&dates=${formatDateForCalendar(pickUpTime)}&location=${encodeURIComponent(location.address)}&details=${encodeURIComponent(`Your order #${orderId} is ready for pickup. Location: ${location.longitude},${location.latitude}`)}`}
                                    style={linkStyle}
                                >
                                    {formatDisplayDateTime(pickUpTime, 'en-NL')}
                                </Link>
                            </Column>
                        </Row>

                        {/* Pick Up Address */}
                        <Row style={detailRow}>
                            <Column
                                style={iconColumn}
                            >
                                📍
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
                        <Row>
                            <Column
                                style={iconColumn}
                            >
                                📞
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
                            {/*<thead>*/}
                            {/*<tr>*/}
                            {/*    <th style={tableHeader} colSpan={2}>Product</th>*/}
                            {/*    <th style={tableHeader}>Qty</th>*/}
                            {/*    <th style={tableHeader}>Price</th>*/}
                            {/*</tr>*/}
                            {/*</thead>*/}
                            <thead>
                            <tr>
                                <th style={productHeaderCell} colSpan={2}>Product</th>
                                <th style={qtyHeaderCell}>Qty</th>
                                <th style={priceHeaderCell}>Price</th>
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
                                <Column><Text style={totalLabel}>VAT(9%)</Text></Column>
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
// new code from David
const productHeaderCell = {
    ...tableHeader,
    width: "60%",
};

const qtyHeaderCell = {
    ...tableHeader,
    width: "15%",
    textAlign: "center" as const,
};

const priceHeaderCell = {
    ...tableHeader,
    width: "25%",
    textAlign: "right" as const,
};
////end of the new code from David

const productCell = {
    padding: "12px",
    verticalAlign: "top" as const,
    width: "60%", // David added
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
    width: "15%", // Davod added this to match header
};

const priceCell = {
    padding: "12px",
    textAlign: "right" as const,
    color: "#666",
    width: "25%", // David added this to match header
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
