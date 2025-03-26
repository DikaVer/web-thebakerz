'use client';

import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Input,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  CardHeader,
  CardBody, 
  CardFooter,
  Tooltip
} from "@heroui/react";
import { useSession } from "@/components/providers/session-provider";
import { useTranslations } from "next-intl";
import { 
  DeliveryRegion, 
  addDeliveryRegion, 
  deleteDeliveryRegion, 
  getDeliveryRegions, 
  getTestDeliveryRegions, 
  searchPostalCode, 
  updateDeliveryRegion 
} from "@/lib/actions/delivery-actions";
import showSuccessMessage from "@/components/toast/toast-succes";
import showErrorMessage from "@/components/toast/toast-error";

// Import the Google Maps API
import { 
  GoogleMap, 
  useJsApiLoader, 
  Circle, 
  Marker, 
  InfoWindow
} from '@react-google-maps/api';

const defaultCenter = {
  lat: 52.3676,
  lng: 4.9041, // Amsterdam coordinates
};

const containerStyle = {
  width: '100%',
  height: '500px',
  pointerEvents: 'auto' as const
};

const mapWrapperStyle = {
  position: 'relative' as const,
  width: '100%',
  height: '500px',
  overflow: 'hidden'
};

const disableBodyScroll = () => {
  document.body.style.overflow = 'hidden';
};

const enableBodyScroll = () => {
  document.body.style.overflow = '';
};

const libraries = ["places", "geometry", "drawing"];

// Default radius in meters for postal code search (3km)
const DEFAULT_RADIUS = 3000;

