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

const App: React.FC = () => {
  const [aircraftData, setAircraftData] = useState<Aircraft[]>([]);
  const [selectedAircraft, setSelectedAircraft] = useState<Aircraft | null>(null);
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
      <div className={styles.loadingScreen}>
        <div className={styles.loadingSpinner}></div>
        <h2>실시간 항공기 데이터 로딩 중...</h2>
        <p>OpenSky Network에서 데이터를 가져오고 있습니다.</p>
      </div>
    );
  }

  return (
    <div className={styles.app}>
      <aside className={styles.sidebar}>
        <h1 className={styles.logo}>REASKY</h1>

        <nav className={styles.nav}>
          <button>DASHBOARD</button>
          <button>MAP</button>
          <button>SAVE</button>
          <button>SETTING</button>
        </nav>

        <footer className={styles.sidebarFooter}>
          <small>© 2025 REASKY Dashboard</small>
        </footer>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <h2>실시간 항공기 추적 대시보드</h2>
          <button onClick={handleRefresh} disabled={refreshing}>
            🔄 {refreshing ? "새로고침 중..." : "새로고침"}
          </button>
        </header>

        <section className={styles.stats}>
          <article className={styles.statCard}>
            <p>추적 중인 항공기</p>
            <strong>{aircraftData.length}대</strong>
          </article>
          <article className={styles.statCard}>
            <p>평균 고도</p>
            <strong>
              {metersToFeet(calculateAverageAltitude(aircraftData)).toLocaleString()} ft
            </strong>
          </article>
          <article className={styles.statCard}>
            <p>평균 속도</p>
            <strong>{msToKnots(calculateAverageSpeed(aircraftData))} knots</strong>
          </article>
          <article className={styles.statCard}>
            <p>상태</p>
            <strong className={styles.live}>● LIVE</strong>
          </article>
        </section>

        {aircraftData.length === 0 ? (
          <div className={styles.alertWarning}>
            현재 한국 상공(위도 30–45°, 경도 120–135°)에 추적 가능한 항공기가 없습니다.
            잠시 후 다시 시도해주세요.
          </div>
        ) : (
          <>
            <section className={styles.mapSection}>
              <GoogleMap
                aircraftData={aircraftData}
                onAircraftSelect={handleAircraftSelect}
                selectedAircraft={selectedAircraft}
              />
            </section>

            {historyData.length > 0 ? (
              <section className={styles.charts}>
                <div className={styles.chartBox}>
                  <AltitudeChart data={historyData} />
                </div>
                <div className={styles.chartBox}>
                  <VelocityChart data={historyData} />
                </div>
                <div className={styles.chartBox}>
                  <HeadingChart data={historyData} />
                </div>
              </section>
            ) : (
              <div className={styles.alertInfo}>
                💡 지도에서 항공기 마커를 클릭하여 해당 항공기의 비행 데이터를 확인하세요.
              </div>
            )}
          </>
        )}

        <footer className={styles.footer}>
          <p>
            데이터 제공: OpenSky Network | 30초마다 자동 갱신 | 한국 상공 (위도 30–45°, 경도
            120–135°)
          </p>
        </footer>
      </main>
    </div>
  );
};

export default App;
