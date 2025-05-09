
import { NextRequest, NextResponse } from "next/server";
import { getDeliveryAddress } from "@/app/(store)/[id]/delivery-actions";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
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
