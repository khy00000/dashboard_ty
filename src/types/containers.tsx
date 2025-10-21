// 컨테이너 위치 정보
export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

// 센서 데이터
export interface SensorData{
  temperature: number;
  humidity: number;
  timestamp: Date;
}

// 컨테이너 정보
export interface Container {
  id: string;
  containerNumber: string;
  shipName: string;
  location: Location;
  currentTemperature: number;
  currentHumidity: number;
  status: 'active' | 'idle' | 'maintenance';
  lastUpdate: Date;
  sensorHistory: SensorData[];
}

// id - 선박 고유번호 MMSI
// containerNumber - 컨테이너 번호 MMSI 기반
// shipName - 선박명
// location - 위치(위도, 경도)
// currentTemperature - 현재 온도
// currentHumidity - 현재 습도
// status - 상태
// lastUpdate - 마지막 업데이트 시간
// sensorHistory - 센서 히스토리(mock)

// 검색 필터
export interface SearchFilter {
  searchText: string;
  status?: Container['status'];
  shipName?: string;
}