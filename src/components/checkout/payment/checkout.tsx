'use client'

import { useEffect, useState } from 'react'
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { fetchClientSecret } from "@/lib/actions/stripe"
import { Button, Spacer } from "@heroui/react"
import { useRouter } from 'next/navigation'
import { Icon } from "@iconify/react"
import showErrorMessage from "@/components/toast/toast-error"
import { useTranslations } from "next-intl"
import clarity from '@microsoft/clarity';
// Define response type for fetchClientSecret
type ClientSecretResponse = string | { error: string }

interface CheckoutProps {
    id: string
    storeId: string
    clientSecretParam?: string
    storeStripeAccountId: string
}

export default function Checkout({ id, storeId, clientSecretParam, storeStripeAccountId }: CheckoutProps) {
    const [clientSecret, setClientSecret] = useState<string | null | undefined>(clientSecretParam)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const t = useTranslations("app/(store)/components/checkout")
    clarity.event("pay");
    clarity.setTag("page", "payment");

    const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

    useEffect(() => {
        const getClientSecret = async () => {
            try {
                setIsLoading(true)
                setError(null)
                
                // Get the order note from localStorage
                const orderNote = localStorage.getItem("orderNote") || "";

                const response = await fetchClientSecret({
                    storeId,
                    storeStripeAccountId,
                    orderNote, // Include the order note in the request
                }) as ClientSecretResponse

                if (typeof response === 'object' && 'error' in response) {
                    showErrorMessage({ error: response.error })
                    setError(response.error)
                    router.push(`/${id}/checkout`)
                } else if (typeof response === 'string') {
                    setClientSecret(response)
                } else {
                    const errorMsg = 'Failed to initialize checkout'
                    showErrorMessage({ error: errorMsg })
                    setError(errorMsg)
                    router.push(`/${id}/checkout`)
                }
            } catch (err) {
                const errorMsg = 'Something went wrong. Please try again.'
                showErrorMessage({ error: errorMsg })
                setError(errorMsg)
                router.push(`/${id}/checkout`)
                console.error(err)
            } finally {
                setIsLoading(false)
            }
        }

        !clientSecret && getClientSecret();
    }, [id, storeId, router])

    if (isLoading && !clientSecret) {
        return <LoadingView />
    }

    if (error || !clientSecret) {
        return <ErrorView error={error} onRetry={() => router.push(`/${id}/checkout`)} />
    }


    return (
        <div id="checkout" className="min-h-[500px] bg-background">
            <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={{ clientSecret }}
            >
                <EmbeddedCheckout/>
            </EmbeddedCheckoutProvider>
        </div>
    )
}

function LoadingView() {
    const t = useTranslations("app/(store)/components/checkout")
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="animate-spin mb-4">
                <Icon icon="eos-icons:loading" width={48} />
            </div>
            <p>{t("loadingPaymentGateway")}</p>
        </div>
    )
}

interface ErrorViewProps {
    error: string | null
    onRetry: () => void
}

function ErrorView({ error, onRetry }: ErrorViewProps) {
    const t = useTranslations("app/(store)/components/checkout")
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="text-red-500 mb-4">
                <Icon icon="ph:warning-circle" width={48} />
            </div>
            <p className="text-lg font-medium mb-2">
                {error || t("unableToInitializePayment")}
            </p>
            <Spacer y={4} />
            <Button
                className="bg-gradient-primary text-white"
                onPress={onRetry}
            >
                {t("returnToCheckout")}
            </Button>
        </div>
    )
}