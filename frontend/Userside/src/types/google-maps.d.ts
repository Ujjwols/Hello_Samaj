
declare global {
  interface Window {
    google: {
      maps: {
        Map: new (mapDiv: HTMLElement, opts: GoogleMapOptions) => GoogleMapInstance;
        Marker: new (opts: GoogleMarkerOptions) => GoogleMarkerInstance;
        Geocoder: new () => GoogleGeocoderInstance;
      };
    };
  }
}

export interface GoogleMapOptions {
  zoom: number;
  center: LatLngLiteral;
  mapTypeControl?: boolean;
  streetViewControl?: boolean;
  fullscreenControl?: boolean;
}

export interface GoogleMarkerOptions {
  position: LatLngLiteral;
  map: GoogleMapInstance;
  title?: string;
}

export interface LatLngLiteral {
  lat: number;
  lng: number;
}

export interface LatLng {
  lat(): number;
  lng(): number;
}

export interface GoogleMapMouseEvent {
  latLng: LatLng | null;
}

export interface GoogleMapInstance {
  addListener(eventName: string, handler: (event: GoogleMapMouseEvent) => void): void;
}

export interface GoogleMarkerInstance {
  setMap(map: GoogleMapInstance | null): void;
}

export interface GoogleGeocoderRequest {
  location: LatLngLiteral;
}

export interface GoogleGeocoderResult {
  formatted_address: string;
}

export interface GoogleGeocoderInstance {
  geocode(
    request: GoogleGeocoderRequest, 
    callback: (results: GoogleGeocoderResult[], status: string) => void
  ): void;
}
