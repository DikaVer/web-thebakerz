import {WorkHours} from "@/lib/actions/calendar-actions";

export interface DeliveryRange {
  range: number; // in kilometers
  deliveryPriceInCents: number; // delivery price in cents
  minOrderPriceInCents: number; // minimum order price in cents
}

export interface DeliveryCity {
  name: string;
  ranges: DeliveryRange[];
  coordinates: { lat: number, lng: number };
  deliverySchedule?: WorkHours;
  isStoreDelivery: boolean;
  minOrderTime: number; // minimum order time in minutes
  
  // Kept for backward compatibility
  range?: number; 
  priceInCents?: number;
  minOrderPriceInCents?: number;
}

export interface MapElement {
  marker: google.maps.Marker | null;
  circles: google.maps.Circle[];
} 