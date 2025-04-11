"use server";

import { render } from "@react-email/components";
import { EmailClient, KnownEmailSendStatus } from "@azure/communication-email";
import VerifyCodeEmail from "@/components/emails/auth-code";
import OnboardingRequest from "@/components/emails/onboarding-request";
import ContactUsForm from "@/components/emails/contact-us";
import { acceptTOS } from "@/lib/term-of-service";
import { TOS_VERSION } from "@/lib/local-variables";
import { globalPOSTRateLimit } from "@/lib/actions/requests";
import { headers } from "next/headers";
import { RefillingTokenBucket } from "@/lib/actions/rate-limits";
import OrderPlacedEmail, {OrderPlacedEmailProps} from "@/components/emails/order-placed";
import NewOrderEmail from "@/components/emails/new-order-bakerz";
import {OrderData} from "@/lib/actions/order";
import {getCurrentStore} from "@/lib/actions/store";

const ipBucket = new RefillingTokenBucket<string>(20, 1);

/**
 * Retrieves the email client and sender address from environment variables.
 */
async function getEmailClient() {
    const endpoint = process.env.NEXT_PRIVATE_AZURE_COMMUNICATION_EMAIL_ENDPOINT;
    const senderAddress = process.env.NEXT_PRIVATE_EMAIL_FROM; // Must be a verified MailFrom address in Azure
    if (!endpoint) {
        throw new Error(
            "Missing NEXT_PRIVATE_AZURE_COMMUNICATION_EMAIL_ENDPOINT or AZURE_COMMUNICATION_EMAIL_KEY environment variables."
        );
    }
    if (!senderAddress) {
        throw new Error("Missing NEXT_PRIVATE_EMAIL_FROM environment variable.");
    }
    return { emailClient: new EmailClient(endpoint), senderAddress };
}

/**
 * Sends an email using the provided EmailClient and message object.
 */
async function sendEmailMessage(emailClient: EmailClient, message: any): Promise<void> {
    const poller = await emailClient.beginSend(message);
    const result = await poller.pollUntilDone();
    if (result.status !== KnownEmailSendStatus.Succeeded) {
        throw new Error(`Email send failed with status: ${result.status}`);
    }
}

/**
 * Sends a magic code email.
 */
export async function sendMagicCode(params: { identifier: string; code: string }) {
    const { identifier: to, code } = params;

    // const formattedCode = `${code.slice(0, 3)}-${code.slice(3)}`;
    const formattedCode = code;

    console.log(`Sending magic link to ${to}`);
    console.log(`Magic code: ${code}`);

    const { emailClient, senderAddress } = await getEmailClient();

    const message = {
        senderAddress,
        content: {
            subject: `Verification Code: ${formattedCode}`,
            plainText: generatePlainTextCode({ code: formattedCode }),
            html: await render(VerifyCodeEmail({ verificationCode: code })),
        },
        recipients: {
            to: [
                {
                    address: to,
                    displayName: "TheBakerz",
                },
            ],
        },
    };

    try {
        await sendEmailMessage(emailClient, message);
        console.log(`Magic link email sent successfully to ${to}`);
    } catch (error) {
        console.error(`Error sending magic link email: ${error}`);
        throw error;
    }
}

/**
 * Sends a order placed email.
 */
