import { setAddressData } from "@/lib/actions/session-store";
import { AddressDataFieldSchema, CheckoutDataFieldSchema } from "@/lib/schemas";
import { AddressDataField, AddressDataStorageField } from "@/lib/definitions";
import { NextResponse } from "next/server";
import {auth} from "@/auth";

// This function will handle saving the address
export async function POST(req: Request) {
    try {
        // Parse the request body since req.body is not available directly
        const body = await req.json();
        const { addressData, checkoutData } = body;
        // Validate the input (optional but recommended)
        const validatedAddressData = AddressDataFieldSchema.parse(addressData) as AddressDataField;
        const validatedCheckoutData = CheckoutDataFieldSchema.parse(checkoutData) as AddressDataStorageField;

        const session = await auth()
        // Save the address to the database
        if (session) {
            await setAddressData({
                shippingAddress: validatedCheckoutData.shippingAddress,
                savedAddresses: {
                    ...validatedCheckoutData.savedAddresses,
                    [validatedAddressData.id]: validatedAddressData,
                }, // @ts-ignore
            }, session.user?.addressToken);
        }

        // Respond with a success message
        return NextResponse.json({ message: 'Address saved successfully', addressData }, { status: 200 });
    } catch (error) {
        if (error instanceof Error) {
            // If validation fails, Zod throws a `ZodError`
            return NextResponse.json({
                message: JSON.parse(error.message),
                errors: error || [],
            }, { status: 400 });
        }
        // For any other server error
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
