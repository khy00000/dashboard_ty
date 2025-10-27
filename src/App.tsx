import React, { useState, useEffect } from "react";
import GoogleMap from "./components/Map/GoogleMap";
import AltitudeChart from "./components/Charts/AltitudeChart";
import VelocityChart from "./components/Charts/VelocityChart";
import HeadingChart from "./components/Charts/HeadingChart";
import type { Aircraft, AircraftHistory } from "./types/aircraft.types";
import {
  fetchAircraftData,
  generateAircraftHistory,
  calculateAverageAltitude,
  calculateAverageSpeed,
  metersToFeet,
  msToKnots,
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
  const [selectedAircraft, setSelectedAircraft] = useState<Aircraft | null>(
    null
  );
  const [historyData, setHistoryData] = useState<AircraftHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      console.log("항공기 데이터 로딩...");
      const data = await fetchAircraftData();
      setAircraftData(data);

      if (data.length === 0) {
        console.warn("현재 한국 상공에 항공기가 없습니다.");
      }
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(true), 60000);
    return () => clearInterval(interval);
  }, []);

  const handleAircraftSelect = (aircraft: Aircraft | null) => {
    setSelectedAircraft(aircraft);
    if (aircraft) setHistoryData(generateAircraftHistory(aircraft));
    else setHistoryData([]);
  };

  const handleRefresh = () => {
    loadData(true);
    setSelectedAircraft(null);
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <h2>실시간 항공기 데이터 로딩 중...</h2>
        <p>OpenSky Network에서 데이터를 가져오고 있습니다.</p>
      </div>
    );
  }

  return (
    <>
      {aircraftData.length === 0 ? (
        <div className={styles.loading}>
          <h2>실시간 항공기 데이터 로딩 중...</h2>
          <p>OpenSky Network에서 데이터를 가져오고 있습니다.</p>
        </div>
      ) : (
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
                    onAircraftSelect={handleAircraftSelect}
                    selectedAircraft={selectedAircraft}
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
                    <strong>
                      {metersToFeet(
                        calculateAverageAltitude(aircraftData)
                      ).toLocaleString()}{" "}
                      ft
                    </strong>
                  </article>
                  <article className={styles.statCard}>
                    <p>평균 속도</p>
                    <strong>
                      {msToKnots(calculateAverageSpeed(aircraftData))} knots
                    </strong>
                  </article>
                  <article className={styles.statCard}>
                    <p>상태</p>
                    <strong className={styles.live}>● LIVE</strong>
                  </article>
                </section>
              </div>

              {/* 하단 차트 */}
              {historyData.length > 0 ? (
                <section className={styles.charts}>
                  <div className={styles.chartWrap}>
                    <AltitudeChart data={historyData} />
                    <VelocityChart data={historyData} />
                    <HeadingChart data={historyData} />
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
                  데이터 제공: OpenSky Network | 30초마다 자동 갱신 | 한국
                  상공(위도 30–45°, 경도 120–135°)
                </p>
              </footer>
            </div>
          </main>
        </div>
      )}
    </>
  );
};

export default App;
