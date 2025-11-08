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
import { msToKnots } from "../../utils/dataSky";
import styles from "./Charts.module.scss";

const VelocityChart: React.FC<ChartProps> = ({ data }) => {
  // time을 "HH:mm" 시간 형식으로 변환
  const chartData = data.map((d) => ({
    ...d,
    altitude: msToKnots(d.velocity), // knots로 변환
    timeFormatted: new Date(d.time * 1000).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  }));

  // 평균 속도
  const avgVelocity = (
    data.reduce((sum, d) => sum + msToKnots(d.velocity), 0) / data.length
  ).toFixed(1);

  // 최고 속도
  const maxVelocity = Math.max(
    ...data.map((d) => msToKnots(d.velocity))
  ).toFixed(1);

  // y축 domain 동적 설정
  const minAlt = Math.min(...chartData.map((d) => d.velocity));
  const maxAlt = Math.max(...chartData.map((d) => d.velocity));
  const yDomain = [
    Math.floor((minAlt * 0.9) / 100) * 100,
    Math.ceil((maxAlt * 1.1) / 100) * 100,
  ];

  return (
    <div className={styles.chartContainer}>
      <h2 className={styles.title}>속도 변화 Velocity</h2>

      <ResponsiveContainer width="95%" height="90%">
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

          {/* y축 속도 */}
          <YAxis
            stroke="#fff"
            label={{ value: "속도 knots", angle: -90, position: "insideLeft", dy: 5 }}
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
                    <span style={{ fontSize: 14 }}>{value.toFixed(0)} knots</span>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="velocity"
            stroke="#8B5CF6"
            strokeWidth={1}
            dot={false}
            // dot={{ r: 3, fill: "#8B5CF6" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className={`${styles.chartsStats}`}>
        <p>
          <strong>평균:</strong>{" "}
          {parseInt(avgVelocity).toLocaleString()} knots
          <strong style={{ marginLeft: 12 }}>최고:</strong>{" "}
           {parseInt(maxVelocity).toLocaleString()} knots
        </p>
      </div>
    </div>
  );
};

export default VelocityChart;
