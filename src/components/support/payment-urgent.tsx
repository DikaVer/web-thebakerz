/**
 * @fileoverview Button for sending an urgent payment support request.
 *
 * Exports PaymentSupportButton, which submits the given error and description
 * to the sendPaymentSupport email server action when pressed, shows a success
 * toast, and replaces itself with a confirmation message once the support
 * ticket has been sent.
 */
'use client';

import React, {useState} from 'react';

import { Button } from "@/components/ui/button";
import {sendPaymentSupport} from "@/lib/actions/emails/email-action";
import showSuccessMessage from "@/components/toast/toast-succes";
import {useTranslations} from "next-intl";


export default function PaymentSupportButton({error, description}: {error: string; description: string}) {

    const [isPending, setIsPending] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const t = useTranslations("app/(support)/components/payment-urgent");


    return !isSuccess ? (
            <Button
                type="submit"
                aria-label="Send payment support request"
                className={'rounded-xl bg-gradient-primary'}
                isLoading={isPending}
                disabled={isPending}
                onClick={async () => {
                    setIsPending(true)
                    try {
                        await sendPaymentSupport({error, description});
                        showSuccessMessage({success: t("requestSentSuccess")});
                        setIsSuccess(true);
                    } catch (e) {
                        console.error(e);
                    } finally {
                        setIsPending(false)
                    }
                }}
            >
                {
                    isPending ? t("sending") : t("sendRequest")
                }
            </Button>
    ):(
        <p>{t("supportTicket")}</p>
    );
}
