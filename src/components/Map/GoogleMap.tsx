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
  onAircraftSelect,
  selectedAircraft,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const markersRef = useRef<
    Map<string, google.maps.marker.AdvancedMarkerElement>
  >(new Map());
  // 클릭된 마커 추적
  const selectedMarkerRef =
    useRef<google.maps.marker.AdvancedMarkerElement | null>(null);

  // 지도 초기화
  useEffect(() => {
    async function init() {
      const { Map } = await importLibrary("maps");
      if (mapRef.current) {
        const mapInstance = new Map(mapRef.current, {
          center: { lat: 37.5, lng: 127.5 },
          zoom: 7,
          mapId: GOOGLE_MAPS_ID,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: false,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: false,
        });
        setMap(mapInstance);
      }
    }

    init().catch(console.error);
  }, []);

  // 마커 렌더링
  useEffect(() => {
    if (!map) return;

    async function renderMarkers() {
      const { AdvancedMarkerElement } = await importLibrary("marker");

      aircraftData.forEach((ac) => {
        let marker = markersRef.current.get(ac.id);
        if (!marker) {
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

          marker.addListener("click", () => {
            // 기존 마커 색 복원
            if (selectedMarkerRef.current) {
              const prevSvg =
                selectedMarkerRef.current.content.querySelector("path");
              if (prevSvg) prevSvg.setAttribute("fill", "#2196F3");
            }

            // 클릭 마커 색 진하게
            const svg = planeIcon.querySelector("path");
            if (svg) svg.setAttribute("fill", "#0D47A1");
            selectedMarkerRef.current = marker;

            // 상세정보 오픈
            onAircraftSelect(ac);

            // 지도 중심 & 줌
            map.panTo({ lat: ac.latitude, lng: ac.longitude });
            map.setZoom(9);
          });

          markersRef.current.set(ac.id, marker);
        } else {
          // 기존 마커 위치 업데이트
          marker.position = { lat: ac.latitude, lng: ac.longitude };
          const svg = marker.content.querySelector("svg");
          if (svg) svg.style.transform = `rotate(${ac.heading}deg)`;
        }
      });
    }

    renderMarkers().catch(console.error);
  }, [map, aircraftData, onAircraftSelect]);

  // 상세 정보 카드 닫기
  const handleCloseInfo = () => {
    onAircraftSelect(null as any);

    if (map) {
      map.setZoom(7); // 초기 줌으로 복귀
      map.panTo({ lat: 37.5, lng: 127.5 }); // 초기 중심으로 이동
    }
  };

  // 선택된 항공기 따라가기 (실시간)
  useEffect(() => {
    if (!map || !selectedAircraft) return;

    let animationFrame: number;
    const followAircraft = () => {
      const history = aircraftHistoryRef.current.get(selectedAircraft.id);
      if (history && history.length) {
        const latest = history[history.length - 1];
        map.panTo(latest);
        // 폴리라인 갱신
        if (trailLineRef.current) trailLineRef.current.setPath(history);
      }
      animationFrame = requestAnimationFrame(followAircraft);
    };

    followAircraft();
    return () => cancelAnimationFrame(animationFrame);
  }, [map, selectedAircraft]);

  // 항공기 트랙 업데이트
  useEffect(() => {
    const HOURS = 8 * 60 * 60 * 1000;

    aircraftData.forEach((aircraft) => {
      const history = aircraftHistoryRef.current.get(aircraft.id) || [];
      const newPosition = {
        lat: aircraft.latitude,
        lng: aircraft.longitude,
        timestamp: Date.now(),
      };

      // 중복 제거
      const lastPosition = history[history.length - 1];
      const isDuplicate =
        lastPosition &&
        Math.abs(lastPosition.lat - newPosition.lat) < 0.0001 &&
        Math.abs(lastPosition.lng - newPosition.lng) < 0.0001;

      if (!isDuplicate) {
        const updatedHistory = [...history, newPosition].filter(
          (pos) => Date.now() - pos.timestamp < HOURS
        ); // 8시간 이내

        aircraftHistoryRef.current.set(aircraft.id, updatedHistory);
      }
    });
  }, [aircraftData]);

  // 폴리 라인
  useEffect(() => {
    if (!map) return;

    // 이전 폴리라인 제거
    if (trailLineRef.current) {
      trailLineRef.current.setMap(null);
      trailLineRef.current = null;
    }

    if (!selectedAircraft) return;

    const history = aircraftHistoryRef.current.get(selectedAircraft.id) || [];

    console.log(
      "Drawing polyline for:",
      selectedAircraft.callsign,
      "Points:",
      history.length
    ); // 디버깅용

    if (history.length > 1) {
      trailLineRef.current = new google.maps.Polyline({
        path: history,
        geodesic: true,
        strokeColor: "#0022ffff",
        strokeOpacity: 0.8,
        strokeWeight: 4,
        map,
        zIndex: 1, // 마커보다 아래
      });
    }
  }, [selectedAircraft, map]);

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