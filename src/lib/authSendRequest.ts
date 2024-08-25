"use server";

import {render} from '@react-email/components';
import {VerifyIdentityEmail} from "@/components/emails/email";


export async function sendMagicLink(params: {
    identifier: string
    url: string
}) {
    const { identifier: to, url } = params
    console.log("Sending magic link to", url)
    const { host } = new URL(url)
    console.log("Sending magic link to", host)
    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            personalizations: [{ to: [{ email: to }] }],
            from: { email: process.env.EMAIL_FROM },
            subject: `${host}: Sign in with Magic Link`,
            content: [
                { type: "text/plain", value: text({ url, host }) },
                { type: "text/html", value: await render(VerifyIdentityEmail({url: url})) },
            ],
        }),
    })

    if (!res.ok) throw new Error("Sendgrid error: " + (await res.text()))
}

// Email Text body (fallback for email clients that don't render HTML, e.g. feature phones)
function text({ url, host }: { url: string; host: string }) {
    return `Sign in to ${host}\n${url}\n\n`
}