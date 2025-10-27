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
      <h2 className={styles.chartTitle}>비행 방향 Heading</h2>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          {/* 격자 배경 */}
          <CartesianGrid strokeDasharray="3 3" stroke="#fff" />

          {/* x축 시간 */}
          <XAxis dataKey="time" stroke="#fff" />

          {/* y축 방향 */}
          <YAxis
            label={{ value: "방향 (°)", angle: -90, position: "insideLeft" }}
            stroke="#fff"
            domain={[0, 360]}
          />

          {/* 호버 */}
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              color: "#00000"
            }}
            formatter={(value: number) =>
              `${Math.round(value)}° (${getDirection(value)})`
            }
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="heading"
            stroke="#93c6dfff"
            strokeWidth={3}
            name="방향 (°)"
            dot={{ r: 4, fill: "#93c6dfff" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className={`${styles.stats} ${styles.orange}`}>
        <p>
          <strong>분석:</strong> 평균 방향 {avgHeading}° (
          {getDirection(parseFloat(avgHeading))})
        </p>
      </div>
    </div>
  );
};

export default HeadingChart;
