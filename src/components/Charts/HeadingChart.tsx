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
import { getDirection } from "../../utils/dataSky";
import styles from "./Charts.module.scss";

const HeadingChart: React.FC<ChartProps> = ({ data }) => {
  // time을 "HH:mm" 시간 형식으로 변환
  const chartData = data.map((d) => ({
    ...d,
    heading: d.heading,
    timeFormatted: new Date(d.time * 1000).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  }));

  // 평균 방향
  const avgHeading = (
    data.reduce((sum, d) => sum + d.heading, 0) / data.length
  ).toFixed(0);

  // y축 domain 동적 설정
  const minAlt = Math.min(...chartData.map((d) => d.heading));
  const maxAlt = Math.max(...chartData.map((d) => d.heading));
  const yDomain = [
    Math.floor((minAlt * 0.9) / 100) * 100,
    Math.ceil((maxAlt * 1.1) / 100) * 100,
  ];

  return (
    <div className={styles.chartContainer}>
      <h2 className={styles.title}>비행 방향 Heading</h2>

      <ResponsiveContainer className={styles.chart}>
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

          {/* y축 방향 */}
          <YAxis
            label={{
              value: "방향 °",
              angle: -90,
              position: "insideLeft",
              dx: 0,
              dy: -20,
            }}
            stroke="#fff"
            domain={yDomain}
            tick={{ fontSize: 10 }}
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
          <Legend
            content={({ payload }) => (
              <ul className={styles.legendList}>
                {payload?.map((entry, index) => (
                  <li key={`item-${index}`} className={styles.legendItem}>
                    <span
                      className={styles.legendDot}
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className={styles.legendHeText}>{entry.value}</span>
                  </li>
                ))}
              </ul>
            )}
          />
          <Line
            type="monotone"
            dataKey="heading"
            stroke="#93c6dfff"
            strokeWidth={1}
            dot={false}
            // dot={{ r: 3, fill: "#93c6dfff" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className={styles.chartsStats}>
        <p>
          <strong>평균:</strong> {avgHeading}° (
          {getDirection(parseFloat(avgHeading))})
        </p>
      </div>
    </div>
  );
};

export default HeadingChart;
