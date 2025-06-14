'use client'

import { useEffect, useState, useCallback } from 'react'
import { Elements, PaymentElement, ExpressCheckoutElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { prepareCheckout } from "@/lib/actions/prepare-checkout-input"
import { Button, Input, Spacer, Spinner } from "@heroui/react"
import { useRouter } from 'next/navigation'
import { Icon } from "@iconify/react"
import showErrorMessage from "@/components/toast/toast-error"
import showSuccessMessage from "@/components/toast/toast-succes"
import { useTranslations } from "next-intl"
import { useCart } from '@/components/providers/cart-provider'
import { useStore } from '@/components/providers/store-provider'
import { useSession } from '@/components/providers/session-provider'
import { EmailSchema } from '@/lib/utils/schemas'



interface EmbeddedCheckoutProps {
    storeStripeAccountId: string
    onPaymentSuccess?: () => void
    totalAmount: number
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function EmbeddedCheckout({ 
    storeStripeAccountId, 
    totalAmount,
    onPaymentSuccess 
}: EmbeddedCheckoutProps) {
    const [options, setOptions] = useState<any>(null)
    const [orderId, setOrderId] = useState<string | null>(null)
    const [isInitializing, setIsInitializing] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { store } = useStore()

    const initializeCheckout = useCallback(async () => {
        if (!store?.id || !storeStripeAccountId) {
            setIsInitializing(false);
            setError("Store data is not yet available.");
            return;
        }

            setIsInitializing(true)
            setError(null)
            
        try {
            const orderNote = localStorage.getItem("orderNote") || "";

            const response = await prepareCheckout({
                storeId: store.id,
                storeStripeAccountId,
                orderNote,
            })

            if ('error' in response) {
                showErrorMessage({ error: response.error || 'Failed to initialize checkout' })
                setError(response.error || 'Failed to initialize checkout')
            } else if (response.orderId && response.totalAmount && response.currency) {
                setOrderId(response.orderId)
                setOptions({
                    mode: 'payment' as const,
                    amount: response.totalAmount,
                    currency: response.currency,
                    paymentMethodCreation: 'manual' as const,
                    appearance: {
        theme: 'stripe' as const,
        variables: {
            colorPrimary: '#0066cc',
            colorBackground: '#ffffff',
            colorText: '#30313d',
            colorDanger: '#df1b41',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Lexend Deca, sans-serif',
            spacingUnit: '6px',
            borderRadius: '8px',
        },
        rules: {
            '.Tab': {
                border: '1px solid #E3E8EE',
                borderRadius: '8px',
            },
            '.Tab--selected': {
                borderColor: '#0066cc',
                boxShadow: '0 0 0 1px #0066cc',
            },
            '.Input': {
                border: '1px solid #E3E8EE',
                borderRadius: '8px',
            },
            '.Input:focus': {
                borderColor: '#0066cc',
                boxShadow: '0 0 0 1px #0066cc',
            }
        },
    }
                })
            } else {
                const errorMsg = 'Failed to initialize checkout'
                showErrorMessage({ error: errorMsg })
                setError(errorMsg)
            }
        } catch (err) {
            const errorMsg = 'Something went wrong. Please try again.'
            showErrorMessage({ error: errorMsg })
            setError(errorMsg)
            console.error(err)
        } finally {
            setIsInitializing(false)
        }
    }, [store?.id, storeStripeAccountId])

    useEffect(() => {
        initializeCheckout()
    }, [initializeCheckout])

    if (isInitializing) {
        return <InitializingView />
    }

    if (error || !options || !orderId) {
        return (
            <ErrorView 
                error={error} 
                onRetry={initializeCheckout}
            />
        )
    }

    return (
        <Elements stripe={stripePromise} options={options}>
            <CheckoutForm 
                    orderId={orderId}
                    onPaymentSuccess={onPaymentSuccess}
                />
            </Elements>
    )
}

interface CheckoutFormProps {
    orderId: string
    onPaymentSuccess?: () => void
}

function CheckoutForm({ orderId, onPaymentSuccess }: CheckoutFormProps) {
    const stripe = useStripe()
    const elements = useElements()
    const router = useRouter()
    const t = useTranslations("app/(store)/components/checkout")
    const { removeAllItems } = useCart()
    const { store } = useStore()
    const { session } = useSession()
    
    const [isLoading, setIsLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [emailError, setEmailError] = useState('')
    const [customerName, setCustomerName] = useState('')
    const [nameError, setNameError] = useState('')
    const [isExpressCheckoutAvailable, setIsExpressCheckoutAvailable] = useState(false)
    const [hasSubmitted, setHasSubmitted] = useState(false)
    
    const userEmail = session?.user?.email || email;
    const needsEmail = !session?.user?.email;
    
    const validateEmail = (emailValue: string) => {
        try {
            EmailSchema.parse({ email: emailValue })
            setEmailError('')
            return true
        } catch (error: any) {
            if (error.errors?.[0]?.message) {
                setEmailError(error.errors[0].message)
            }
            return false
        }
    }

    const handleEmailChange = (value: string) => {
        setEmail(value)
        if (value) {
            validateEmail(value)
        } else if (hasSubmitted) {
            setEmailError('Email is required')
        } else {
            setEmailError('')
        }
    }

    const handleNameChange = (value: string) => {
        setCustomerName(value)
    }

    const handleServerResponse = async (response: any) => {
        if (response.error) {
            showErrorMessage({ error: response.error.message || 'An unknown error occurred' });
            setIsLoading(false);
        } else if (response.status === 'requires_action') {
            const { error, paymentIntent } = await stripe!.handleNextAction({
                clientSecret: response.client_secret
            });

            if (error) {
                showErrorMessage({ error: error.message || 'Authentication failed.' });
                setIsLoading(false);
            } else if (paymentIntent) {
                if (onPaymentSuccess) onPaymentSuccess();
                // For non-redirect flows (like 3D Secure) that complete inline.
                // We redirect to the same completion URL that redirect-based flows use.
                // This unifies the order finalization logic on the server.
                setIsLoading(true);
                window.location.href = `/api/payment/complete?payment_intent=${paymentIntent.id}&redirect_status=${paymentIntent.status}`;
            }
        } else {
            // Payment succeeded immediately on the server.
            showSuccessMessage({ success: t("paymentSuccessful") });
            removeAllItems();
            if (onPaymentSuccess) onPaymentSuccess();
            const storeUrl = store?.storeName || store?.id;
            router.push(`/${storeUrl}/order/success?order_id=${response.orderId}`);
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()

        if (!stripe || !elements) {
            return
        }
        
        setHasSubmitted(true)
        
        if (needsEmail) {
            let hasError = false;
            if (!email) {
                setEmailError('Email is required');
                hasError = true;
            } else if (!validateEmail(email)) {
                hasError = true;
            }
            if (hasError) {
                showErrorMessage({ error: "Please fill in all required fields." });
                setIsLoading(false);
                return;
            }
        }

        setIsLoading(true)

            const { error: submitError } = await elements.submit()
            if (submitError) {
                showErrorMessage({ error: submitError.message || 'Payment form validation failed' })
                setIsLoading(false)
                return
            }

        const { error, confirmationToken } = await stripe.createConfirmationToken({
                elements,
                params: {
                return_url: `${window.location.origin}/api/payment/complete`,
                payment_method_data: {
                    billing_details: {
                        name: customerName || session?.user?.username || userEmail.split('@')[0],
                        email: userEmail,
                    }
                }
            }
        });

        if (error) {
            showErrorMessage({ error: error.message || 'Failed to create confirmation token' })
            setIsLoading(false)
            return;
        }

        try {
            const res = await fetch("/api/payment-intent", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    confirmationTokenId: confirmationToken!.id,
                    orderId: orderId,
                    storeId: store?.id,
                    email: userEmail,
                    name: customerName,
                }),
            });
        
            const data = await res.json();
            await handleServerResponse(data);

        } catch (e: any) {
            showErrorMessage({ error: e.message || 'Server communication error' })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                 <ExpressCheckoutElement 
                    onReady={(event) => {
                        if (event.availablePaymentMethods) {
                            setIsExpressCheckoutAvailable(true);
                        }
                    }}
                    onConfirm={
                    async (e) => {
                         if (!stripe || !elements) {
                            return;
                         }

                        //  if (needsEmail) {
                        //     let hasError = false;
                        //     if (!validateEmail(email)) {
                        //         hasError = true;
                        //     }
                        //     if (hasError) {
                        //         showErrorMessage({ error: "Please fill in all required fields before using Express Checkout." });
                        //         return;
                        //     }
                        // }

                         const {error, confirmationToken} = await stripe.createConfirmationToken({
                            elements,
                            params: {
                                return_url: `${window.location.origin}/api/payment/complete`,
                                // payment_method_data: {
                                //     billing_details: {
                                //         name: customerName || session?.user?.username || userEmail.split('@')[0],
                                //         email: userEmail,
                                //     }
                                // }
                            }
                         });

                         if (error) {
                             showErrorMessage({ error: error.message || 'Failed to create confirmation token' })
                             setIsLoading(false)
                             return;
                         }

                         try {
                             const res = await fetch("/api/payment-intent", {
                                 method: "POST",
                                 headers: {"Content-Type": "application/json"},
                                 body: JSON.stringify({
                                     confirmationTokenId: confirmationToken!.id,
                                     orderId: orderId,
                                     storeId: store?.id,
                                     email: userEmail,
                                     name: customerName,
                                 }),
                             });
                             const data = await res.json();
                             await handleServerResponse(data);
                         } catch (e: any) {
                            showErrorMessage({ error: e.message || 'Server communication error' })
                         }
                    }
                 } />
            {isExpressCheckoutAvailable && <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-background text-gray-500 rounded-full">{t("orPayWith")}</span>
                </div>
            </div>}

            {needsEmail && (
                <div>
                    <div>
                        <Input
                            type="email"
                            size="lg"
                            label="Email Address"
                            placeholder="Enter your email address"
                            labelPlacement='outside'
                            variant="bordered"
                            value={email}
                            radius='sm'
                            onValueChange={handleEmailChange}
                            isRequired
                            errorMessage={emailError}
                            isInvalid={!!emailError || (hasSubmitted && !email)}
                            classNames={{
                                input: "text-base placeholder:!font-light",
                                label: "text-sm",
                                inputWrapper: "border-small",
                            
                            }}
                            endContent={
                                <Icon icon="solar:letter-linear" className="text-default-400" width={24} />
                            }
                        />
                    </div>
                    <Spacer y={4} />    
                    <div>
                        <Input
                            type="text"
                            size="lg"
                            label="Full Name"
                            placeholder="Enter your full name"
                            labelPlacement='outside'
                            variant="bordered"
                            value={customerName}
                            radius='sm'
                            onValueChange={handleNameChange}
                            classNames={{
                                input: "text-base placeholder:!font-light",
                                label: "text-sm",
                                inputWrapper: "border-small",
                            }}
                            endContent={
                                <Icon icon="solar:user-linear" className="text-default-400" width={24} />
                            }
                        />
                    </div>
                </div>
            )}

                <div>
                    <PaymentElement 
                        options={{
                            layout: 'tabs',
                            defaultValues: {
                                billingDetails: {
                                    email: 'never',
                                    name: 'never'
                                }
                            },
                            fields: {
                                billingDetails: {
                                    email: 'never',
                                    name: 'never'
                                }
                            },
                        }}
                    />
                </div>

                <Button
                    type="submit"
                    isDisabled={!stripe || !elements || isLoading}
                    isLoading={isLoading}
                    className="w-full bg-gradient-primary text-white text-lg py-3 rounded-full"
                    size="lg"
                >
                    {isLoading ? t("processing") : t("pay")}
                </Button>
            </form>
        </div>
    )
}

function InitializingView() {
    const t = useTranslations("app/(store)/components/checkout")
    return (
        <div className="flex flex-col items-center justify-center p-8 bg-background rounded-lg border">
            <div className="mb-4">
                <Spinner size="lg" />
            </div>
            <p className="text-sm text-default-600">{t("initializingPayment")}</p>
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
        <div className="flex flex-col items-center justify-center p-8 bg-background rounded-lg border">
            <div className="text-red-500 mb-4">
                <Icon icon="ph:warning-circle" width={32} />
            </div>
            <p className="text-sm font-medium mb-2 text-center">
                {error || t("unableToInitializePayment")}
            </p>
            <Button
                aria-label="Retry payment initialization"
                className="bg-gradient-primary text-white"
                onPress={onRetry}
                size="sm"
            >
                {t("retry")}
            </Button>
        </div>
    )
} 