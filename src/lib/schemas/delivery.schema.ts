import { z } from 'zod';
import { cityLatLngMap } from '@/lib/local-variables';

// Schema for delivery schedule time
const DeliveryTimeSchema = z.object({
  hour: z.number().min(0).max(23),
  minute: z.number().min(0).max(59)
});

// Schema for delivery schedule day
const DeliveryScheduleDaySchema = z.object({
  isEnabled: z.boolean(),
  start: DeliveryTimeSchema,
  end: DeliveryTimeSchema
}).refine(
  (data) => {
    if (!data.isEnabled) return true;
    const startMinutes = data.start.hour * 60 + data.start.minute;
    const endMinutes = data.end.hour * 60 + data.end.minute;
    return startMinutes < endMinutes;
  },
  {
    message: "Start time must be before end time",
    path: ["start"]
  }
);

// Schema for delivery schedule
const DeliveryScheduleSchema = z.record(z.string(), DeliveryScheduleDaySchema);

// Schema for coordinates
const CoordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180)
});

// Schema for a single delivery region
const DeliveryRegionSchema = z.object({
  name: z.string().refine(
    (name) => name in cityLatLngMap,
    { message: "City must be from the predefined list" }
  ),
  radiusKm: z.number().min(0).max(100),
  priceInCents: z.number().min(0),
  minOrderPriceInCents: z.number().min(1000, { message: "Minimum order price must be at least 10€" }),
  coordinates: CoordinatesSchema,
  deliverySchedule: DeliveryScheduleSchema
});

// Schema for the array of delivery regions
export const DeliveryRegionsSchema = z.array(DeliveryRegionSchema);

// Type for the validated data
export type ValidatedDeliveryRegion = z.infer<typeof DeliveryRegionSchema>;
export type ValidatedDeliveryRegions = z.infer<typeof DeliveryRegionsSchema>; 