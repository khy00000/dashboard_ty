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
import styles from "./Charts.module.scss";

const AltitudeChart: React.FC<ChartProps> = ({ data }) => {
  // 평균 고도
  const avgAltitude = (
    data.reduce((sum, d) => sum + d.altitude, 0) / data.length
  ).toFixed(0);
  // 최고 고도
  const maxAltitude = Math.max(...data.map((d) => d.altitude)).toFixed(0);

  return (
    <div className={styles.chartContainer}>
      <h2 className={styles.title}>고도 변화 Altitude</h2>

      <ResponsiveContainer width="95%" height="90%">
        <LineChart data={data}>
          {/* 격자 배경 */}
          <CartesianGrid strokeDasharray="3 3" stroke="#fff" />

          {/* x축 시간 */}
          <XAxis dataKey="time" stroke="#fff" tick={{ fontSize: 12 }} />

          {/* y축 고도 */}
          <YAxis
            stroke="#fff"
            label={{ value: "고도m", angle: -90, position: "insideLeft" }}
            stroke="#fff"
            domain={[0, 360]}
            tick={{ fontSize: 12 }}
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
                      {Math.round(value).toLocaleString()} m
                    </span>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="altitude"
            stroke="#3B82F6"
            strokeWidth={1}
            dot={{ r: 3, fill: "#3B82F6" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className={styles.chartsStats}>
        <p>
          <strong>평균:</strong> {parseInt(avgAltitude).toLocaleString()}m
          <strong style={{ marginLeft: 12 }}>최고:</strong>{" "}
          {parseInt(maxAltitude).toLocaleString()}m
        </p>
      </div>
    </div>
  );
};

export default AltitudeChart;
