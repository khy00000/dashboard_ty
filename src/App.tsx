import React, { useState, useEffect } from "react";
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
  const [avgAltitude, setAvgAltitude] = useState<number>(0);
  const [avgSpeed, setAvgSpeed] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // 항공기 데이터 로딩
  const loadAircraftData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      console.log("항공기 데이터 로딩...");
      const data = await fetchAircraftData();
      setAircraftData(data);
      setAvgAltitude(averageAltitude(data));
      setAvgSpeed(averageSpeed(data));

      if (data.length === 0) {
        console.log("항공기 데이터가 없음");
      }
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAircraftData(); // 초기 실행
    const interval = setInterval(() => loadAircraftData(true), 30000);
    return () => clearInterval(interval);
  }, []);

  // 항공기 선택
  const handleAircraftSelect = async (aircraft: Aircraft) => {
    // null 체크
    if (!aircraft) {
      setSelectedAircraft(null);
      setTrackData([]);
      return;
    }

    // 새로운 항공기 선택
    setSelectedAircraft(aircraft);

    try {
      const now = Math.floor(Date.now() / 1000);
      const track = await fetchTrackData(aircraft.id, now);

      // track heading이 null/false인 경우 현재 항공기의 heading으로 대체
      const enrichedTrack = track.map(t => ({
        ...t,
        heading: (t.heading === null || t.heading === false) 
          ? aircraft.heading 
          : t.heading
      }));
      
      setTrackData(enrichedTrack);

    } catch (error) {
      console.error("트랙 데이터 로드 실패:", error);
      setTrackData([]);
    }
  };

  // 새로고침
  const handleRefresh = () => {
    loadAircraftData(true);
    setSelectedAircraft(null);
    setTrackData([]);
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
            <button>
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
              데이터 제공: OpenSky Network | 30초마다 자동 갱신 | 한국 상공(위도
              30–45°, 경도 120–135°)
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default App;
