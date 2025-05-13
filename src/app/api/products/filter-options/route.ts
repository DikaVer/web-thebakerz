import { NextResponse } from 'next/server';
import { containerProducts } from '@/db';

export async function GET() {
  try {
    // Get all unique categories
    const categoryQuery = {
      query: "SELECT DISTINCT VALUE c.category FROM c WHERE c.archive = false AND c.category != null",
    };
    
    const { resources: categories } = await containerProducts.items
      .query(categoryQuery)
      .fetchAll();
    
    // Get all unique allergies
    const allergyQuery = {
      query: "SELECT DISTINCT VALUE allergy FROM c JOIN allergy IN c.allergies WHERE c.archive = false AND IS_ARRAY(c.allergies)",
    };
    
    const { resources: allergies } = await containerProducts.items
      .query(allergyQuery)
      .fetchAll();
    
    // Get all unique dietary options
    const dietaryQuery = {
      query: "SELECT DISTINCT VALUE diet FROM c JOIN diet IN c.dietary WHERE c.archive = false AND IS_ARRAY(c.dietary)",
    };
    
    const { resources: dietary } = await containerProducts.items
      .query(dietaryQuery)
      .fetchAll();
    
    // Get max price of all products
    const maxPriceQuery = {
      query: "SELECT VALUE MAX(c.price) FROM c WHERE c.archive = false",
    };
    
    const { resources: maxPriceResult } = await containerProducts.items
      .query(maxPriceQuery)
      .fetchAll();
    
    const maxPrice = maxPriceResult.length > 0 ? maxPriceResult[0] : 10000;
    
    // Return all filter options
    return NextResponse.json({
      categories: categories || [],
      allergies: allergies || [],
      dietary: dietary || [],
      maxPrice: maxPrice || 10000,
    });
    
  } catch (error) {
    console.error('Error fetching filter options:', error);
    return NextResponse.json(
      { error: 'Failed to fetch filter options' },
      { status: 500 }
    );
  }
} 