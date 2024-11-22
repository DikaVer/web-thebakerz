"use server";

import { render } from '@react-email/components';
import { VerifyIdentityEmail } from "@/components/emails/email";

// Function to send a magic link email
export async function sendMagicLink(params: { identifier: string; url: string }) {
    const { identifier: to, url } = params; // Destructure email identifier and URL from params
    const { host } = new URL(url); // Extract host from the URL

    console.log(`Sending magic link to ${to} with host ${host}`);
    console.log(`Magic link URL: ${url}`);

    try {
        // Send the email using SendGrid's API
        const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.AUTH_SENDGRID_SECRET}`, // Authorization using SendGrid secret
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                personalizations: [{ to: [{ email: to }] }], // Recipient email
                from: { email: process.env.EMAIL_FROM }, // Sender email (from environment variable)
                subject: `TheBakerz: Link to sign in`, // Subject of the email
                content: [
                    { type: "text/plain", value: generatePlainText({ url, host }) }, // Plain text version of the email
                    { type: "text/html", value: await render(VerifyIdentityEmail({ url })) }, // HTML version rendered using React component
                ],
            }),
        });

        // Check if the request was successful
        if (!res.ok) {
            const errorMessage = await res.text();
            throw new Error(`SendGrid error: ${errorMessage}`);
        }

        console.log(`Magic link email sent successfully to ${to}`);
    } catch (error) {
        console.error(`Error sending magic link email: ${error}`);
        throw error; // Propagate error for higher-level handling
    }
}

// Generates plain text body for email (fallback for clients that don't render HTML)
function generatePlainText({ url, host }: { url: string; host: string }): string {
    return `Sign in to ${host}\n${url}\n\n`; // Simple message with link and host information
}
