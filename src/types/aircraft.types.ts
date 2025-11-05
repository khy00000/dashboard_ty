// OpenSky API 응답 타입
export interface OpenSkyState {
  icao24: string;
  callsign: string | null;
  origin_country: string;
  time_position: number | null;
  last_contact: number;
  longitude: number | null;
  latitude: number | null;
  baro_altitude: number | null;
  on_ground: boolean;
  velocity: number | null;
  true_track: number | null;
  vertical_rate: number | null;
  sensors: number[] | null;
  geo_altitude: number | null;
  squawk: string | null;
  spi: boolean;
  position_source: number;
}

// 항공기 정보 타입
export interface Aircraft {
  id: string;
  callsign: string;
  country: string;
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  heading: number;
  onGround: boolean;
  lastUpdate: string;
}

// 항공기 히스토리 & 차트 정보 데이터
export interface AircraftTrack {
  time: string;
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  heading: number;
}

// 구글맵 Props
export interface GoogleMapProps {
  aircraftData: Aircraft[];
  trackData: AircraftTrack[];
  onAircraftSelect: (aircraft: Aircraft) => void;
  selectedAircraft: Aircraft | null;
}

// 항공기 정보 카드 Props
export interface AircraftInfoCardProps {
  aircraft: Aircraft;
  onClose: () => void;
}

// 차트 Props
export interface ChartProps {
  data: AircraftTrack[];
}