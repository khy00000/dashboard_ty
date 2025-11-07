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
  aircraftUpdate, // 실시간 누적 좌표 기록
  setAircraftUpdate, // 실시간 폴리라인 업데이트 용
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

  // 선택된 항공기 실시간 누적 폴리라인
  useEffect(() => {
    if (!map || !selectedAircraft) return;

    async function drawPolyline() {
      const { Polyline } = await importLibrary("maps");

      // 과거 트랙 좌표 변환
      const pastPath = trackData.map((t) => ({
        lat: t.latitude,
        lng: t.longitude,
      }));

      // 실시간 기록 가져오기
      const history = aircraftUpdate.get(selectedAircraft.id) || [];

      const fullPath = [...pastPath, ...history];

      if (trailLineRef.current) {
        trailLineRef.current.setPath(fullPath);
      } else {
        trailLineRef.current = new Polyline({
          path: fullPath,
          strokeColor: "#0D47A1",
          strokeOpacity: 0.9,
          strokeWeight: 4,
          geodesic: true,
          map,
        });
      }
    }

    drawPolyline();
  }, [map, selectedAircraft, trackData]);

  // 새로운 좌표 실시간 이어 붙이기
  useEffect(() => {
    if (!map || !selectedAircraft || !trailLineRef.current) return;

    const id = selectedAircraft.id;
    const currentPos = {
      lat: selectedAircraft.latitude,
      lng: selectedAircraft.longitude,
    };

    // 기존 history 가져오기
    const prev = aircraftUpdate.get(id) || [];
    const last = prev[prev.length - 1];

    // 실제로 움직였을 때만 add
    if (!last || last.lat !== currentPos.lat || last.lng !== currentPos.lng) {
      setAircraftUpdate((prevMap) => {
        const newMap = new Map(prevMap);
        newMap.set(id, [...prev, currentPos]); // 현재 위치 추가
        return newMap;
      });
    }

    // 과거 트랙(trackData) + 실시간(history) + 현재 위치 = 최종 폴리라인
    const mergedPath = [
      ...trackData.map((t) => ({ lat: t.latitude, lng: t.longitude })),
      ...(aircraftUpdate.get(id) || []),
      currentPos,
    ];

    // 마커와 폴리라인 마지막 지점이 일치
    trailLineRef.current.setPath(mergedPath);
  }, [selectedAircraft, aircraftData]); // aircraftData 갱신마다 호출됨

  // 상세 정보 카드 닫기
  const handleCloseInfo = () => {
    if (selectedMarkerRef.current) {
      const path = selectedMarkerRef.current.content.querySelector("path");
      if (path) path.setAttribute("fill", "#2196F3");
    }
    selectedMarkerRef.current = null;

    // 폴리라인 제거
    if (trailLineRef.current) {
      trailLineRef.current.setMap(null);
      trailLineRef.current = null;
    }

    // app.tsx에 선택 해제 알림
    onAircraftSelect(null as any);

    // 지도 초기화
    if (map) {
      map.panTo({ lat: 37.5, lng: 127.5 });
      map.setZoom(7);
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
