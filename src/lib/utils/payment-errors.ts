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