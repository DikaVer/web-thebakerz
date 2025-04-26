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
import {formatCurrency, formatDisplayDateTime, scheduledToCalendarDateTime} from "@/lib/utils";
import {OrderProducts, Customer, PriceOrderData} from "@/lib/actions/order";
import { DeliveryAddress } from "@/app/(store)/[id]/delivery-actions";

interface NewOrderEmailProps {
    orderId: string;
    storeName: string;
    scheduledTime: {
        date: string;
        time: string;
    }; // Renamed from pickUpTime
    storePhone: string;
    storeLocation: { // Renamed from location to storeLocation for clarity
        address: string;
        longitude: number;
        latitude: number;
    }
    customer: Customer;
    products: OrderProducts;
    priceData: PriceOrderData;
    isDelivery: boolean;
    isStoreDelivery: boolean;
    deliveryAddress?: DeliveryAddress | null; // Optional delivery address
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

export default function NewOrderEmail({
    orderId, 
    storeName, 
    scheduledTime, 
    storeLocation, 
    customer, 
    products, 
    priceData, 
    isDelivery, 
    isStoreDelivery,
    deliveryAddress
}: NewOrderEmailProps) {

    const scheduledTimeLabel = isDelivery ? "Delivery Time" : "Pick Up Time";
    const addressLabel = isDelivery ? "Delivery Address" : "Pick Up Address (Store)";
    const addressToShow = isDelivery 
        ? `${deliveryAddress?.street} ${deliveryAddress?.houseNumber}, ${deliveryAddress?.zipCode} ${deliveryAddress?.city}` 
        : storeLocation.address;
    const mapLink = isDelivery
        ? `https://maps.google.com/?q=${encodeURIComponent(addressToShow)}`
        : `https://maps.google.com/?q=${storeLocation.latitude},${storeLocation.longitude}`;

    // Calendar link might be less relevant for the baker, but keep for now
    const calendarEventTitle = `${storeName} Order ${isDelivery ? 'Delivery' : 'Pickup'} #${orderId}`;
    const calendarLocation = isDelivery ? addressToShow : storeLocation.address;
    const calendarDetails = `Order #${orderId} from ${storeName}. For: ${customer.name_customer}. Scheduled: ${formatDisplayDateTime(scheduledTime.date, 'en-NL')}. ${isDelivery ? `Delivery to: ${addressToShow}` : `Pickup at: ${storeLocation.address}`}`;
    const calendarLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(calendarEventTitle)}&dates=${formatDateForCalendar(scheduledTime.date)}&location=${encodeURIComponent(calendarLocation)}&details=${encodeURIComponent(calendarDetails)}`;

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
                        <Text style={headerTitle}>You have a new {isDelivery ? "delivery" : "pickup"} order! 🎉</Text>
                        <Text style={orderIdText}>Order ID: #{orderId}</Text>
                    </Section>

                    <Hr style={purpleDivider} />

                    {/* Customer Info Section */}
                    <Section style={customerInfoSection}>
                         <Text style={sectionTitle}>Customer Information</Text>
                         <Row style={detailRow}> 
                            <Column style={textColumn}>
                                <Text style={customerDetail}>Name: {customer.name_customer}</Text>
                                <Text style={customerDetail}>Email: {customer.email_customer} {customer.email_verified ? "(Verified)" : "(Not Verified)"}</Text>
                                {customer.phone_number && <Text style={customerDetail}>Phone: {customer.phone_number}</Text>}
                            </Column>
                         </Row>
                    </Section>

                    <Section style={detailsContainer}>
                        {/* Scheduled Time */}
                        <Row style={detailRow}> 
                            <Column style={iconColumn}>🕒</Column>
                            <Column style={textColumn}>
                                <Text style={detailHeading}>{scheduledTimeLabel}</Text>
                                <Text style={detailText}>
                                    {`${String(scheduledToCalendarDateTime(scheduledTime).day).padStart(2, '0')}-${String(scheduledToCalendarDateTime(scheduledTime).month).padStart(2, '0')}-${scheduledToCalendarDateTime(scheduledTime).year} at ${String(scheduledToCalendarDateTime(scheduledTime).hour).padStart(2, '0')}:${String(scheduledToCalendarDateTime(scheduledTime).minute).padStart(2, '0')}`}
                                    </Text>
                            </Column>
                        </Row>
                        
                        {/* Delivery/Pickup Address */}
                         <Row>
                            <Column style={iconColumn}>📍</Column>
                            <Column style={textColumn}>
                                <Text style={detailHeading}>{addressLabel}</Text>
                                <Link href={mapLink} style={linkStyle} target="_blank">
                                    {addressToShow}
                                </Link>
                                {isDelivery && deliveryAddress?.additionalInfo && (
                                    <Text style={deliveryNoteStyle}>Note: {deliveryAddress.additionalInfo}</Text>
                                )}
                            </Column>
                        </Row>

                    </Section>

                    {/* Order Details */}
                    <Section style={orderSection}>
                        <Text style={sectionTitle}>Order Items</Text>
                        {/* Products Table */}
                         <table style={table}>
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
                                                {product.variants && product.variants.map((variant, vIndex) => (
                                                    <Text key={vIndex} style={productVariant}>
                                                        <span style={{ fontWeight: "500" }}>{variant.label}:</span> {variant.selectedItems.map(item =>
                                                        `${item.label}${item.price > 0 ? ` (+${formatCurrency(item.price)})` : ''}`
                                                    ).join(", ")}
                                                    </Text>
                                                ))}
                                                {product.note && <Text style={productNoteStyle}>Note: {product.note}</Text>}
                                            </td>
                                            <td style={quantityCell}>{product.qty}</td>
                                            <td style={priceCell}>{formatCurrency(product.itemTotalInclVat ?? (product.unitAmount * product.qty))}</td>
                                        </tr>
                                        {index < products.length - 1 && <tr><td colSpan={4} style={rowDivider}></td></tr>}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>

                        {/* Totals */}
                        <Section style={totalSection}>
                             <Row style={totalRow}>
                                <Column><Text style={totalLabel}>Subtotal (Items)</Text></Column>
                                <Column><Text style={totalValue}>{formatCurrency(priceData.itemInclVat)}</Text></Column>
                            </Row>
                            {isStoreDelivery && priceData.deliveryFeeInclVat !== undefined && priceData.deliveryFeeInclVat > 0 && (
                                <Row style={totalRow}>
                                    <Column><Text style={totalLabel}>Delivery Fee</Text></Column>
                                    <Column><Text style={totalValue}>{formatCurrency(priceData.deliveryFeeInclVat)}</Text></Column>
                                </Row>
                            )}
                            <Row style={totalTotalRow}>
                                <Column><Text style={totalTotalLabel}>Total Charged</Text></Column>
                                <Column><Text style={totalTotalValue}>{formatCurrency(priceData.totalInclVat)}</Text></Column>
                            </Row>
                        </Section>
                    </Section>

                    {/* Footer */}
                    <Section style={footer}>
                         {/* Maybe add a link to the order management system? */}
                        <Text style={footerText}>Order received via TheBakerz Platform.</Text>
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

const customerInfoSection = {
    marginBottom: "20px",
};

const customerDetail = {
    fontSize: "14px",
    color: "#555",
    margin: "2px 0",
    lineHeight: "1.5",
};

const detailsContainer = {
    backgroundColor: "#f8f3fb",
    borderRadius: "8px",
    padding: "20px",
    margin: "16px 0",
};

const detailRow = {
    marginBottom: "15px",
};

const iconColumn = {
    width: "40px",
    verticalAlign: "top",
    paddingTop: "2px",
};

const textColumn = {
    verticalAlign: "top",
};

const detailHeading = {
    fontSize: "16px",
    fontWeight: "600",
    color: "#730c6f",
    margin: "0 0 5px 0",
    textAlign: "left" as const,
};

const detailText = {
     fontSize: "14px",
    color: "#555",
    margin: "0",
}

const linkStyle = {
    fontSize: "14px",
    color: "#555",
    textDecoration: "underline",
    margin: "0",
    display: "block",
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

const productCell = {
    padding: "12px",
    verticalAlign: "top" as const,
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

const productNoteStyle = {
    fontSize: "12px",
    color: "#444",
    fontStyle: "italic",
    margin: "4px 0 0 0",
};

const quantityCell = {
    padding: "12px",
    textAlign: "center" as const,
    color: "#666",
    width: "15%",
};

const priceCell = {
    padding: "12px",
    textAlign: "right" as const,
    color: "#666",
    width: "25%",
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

const footerText = {
    fontSize: "12px",
    color: "#aaa",
    margin: "0",
};

const deliveryNoteStyle = {
    fontSize: "12px",
    color: "#666",
    margin: "4px 0 0 0",
};

