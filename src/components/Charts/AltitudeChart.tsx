import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ChartProps } from '../../types/aircraft.types';
import styles from './Charts.module.scss';

const AltitudeChart: React.FC<ChartProps> = ({ data }) => {
  const avgAltitude = (data.reduce((sum, d) => sum + d.altitude, 0) / data.length).toFixed(0);
  const minAltitude = Math.min(...data.map(d => d.altitude)).toFixed(0);
  const maxAltitude = Math.max(...data.map(d => d.altitude)).toFixed(0);

  return (
    <Paper className={styles.chartContainer}>
      <Typography variant="h6" gutterBottom>
        ✈️ 고도 변화
      </Typography>
      
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey="time" 
            stroke="#666" 
            style={{ fontSize: 12 }}
            tick={{ fill: '#666' }}
          />
          <YAxis 
            stroke="#666" 
            style={{ fontSize: 12 }}
            tick={{ fill: '#666' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.98)', 
              border: '1px solid #ddd', 
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}
            labelStyle={{ fontWeight: 600, marginBottom: 4 }}
            formatter={(value: number) => [`${Math.round(value).toLocaleString()} m`, '고도']}
          />
          <Legend wrapperStyle={{ fontSize: 13, paddingTop: 10 }} />
          <Line
            type="monotone"
            dataKey="altitude"
            stroke="#2196f3"
            strokeWidth={3}
            name="고도 (m)"
            dot={{ r: 3, fill: '#2196f3', strokeWidth: 0 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <Box className={styles.stats}>
        <Typography variant="body2">
          <strong>평균:</strong> {parseInt(avgAltitude).toLocaleString()}m  
          <strong style={{ marginLeft: 12 }}>최고:</strong> {parseInt(maxAltitude).toLocaleString()}m
        </Typography>
      </Box>
    </Paper>
  );
};

export default AltitudeChart;