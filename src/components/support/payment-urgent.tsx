'use client';

import React, {useState} from 'react';

import { Button } from "@/components/ui/button";
import {sendPaymentSupport} from "@/lib/actions/auth/email-action";
import showSuccessMessage from "@/components/toast/toast-succes";


export default function PaymentSupportButton({error, description}: {error: string; description: string}) {

    const [isPending, setIsPending] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);


    return !isSuccess ? (
            <Button
                type="submit"
                className={'rounded-xl bg-gradient-primary'}
                isLoading={isPending}
                disabled={isPending}
                onClick={async () => {
                    setIsPending(true)
                    try {
                        await sendPaymentSupport({error, description});
                        showSuccessMessage({success: "Your request has been sent successfully."});
                        setIsSuccess(true);
                    } catch (e) {
                        console.error(e);
                    } finally {
                        setIsPending(false)
                    }
                }}
            >
                {
                    isPending ? "Sending..." : "Send request"
                }
            </Button>
    ):(
        <p>We received your support ticket. We will contact you soon!</p>
    );
}
