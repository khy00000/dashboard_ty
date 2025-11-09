import React, { useState, useEffect, useRef } from "react";
import GoogleMap from "./components/Map/GoogleMap";
import AltitudeChart from "./components/Charts/AltitudeChart";
import VelocityChart from "./components/Charts/VelocityChart";
import HeadingChart from "./components/Charts/HeadingChart";
import type { Aircraft, AircraftTrack } from "./types/aircraft.types";
import {
  fetchAircraftData,
  fetchTrackData,
  averageAltitude,
  averageSpeed,
} from "./utils/dataSky";
import styles from "./App.module.scss";
import { CgAirplane } from "react-icons/cg";
import { RiGlobalLine } from "react-icons/ri";
import { LuMap } from "react-icons/lu";
import { FaRegBookmark } from "react-icons/fa";
import { FiSettings } from "react-icons/fi";
import { IoMdRefresh } from "react-icons/io";

const App: React.FC = () => {
  const [aircraftData, setAircraftData] = useState<Aircraft[]>([]);
  const [trackData, setTrackData] = useState<AircraftTrack[]>([]);
  const [selectedAircraft, setSelectedAircraft] = useState<Aircraft | null>(
    null
  );
  const selectedAircraftRef = useRef<Aircraft | null>(null);

  const [avgAltitude, setAvgAltitude] = useState<number>(0);
  const [avgSpeed, setAvgSpeed] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isMapReset, setIsMapReset] = useState(false);

    useEffect(() => {
    selectedAircraftRef.current = selectedAircraft;
  }, [selectedAircraft]);

  // Track 데이터 로딩
  const loadTrackData = async (aircraft: Aircraft) => {
    try {
      const now = Math.floor(Date.now() / 1000);
      const track = await fetchTrackData(aircraft.id, now);
      const enrichedTrack = track.map((t) => ({
        ...t,
        heading:
          t.heading === null || t.heading === false
            ? aircraft.heading
            : (t.heading as number),
      }));

      // 현재 위치 추가
      const currentPoint: AircraftTrack = {
        time: now,
        latitude: aircraft.latitude,
        longitude: aircraft.longitude,
        altitude: aircraft.altitude || 0,
        velocity: aircraft.velocity || 0,
        heading: aircraft.heading,
      };

      setTrackData([...enrichedTrack, currentPoint]);
    } catch (error) {
      console.error("트랙 데이터 로드 실패:", error);
      setTrackData([]);
    }
  };

  // 항공기 전체 스테이트 데이터 실시간
  const loadAircraftData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await fetchAircraftData();
      setAircraftData(data);
      setAvgAltitude(averageAltitude(data));
      setAvgSpeed(averageSpeed(data));

      const currentSelected = selectedAircraftRef.current;

      // 선택된 항공기가 있는 경우 : 위치 갱신 + track 마지막에 state 최신 정보 추가
      if (currentSelected) {
        const updated = data.find((ac) => ac.id === currentSelected.id);

        if (updated) {
          setSelectedAircraft(updated);

          // Track에 새 위치 추가
          const newPoint: AircraftTrack = {
            time: Math.floor(Date.now() / 1000),
            latitude: updated.latitude,
            longitude: updated.longitude,
            altitude: updated.altitude || 0,
            velocity: updated.velocity || 0,
            heading:
              updated.heading !== null && updated.heading !== false
                ? updated.heading
                : currentSelected.heading,
          };

          setTrackData((prev) => {
            const updated = [...prev, newPoint];
            console.log(`Track 새위치 state 데이터로 업데이트: ${updated.length}개 포인트`);
            return updated;
          });
        } else {
          // 항공기가 범위에서 사라졌을 때 초기화
          setSelectedAircraft(null);
          setTrackData([]);
        }
      }
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 30초마다 업데이트
  useEffect(() => {
    loadAircraftData();
    const interval = setInterval(() => loadAircraftData(true), 30000);
    return () => clearInterval(interval);
  }, []);

  // 항공기 선택시 (트랙 데이터 최초 로딩)
  const handleAircraftSelect = async (aircraft: Aircraft | null) => {
    if (!aircraft) {
      setSelectedAircraft(null);
      setTrackData([]);
      return;
    }
    setSelectedAircraft(aircraft);
    await loadTrackData(aircraft);
  };

  // 새로고침
  const handleRefresh = () => {
    // 순서 중요
    setSelectedAircraft(null);
    setTrackData([]);
    setIsMapReset(true);
    
    // 데이터 다시 로드
    loadAircraftData(true);
    
    // 지도 초기화 플래그 리셋
    setTimeout(() => setIsMapReset(false), 200);
  };

  // 로딩 화면
  if (loading) {
    return (
      <div className={styles.loading}>
        <h2>실시간 항공기 데이터 로딩 중...</h2>
        <p>OpenSky Network에서 데이터를 가져오고 있습니다.</p>
      </div>
    );
  }

  return (
    <div className={styles.app}>
      {/* 사이드 네비 */}
      <aside className={styles.sidebar}>
        <div>
          <h1 className={styles.logo}>
            <CgAirplane />
          </h1>

          <nav className={styles.nav}>
            <button className={styles.active}>
              <RiGlobalLine className={styles.icon} />
            </button>
            <button>
              <LuMap className={styles.icon} />
            </button>
            <button>
              <FaRegBookmark className={styles.icon} />
            </button>
            <button>
              <FiSettings className={styles.icon} />
            </button>
          </nav>
        </div>

        <footer className={styles.sidebarFooter}>
          <small>©</small>
        </footer>
      </aside>

      <main className={styles.main}>
        {/* 헤더 */}
        <header className={styles.header}>
          <h2>Aircraft Tracking Dashboard</h2>
          <button onClick={handleRefresh} disabled={refreshing}>
            <IoMdRefresh className={styles.refresh} />
          </button>
        </header>

        {/* 지도 차트 영역 */}
        <div className={styles.sectionWrap}>
          {/* 상단 */}
          <div className={styles.sectionTop}>
            {/* 지도 영역 */}
            <section className={styles.mapSection}>
              <GoogleMap
                aircraftData={aircraftData}
                trackData={trackData}
                selectedAircraft={selectedAircraft}
                onAircraftSelect={handleAircraftSelect}
                isMapReset={isMapReset}
              />
            </section>

            {/* 정보 영역 */}
            <section className={styles.stats}>
              <article className={styles.statCard}>
                <p>추적 중인 항공기</p>
                <strong>{aircraftData.length}대</strong>
              </article>
              <article className={styles.statCard}>
                <p>평균 고도</p>
                <strong>{avgAltitude.toLocaleString()} ft</strong>
              </article>
              <article className={styles.statCard}>
                <p>평균 속도</p>
                <strong>{avgSpeed.toLocaleString()} kn</strong>
              </article>
              <article className={styles.statCard}>
                <p>상태</p>
                <strong className={styles.live}>● LIVE</strong>
              </article>
            </section>
          </div>

          {/* 하단 차트 */}
          {trackData.length > 0 ? (
            <section className={styles.charts}>
              <div className={styles.chartWrap}>
                <AltitudeChart data={trackData} />
                <VelocityChart data={trackData} />
                <HeadingChart data={trackData} />
              </div>
            </section>
          ) : (
            <div className={styles.alertInfo}>
              💡 지도에서 항공기 마커를 클릭하여 해당 항공기의 비행 데이터를
              확인하세요.
            </div>
          )}

          <footer className={styles.footer}>
            <p>
              데이터 제공: OpenSky Network | 30초마다 자동 갱신 | KR JP(위도
              33–43°, 경도 124–132°)
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default App;