const DeliveryManager = () => {
  const { session } = useSession();
  const t = useTranslations("app/(return_page)/settings/components/delivery-settings");
  const [regions, setRegions] = useState<DeliveryRegion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTest, setIsTest] = useState(false);
  const [activeRegion, setActiveRegion] = useState<DeliveryRegion | null>(null);
  const [selectedPostalCodes, setSelectedPostalCodes] = useState<string[]>([]);
  const [postalCodeCoordinates, setPostalCodeCoordinates] = useState<Record<string, {lat: number, lng: number}>>({});
  const [currentPostalCode, setCurrentPostalCode] = useState("");
  const [regionName, setRegionName] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedCoordinates, setSelectedCoordinates] = useState<{lat: number, lng: number, radius?: number} | null>(null);
  const [searchingPostalCode, setSearchingPostalCode] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  // Load Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: libraries as any,
  });

  // Initialize map when loaded
  const onMapLoad = (map: google.maps.Map) => {
    setMap(map);
  };

  useEffect(() => {
    const fetchRegions = async () => {
      setLoading(true);
      try {
        if (session?.store?.id) {
          const result = await getDeliveryRegions(session.store.id);
          if (result.success && result.data) {
            // Convert CosmosDB resources to DeliveryRegion array
            const regions = result.data.map(item => ({
              id: item.id,
              storeId: item.storeId,
              regionName: item.regionName,
              postalCodes: item.postalCodes,
              price: item.price,
              coordinates: item.coordinates,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt
            }));
            setRegions(regions);
            
            // Pre-load postal code coordinates
            const postalCodesMap: Record<string, {lat: number, lng: number}> = {};
            for (const region of regions) {
              for (const code of region.postalCodes) {
                if (!postalCodesMap[code] && region.coordinates) {
                  postalCodesMap[code] = {
                    lat: region.coordinates.lat,
                    lng: region.coordinates.lng
                  };
                }
              }
            }
            setPostalCodeCoordinates(postalCodesMap);
          } else {
            // If there's an error, use test data in dev environments
            if (process.env.NODE_ENV === 'development') {
              const testData = await getTestDeliveryRegions();
              setRegions(testData);
              
              // Set up test postal code coordinates
              const postalCodesMap: Record<string, {lat: number, lng: number}> = {};
              for (const region of testData) {
                for (const code of region.postalCodes) {
                  if (!postalCodesMap[code] && region.coordinates) {
                    postalCodesMap[code] = {
                      lat: region.coordinates.lat + (Math.random() - 0.5) * 0.01,
                      lng: region.coordinates.lng + (Math.random() - 0.5) * 0.01
                    };
                  }
                }
              }
              setPostalCodeCoordinates(postalCodesMap);
              setIsTest(true);
            }
          }
        } else if (process.env.NODE_ENV === 'development') {
          const testData = await getTestDeliveryRegions();
          setRegions(testData);
          
          // Set up test postal code coordinates
          const postalCodesMap: Record<string, {lat: number, lng: number}> = {};
          for (const region of testData) {
            for (const code of region.postalCodes) {
              if (!postalCodesMap[code] && region.coordinates) {
                postalCodesMap[code] = {
                  lat: region.coordinates.lat + (Math.random() - 0.5) * 0.01,
                  lng: region.coordinates.lng + (Math.random() - 0.5) * 0.01
                };
              }
            }
          }
          setPostalCodeCoordinates(postalCodesMap);
          setIsTest(true);
        }
      } catch (error) {
        console.error("Error fetching delivery regions:", error);
        showErrorMessage({ error: t("loadError") });
      } finally {
        setLoading(false);
      }
    };

    fetchRegions();
  }, [session?.store?.id, t]);

  const handleAddPostalCode = async () => {
    if (!currentPostalCode) return;
    
    const formattedCode = currentPostalCode.trim().toUpperCase();
    
    if (selectedPostalCodes.includes(formattedCode)) {
      setCurrentPostalCode("");
      return;
    }
    
    setSearchingPostalCode(true);
    try {
      const result = await searchPostalCode(formattedCode);
      if (result.success && result.data) {
        // Update postal code states
        const newCoordinates = {
          ...postalCodeCoordinates,
          [formattedCode]: result.data
        };
        setPostalCodeCoordinates(newCoordinates);
        setSelectedPostalCodes(prev => [...prev, formattedCode]);
        setCurrentPostalCode("");

        // Calculate new region coordinates
        const updatedCodes = [...selectedPostalCodes, formattedCode];
        const validCoordinates = updatedCodes
          .map(code => newCoordinates[code])
          .filter(coord => coord !== undefined);

        if (validCoordinates.length > 0) {
          // Calculate center
          const center = {
            lat: validCoordinates.reduce((sum, coord) => sum + coord.lat, 0) / validCoordinates.length,
            lng: validCoordinates.reduce((sum, coord) => sum + coord.lng, 0) / validCoordinates.length
          };

          // Calculate radius
          const earthRadius = 6371000; // Earth radius in meters
          const maxDistance = validCoordinates.reduce((max, coord) => {
            const dLat = (coord.lat - center.lat) * Math.PI / 180;
            const dLng = (coord.lng - center.lng) * Math.PI / 180;
            const a = 
              Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(center.lat * Math.PI / 180) * Math.cos(coord.lat * Math.PI / 180) * 
              Math.sin(dLng/2) * Math.sin(dLng/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            const distance = earthRadius * c;
            return Math.max(max, distance);
          }, 0);

          // Set minimum radius and add buffer
          const radius = Math.max(maxDistance * 1.3, 1000);

          // Update selected coordinates
          setSelectedCoordinates({
            lat: center.lat,
            lng: center.lng,
            radius: radius
          });

          // Center map without zooming
          if (map) {
            map.setCenter(center);
          }
        }
      } else {
        showErrorMessage({ error: t("postalCodeNotFound") });
      }
    } catch (error) {
      console.error("Error searching postal code:", error);
      showErrorMessage({ error: t("errorOccurred") });
    } finally {
      setSearchingPostalCode(false);
    }
  };

  const handleRemovePostalCode = (code: string) => {
    // First update the selected postal codes
    const updatedCodes = selectedPostalCodes.filter(c => c !== code);
    setSelectedPostalCodes(updatedCodes);

    // If there are no more postal codes, clear everything
    if (updatedCodes.length === 0) {
      setSelectedCoordinates(null);
      return;
    }

    // Calculate new region coordinates
    const validCoordinates = updatedCodes
      .map(c => postalCodeCoordinates[c])
      .filter(Boolean); // This ensures we only get valid coordinates

    if (validCoordinates.length === 0) {
      setSelectedCoordinates(null);
      return;
    }

    // Calculate new center
    const center = {
      lat: validCoordinates.reduce((sum, coord) => sum + coord.lat, 0) / validCoordinates.length,
      lng: validCoordinates.reduce((sum, coord) => sum + coord.lng, 0) / validCoordinates.length
    };

    // Calculate new radius using haversine formula
    const earthRadius = 6371000; // Earth radius in meters
    const maxDistance = validCoordinates.reduce((max, coord) => {
      const dLat = (coord.lat - center.lat) * Math.PI / 180;
      const dLng = (coord.lng - center.lng) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(center.lat * Math.PI / 180) * Math.cos(coord.lat * Math.PI / 180) * 
        Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = earthRadius * c;
      return Math.max(max, distance);
    }, 0);

    // Set minimum radius and add buffer
    const bufferMultiplier = validCoordinates.length > 1 ? 1.5 : 1.3;
    const radius = Math.max(maxDistance * bufferMultiplier, 1000); // Minimum 1km radius

    // Update the selected coordinates
    setSelectedCoordinates({
      lat: center.lat,
      lng: center.lng,
      radius: radius
    });

    // Center map on the new region center
    if (map) {
      map.setCenter(center);
    }
  };
  
  // Calculate the center and radius for a region based on its postal codes
  const updateRegionCoordinatesFromPostalCodes = (codes: string[]) => {
    // Clear region if no postal codes
    if (!codes || codes.length === 0) {
      setSelectedCoordinates(null);
      return;
    }

    // Get valid coordinates
    const validCoordinates = codes
      .map(code => postalCodeCoordinates[code])
      .filter(Boolean); // Remove any undefined or null values

    if (validCoordinates.length === 0) {
      setSelectedCoordinates(null);
      return;
    }

    // Calculate center
    const center = {
      lat: validCoordinates.reduce((sum, coord) => sum + coord.lat, 0) / validCoordinates.length,
      lng: validCoordinates.reduce((sum, coord) => sum + coord.lng, 0) / validCoordinates.length
    };

    // Calculate radius using haversine formula
    const earthRadius = 6371000;
    const maxDistance = validCoordinates.reduce((max, coord) => {
      const dLat = (coord.lat - center.lat) * Math.PI / 180;
      const dLng = (coord.lng - center.lng) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(center.lat * Math.PI / 180) * Math.cos(coord.lat * Math.PI / 180) * 
        Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = earthRadius * c;
      return Math.max(max, distance);
    }, 0);

    // Add buffer and set minimum radius
    const bufferMultiplier = validCoordinates.length > 1 ? 1.5 : 1.3;
    const radius = Math.max(maxDistance * bufferMultiplier, 1000);

    // Update the coordinates state
    setSelectedCoordinates({
      lat: center.lat,
      lng: center.lng,
      radius: radius
    });

    // Update map center
    if (map) {
      map.setCenter(center);
    }
  };

  const handleSaveRegion = async () => {
    if (!regionName || selectedPostalCodes.length === 0 || price <= 0 || !selectedCoordinates) {
      showErrorMessage({ error: t("requiredFieldsError") });
      return;
    }

    try {
      const regionData: DeliveryRegion = {
        storeId: session?.store?.id || "test-store",
        regionName,
        postalCodes: selectedPostalCodes,
        price,
        coordinates: selectedCoordinates,
      };

      if (activeRegion?.id) {
        // Update existing region
        const result = await updateDeliveryRegion(activeRegion.id, regionData);
        if (result.success) {
          showSuccessMessage({ success: t("updateSuccess") });
          setRegions(prev => prev.map(r => r.id === activeRegion.id ? { ...r, ...regionData, id: activeRegion.id } : r));
        } else {
          showErrorMessage({ error: t("updateError") });
        }
      } else {
        // Add new region
        const result = await addDeliveryRegion(regionData);
        if (result.success && result.data) {
          showSuccessMessage({ success: t("addSuccess") });
          // Convert the CosmosDB resource to our DeliveryRegion type
          const newRegion: DeliveryRegion = {
            id: result.data.id,
            storeId: result.data.storeId,
            regionName: result.data.regionName,
            postalCodes: result.data.postalCodes,
            price: result.data.price,
            coordinates: result.data.coordinates,
            createdAt: result.data.createdAt,
            updatedAt: result.data.updatedAt
          };
          setRegions(prev => [...prev, newRegion]);
        } else {
          showErrorMessage({ error: t("addError") });
        }
      }

      resetForm();
    } catch (error) {
      console.error("Error saving region:", error);
      showErrorMessage({ error: t("errorOccurred") });
    }
  };

  const handleEditRegion = (region: DeliveryRegion) => {
    setActiveRegion(region);
    setRegionName(region.regionName);
    setSelectedPostalCodes(region.postalCodes);
    setPrice(region.price);
    setSelectedCoordinates(region.coordinates || null);
    
    // Center map on the region if available
    if (map && region.coordinates) {
      map.setCenter({
        lat: region.coordinates.lat,
        lng: region.coordinates.lng
      });
      map.setZoom(12);
    }
  };

  const handleDeleteRegion = async () => {
    if (!activeRegion?.id) return;

    try {
      const result = await deleteDeliveryRegion(activeRegion.id);
      if (result.success) {
        showSuccessMessage({ success: t("deleteSuccess") });
        setRegions(prev => prev.filter(r => r.id !== activeRegion.id));
        onDeleteClose();
      } else {
        showErrorMessage({ error: t("deleteError") });
      }
    } catch (error) {
      console.error("Error deleting region:", error);
      showErrorMessage({ error: t("errorOccurred") });
    }
  };

  const resetForm = () => {
    setActiveRegion(null);
    setRegionName("");
    setSelectedPostalCodes([]);
    setCurrentPostalCode("");
    setPrice(0);
    setSelectedCoordinates(null);
  };

  const handleNewRegion = () => {
    resetForm();
  };

  const formatPrice = (price: number) => {
    return `€${price.toFixed(2)}`;
  };
  
  // Get the region for a postal code
  const getRegionForPostalCode = (postalCode: string) => {
    return regions.find(region => region.postalCodes.includes(postalCode));
  };

  // Reset map to default view
  const resetMap = () => {
    if (map) {
      map.setCenter(defaultCenter);
      map.setZoom(10);
      setSelectedMarker(null);
      setSelectedCoordinates(null);
      setSelectedPostalCodes([]);
      if (activeRegion) {
        setActiveRegion(null);
        setRegionName("");
        setPrice(0);
      }
    }
  };

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  return (
    <div className="delivery-manager p-4">
      {/* Regions list */}
      {loading ? (
        <p className={'mb-4'}>Loading regions...</p>
      ) : regions.length === 0 ? (
        <p className={'mb-4'}>{t("noRegionsYet")}</p>
      ) : (
        <Table aria-label="Delivery regions table mb-4" shadow={'md'}>
          <TableHeader>
            <TableColumn>{t("regionName")}</TableColumn>
            <TableColumn>{t("postalCodes")}</TableColumn>
            <TableColumn>{t("price")}</TableColumn>
            <TableColumn>{t("actions")}</TableColumn>
          </TableHeader>
          <TableBody>
            {regions.map((region) => (
              <TableRow key={region.id}>
                <TableCell>{region.regionName}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {region.postalCodes.map((code) => (
                      <Chip 
                        key={code} 
                        variant="flat" 
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => {
                          if (postalCodeCoordinates[code] && map) {
                            map.setCenter(postalCodeCoordinates[code]);
                            map.setZoom(14);
                            setSelectedMarker(code);
                          }
                        }}
                      >
                        {code}
                      </Chip>
                    ))}
                  </div>
                </TableCell>
                <TableCell>{formatPrice(region.price)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleEditRegion(region)}>{t("edit")}</Button>
                    <Button 
                      size="sm" 
                      color="danger" 
                      onClick={() => {
                        setActiveRegion(region);
                        onDeleteOpen();
                      }}
                    >
                      {t("delete")}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Map card */}
      <div className="md:col-span-2">
        <Card className="my-4">
          <CardHeader>
            <div className="flex justify-between items-center w-full">
              <h3 className="text-lg font-semibold">{t("deliveryMap")}</h3>
              <div className="flex items-center gap-2">
                <Input
                  className="min-w-[150px]"
                  placeholder={t("postalCodesPlaceholder")}
                  value={currentPostalCode}
                  onChange={(e) => setCurrentPostalCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddPostalCode();
                    }
                  }}
                />
                <Button 
                  color="primary" 
                  onClick={handleAddPostalCode}
                  isLoading={searchingPostalCode}
                >
                  {searchingPostalCode ? t("searching") : t("searchPostalCode")}
                </Button>
                <Tooltip content={t("resetMap")}>
                  <Button 
                    variant="light" 
                    isIconOnly
                    onClick={resetMap}
                    aria-label={t("resetMap")}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                  </Button>
                </Tooltip>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            {/* Show selected postal codes */}
            <div className="mb-4">
              <p className="text-sm mb-2">{t("postalCodesLabel")}</p>
              <div className="flex flex-wrap gap-1">
                {selectedPostalCodes.map((code) => (
                  <Chip 
                    key={code} 
                    onClose={() => handleRemovePostalCode(code)}
                    variant="flat"
                  >
                    {code}
                  </Chip>
                ))}
              </div>
              {selectedPostalCodes.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">{t("enterPostalCode")}</p>
              )}
            </div>

            {isLoaded ? (
              <div 
                style={mapWrapperStyle} 
                className="map-container"
                onMouseEnter={disableBodyScroll}
                onMouseLeave={enableBodyScroll}
              >
                <GoogleMap
                  mapContainerStyle={containerStyle}
                  center={defaultCenter}
                  zoom={10}
                  onLoad={onMapLoad}
                  options={{
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: true,
                    zoomControl: true,
                    scrollwheel: true,
                    draggable: true,
                    clickableIcons: false,
                    disableDoubleClickZoom: false,
                    gestureHandling: 'greedy',
                  }}
                >
                  {/* Display all postal code markers */}
                  {Object.entries(postalCodeCoordinates).map(([code, position]) => {
                    const region = getRegionForPostalCode(code);
                    const isSelected = selectedPostalCodes.includes(code);
                    
                    // Skip if no coordinates
                    if (!position) return null;
                    
                    return (
                      <Marker
                        key={`postal-${code}`}
                        position={position}
                        title={region ? `${code} - ${region.regionName}` : code}
                        label={{
                          text: code,
                          color: '#333',
                          fontSize: isSelected ? '11px' : '10px',
                          fontWeight: 'bold',
                        }}
                        icon={{
                          path: "M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z",
                          fillColor: isSelected ? '#FF4545' : '#4285F4',
                          fillOpacity: isSelected ? 0.9 : 0.8,
                          strokeColor: '#ffffff',
                          strokeWeight: 1,
                          scale: isSelected ? 0.9 : 0.7,
                          labelOrigin: new google.maps.Point(0, -30),
                        }}
                        onClick={() => setSelectedMarker(code)}
                        animation={isSelected ? google.maps.Animation.DROP : undefined}
                      />
                    );
                  })}
                  
                  {/* Display region centers with prices */}
                  {regions.map((region) => (
                    region.coordinates && (
                      <React.Fragment key={region.id}>
                        <Circle
                          center={{
                            lat: region.coordinates.lat,
                            lng: region.coordinates.lng
                          }}
                          radius={region.coordinates.radius || 3000}
                          options={{
                            fillColor: '#4285F4',
                            fillOpacity: 0.2,
                            strokeColor: '#4285F4',
                            strokeOpacity: 0.6,
                            strokeWeight: 1,
                          }}
                          onClick={() => handleEditRegion(region)}
                        />
                        <Marker
                          position={{
                            lat: region.coordinates.lat,
                            lng: region.coordinates.lng
                          }}
                          title={`${region.regionName}: ${formatPrice(region.price)}`}
                          label={{
                            text: formatPrice(region.price),
                            color: 'white',
                            fontWeight: 'bold',
                          }}
                          icon={{
                            path: "M-20,0a20,20 0 1,0 40,0a20,20 0 1,0 -40,0",
                            fillColor: '#4285F4',
                            fillOpacity: 0.8,
                            strokeWeight: 0,
                            scale: 0.6,
                            anchor: new google.maps.Point(0, 0),
                          }}
                          onClick={() => handleEditRegion(region)}
                        />
                      </React.Fragment>
                    )
                  ))}
                  
                  {/* Display selected region as translucent circle */}
                  {selectedCoordinates && (
                    <>
                      <Circle
                        center={{
                          lat: selectedCoordinates.lat,
                          lng: selectedCoordinates.lng
                        }}
                        radius={selectedCoordinates.radius || 3000}
                        options={{
                          fillColor: '#FF6B6B',
                          fillOpacity: 0.2,
                          strokeColor: '#FF4545',
                          strokeOpacity: 0.8,
                          strokeWeight: 2,
                        }}
                      />
                      
                      <Marker
                        position={{
                          lat: selectedCoordinates.lat,
                          lng: selectedCoordinates.lng
                        }}
                        icon={{
                          path: google.maps.SymbolPath.CIRCLE,
                          scale: 7,
                          fillColor: '#FF4545',
                          fillOpacity: 1,
                          strokeColor: '#FFFFFF',
                          strokeWeight: 2,
                        }}
                      />
                    </>
                  )}
                  
                  {/* Info window for selected marker */}
                  {selectedMarker && postalCodeCoordinates[selectedMarker] && (
                    <InfoWindow
                      position={postalCodeCoordinates[selectedMarker]}
                      onCloseClick={() => setSelectedMarker(null)}
                    >
                      <div className="p-1">
                        <p className="font-bold">{selectedMarker}</p>
                        {getRegionForPostalCode(selectedMarker) ? (
                          <>
                            <p>{getRegionForPostalCode(selectedMarker)?.regionName}</p>
                            <p>{formatPrice(getRegionForPostalCode(selectedMarker)?.price || 0)}</p>
                          </>
                        ) : (
                          <Button 
                            size="sm" 
                            color="primary"
                            className="mt-1"
                            onClick={() => {
                              setCurrentPostalCode(selectedMarker);
                              setSelectedMarker(null);
                              handleAddPostalCode();
                            }}
                          >
                            {t("add")}
                          </Button>
                        )}
                      </div>
                    </InfoWindow>
                  )}
                </GoogleMap>
              </div>
            ) : (
              <div className="flex items-center justify-center" style={{ height: '500px' }}>
                <p>{t("loadingMap")}</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Region form */}
      <Card className="mb-4">
        <CardHeader>
          <h4 className="font-medium">
            {activeRegion ? t("editDeliveryRegion") : t("addEditDeliveryRegion")}
          </h4>
        </CardHeader>
        <CardBody className="flex flex-col gap-4">
          <Input
            label={t("regionNameLabel")}
            placeholder={t("regionNamePlaceholder")}
            value={regionName}
            onChange={(e) => setRegionName(e.target.value)}
          />

          <Input
            type="number"
            label={t("deliveryPriceLabel")}
            placeholder={t("deliveryPricePlaceholder")}
            min={0}
            step={0.01}
            value={price.toString()}
            onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
          />

          <div>
            <p className="text-sm mb-2">{t("regionOnMapLabel")}</p>
            <p className="text-xs text-gray-500">
              {selectedCoordinates
                ? t("selectedRegionRadius", { radius: Math.round((selectedCoordinates.radius || 0) / 1000) })
                : t("addPostalCodesToShowOnMap")}
            </p>
          </div>
        </CardBody>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="flat" onClick={resetForm}>
            {t("cancel")}
          </Button>
          <Button color="primary" onClick={handleSaveRegion}>
            {t("save")}
          </Button>
        </CardFooter>
      </Card>

      {/* Confirmation modal for deletion */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalContent>
          <ModalHeader>{t("confirmDeletion")}</ModalHeader>
          <ModalBody>
            {t("confirmDeleteMessage", { regionName: activeRegion?.regionName || "" })}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onClick={onDeleteClose}>
              {t("cancel")}
            </Button>
            <Button color="danger" onClick={handleDeleteRegion}>
              {t("delete")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default DeliveryManager;