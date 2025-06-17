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
import {OrderProducts, PriceOrderData} from "@/lib/actions/order";
import { DeliveryAddress } from "@/app/(store)/[id]/delivery-actions";

export interface OrderPlacedEmailProps {
    orderId: string;
    storeName: string;
    scheduledTime: {
        date: string;
        time: string;
    };
    storePhone: string;
    storeLocation: {
        address: string;
        longitude: number;
        latitude: number;
    }
    priceData: PriceOrderData;
    products: OrderProducts;
    isPostDelivery: boolean;
    isDelivery: boolean;
    deliveryAddress?: DeliveryAddress | null;
    isRescueDeal: boolean;
}

function formatDateForCalendar(dateString: string): string {
    const date = new Date(dateString);
    const endDate = new Date(date.getTime() + 30 * 60000);
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

// You will receive another email when your order is ready for {isDelivery ? "delivery" : "pickup"}.

export default function OrderPlacedEmail({
    orderId, 
    storeName, 
    storePhone, 
    scheduledTime, 
    storeLocation, 
    products, 
    isPostDelivery,
    priceData,
    isDelivery, 
    deliveryAddress,
    isRescueDeal
}: OrderPlacedEmailProps) {
    
    const scheduledTimeLabel = isDelivery ? "Delivery Time" : isRescueDeal ? "Pick Up Before" : "Pick Up Time";
    const addressLabel = isDelivery ? "Delivery Address" : "Pick Up Address";
    const addressToShow = isDelivery 
        ? `${deliveryAddress?.street} ${deliveryAddress?.houseNumber}, ${deliveryAddress?.zipCode} ${deliveryAddress?.city}` 
        : storeLocation.address;
    const mapLink = isDelivery
        ? `https://maps.google.com/?q=${encodeURIComponent(addressToShow)}`
        : `https://maps.google.com/?q=${storeLocation.latitude},${storeLocation.longitude}`;
        
    // Format date components
    const dateFormatted = `${String(scheduledToCalendarDateTime(scheduledTime).day).padStart(2, '0')}-${String(scheduledToCalendarDateTime(scheduledTime).month).padStart(2, '0')}-${scheduledToCalendarDateTime(scheduledTime).year}`;
    const timeFormatted = `${String(scheduledToCalendarDateTime(scheduledTime).hour).padStart(2, '0')}:${String(scheduledToCalendarDateTime(scheduledTime).minute).padStart(2, '0')}`;
        
    const calendarEventTitle = `${storeName} Order ${isDelivery ? 'Delivery' : 'Pickup'} #${orderId}`;
    const calendarLocation = isDelivery ? addressToShow : storeLocation.address;
    const calendarDetails = `Order #${orderId} from ${storeName}. Scheduled for ${formatDisplayDateTime(scheduledTime.date, 'en-NL')}. ${isDelivery ? `Delivery to: ${addressToShow}` : `Pickup at: ${storeLocation.address}`}`;
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
                        <Text style={headerTitle}>Your Order is Placed! 🎉</Text>
                    </Section>

                    <Hr style={purpleDivider} />


                    {/* Order Summary */}
                    <Section>
                        <Text style={summaryText}>
                            Hello,<br/>
                            Your order #{orderId} has been placed.
                        </Text>
                    </Section>

                    <Section style={detailsContainer}>
                        {/* Scheduled Time */}
                        <Row style={detailRow}>
                            <Column style={iconColumn}>🕒</Column>
                            <Column style={textColumn}>
                                <Text style={detailHeading}>{scheduledTimeLabel}</Text>
                                <Link href={calendarLink} style={linkStyle}>
                                    {isPostDelivery ? (
                                        dateFormatted
                                    ) : (
                                        <>
                                            {dateFormatted} <strong>{isRescueDeal ? 'before' : 'at'}</strong> {timeFormatted}
                                        </>
                                    )}
                                </Link>
                            </Column>
                        </Row>

                        {/* Address */}
                        <Row style={detailRow}>
                            <Column style={iconColumn}>📍</Column>
                            <Column style={textColumn}>
                                <Text style={detailHeading}>{addressLabel}</Text>
                                <Link href={mapLink} style={linkStyle}>
                                    {addressToShow}
                                </Link>
                                {isDelivery && deliveryAddress?.additionalInfo && (
                                    <Text style={deliveryNoteStyle}>Note: {deliveryAddress.additionalInfo}</Text>
                                )}
                            </Column>
                        </Row>

                        {/* Contact Us (Store Phone) */}
                        <Row>
                            <Column style={iconColumn}>📞</Column>
                            <Column style={textColumn}>
                                <Text style={detailHeading}>Contact {storeName}</Text>
                                <Link href={`tel:${storePhone}`} style={linkStyle}>
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
                                                {product.note && <Text style={productVariant}>Note: {product.note}</Text>}
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
                                <Column><Text style={totalLabel}>Subtotal</Text></Column>
                                <Column><Text style={totalValue}>{formatCurrency(priceData.itemExclVat)}</Text></Column>
                            </Row>
                            { priceData.itemVat > 0 &&
                                <Row style={totalRow}>
                                    <Column><Text style={totalLabel}>VAT 9%</Text></Column>
                                    <Column><Text style={totalValue}>{formatCurrency(priceData.itemVat)}</Text></Column>
                                </Row>
                            }
                            {isDelivery && priceData.deliveryFeeExclVat && priceData.deliveryFeeExclVat > 0 && (
                                <>
                                    <Row style={totalRow}>
                                        <Column><Text style={totalLabel}>Delivery Fee</Text></Column>
                                        <Column><Text style={totalValue}>{formatCurrency(priceData.deliveryFeeExclVat)}</Text></Column>
                                    </Row>
                                    { priceData.deliveryVat  > 0 &&
                                        <Row style={totalRow}>
                                            <Column><Text style={totalLabel}>VAT 9%</Text></Column>
                                            <Column><Text style={totalValue}>{formatCurrency(priceData.deliveryVat)}</Text></Column>
                                        </Row>
                                    }
                                </>
                            )}
                            {priceData.serviceFeeInclVat > 0 &&
                                <>
                                    <Row style={totalRow}>
                                        <Column><Text style={totalLabel}>Service Fee</Text></Column>
                                        <Column><Text style={totalValue}>{formatCurrency(priceData.serviceFeeExclVat)}</Text></Column>
                                    </Row>
                                    { priceData.serviceVat > 0 &&
                                        <Row style={totalRow}>
                                            <Column><Text style={totalLabel}>VAT 9%</Text></Column>
                                            <Column><Text style={totalValue}>{formatCurrency(priceData.serviceVat)}</Text></Column>
                                        </Row>
                                    }
                                </>
                            }
                    
                            <Row style={totalTotalRow}>
                                <Column><Text style={totalTotalLabel}>Total</Text></Column>
                                <Column><Text style={totalTotalValue}>{formatCurrency(priceData.totalInclVat)}</Text></Column>
                            </Row>
                        </Section>
                    </Section>

                    {/* Footer */}
                    <Section style={footer}>
                        <Text style={thankYou}>Thank you for choosing {storeName}! 🧁</Text>
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

const deliveryNoteStyle = {
    fontSize: "12px",
    color: "#666",
    margin: "4px 0 0 0",
};
