import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ChartProps } from '../../types/aircraft.types';
import styles from './Charts.module.scss';

const HeadingChart: React.FC<ChartProps> = ({ data }) => {
  const avgHeading = (data.reduce((sum, d) => sum + d.heading, 0) / data.length).toFixed(0);
  
  const getDirection = (heading: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(heading / 45) % 8;
    return directions[index];
  };

  return (
    <div className={styles.chartContainer}>
      <h2 className={styles.chartTitle}>🧭 비행 방향 (Heading)</h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="time" stroke="#666" />
          <YAxis 
            label={{ value: '방향 (°)', angle: -90, position: 'insideLeft' }} 
            stroke="#666"
            domain={[0, 360]}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '4px' }}
            labelStyle={{ fontWeight: 'bold' }}
            formatter={(value: number) => `${Math.round(value)}° (${getDirection(value)})`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="heading"
            stroke="#ff9800"
            strokeWidth={3}
            name="방향 (°)"
            dot={{ r: 4, fill: '#ff9800' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className={`${styles.stats} ${styles.orange}`}>
        <p><strong>분석:</strong> 평균 방향 {avgHeading}° ({getDirection(parseFloat(avgHeading))})</p>
      </div>
    </div>
  );
};

export default HeadingChart;