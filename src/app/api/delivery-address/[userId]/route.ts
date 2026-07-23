/**
 * @fileoverview API route handling GET /api/delivery-address/[userId].
 *
 * Fetches the delivery address stored for the given user via the getDeliveryAddress
 * helper and returns it as JSON, or null when no address exists. Rate limited via
 * globalGETRateLimit.
 */
import { NextRequest, NextResponse } from "next/server";
import { getDeliveryAddress } from "@/app/(store)/[id]/delivery-actions";
import { globalGETRateLimit } from "@/lib/utils/helper/requests";
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  if (!(await globalGETRateLimit())) {
    return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
    );
}
  try {
    const { userId } = await params;
    
    // Get delivery address using the helper function
    const address = await getDeliveryAddress(userId);

    if (!address) {
      return NextResponse.json(null);
    }

    return NextResponse.json(address);

  } catch (error) {
    console.error("Error in delivery address API route:", error);
    return NextResponse.json(
      { error: "Failed to fetch delivery address" },
      { status: 500 }
    );
  }
}
