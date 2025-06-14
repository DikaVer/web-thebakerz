'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { getErrorMessage } from '@/lib/utils/payment-errors';

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