export async function sendOrderPlaced(params: { identifier: string; orderData: OrderData }) {
    const { identifier: to, orderData } = params;

    const storeData = await getCurrentStore(orderData.store_id);
    if (!storeData) {
        // Maybe throw a more specific error or log details
        console.error(`Failed to send order emails: Store not found for ID ${orderData.store_id}`);
        return; // Exit if store data is missing
    }

    const { emailClient, senderAddress } = await getEmailClient();


        
    // Construct store location object (handle potential nulls)
    const storeLocation = {
        address: `${storeData.location?.route || ''}, ${storeData.location?.city || ''}, ${storeData.location?.country || ''}`.replace(/^, |, $/g, ''), // Clean up extra commas
        latitude: storeData.location?.latitude ?? 0,
        longitude: storeData.location?.longitude ?? 0,
    };

    // --- Customer Email --- 
    const messageCustomer = {
        senderAddress,
        content: {
            subject: `Your ${storeData.ownerName} Order #${orderData.store_order_id} is Placed!`, // Use store name in subject
            html: await render(OrderPlacedEmail({
                orderId: orderData.store_order_id,
                storeName: storeData.ownerName || "The Store", // Use store name
                scheduledTime: orderData.scheduled_time, // Pass combined string
                storePhone: storeData.phone || "", // Pass store phone
                storeLocation: storeLocation, // Pass formatted store location
                products: orderData.productsData,
                // Pass new pricing/delivery fields
                priceData: orderData.priceData,
                isDelivery: orderData.isDelivery,
                deliveryAddress: orderData.deliveryAddress,
            })),
        },
        recipients: {
            to: [
                {
                    address: to, // Customer email passed in `identifier`
                    displayName: orderData.customer.name_customer, // Use customer name from order data
                },
            ],
        },
    };

    // --- Baker Email --- 
    const messageBakerz = {
        senderAddress,
        content: {
            subject: `New ${orderData.isDelivery ? 'Delivery' : 'Pickup'} Order #${orderData.store_order_id} (${storeData.ownerName})`, // Indicate type and store
            html: await render(NewOrderEmail({
                 orderId: orderData.store_order_id,
                storeName: storeData.ownerName || "Your Store",
                scheduledTime: orderData.scheduled_time,
                storePhone: storeData.phone || "", // Include store phone for reference
                storeLocation: storeLocation, // Include store location for pickup reference
                customer: orderData.customer, // Pass the whole customer object
                products: orderData.productsData,
                isStoreDelivery: orderData.isStoreDelivery,
                // Pass new pricing/delivery fields
                priceData: orderData.priceData,
                isDelivery: orderData.isDelivery,
                deliveryAddress: orderData.deliveryAddress,
            })),
        },
        recipients: {
            to: [
                {
                    address: storeData.email, // Use store's email from storeData
                    displayName: storeData.ownerName || storeData.storeName || "Store Owner", // Use owner or store name
                },
            ],
            // Optional: Add CC/BCC if needed
            // cc: [{ address: "management@example.com" }],
        },
    };

    try {
        // Send emails concurrently for efficiency
        const sendCustomerEmail = sendEmailMessage(emailClient, messageCustomer);
        const sendBakerEmail = sendEmailMessage(emailClient, messageBakerz);
        
        await Promise.all([sendCustomerEmail, sendBakerEmail]);
        
        console.log(`Order confirmation email sent successfully to customer: ${to}`);
        console.log(`New order notification email sent successfully to baker: ${storeData.email}`);
    } catch (error) {
        console.error(`Error sending order emails for order ${orderData.id}:`, error);
        // Decide if you need to re-throw or just log
        // throw error; // Re-throwing might interrupt other processes
    }
}

/**
 * Sends an onboarding request email.
 */
export async function sendOnboardingRequest(params: { phone: string; fullName: string; email: string }) {
    const { phone, fullName, email: to } = params;

    if (!(await globalPOSTRateLimit())) {
        return { message: "Too many requests" };
    }

    // Retrieve the client IP from headers (assumes X-Forwarded-For is set)
    const reqHeaders = await headers();
    const clientIP = reqHeaders.get("x-forwarded-for") || "Not Available";
    if (clientIP !== "Not Available" && !ipBucket.check(clientIP, 1)) {
        return { message: "Too many requests" };
    }

    const { emailClient, senderAddress } = await getEmailClient();

    const message = {
        senderAddress,
        content: {
            subject: `TheBakerz - Onboarding Request`,
            plainText: generatePlainTextOnboardingRequest({ phone, fullName, email: to }),
            html: await render(OnboardingRequest({ phone, fullName, email: to })),
        },
        recipients: {
            to: [
                {
                    address: "support@thebakerz.com",
                    displayName: "TheBakerz",
                },
            ],
        },
    };

    try {
        await sendEmailMessage(emailClient, message);
    } catch (error) {
        console.error(`Error sending onboarding request email: ${error}`);
        throw error;
    }

    // Record TOS acceptance after a successful send
    await acceptTOS(to, TOS_VERSION, clientIP, "explicit", "onboarding");
}

/**
 * Sends a contact-us form email.
 */
export async function sendContactUsForm(params: { email: string; subject: string; description: string }) {
    const { description, subject, email: to } = params;

    const { emailClient, senderAddress } = await getEmailClient();

    const message = {
        senderAddress,
        content: {
            subject: `TheBakerz - Contact Us`,
            plainText: generatePlainTextContactusForm({ email: to, subject, description }),
            html: await render(ContactUsForm({ email: to, subject, content: description })),
        },
        recipients: {
            to: [
                {
                    address: "support@thebakerz.com",
                    displayName: "TheBakerz",
                },
            ],
        },
    };

    try {
        await sendEmailMessage(emailClient, message);
    } catch (error) {
        console.error(`Error sending contact us form email: ${error}`);
        throw error;
    }
}

/**
 * Generates a plain text version for the onboarding request email.
 */
function generatePlainTextOnboardingRequest({
                                                phone,
                                                fullName,
                                                email,
                                            }: {
    phone: string;
    fullName: string;
    email: string;
}): string {
    return `Phone number: ${phone}\nFull name: ${fullName}\nEmail: ${email}`;
}

/**
 * Generates a plain text version for the contact us form email.
 */
function generatePlainTextContactusForm({
                                            email,
                                            subject,
                                            description,
                                        }: {
    email: string;
    subject: string;
    description: string;
}): string {
    return `Email: ${email}\nSubject: ${subject}\nDescription: ${description}`;
}

/**
 * Generates a plain text version for the magic code email.
 */
function generatePlainTextCode({ code }: { code: string }): string {
    return `Your verification code is: ${code}`;
}
