import axios from "axios";
import type { Aircraft, AircraftTrack } from "../types/aircraft.types";

// 개발모드 목데이터 사용
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === "true";

// 항공 데이터 엔드포인트
const OPENSKY_API = "/opensky/api/states/all";
const OPENSKY_TRACK_API = "/opensky/api/tracks/all";

// 실시간 항공기 데이터 가져오기 (한국 상공)
export async function fetchAircraftData(): Promise<Aircraft[]> {
  try {
    if (USE_MOCK_DATA) {
      console.log("개발모드: mock 항공기 데이터 사용 중");
      return mockAircraft();
    }

    // 데이터 요청 (한국 상공만)
    const response = await axios.get(
      `${OPENSKY_API}?lamin=30&lomin=120&lamax=45&lomax=135`,
      { timeout: 10000 } // 10초 타임아웃
    );

    const states = response.data.states;

    if (!states || states.length === 0) {
      console.warn("항공기 데이터가 없습니다.");
      return [];
    }

    console.log(`한국 상공 항공기 수신: ${states.length}대`);

    // Aircraft 형식으로 변환
    const aircraft: Aircraft[] = states
      .filter((state: any) => !state[8]) // 지상에 있는 항공기 제외
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
async function mockAircraft(): Promise<Aircraft[]> {
  const response = await fetch("/mockStates.json");
  const data = await response.json();

  const states = data.states;

  if (!states || states.length === 0) return [];

  const aircraft: Aircraft[] = states.map((state: any) => {
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
  console.log(`MOCK 개발모드 : ${aircraft.length}대의 항공기 데이터 처리 완료`);

  return aircraft;
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

    const track: AircraftTrack[] = data.path.map((p: any) => ({
      time: p[0],
      latitude: p[2],
      longitude: p[1],
      altitude: p[3] || 0,
      velocity: p[4] || 0,
      heading: p[5] || 0,
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
    time: p.time,
    latitude: p.latitude,
    longitude: p.longitude,
    altitude: p.altitude,
    velocity: p.velocity,
    heading: p.heading,
  }));
  console.log(
    `MOCK 개발모드 : ${icao24}항공기의 이전(트랙) 데이터 처리 완료`
  );

  return track;
}

// 평균 고도 계산
export function averageAltitude(aircraft: Aircraft[]): number {
  if (aircraft.length === 0) return 0;
  const total = aircraft.reduce((sum, a) => sum + a.altitude, 0);
  return Math.round(total / aircraft.length);
}

// 평균 속도 계산
export function averageSpeed(aircraft: Aircraft[]): number {
  if (aircraft.length === 0) return 0;
  const total = aircraft.reduce((sum, a) => sum + a.velocity, 0);
  return Math.round(total / aircraft.length);
}

// 고도를 피트로 변환
export function metersToFeet(meters: number): number {
  return Math.round(meters * 3.28084);
}

// 속도를 노트로 변환
export function msToKnots(ms: number): number {
  return Math.round(ms * 1.94384);
}