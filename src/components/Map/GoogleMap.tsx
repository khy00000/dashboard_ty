import React, { useEffect, useRef, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import type { GoogleMapProps, Aircraft } from "../../types/aircraft.types";
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

  // 항공기 히스토리 업데이트
  useEffect(() => {
    aircraftData.forEach((aircraft) => {
      const history = aircraftHistoryRef.current.get(aircraft.id) || [];
      const newPosition = { lat: aircraft.latitude, lng: aircraft.longitude };
      const updatedHistory = [...history, newPosition].slice(-20);
      aircraftHistoryRef.current.set(aircraft.id, updatedHistory);
    });
  }, [aircraftData]);

  // 마커 렌더링
  useEffect(() => {
    if (!map || !aircraftData.length) return;

    async function renderMarkers() {
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];

      const { AdvancedMarkerElement } = await importLibrary("marker");

      for (const aircraft of aircraftData) {
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

  // 경로 표시
  useEffect(() => {
    if (!map || !selectedAircraft) {
      if (trailLineRef.current) {
        trailLineRef.current.setMap(null);
        trailLineRef.current = null;
      }
      return;
    }

    const history = aircraftHistoryRef.current.get(selectedAircraft.id) || [];
    if (history.length > 1) {
      if (trailLineRef.current) trailLineRef.current.setMap(null);

      trailLineRef.current = new google.maps.Polyline({
        path: history,
        geodesic: true,
        strokeColor: "#FF5722",
        strokeOpacity: 0.8,
        strokeWeight: 3,
        map,
      });
    }

    map.panTo({ lat: selectedAircraft.latitude, lng: selectedAircraft.longitude });
    map.setZoom(10);
  }, [selectedAircraft, map, aircraftData]);

  const handleCloseInfo = () => {
    onAircraftSelect(null as any);
    if (trailLineRef.current) {
      trailLineRef.current.setMap(null);
      trailLineRef.current = null;
    }
    map?.setZoom(7);
  };

  return (
    <section className={styles.mapContainer}>
      {/* 구글 맵 */}
      <div ref={mapRef} className={styles.map}></div>

      {/* 항공기 정보 카드 */}
      {selectedAircraft && (
        <AircraftInfoCard
          aircraft={selectedAircraft}
          onClose={handleCloseInfo}
        />
      )}
    </section>
  );
};

export default GoogleMap;