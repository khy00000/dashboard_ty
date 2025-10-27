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

      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
        >
          {/* 격자 배경 */}
          <CartesianGrid strokeDasharray="3 3" stroke="#fff" />

          {/* x축 시간 */}
          <XAxis dataKey="time" stroke="#fff" />

          {/* y축 고도 */}
          <YAxis stroke="#fff" />

          {/* 호버 */}
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              color: "#00000"
            }}
            formatter={(value: number) => [
              `${Math.round(value).toLocaleString()} m`,
              "고도",
            ]}
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
