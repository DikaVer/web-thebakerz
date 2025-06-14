'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';

export const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
        case 'rate_limit':
            return 'Too many requests. Please try again later.';
        case 'missing_payment_intent':
            return 'Payment information is missing. Please try again.';
        case 'payment_failed':
            return 'Payment was not successful. Please try again.';
        case 'missing_store_id':
        case 'missing_cosmos_id':
        case 'missing_cart_id':
            return 'Missing order information. Please contact support.';
        case 'order_not_found':
            return 'Order could not be found. Please contact support.';
        case 'missing_email':
            return 'Customer information is missing. Please contact support.';
        case 'user_creation_failed':
            return 'Failed to create user account. Please contact support.';
        case 'order_creation_failed':
            return 'Failed to create order. Please contact support.';
        case 'processing_failed':
            return 'Payment processing failed. Please try again or contact support.';
        default:
            return 'An unexpected error occurred during payment processing.';
    }
};

export default function PaymentErrorPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const error = searchParams.get('error');
    const status = searchParams.get('status');

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
                        Payment Error
                    </h1>
                    <p className="text-gray-600">
                        {getErrorMessage(error)}
                    </p>
                    {status && (
                        <p className="text-sm text-gray-500 mt-2">
                            Status: {status}
                        </p>
                    )}
                </div>

                <div className="space-y-3">
                    <Button
                        color="primary"
                        variant="solid"
                        onClick={() => router.back()}
                        className="w-full"
                    >
                        Try Again
                    </Button>
                    
                    <Button
                        color="default"
                        variant="bordered"
                        onClick={() => router.push('/')}
                        className="w-full"
                    >
                        Go Home
                    </Button>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                        If this problem persists, please contact our support team.
                    </p>
                </div>
            </div>
        </div>
    );
}