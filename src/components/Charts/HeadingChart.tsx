import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type{ ChartProps } from '../../types/aircraft.types';
import styles from './Charts.module.scss';

const HeadingChart: React.FC<ChartProps> = ({ data }) => {
  const avgHeading = (data.reduce((sum, d) => sum + d.heading, 0) / data.length).toFixed(0);
  
  // 방향을 나침반 방향으로 변환
  const getDirection = (heading: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(heading / 45) % 8;
    return directions[index];
  };

  return (
    <Paper className={styles.chartContainer}>
      <Typography variant="h6" gutterBottom>
        🧭 비행 방향 (Heading)
      </Typography>
      
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
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #ddd', 
              borderRadius: '4px' 
            }}
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

      <Box className={styles.stats} style={{ backgroundColor: '#fff3e0' }}>
        <Typography variant="body2">
          <strong>분석:</strong> 평균 방향 {avgHeading}° ({getDirection(parseFloat(avgHeading))})
        </Typography>
      </Box>
    </Paper>
  );
};

export default HeadingChart;