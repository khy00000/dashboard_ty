import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ChartProps } from '../../types/aircraft.types';
import styles from './Charts.module.scss';

const VelocityChart: React.FC<ChartProps> = ({ data }) => {
  // 평균 속도
  const avgVelocity = (data.reduce((sum, d) => sum + d.velocity, 0) / data.length).toFixed(1);
  // 최고 속도
  const maxVelocity = Math.max(...data.map(d => d.velocity)).toFixed(1);

  return (
    <div className={styles.chartContainer}>
      <h2 className={styles.title}>속도 변화 Velocity</h2>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>

          {/* 격자 배경 */}
          <CartesianGrid strokeDasharray="3 3" stroke="#fff" />

          {/* x축 시간 */}
          <XAxis dataKey="time" stroke="#fff" />

          {/* y축 속도 */}
          <YAxis stroke="#fff" />

          {/* 호버 */}
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              color: "#00000"
            }}
            formatter={(value: number) => [`${value.toFixed(1)} m/s (${Math.round(value * 3.6)} km/h)`, '속도']}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="velocity"
            stroke="#8B5CF6"
            strokeWidth={1}
            dot={{ r: 3, fill: '#8B5CF6' }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className={`${styles.chartsStats}`}>
        <p>
          <strong>평균:</strong> {avgVelocity}m/s ({Math.round(parseFloat(avgVelocity) * 3.6)}km/h)
          <strong style={{ marginLeft: 12 }}>최고:</strong> {maxVelocity}m/s
        </p>
      </div>
    </div>
  );
};

export default VelocityChart;