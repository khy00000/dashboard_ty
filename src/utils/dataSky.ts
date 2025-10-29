import axios from "axios";
import type { Aircraft, AircraftHistory } from "../types/aircraft.types";

// 개발모드 목데이터 사용
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === "false";

// 항공 데이터 엔드포인트
const OPENSKY_API = "/opensky/api/states/all";

// 마지막 API 호출 시간 추적
let lastCallTime = 0;
// 마지막 가져온 항공기 데이터 배열
let cachedAircraftData: Aircraft[] = [];
// 호출 최소 간격
const MIN_INTERVAL = 30000; // 30초

// 실시간 항공기 데이터 가져오기 (한국 상공)
export async function fetchAircraftData(): Promise<Aircraft[]> {
  try {
    if (USE_MOCK_DATA) {
      console.log("개발모드: mock 항공기 데이터 사용 중");
      return generateMockAircraft();
    }

    // Rate Limiting(속도 제한) 체크 ?? 어떻게 수정
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;

    if (timeSinceLastCall < MIN_INTERVAL && lastCallTime !== 0) {
      console.warn(
        `API 호출 대기 중... ${Math.ceil(
          (MIN_INTERVAL - timeSinceLastCall) / 1000
        )}초 후 재시도`
      );
      // 이전 데이터 유지
      return cachedAircraftData;
    }

    console.log("OpenSky Network API 호출...");
    lastCallTime = now;

    // 데이터 요청
    const response = await axios.get(OPENSKY_API, {
      timeout: 10000, // 10초 타임아웃
    });

    const states = response.data.states;

    if (!states || states.length === 0) {
      console.warn("항공기 데이터가 없습니다.");
      return [];
    }

    console.log(`전체 ${states.length}대의 항공기 수신`);

    // 한국 상공 + 주변 필터링 (위도 30-45, 경도 120-135)
    const koreanAirspace = states.filter((state: any) => {
      const lat = state[6];
      const lon = state[5];
      return (
        lat &&
        lon &&
        lat >= 30 &&
        lat <= 45 &&
        lon >= 120 &&
        lon <= 135 &&
        !state[8] // 지상에 있지 않은 항공기만
      );
    });

    console.log(`한국 상공: ${koreanAirspace.length}대`);

    // ? 슬라이스 인덱스 기준
    // Aircraft 형식으로 변환 (30대만 처리)
    const aircraft: Aircraft[] = koreanAirspace
      .slice(0, 30)
      .map((state: any) => {
        return {
          id: state[0], // icao24
          callsign: state[1]?.trim() || `Aircraft-${state[0].substring(0, 6)}`,
          country: state[2],
          latitude: state[6],
          longitude: state[5],
          altitude: state[7] || 0,
          velocity: state[9] || 0,
          heading: state[10] || 0,
          // ?
          onGround: state[8] || false,
          // ?
          lastUpdate: new Date(state[4] * 1000).toISOString(),
        };
      });

    console.log(`${aircraft.length}대의 항공기 데이터 처리 완료`);

    // 캐시 데이터 업데이트
    cachedAircraftData = aircraft;
    return aircraft;
  } catch (error) {
    console.error("OpenSky API 오류:", error);
    if (axios.isAxiosError(error)) {
      console.error("상세:", error.message);
    }
    // 에러 시 빈 배열 반환
    return [];
  }
}

// 개발 중 API 호출 대신 mock 데이터 사용
function generateMockAircraft(): Aircraft[] {
  const mockData: Aircraft[] = [];
  const baseTime = Date.now();

  // 한국 상공 5개 항공기 시뮬레이션
  for (let i = 0; i < 5; i++) {
    const baseLat = 35 + Math.random() * 3;
    const baseLon = 126 + Math.random() * 4;

    mockData.push({
      id: `mock${i}${Math.random().toString(36).substr(2, 5)}`,
      callsign: `KAL${100 + i * 10}`,
      country: "South Korea",
      latitude: baseLat + (Math.random() - 0.5) * 0.5,
      longitude: baseLon + (Math.random() - 0.5) * 0.5,
      altitude: 9000 + Math.random() * 4000,
      velocity: 200 + Math.random() * 100,
      heading: Math.random() * 360,
      onGround: false,
      lastUpdate: new Date(baseTime).toISOString(),
    });
  }

  console.log("Mock 데이터 반환 (개발 모드)");
  return mockData;
}

// 가상 고도, 속도, 방향 데이터 생성 (차트용 mock)
export function generateAircraftHistory(aircraft: Aircraft): AircraftHistory[] {
  const history: AircraftHistory[] = [];
  const currentTime = Date.now();

  // 지난 2시간 데이터 생성 (12개 포인트, 10분 간격)
  for (let i = 12; i >= 0; i--) {
    const timeOffset = i * 10 * 60 * 1000; // 10분
    const timestamp = new Date(currentTime - timeOffset);

    // 현재 값에서 자연스럽게 변화
    const altitudeVariation = (Math.random() - 0.5) * 1000;
    const velocityVariation = (Math.random() - 0.5) * 50;
    const headingVariation = (Math.random() - 0.5) * 20;

    history.push({
      time: timestamp.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      altitude: Math.max(
        0,
        aircraft.altitude + (altitudeVariation * (12 - i)) / 12
      ),
      velocity: Math.max(
        0,
        aircraft.velocity + (velocityVariation * (12 - i)) / 12
      ),
      heading:
        (aircraft.heading + (headingVariation * (12 - i)) / 12 + 360) % 360,
    });
  }

  return history;
}

// 고도를 피트로 변환
export function metersToFeet(meters: number): number {
  return Math.round(meters * 3.28084);
}

// 속도를 노트로 변환
export function msToKnots(ms: number): number {
  return Math.round(ms * 1.94384);
}

// 평균 고도 계산
export function calculateAverageAltitude(aircraft: Aircraft[]): number {
  if (aircraft.length === 0) return 0;
  const total = aircraft.reduce((sum, a) => sum + a.altitude, 0);
  return Math.round(total / aircraft.length);
}

// 평균 속도 계산
export function calculateAverageSpeed(aircraft: Aircraft[]): number {
  if (aircraft.length === 0) return 0;
  const total = aircraft.reduce((sum, a) => sum + a.velocity, 0);
  return Math.round(total / aircraft.length);
}
