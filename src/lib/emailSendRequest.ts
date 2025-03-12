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

    const formattedCode = `${code.slice(0, 3)}-${code.slice(3)}`;

    console.log(`Sending magic link to ${to}`);
    console.log(`Magic code: ${code}`);

    const { emailClient, senderAddress } = await getEmailClient();

    const message = {
        senderAddress,
        content: {
            subject: `Your TheBakerz Verification Code: ${formattedCode}`,
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
        throw new Error("Store not found");
    }

    const { emailClient, senderAddress } = await getEmailClient();

    const messageCustomer = {
        senderAddress,
        content: {
            subject: `Your #${orderData.order_id} is placed!`,
            html: await render(OrderPlacedEmail({
                orderId: orderData.order_id,
                storeName: storeData.ownerName ? storeData.ownerName : "Anonymous Store",
                pickUpTime: orderData.scheduled_time.date + " " + orderData.scheduled_time.time,
                storePhone: storeData.phone ? storeData.phone : "No phone number",
                location: {
                    address: storeData.location.route + ", " + storeData.location.city + ", " + storeData.location.country,
                    latitude: storeData.location.latitude,
                    longitude: storeData.location.longitude,
                },
                products: orderData.productsData,
                subtotal_amount: orderData.amount,
                total_amount: orderData.amount,
                vat: orderData.amount_tax,
            })),
        },
        recipients: {
            to: [
                {
                    address: to,
                    displayName: storeData.ownerName,
                },
            ],
        },
    };

    const messageBakerz = {
        senderAddress,
        content: {
            subject: `You have a new order #${orderData.order_id} 🎉`,
            html: await render(NewOrderEmail({
                orderId: orderData.order_id,
                storeName: storeData.ownerName ? storeData.ownerName : "Anonymous Store",
                pickUpTime: orderData.scheduled_time.date + " " + orderData.scheduled_time.time,
                storePhone: storeData.phone ? storeData.phone : "No phone number",
                location: {
                    address: storeData.location.route + ", " + storeData.location.city + ", " + storeData.location.country,
                    latitude: storeData.location.latitude,
                    longitude: storeData.location.longitude,
                },
                products: orderData.productsData,
                subtotal_amount: orderData.amount,
                total_amount: orderData.amount,
                vat: orderData.amount_tax,
            })),
        },
        recipients: {
            to: [
                {
                    address: storeData.email,
                    displayName: "TheBakerz",
                },
            ],
        },
    };

    try {
        await sendEmailMessage(emailClient, messageBakerz);
        await sendEmailMessage(emailClient, messageCustomer);
        console.log(`Email email sent successfully to ${to}`);
        console.log(`Email email sent successfully to ${storeData.email}`);
    } catch (error) {
        console.error(`Error sending magic link email: ${error}`);
        throw error;
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
    return `Your 6 digit code is ${code}`;
}
