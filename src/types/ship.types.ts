// AIS API 응답 데이터
export interface AISDataPoint {
  MMSI: string;
  수신시간: string;
  경도: number;
  위도: number;
  SOG: string;
  COG: string;
  HEDING: number;
}

// 선박 정보
export interface Ship{
  mmsi: string;
  name?: string;
  data: AISDataPoint[];
}

// 컨테이너 센서 데이터
export interface ContainerData {
  time: string;
  timestamp: string;
  temperature: number;
  humidity: number;
  sog: number;
}

// Props
export interface GoogleMapProps {
  shipData: Ship[];
  onShipSelect: (ship: Ship) => void;
  selectShip: Ship | null;
}

export interface ShipInfoCardProps {
  ship: Ship;
  onClose: () => void;
}

export interface ChartProps {
  data: ContainerData[];
}