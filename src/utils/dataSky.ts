import axios from "axios";
import type { Aircraft, AircraftTrack } from "../types/aircraft.types";

// 개발모드 목데이터 사용
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === "false";

// 항공 데이터 엔드포인트
const OPENSKY_API = "/opensky/api/states/all";
const OPENSKY_TRACK_API = "/opensky/api/tracks/all";

// 실시간 항공기 데이터 가져오기 (한국 일본 일부 상공)
export async function fetchAircraftData(): Promise<Aircraft[]> {
  try {
    if (USE_MOCK_DATA) {
      console.log("개발모드: mock 항공기 데이터 사용 중");
      return mockAircraft();
    }

    // 데이터 요청
    const response = await axios.get(
      `${OPENSKY_API}?lamin=33&lomin=124&lamax=43&lomax=132`,
      { timeout: 10000 } // 10초 타임아웃
    );
    const states = response.data.states;

    if (!states || states.length === 0) {
      console.warn("항공기 데이터가 없습니다.");
      return [];
    }

    // Aircraft 형식으로 변환
    const aircraft: Aircraft[] = states
      .filter((state: any) => {
        const lat = state[6];
        const lon = state[5];
        const isValidPos = typeof lat === "number" && typeof lon === "number";

        return (
          !state[8] && // 지상 항공기 제외
          isValidPos && // null/undefined/0 제외
          lat >= 33 &&
          lat <= 43 &&
          lon >= 124 &&
          lon <= 132
        );
      })
      .slice(0, 30) //30대만 처리
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
          onGround: state[8] || false,
          lastUpdate: new Date(state[4] * 1000).toISOString(),
        };
      });

    console.log(`${aircraft.length}대의 항공기 데이터 처리 완료`);

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

// 개발 중 API 호출 대신 mock 데이터 사용 (now 항공기 정보)
let mockCache: Aircraft[] | null = null;
let mockUpdateCount = 0;

async function mockAircraft(): Promise<Aircraft[]> {
  if (!mockCache) {
    const response = await fetch("/mockStates.json");
    const data = await response.json();
    mockCache = data.states.map((s: any) => ({
      id: s[0],
      callsign: s[1]?.trim() || `Aircraft-${s[0].substring(0, 6)}`,
      country: s[2],
      latitude: s[6],
      longitude: s[5],
      altitude: s[7] || 0,
      velocity: s[9] || 0,
      heading: s[10] || 0,
      onGround: s[8] || false,
      lastUpdate: new Date().toISOString(),
    }));
  }

  if (!mockCache) return [];

  mockUpdateCount++;

  // 항공기 움직임 시뮬레이션 위치를 살짝 이동시키기 (머물지 않도록)
  mockCache = mockCache.map((ac) => {
    // 해딩을 라디안으로 변환
    const headingRad = (ac.heading * Math.PI) / 180;

    // 속도에 비례한 이동거리 (30초 간격)
    // 속도 m/s 30초 동안 이동한 거리를 위도/경도로 변환
    const distanceKm = (ac.velocity * 30) / 1000; //km
    const latChange = (distanceKm / 111) * Math.cos(headingRad); // 1도(111km)
    const lngChange =
      (distanceKm / (111 * Math.cos((ac.latitude * Math.PI) / 180))) *
      Math.sin(headingRad);

    // 랜덤성 추가
    const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 ~ 1.2

    return {
      ...ac,
      latitude: ac.latitude + latChange * randomFactor,
      longitude: ac.longitude + lngChange * randomFactor,
      // 고도도 약간씩 변화
      altitude: ac.altitude + (Math.random() - 0.5) * 50,
      // 속도도 약간씩 변화
      velocity: Math.max(180, ac.velocity + (Math.random() - 0.5) * 10),
      // heading도 약간씩 변화
      heading: (ac.heading + (Math.random() - 0.5) * 5 + 360) % 360,
      lastUpdate: new Date().toISOString(),
    };
  });

  console.log(
    `track MOCK 업데이트 ${mockUpdateCount} : ${mockCache.length}대 항공기 현재 위치 갱신`
  );
  return mockCache;
}

// 항공기 트랙(이전) 데이터
export async function fetchTrackData(
  icao24: string,
  time: number
): Promise<AircraftTrack[]> {
  try {
    if (USE_MOCK_DATA) {
      console.log("개발모드: mock 항공기의 이전(트랙) 데이터 사용 중");
      return mockTrack(icao24);
    }

    const response = await axios.get(`${OPENSKY_TRACK_API}`, {
      params: { icao24, time },
      timeout: 10000,
    });

    const data = response.data;

    if (!data || !data.path) {
      console.warn("트랙 데이터가 없습니다.");
      return [];
    }

    const track: AircraftTrack[] = data.path
      .filter((p: any) => p[1] !== null && p[2] !== null)
      .map((p: any) => ({
        time: p[0],
        latitude: p[1],
        longitude: p[2],
        altitude: p[3] || 0,
        velocity: p[4] || 0,
        heading: p[5] || false,
      }));

    console.log(`항공기 트랙 데이터 처리 완료: ${icao24}, ${track.length}`);

    return track;
  } catch (error) {
    console.error("OpenSky Track API 오류:", error);
    if (axios.isAxiosError(error)) {
      console.error("상세:", error.message);
    }
    return [];
  }
}

// 항공기 히스토리 & 차트 정보 mock 데이터
async function mockTrack(icao24: string): Promise<AircraftTrack[]> {
  const response = await fetch("/mockTracks.json");
  const data = await response.json();

  const history = data.find((t: any) => t.icao24 === icao24);
  if (!history) return [];

  const track: AircraftTrack[] = history.path.map((p: any) => ({
    time: p[0],
    longitude: p[1],
    latitude: p[2],
    altitude: p[3] || 0,
    velocity: p[4] || 0,
    heading: p[5] || 0,
  }));

  console.log(`MOCK 개발모드 : ${icao24}항공기의 이전(트랙) 데이터 처리 완료`);

  return track;
}

// 항공기 현재 전체 평균 고도 계산 (meter -> ft 변환)
export function averageAltitude(aircraft: Aircraft[]): number {
  if (aircraft.length === 0) return 0;
  const total = aircraft.reduce((sum, a) => sum + a.altitude * 3.28084, 0);
  return Math.round(total / aircraft.length);
}

// 항공기 현재 전체 평균 속도 계산 (m/s -> knots 변환)
export function averageSpeed(aircraft: Aircraft[]): number {
  if (aircraft.length === 0) return 0;
  const total = aircraft.reduce((sum, a) => sum + a.velocity * 1.94384, 0);
  return Math.round(total / aircraft.length);
}

// 선택된 항공기(track) 고도를 피트로 변환
export function metersToFeet(meters: number): number {
  return Math.round(meters * 3.28084);
}

// 선택된 항공기(track) 속도를 노트로 변환
export function msToKnots(ms: number): number {
  return Math.round(ms * 1.94384);
}

// 동서남북
export function getDirection(heading: number): string {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(heading / 45) % 8;
  return directions[index];
}
