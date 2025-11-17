import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { ChartProps } from "../../types/aircraft.types";
import { metersToFeet } from "../../utils/dataSky";
import styles from "./Charts.module.scss";

const AltitudeChart: React.FC<ChartProps> = ({ data }) => {
  // time을 "HH:mm" 시간 형식으로 변환
  const chartData = data.map((d) => ({
    ...d,
    altitude: metersToFeet(d.altitude), // ft로 변환
    timeFormatted: new Date(d.time * 1000).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  }));

  // 평균 고도
  const avgAltitude = (
    data.reduce((sum, d) => sum + metersToFeet(d.altitude), 0) / data.length
  ).toFixed(0);

  // 최고 고도
  const maxAltitude = Math.max(
    ...data.map((d) => metersToFeet(d.altitude))
  ).toFixed(0);

  // y축 domain 동적 설정
  const minAlt = Math.min(...chartData.map((d) => d.altitude));
  const maxAlt = Math.max(...chartData.map((d) => d.altitude));
  const yDomain = [
    Math.floor((minAlt * 0.9) / 1000) * 1000,
    Math.ceil((maxAlt * 1.1) / 1000) * 1000,
  ];

  return (
    <div className={styles.chartContainer}>
      <h2 className={styles.title}>고도 변화 Altitude</h2>

      <ResponsiveContainer>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
        >
          {/* 격자 배경 */}
          <CartesianGrid strokeDasharray="3 3" stroke="#fff" />

          {/* x축 시간 */}
          <XAxis
            dataKey="timeFormatted"
            stroke="#fff"
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />

          {/* y축 고도 */}
          <YAxis
            stroke="#fff"
            label={{ value: "고도 ft", angle: -90, position: "insideLeft" }}
            domain={yDomain}
            tick={{ fontSize: 11 }}
          />

          {/* 호버 */}
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const value = payload[0].value as number;
                return (
                  <div
                    style={{
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      color: "#000",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      textAlign: "center",
                      padding: "8px 12px",
                      minWidth: "60px",
                      minHeight: "40px",
                    }}
                  >
                    <span style={{ fontSize: 14 }}>
                      {Math.round(value).toLocaleString()} ft
                    </span>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
          />
          <Line
            type="monotone"
            dataKey="altitude"
            stroke="#3B82F6"
            strokeWidth={1}
            dot={false}
            // dot={{ r: 3, fill: "#3B82F6" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className={styles.chartsStats}>
        <p>
          <strong>평균:</strong> {parseInt(avgAltitude).toLocaleString()} ft
          <strong style={{ marginLeft: 12 }}>최고:</strong>{" "}
          {parseInt(maxAltitude).toLocaleString()} ft
        </p>
      </div>
    </div>
  );
};

export default AltitudeChart;
