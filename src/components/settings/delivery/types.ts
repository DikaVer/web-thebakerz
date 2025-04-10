import {WorkHours} from "@/lib/actions/calendar-actions";


export interface DeliveryCity {
  name: string;
  range: number; // in kilometers
  priceInCents: number; // delivery price in cents
  minOrderPriceInCents: number; // minimum order price in cents
  coordinates: { lat: number, lng: number };
  deliverySchedule?: WorkHours;
  isStoreDelivery: boolean;
  minOrderTime: number; // minimum order time in minutes
}

export interface MapElement {
  marker: google.maps.Marker | null;
  circle: google.maps.Circle | null;
} 