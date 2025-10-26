
import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Alert, Box, CircularProgress, Button } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import GoogleMap from './components/Map/GoogleMap';
import AltitudeChart from './components/Charts/AltitudeChart';
import VelocityChart from './components/Charts/VelocityChart';
import HeadingChart from './components/Charts/HeadingChart';
import type { Aircraft, AircraftHistory } from './types/aircraft.types';
import { 
  fetchAircraftData, 
  generateAircraftHistory,
  calculateAverageAltitude,
  calculateAverageSpeed,
  metersToFeet,
  msToKnots
} from './utils/dataSky';
import styles from './App.module.scss';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
});

const App: React.FC = () => {
  const [aircraftData, setAircraftData] = useState<Aircraft[]>([]);
  const [selectedAircraft, setSelectedAircraft] = useState<Aircraft | null>(null);
  const [historyData, setHistoryData] = useState<AircraftHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // 데이터 로드 함수
  const loadData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      console.log('항공기 데이터 로딩...');
      const data = await fetchAircraftData();
      setAircraftData(data);
      
      if (data.length === 0) {
        console.warn('현재 한국 상공에 항공기가 없습니다.');
      }
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 앱 시작 시 자동 로드
  useEffect(() => {
    loadData();

    // 1분(60초)마다 자동 새로고침 (30초는 너무 잦음)
    const interval = setInterval(() => {
      loadData(true);
    }, 60000); // 60초

    return () => clearInterval(interval);
  }, []);

  // 항공기 선택 핸들러
  const handleAircraftSelect = (aircraft: Aircraft | null) => {
    setSelectedAircraft(aircraft);
    
    if (aircraft) {
      const history = generateAircraftHistory(aircraft);
      setHistoryData(history);
    } else {
      setHistoryData([]);
    }
  };

  // 수동 새로고침
  const handleRefresh = () => {
    loadData(true);
    setSelectedAircraft(null);
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '100vh',
            gap: 2
          }}
        >
          <CircularProgress size={60} />
          <Typography variant="h6">실시간 항공기 데이터 로딩 중...</Typography>
          <Typography variant="body2" color="text.secondary">
            OpenSky Network에서 데이터를 가져오고 있습니다
          </Typography>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className={styles.app}>
        <Container maxWidth="xl" className={styles.container}>
          {/* 헤더 */}
          <Box className={styles.header}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h3" component="h1" className={styles.title}>
                ✈️ 실시간 항공기 추적 대시보드
              </Typography>
              <Button
                variant="contained"
                onClick={handleRefresh}
                disabled={refreshing}
                sx={{ minWidth: 120 }}
              >
                🔄 {refreshing ? '새로고침 중...' : '새로고침'}
              </Button>
            </Box>
            
            <Box className={styles.stats}>
              <Box className={styles.statCard}>
                <Typography variant="body2" color="text.secondary">추적 중인 항공기</Typography>
                <Typography variant="h5" fontWeight="bold">{aircraftData.length}대</Typography>
              </Box>
              <Box className={styles.statCard}>
                <Typography variant="body2" color="text.secondary">평균 고도</Typography>
                <Typography variant="h5" fontWeight="bold">
                  {metersToFeet(calculateAverageAltitude(aircraftData)).toLocaleString()} ft
                </Typography>
              </Box>
              <Box className={styles.statCard}>
                <Typography variant="body2" color="text.secondary">평균 속도</Typography>
                <Typography variant="h5" fontWeight="bold">
                  {msToKnots(calculateAverageSpeed(aircraftData))} knots
                </Typography>
              </Box>
              <Box className={styles.statCard}>
                <Typography variant="body2" color="text.secondary">상태</Typography>
                <Typography variant="h5" fontWeight="bold" color="success.main">● LIVE</Typography>
              </Box>
            </Box>
          </Box>

          {aircraftData.length === 0 ? (
            <Alert severity="warning" sx={{ mb: 3 }}>
              현재 한국 상공(위도 30-45°, 경도 120-135°)에 추적 가능한 항공기가 없습니다.
              잠시 후 다시 시도해주세요.
            </Alert>
          ) : (
            <>
              {/* 구글맵 */}
              <GoogleMap
                aircraftData={aircraftData}
                onAircraftSelect={handleAircraftSelect}
                selectedAircraft={selectedAircraft}
              />

              {/* 차트 */}
              {historyData.length > 0 ? (
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <AltitudeChart data={historyData} />
                  </Grid>
                  <Grid item xs={4}>
                    <VelocityChart data={historyData} />
                  </Grid>
                  <Grid item xs={4}>
                    <HeadingChart data={historyData} />
                  </Grid>
                </Grid>
              ) : (
                <Alert severity="info" className={styles.infoAlert} icon="💡">
                  지도에서 항공기 마커를 클릭하여 해당 항공기의 비행 데이터를 확인하세요
                </Alert>
              )}
            </>
          )}

          {/* 푸터 정보 */}
          <Box sx={{ mt: 4, p: 2, bgcolor: '#f5f5f5', borderRadius: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              데이터 제공: OpenSky Network | 1분마다 자동 갱신 | 
              한국 상공 (위도 30-45°, 경도 120-135°)
            </Typography>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default App;