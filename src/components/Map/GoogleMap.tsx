import React, { useEffect, useRef, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import type { GoogleMapProps } from "../../types/aircraft.types";
import AircraftInfoCard from "./AircraftInfoCard";
import styles from "./GoogleMap.module.scss";

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const GOOGLE_MAPS_ID = import.meta.env.VITE_GOOGLE_MAPS_ID;

setOptions({ key: GOOGLE_MAPS_KEY });

const GoogleMap: React.FC<GoogleMapProps> = ({
  aircraftData,
  trackData,
  onAircraftSelect,
  selectedAircraft,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  // 마커 목록 저장
  const markersRef = useRef<
    Map<string, google.maps.marker.AdvancedMarkerElement>
  >(new Map());

  // 선택된 마커 저장 (색 변경 및 복구)
  const selectedMarkerRef =
    useRef<google.maps.marker.AdvancedMarkerElement | null>(null);

  // 실시간 비행 경로 저장 (좌표 누적)
  const aircraftHistoryRef = useRef<Map<string, google.maps.LatLngLiteral[]>>(
    new Map()
  );

  // 폴리라인 객체 저장
  const trailLineRef = useRef<google.maps.Polyline | null>(null);

  // 지도 초기화
  useEffect(() => {
    async function init() {
      const { Map } = await importLibrary("maps");
      if (mapRef.current) {
        setMap(
          new Map(mapRef.current, {
            center: { lat: 37.5, lng: 127.5 },
            zoom: 7,
            mapId: GOOGLE_MAPS_ID,
            zoomControl: true,
          })
        );
      }
    }
    init();
  }, []);

  // 마커 생성 및 업데이트
  useEffect(() => {
    if (!map) return;

    async function renderMarkers() {
      const { AdvancedMarkerElement } = await importLibrary("marker");

      aircraftData.forEach((ac) => {
        let marker = markersRef.current.get(ac.id);
        if (!marker) {
          // 신규 마커 생성
          const planeIcon = document.createElement("div");
          planeIcon.innerHTML = `
            <svg width="32" height="32" viewBox="0 0 24 24" style="transform: rotate(${ac.heading}deg)">
              <path fill="#2196F3" d="M21,16v-2l-8-5V3.5C13,2.67,12.33,2,11.5,2S10,2.67,10,3.5V9l-8,5v2l8-2.5V19l-2,1.5V22l3.5-1l3.5,1v-1.5L13,19v-5.5L21,16z"/>
            </svg>
          `;
          planeIcon.style.cursor = "pointer";
          planeIcon.style.filter = "drop-shadow(0 2px 4px rgba(0,0,0,0.3))";

          marker = new AdvancedMarkerElement({
            position: { lat: ac.latitude, lng: ac.longitude },
            map,
            title: ac.callsign,
            content: planeIcon,
          });

          // 마커 선택 클릭 이벤트
          marker.addListener("click", () => {
            // 기존 마커 색 복원
            if (selectedMarkerRef.current) {
              const prevSvg =
                selectedMarkerRef.current.content.querySelector("path");
              if (prevSvg) prevSvg.setAttribute("fill", "#2196F3");
            }

            // 마커 선택 색 진하게
            const svg = planeIcon.querySelector("path");
            if (svg) svg.setAttribute("fill", "#0D47A1");
            selectedMarkerRef.current = marker;

            // app.tsx 상태 업데이트 상세정보 오픈
            onAircraftSelect(ac);

            // 지도 중심 & 줌
            map.panTo({ lat: ac.latitude, lng: ac.longitude });
            map.setZoom(9);
          });

          markersRef.current.set(ac.id, marker);
        } else {
          // 기존 마커 위치 업데이트
          marker.position = { lat: ac.latitude, lng: ac.longitude };
        }
      });
    }

    renderMarkers();
  }, [map, aircraftData, selectedAircraft, onAircraftSelect]);

  // 상세 정보 카드 닫기
  const handleCloseInfo = () => {
    onAircraftSelect(null as any);

    if (map) {
      map.setZoom(7); // 초기 줌으로 복귀
      map.panTo({ lat: 37.5, lng: 127.5 }); // 초기 중심으로 이동
    }
  };

  return (
    <section className={styles.mapContainer}>
      {/* 구글 맵 */}
      <div ref={mapRef} className={styles.map}>
        {/* 항공기 정보 카드 */}
        {selectedAircraft && (
          <AircraftInfoCard
            aircraft={selectedAircraft}
            onClose={handleCloseInfo}
          />
        )}
      </div>
    </section>
  );
};

export default GoogleMap;
