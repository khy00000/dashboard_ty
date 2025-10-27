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

const HeadingChart: React.FC<ChartProps> = ({ data }) => {
  // 평균 방향
  const avgHeading = (
    data.reduce((sum, d) => sum + d.heading, 0) / data.length
  ).toFixed(0);

  const getDirection = (heading: number) => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const index = Math.round(heading / 45) % 8;
    return directions[index];
  };

  return (
    <div className={styles.chartContainer}>
      <h2 className={styles.title}>비행 방향 Heading</h2>

      <ResponsiveContainer width="95%" height="90%">
        <LineChart data={data}>
          {/* 격자 배경 */}
          <CartesianGrid strokeDasharray="3 3" stroke="#fff" />

          {/* x축 시간 */}
          <XAxis dataKey="time" stroke="#fff" tick={{ fontSize: 12 }} />

          {/* y축 방향 */}
          <YAxis
            label={{ value: "방향(°)", angle: -90, position: "insideLeft" }}
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
                      {Math.round(value)}° ({getDirection(value)})
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
            dataKey="heading"
            stroke="#93c6dfff"
            strokeWidth={1}
            name="방향 (°)"
            dot={{ r: 3, fill: "#93c6dfff" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className={styles.chartsStats}>
        <p>
          <strong>평균:</strong>방향 {avgHeading}° (
          {getDirection(parseFloat(avgHeading))})
        </p>
      </div>
    </div>
  );
};

export default HeadingChart;
