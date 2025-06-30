
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';
import type { 
  GoogleMapInstance, 
  GoogleMarkerInstance, 
  GoogleMapMouseEvent,
  LatLngLiteral 
} from '@/types/google-maps';

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  selectedLocation?: { lat: number; lng: number; address: string };
}

const LocationPicker = ({ onLocationSelect, selectedLocation }: LocationPickerProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [mapApiKey, setMapApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(true);
  const [map, setMap] = useState<GoogleMapInstance | null>(null);
  const [marker, setMarker] = useState<GoogleMarkerInstance | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  // Initialize map when API key is provided
  useEffect(() => {
    if (mapApiKey && mapRef.current && !map) {
      initializeMap();
    }
  }, [mapApiKey, map]);

  const loadGoogleMaps = () => {
    return new Promise<void>((resolve, reject) => {
      if (window.google && window.google.maps) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${mapApiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Maps'));
      document.head.appendChild(script);
    });
  };

  const initializeMap = async () => {
    try {
      await loadGoogleMaps();
      
      if (!mapRef.current) return;

      // Default to Kathmandu, Nepal
      const defaultCenter: LatLngLiteral = { lat: 27.7172, lng: 85.3240 };
      
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        zoom: 13,
        center: selectedLocation || defaultCenter,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      setMap(mapInstance);

      // Add click listener to map
      mapInstance.addListener('click', (event: GoogleMapMouseEvent) => {
        if (event.latLng) {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          
          // Remove existing marker
          if (marker) {
            marker.setMap(null);
          }

          // Create new marker
          const newMarker = new window.google.maps.Marker({
            position: { lat, lng },
            map: mapInstance,
            title: 'Selected Location',
          });

          setMarker(newMarker);

          // Reverse geocoding to get address
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              const address = results[0].formatted_address;
              onLocationSelect({ lat, lng, address });
            } else {
              onLocationSelect({ lat, lng, address: `${lat.toFixed(6)}, ${lng.toFixed(6)}` });
            }
          });
        }
      });

      // If there's a selected location, add marker
      if (selectedLocation) {
        const initialMarker = new window.google.maps.Marker({
          position: selectedLocation,
          map: mapInstance,
          title: 'Selected Location',
        });
        setMarker(initialMarker);
      }

      setShowApiKeyInput(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load Google Maps. Please check your API key.",
        variant: "destructive",
      });
    }
  };

  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapApiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your Google Maps API key.",
        variant: "destructive",
      });
      return;
    }
    initializeMap();
  };

  if (showApiKeyInput) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-primary" />
            Google Maps Setup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Google Maps API Key Required</p>
                <p>To use the map feature, please enter your Google Maps API key. You can get one from the <a href="https://console.cloud.google.com/google/maps-apis" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a>.</p>
              </div>
            </div>
            <form onSubmit={handleApiKeySubmit} className="space-y-3">
              <div>
                <Label htmlFor="apiKey">Google Maps API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Enter your Google Maps API key"
                  value={mapApiKey}
                  onChange={(e) => setMapApiKey(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full">
                Load Map
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-primary" />
            {t('submit.selectLocation')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{t('submit.mapHelp')}</p>
            <div ref={mapRef} className="w-full h-64 rounded-lg border" />
            {selectedLocation && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-800 mb-1">{t('submit.selectedLocation')}</h4>
                <p className="text-sm text-green-700">{selectedLocation.address}</p>
                <p className="text-xs text-green-600 mt-1">
                  Lat: {selectedLocation.lat.toFixed(6)}, Lng: {selectedLocation.lng.toFixed(6)}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationPicker;
