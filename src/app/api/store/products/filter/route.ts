import { NextRequest, NextResponse } from "next/server";
import { getCurrentProductsByFilter } from "@/lib/actions/product";

export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("Store-Id");
    const authHeader = request.headers.get("Authorization");
    
    // Check authorization header
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const token = authHeader.substring(7);
    if (token !== process.env.NEXT_PRIVATE_SECRET_BEARER) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }
    
    // Check if store ID exists
    if (!storeId) {
      return NextResponse.json(
        { error: "Store ID is required" },
        { status: 400 }
      );
    }
    
    // Get filter parameters from URL
    const url = new URL(request.url);
    const minPrice = url.searchParams.get("minPrice");
    const maxPrice = url.searchParams.get("maxPrice");
    const categories = url.searchParams.get("categories");
    const allergies = url.searchParams.get("allergies");
    const dietary = url.searchParams.get("dietary");
    
    // Build filter parameters
    const filterParams = {
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      categories: categories ? categories.split(",") : undefined,
      allergies: allergies ? allergies.split(",") : undefined,
      dietary: dietary ? dietary.split(",") : undefined
    };
    
    // Get filtered products
    const products = await getCurrentProductsByFilter(filterParams);
    
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching filtered products:", error);
    return NextResponse.json(
      { error: "Failed to fetch filtered products" },
      { status: 500 }
    );
  }
} 