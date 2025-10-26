import React, { useEffect, useRef, useState } from "react";
import { Paper, Box } from "@mui/material";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import type { GoogleMapProps, Aircraft } from "../../types/ship.types";
import AircraftInfoCard from "./AircraftInfoCard";
import styles from "./GoogleMap.module.scss";

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const GOOGLE_MAPS_ID = import.meta.env.VITE_GOOGLE_MAPS_ID;

setOptions({ key: GOOGLE_MAPS_KEY });

const GoogleMap: React.FC<GoogleMapProps> = ({
  aircraftData,
  onAircraftSelect,
  selectedAircraft,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const trailLineRef = useRef<google.maps.Polyline | null>(null);
  
  // 항공기 위치 히스토리 저장
  const aircraftHistoryRef = useRef<Map<string, google.maps.LatLngLiteral[]>>(new Map());

  // 지도 초기화
  useEffect(() => {
    async function init() {
      const { Map } = await importLibrary("maps");
      if (mapRef.current) {
        const mapInstance = new Map(mapRef.current, {
          center: { lat: 37.5, lng: 127.5 },
          zoom: 7,
          mapId: GOOGLE_MAPS_ID,
          disableDefaultUI: false, // 기본 UI 유지
          zoomControl: true, // 확대/축소 버튼 유지
          mapTypeControl: false, // 지도 타입 컨트롤 숨기기
          scaleControl: false, // 스케일 숨기기
          streetViewControl: false, // 스트리트뷰 숨기기
          rotateControl: false, // 회전 컨트롤 숨기기
          fullscreenControl: false, // 풀스크린 버튼 숨기기
        });
        setMap(mapInstance);
      }
    }

    init().catch(console.error);
  }, []);

  // 항공기 위치 히스토리 업데이트
  useEffect(() => {
    aircraftData.forEach((aircraft) => {
      const history = aircraftHistoryRef.current.get(aircraft.id) || [];
      const newPosition = {
        lat: aircraft.latitude,
        lng: aircraft.longitude,
      };
      
      // 새 위치 추가 (최대 20개까지만 저장)
      const updatedHistory = [...history, newPosition].slice(-20);
      aircraftHistoryRef.current.set(aircraft.id, updatedHistory);
    });
  }, [aircraftData]);

  // 항공기 마커 렌더링
  useEffect(() => {
    if (!map || !aircraftData.length) return;

    async function renderMarkers() {
      // 기존 마커 제거
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];

      const { AdvancedMarkerElement, PinElement } = await importLibrary("marker");

      // 새 마커 생성
      for (const aircraft of aircraftData) {
        // 비행기 아이콘 생성 (회전)
        const planeIcon = document.createElement("div");
        planeIcon.innerHTML = `
          <svg width="32" height="32" viewBox="0 0 24 24" style="transform: rotate(${aircraft.heading}deg);">
            <path fill="#2196F3" d="M21,16v-2l-8-5V3.5C13,2.67,12.33,2,11.5,2S10,2.67,10,3.5V9l-8,5v2l8-2.5V19l-2,1.5V22l3.5-1l3.5,1v-1.5L13,19v-5.5L21,16z"/>
          </svg>
        `;
        planeIcon.style.cursor = "pointer";
        planeIcon.style.filter = "drop-shadow(0 2px 4px rgba(0,0,0,0.3))";

        const marker = new AdvancedMarkerElement({
          position: { lat: aircraft.latitude, lng: aircraft.longitude },
          map,
          title: aircraft.callsign,
          content: planeIcon,
        });

        marker.addListener("click", () => onAircraftSelect(aircraft));
        markersRef.current.push(marker);
      }
    }

    renderMarkers().catch(console.error);
  }, [map, aircraftData, onAircraftSelect]);

  // 선택된 항공기의 경로 표시
  useEffect(() => {
    if (!map || !selectedAircraft) {
      // 경로 제거
      if (trailLineRef.current) {
        trailLineRef.current.setMap(null);
        trailLineRef.current = null;
      }
      return;
    }

    // 선택된 항공기의 히스토리 가져오기
    const history = aircraftHistoryRef.current.get(selectedAircraft.id) || [];
    
    if (history.length > 1) {
      // 기존 경로 제거
      if (trailLineRef.current) {
        trailLineRef.current.setMap(null);
      }

      // 새 경로 그리기
      trailLineRef.current = new google.maps.Polyline({
        path: history,
        geodesic: true,
        strokeColor: "#FF5722",
        strokeOpacity: 0.8,
        strokeWeight: 3,
        map: map,
      });
    }

    // 선택된 항공기로 중심 이동
    map.panTo({
      lat: selectedAircraft.latitude,
      lng: selectedAircraft.longitude,
    });
    map.setZoom(10);
  }, [selectedAircraft, map, aircraftData]); // aircraftData 추가로 업데이트마다 경로 갱신

  // 상세정보 닫기
  const handleCloseInfo = () => {
    onAircraftSelect(null as any);
    
    // 경로 제거
    if (trailLineRef.current) {
      trailLineRef.current.setMap(null);
      trailLineRef.current = null;
    }
    
    map?.setZoom(7);
  };

  return (
    <Paper className={styles.mapContainer}>
      {/* 구글 맵 */}
      <div ref={mapRef} className={styles.map} />

      {/* 선택된 항공기 상세정보 카드 */}
      {selectedAircraft && (
        <AircraftInfoCard
          aircraft={selectedAircraft}
          onClose={handleCloseInfo}
        />
      )}

      {/* 범례 */}
      <Box className={styles.legend}>
        <Box sx={{ fontWeight: "bold", mb: 1, fontSize: 13 }}>범례</Box>
        <Box
          sx={{ display: "flex", alignItems: "center", mb: 0.5, fontSize: 12 }}
        >
          <Box
            sx={{
              width: 20,
              height: 20,
              mr: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#2196F3" d="M21,16v-2l-8-5V3.5C13,2.67,12.33,2,11.5,2S10,2.67,10,3.5V9l-8,5v2l8-2.5V19l-2,1.5V22l3.5-1l3.5,1v-1.5L13,19v-5.5L21,16z"/>
            </svg>
          </Box>
          <span>항공기</span>
        </Box>
        <Box
          sx={{ display: "flex", alignItems: "center", mb: 0.5, fontSize: 12 }}
        >
          <Box
            sx={{
              width: 20,
              height: 3,
              bgcolor: "#FF5722",
              mr: 1,
            }}
          />
          <span>비행 경로</span>
        </Box>
        <Box sx={{ fontSize: 11, color: "text.secondary", mt: 1 }}>
          클릭하여 상세 정보 및 경로 확인
        </Box>
      </Box>
    </Paper>
  );
};

export default GoogleMap;