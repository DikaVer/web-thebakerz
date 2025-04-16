# Delivery Manager for Bakery Business

This module allows bakery owners to define delivery zones, set delivery prices based on regions, and visualize delivery areas on an interactive map.

## Features

- **Google Maps Integration**: Draw and visualize delivery zones on a map
- **Postal Code Support**: Associate postal codes with specific delivery regions
- **Custom Pricing**: Set different delivery prices for each region
- **User-friendly Interface**: Easy-to-use interface for managing delivery zones

## Setup Instructions

### 1. Google Maps API Key

You need to obtain a Google Maps API key with the following enabled:
- Maps JavaScript API
- Places API
- Geometry API
- Drawing API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or use an existing one
3. Enable the required APIs
4. Create an API key
5. Set appropriate restrictions for security

Once you have your API key, add it to your `.env.local` file:

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_ACTUAL_API_KEY
```

### 2. Azure Cosmos DB Setup

The delivery regions are stored in Azure Cosmos DB. Ensure your database has a container named "DeliveryRegions".

## Using the Delivery Manager

1. **Navigate to the Settings**: Go to your baker's dashboard and open the Settings page.

2. **Access Delivery Manager**: Select the "Delivery Manager" tab.

3. **Add a New Delivery Region**:
   - Click the "Add New Delivery Region" button
   - Enter a name for the region (e.g., "Amsterdam Centrum")
   - Add postal codes for the region
   - Set a delivery price
   - Draw a circle on the map to define the delivery area
   - Click "Save"

4. **Edit or Delete Regions**:
   - Click on a region on the map or the "Edit" button in the table
   - Update details as needed
   - To delete, click the "Delete" button and confirm

## Testing

The system includes test data for development purposes. When running in development mode without an existing store, test regions for Amsterdam are displayed.

## Troubleshooting

- **Map Not Loading**: Check that your Google Maps API key is valid and has the necessary APIs enabled
- **Can't Save Regions**: Verify that your Azure Cosmos DB connection is working properly
- **Drawing Tools Not Appearing**: Ensure the Google Maps Drawing API is enabled in your Google Cloud Console

For further assistance, contact the development team. 