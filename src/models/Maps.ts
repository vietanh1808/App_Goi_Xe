export interface ILatLng {
  latitude: number;
  longitude: number;
}

export interface IPoint {
  x: number;
  y: number;
}

export interface ICamera {
  center: ILatLng;
  pitch: number;
  heading: number;
  altitude: number; // Only on iOS MapKit, in meters. The property is ignored by Google Maps.
  zoom: number; // Only when using Google Maps.
}
