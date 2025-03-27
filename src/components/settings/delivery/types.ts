import { DeliverySchedule } from "@/lib/actions/delivery-actions";

export interface DeliveryCity {
  name: string;
  range: number; // in kilometers
  priceInCents: number; // delivery price in cents
  minOrderPriceInCents: number; // minimum order price in cents
  coordinates: { lat: number, lng: number };
  deliverySchedule: DeliverySchedule;
}

export interface MapElement {
  marker: google.maps.Marker | null;
  circle: google.maps.Circle | null;
} 