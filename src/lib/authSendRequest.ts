"use server";

import { render } from '@react-email/components';
import { EmailClient, KnownEmailSendStatus } from "@azure/communication-email";
import VerifyCodeEmail from "@/components/emails/auth-code";
import {AzureKeyCredential} from "@azure/core-auth";

// Function to send a magic link email using Azure Communication Services
export async function sendMagicCode(params: { identifier: string; code: string }) {
    const { identifier: to, code } = params;


    console.log(`Sending magic link to ${to}`);
    console.log(`Magic code: ${code}`);

    // Retrieve connection string and sender address from environment variables
    const endpoint = process.env.AZURE_COMMUNICATION_EMAIL_ENDPOINT;
    const senderAddress = process.env.EMAIL_FROM; // Must be a verified MailFrom address in Azure

    if (!endpoint) {
        throw new Error("Missing AZURE_COMMUNICATION_EMAIL_ENDPOINT or AZURE_COMMUNICATION_EMAIL_KEY environment variables.");
    }
    if (!senderAddress) {
        throw new Error("Missing EMAIL_FROM environment variable.");
    }

    // Create an instance of the EmailClient using your connection string
    const emailClient = new EmailClient(endpoint);

    // Construct the email message object
    const message = {
        senderAddress, // This should be your verified sender address from Azure
        content: {
            subject: `TheBakerz Verification Code`,
            plainText: generatePlainText({code}),
            html: await render(VerifyCodeEmail({verificationCode: code})),
        },
        recipients: {
            to: [
                {
                    address: to,
                    displayName: "TheBakerz"
                }
            ]
        }
    };

    try {
        // Begin sending the email (returns a poller for the long-running operation)
        const poller = await emailClient.beginSend(message);
        // Optionally, wait until the operation completes
        const result = await poller.pollUntilDone();

        if (result.status !== KnownEmailSendStatus.Succeeded) {
            throw new Error(`Email send failed with status: ${result.status}`);
        }

        console.log(`Magic link email sent successfully to ${to}`);
    } catch (error) {
        console.error(`Error sending magic link email: ${error}`);
        throw error; // Propagate error for higher-level handling
    }
}

// Generates a plain text version of the email (fallback for clients that don’t support HTML)
function generatePlainText({ code }: { code: string;}): string {
    return `Your 6 digit code is ${code}`;
}
