import React from "react";
import type { AircraftInfoCardProps } from "../../types/aircraft.types";
import { metersToFeet, msToKnots } from "../../utils/dataSky";
import styles from "./GoogleMap.module.scss";
import { AiOutlineClose } from "react-icons/ai";

const AircraftInfoCard: React.FC<AircraftInfoCardProps> = ({
  aircraft,
  onClose,
}) => {
  return (
    <div className={styles.airInfo}>
      <div className={styles.airInfoHeader}>
        <h3>✈️ {aircraft.callsign}</h3>
        <span className={styles.airInfoCountry}>{aircraft.country}</span>
      </div>

      <div className={styles.airInfoBody}>
        <p>
          <strong>ICAO24 :</strong> {aircraft.id.toUpperCase()}
        </p>
        <p>
          <strong>고도 :</strong>{" "}
          {metersToFeet(aircraft.altitude).toLocaleString()} ft
          (
          {Math.round(aircraft.altitude).toLocaleString()} m)
        </p>
        <p>
          <strong>속도 :</strong> 
          {msToKnots(aircraft.velocity)} knots 
          (
          {Math.round(aircraft.velocity * 3.6)} km/h)
        </p>
        <p>
          <strong>방향 :</strong> {Math.round(aircraft.heading)}°
        </p>
        <p>
          <strong>좌표 :</strong> {aircraft.latitude.toFixed(4)}°N,{" "}
          {aircraft.longitude.toFixed(4)}°E
        </p>
        <p className={styles.airInfoTime}>
          마지막 업데이트 :{" "}
          {new Date(aircraft.lastUpdate).toLocaleTimeString("ko-KR")}
        </p>
      </div>

      <button className={styles.airInfoBtn} onClick={onClose}>
        <AiOutlineClose />
      </button>
    </div>
  );
};

export default AircraftInfoCard;
