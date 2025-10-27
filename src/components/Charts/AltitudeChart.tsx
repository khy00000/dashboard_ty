import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ChartProps } from '../../types/aircraft.types';
import styles from './Charts.module.scss';

const AltitudeChart: React.FC<ChartProps> = ({ data }) => {
  const avgAltitude = (data.reduce((sum, d) => sum + d.altitude, 0) / data.length).toFixed(0);
  const minAltitude = Math.min(...data.map(d => d.altitude)).toFixed(0);
  const maxAltitude = Math.max(...data.map(d => d.altitude)).toFixed(0);

  return (
    <div className={styles.chartContainer}>
      <h2 className={styles.title}>✈️ 고도 변화</h2>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="time" stroke="#666" />
          <YAxis stroke="#666" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
            formatter={(value: number) => [`${Math.round(value).toLocaleString()} m`, '고도']}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="altitude"
            stroke="#2196f3"
            strokeWidth={3}
            dot={{ r: 3, fill: '#2196f3' }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className={styles.stats}>
        <p>
          <strong>평균:</strong> {parseInt(avgAltitude).toLocaleString()}m
          <strong style={{ marginLeft: 12 }}>최고:</strong> {parseInt(maxAltitude).toLocaleString()}m
        </p>
      </div>
    </div>
  );
};

export default AltitudeChart;