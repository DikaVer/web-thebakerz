/**
 * @fileoverview Shared TypeScript types for the delivery settings module.
 *
 * Defines DeliveryRange (distance ranges with pricing and window),
 * DeliveryCity and CountryDelivery (per-city and per-country delivery
 * configuration including schedule and delivery mode flags), and MapElement
 * (Google Maps marker and circle references used by the map view).
 */
import {WorkHours} from "@/lib/actions/calendar-actions";

export interface DeliveryRange {
  range: number; // in kilometers
  deliveryPriceInCents: number; // delivery price in cents
  minOrderPriceInCents: number; // minimum order price in cents
  deliveryWindow: number; // delivery window duration in minutes
}

export interface DeliveryCity {
  name: string;
  ranges: DeliveryRange[];
  coordinates: { lat: number, lng: number };
  deliverySchedule: WorkHours;
  isStoreDelivery: boolean;
  isPostDelivery: boolean;
  minOrderTime: number; // minimum order time in minutes

}

export interface CountryDelivery {
  countryCode: string;
  deliveryPriceInCents: number;
  minOrderPriceInCents: number;
  deliverySchedule: WorkHours;
  isStoreDelivery: boolean; // Whether delivery is handled by the store/merchant (true) or the platform (false)
  isPostDelivery: boolean; // Whether delivery is handled by postal service (true) or own delivery (false)
  minOrderTime: number; // minimum order time in minutes
  deliveryWindow: number; // delivery window duration in minutes
}

export interface MapElement {
  marker: google.maps.Marker | null;
  circles: google.maps.Circle[];
} 