/**
 * @fileoverview Payment failure page at /payment/error.
 *
 * Client component that reads the error and status search params, maps the
 * error code to a translated message via getErrorMessage, and offers buttons
 * to retry (go back) or return to the home page.
 */
'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { getErrorMessage } from '@/lib/utils/payment-errors';
import { useTranslations } from 'next-intl';

export default function PaymentErrorPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const error = searchParams.get('error');
    const status = searchParams.get('status');
    const t = useTranslations("PaymentErrors");

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
                <div className="mb-6">
                    <Icon 
                        icon="ph:warning-circle-fill" 
                        className="text-red-500 mx-auto mb-4" 
                        width={64} 
                        height={64}
                    />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {t("paymentError")}
                    </h1>
                    <p className="text-gray-600">
                        {getErrorMessage(error)}
                    </p>
                    {status && (
                        <p className="text-sm text-gray-500 mt-2">
                            {t("status")}: {status}
                        </p>
                    )}
                </div>

                <div className="space-y-3">
                    <Button
                        color="primary"
                        variant="solid"
                        onPress={() => router.back()}
                        className="w-full"
                    >
                        {t("tryAgain")}
                    </Button>
                    
                    <Button
                        color="default"
                        variant="bordered"
                        onPress={() => router.push('/')}
                        className="w-full"
                    >
                        {t("goHome")}
                    </Button>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                        {t("contactSupport")}
                    </p>
                </div>
            </div>
        </div>
    );
}